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
  def call
    return { success: false, errors: errors.full_messages } unless valid?

    ActiveRecord::Base.transaction do
      # Build booking attributes (do not create yet)
      build_booking

      # Validate availability and conflicts before creating
      check_availability
      prevent_double_booking

      # Use explicit orchestration service to create booking with side effects
      result = create_booking_with_orchestration

      if result[:success]
        @booking = result[:booking]
        return result
      end

      # If creation failed, propagate errors
      result[:error]&.split(',')&.each do |message|
        errors.add(:base, message.strip)
      end

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
    if start_time.present? && final_event_date.present? && final_event_date.hour == 0 && final_event_date.min == 0
      hours, minutes = start_time.split(':').map(&:to_i)
      final_event_date = final_event_date.change(hour: hours, min: minutes)
    end
    final_event_end_date = event_end_date || (final_event_date ? final_event_date + 4.hours : nil)

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

  def create_booking_with_orchestration
    # Use explicit orchestration service to create booking with side effects
    Bookings::CreateBooking.call(**@booking_attributes)
  end

  def check_availability
    availability_checker = AvailabilityCheckerService.new(
      vendor_profile: @vendor_profile,
      date: event_date.to_date,
      start_time: event_date.strftime('%H:%M'),
      end_time: (event_end_date || (event_date + 2.hours)).strftime('%H:%M')
    )

    return if availability_checker.available?

    errors.add(:event_date, 'is not available for this vendor')
    @booking&.errors&.add(:event_date, 'is not available for this vendor')
    raise ActiveRecord::RecordInvalid, @booking
  end

  def prevent_double_booking
    conflict_resolver = ConflictResolutionService.new(
      vendor_profile: @vendor_profile,
      event_date: event_date,
      event_end_date: event_end_date || (event_date + 2.hours),
      exclude_booking_id: nil
    )

    return unless conflict_resolver.conflict?

    errors.add(:event_date, 'conflicts with another booking')
    raise ActiveRecord::RecordInvalid, @booking
  end
end
