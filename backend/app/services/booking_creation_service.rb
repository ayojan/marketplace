# frozen_string_literal: true

# rubocop:disable Metrics/ClassLength
class BookingCreationService
  include ActiveModel::Model
  include ActiveModel::Attributes
  include Callable

  attr_accessor :customer
  attr_reader :booking

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

    @transaction_succeeded = false
    execute_creation_transaction
    if @transaction_succeeded && @booking&.persisted?
      send_confirmation_notification
      { success: true, booking: @booking }
    else
      { success: false, errors: errors.full_messages }
    end
  rescue ActiveRecord::RecordInvalid => e
    handle_record_invalid(e)
    { success: false, errors: errors.full_messages }
  rescue StandardError => e
    errors.add(:base, e.message)
    { success: false, errors: errors.full_messages }
  end

  private

  def execute_creation_transaction
    ActiveRecord::Base.transaction do
      build_booking
      check_availability
      prevent_double_booking
      handle_create_result(create_booking_record)
    end
  end

  def handle_create_result(result)
    if result[:success]
      @booking = result[:booking]
      @transaction_succeeded = true
    else
      result[:error]&.split(',')&.each { |msg| errors.add(:base, msg.strip) }
      raise ActiveRecord::Rollback
    end
  end

  def handle_record_invalid(invalid_error)
    invalid_error.record.errors.each do |error|
      errors.add(error.attribute, error.message) unless errors[error.attribute].include?(error.message)
    end
  end

  def calculate_event_dates
    date = apply_start_time(event_date)
    end_date = event_end_date || (date ? date + 4.hours : nil)
    [date, end_date]
  end

  def apply_start_time(date)
    return date if start_time.blank? || date.blank? || !date.hour.zero? || !date.min.zero?

    hours, minutes = start_time.split(':').map(&:to_i)
    date.change(hour: hours, min: minutes)
  end

  def build_booking
    @service = Service.find(service_id)
    @vendor_profile = @service.vendor_profile
    @final_event_date, @final_event_end_date = calculate_event_dates

    @booking_attributes = {
      customer: customer,
      vendor_profile: @vendor_profile,
      service: @service,
      event_date: @final_event_date,
      event_end_date: @final_event_end_date,
      event_location: event_location,
      total_amount: total_amount,
      requirements: requirements,
      special_instructions: special_instructions,
      event_duration: event_duration || '4 hours',
      status: 'pending'
    }
    @booking = Booking.new(@booking_attributes)
  end

  def create_booking_record
    Bookings::CreateBooking.call(**@booking_attributes, skip_notifications: true)
  end

  def send_confirmation_notification
    Notifications::SendBookingConfirmation.call(booking: @booking)
  rescue StandardError => e
    Rails.logger.error("Failed to send booking confirmation for #{@booking&.id}: #{e.message}")
  end

  def check_availability
    booking_date_time = @final_event_date || event_date
    validate_future_booking!(booking_date_time)
    validate_vendor_availability!(booking_date_time)
  end

  def validate_future_booking!(booking_date_time)
    return if booking_date_time > Time.current

    fail_booking_validation!(:event_date, 'must be in the future')
  end

  def validate_vendor_availability!(booking_date_time)
    end_time_str = (@final_event_end_date || event_end_date || (booking_date_time + 2.hours)).strftime('%H:%M')
    checker = AvailabilityCheckerService.new(
      vendor_profile: @vendor_profile,
      date: booking_date_time.to_date,
      start_time: booking_date_time.strftime('%H:%M'),
      end_time: end_time_str
    )
    return if checker.available?

    fail_booking_validation!(:event_date, 'is not available for this vendor')
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

    fail_booking_validation!(:event_date, 'conflicts with another booking')
  end

  def fail_booking_validation!(attribute, message)
    errors.add(attribute, message)
    @booking.errors.add(attribute, message) if @booking.respond_to?(:errors)
    raise ActiveRecord::RecordInvalid, @booking
  end

  def event_date_in_future
    return unless event_date

    errors.add(:event_date, 'must be in the future') if event_date <= Time.current
  end
end
# rubocop:enable Metrics/ClassLength
