# frozen_string_literal: true

class BookingCreationService
  include ActiveModel::Model
  include ActiveModel::Attributes
  include Callable

  attr_accessor :customer

  attribute :service_id, :integer
  attribute :event_date, :datetime
  attribute :event_end_date, :datetime
  attribute :start_time, :string
  attribute :event_location, :string
  attribute :total_amount, :decimal
  attribute :requirements, :string
  attribute :special_instructions, :string
  attribute :event_duration, :string

  validates :customer, presence: true
  validates :service_id, presence: true
  validates :event_date, presence: true
  validates :total_amount, numericality: { greater_than: 0 }
  validate :event_date_in_future
  def call
    return { success: false, errors: errors.full_messages } unless valid?

    transaction_succeeded = false

    ActiveRecord::Base.transaction do
      # Build booking attributes (do not create yet)
      build_booking

      # Validate availability and conflicts before creating
      check_availability
      prevent_double_booking

      # Create booking record inside transaction, skipping asynchronous side effects
      result = create_booking_record

      if result[:success]
        @booking = result[:booking]
        transaction_succeeded = true
      else
        # If creation failed, propagate errors and roll back
        result[:error]&.split(',')&.each do |message|
          errors.add(:base, message.strip)
        end
        raise ActiveRecord::Rollback
      end
    end

    if transaction_succeeded && @booking&.persisted?
      send_confirmation_notification
      { success: true, booking: @booking }
    else
      { success: false, errors: errors.full_messages }
    end
  rescue ActiveRecord::RecordInvalid => e
    e.record.errors.each do |error|
      errors.add(error.attribute, error.message) unless errors[error.attribute].include?(error.message)
    end
    { success: false, errors: errors.full_messages }
  rescue StandardError => e
    errors.add(:base, e.message)
    { success: false, errors: errors.full_messages }
  end
  attr_reader :booking

  private

  def build_booking
    @service = Service.find(service_id)
    @vendor_profile = @service.vendor_profile

    # If start_time is provided and event_date is midnight, combine them
    final_event_date = event_date
    if start_time.present? && final_event_date.present? && final_event_date.hour.zero? && final_event_date.min.zero?
      hours, minutes = start_time.split(':').map(&:to_i)
      final_event_date = final_event_date.change(hour: hours, min: minutes)
    end
    final_event_end_date = event_end_date || (final_event_date ? final_event_date + 4.hours : nil)

    @final_event_date = final_event_date
    @final_event_end_date = final_event_end_date

    # Build booking attributes for validation, don't create yet
    @booking_attributes = {
      customer: customer,
      vendor_profile: @vendor_profile,
      service: @service,
      event_date: final_event_date,
      event_end_date: final_event_end_date,
      event_location: event_location,
      total_amount: total_amount,
      requirements: requirements,
      special_instructions: special_instructions,
      event_duration: event_duration || '4 hours',
      status: 'pending'
    }

    # Create a temporary booking for validation (don't save)
    @booking = Booking.new(@booking_attributes)
  end

  def create_booking_record
    # Save booking record via domain service without triggering async notifications yet
    Bookings::CreateBooking.call(**@booking_attributes, skip_notifications: true)
  end

  def send_confirmation_notification
    # Trigger notifications strictly outside database transaction
    Notifications::SendBookingConfirmation.call(booking: @booking)
  rescue StandardError => e
    Rails.logger.error("Failed to send booking confirmation for #{@booking&.id}: #{e.message}")
  end

  def check_availability
    booking_date_time = @final_event_date || event_date
    if booking_date_time <= Time.current
      errors.add(:event_date, 'must be in the future')
      @booking.errors.add(:event_date, 'must be in the future') if @booking.respond_to?(:errors)
      raise ActiveRecord::RecordInvalid, @booking
    end

    availability_checker = AvailabilityCheckerService.new(
      vendor_profile: @vendor_profile,
      date: booking_date_time.to_date,
      start_time: booking_date_time.strftime('%H:%M'),
      end_time: (@final_event_end_date || event_end_date || (booking_date_time + 2.hours)).strftime('%H:%M')
    )

    return if availability_checker.available?

    errors.add(:event_date, 'is not available for this vendor')
    @booking.errors.add(:event_date, 'is not available for this vendor') if @booking.respond_to?(:errors)
    raise ActiveRecord::RecordInvalid, @booking
  end

  def prevent_double_booking
    booking_date_time = @final_event_date || event_date
    conflict_resolver = ConflictResolutionService.new(
      vendor_profile: @vendor_profile,
      event_date: booking_date_time,
      event_end_date: @final_event_end_date || event_end_date || (booking_date_time + 2.hours),
      exclude_booking_id: nil
    )

    return unless conflict_resolver.conflict?

    errors.add(:event_date, 'conflicts with another booking')
    @booking.errors.add(:event_date, 'conflicts with another booking') if @booking.respond_to?(:errors)
    raise ActiveRecord::RecordInvalid, @booking
  end

  def event_date_in_future
    return unless event_date

    errors.add(:event_date, 'must be in the future') if event_date <= Time.current
  end
end
