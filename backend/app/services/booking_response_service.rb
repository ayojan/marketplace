# frozen_string_literal: true

class BookingResponseService
  include Callable

  RESPONSE_STATUS = {
    'accept' => 'accepted',
    'decline' => 'declined',
    'counter_offer' => 'counter_offered'
  }.freeze

  RESPONSE_NOTIFICATION = {
    'accept' => 'booking_approved',
    'decline' => 'booking_rejected',
    'counter_offer' => 'booking_changes_requested'
  }.freeze

  def initialize(booking, vendor, response_action, options = {})
    @booking = booking
    @vendor = vendor
    @response_action = response_action
    @counter_amount = options[:counter_amount]
    @counter_message = options[:counter_message]
  end

  def call
    return { success: false, errors: ['Unauthorized'] } unless authorized?
    return { success: false, errors: ['Invalid response type'] } unless valid_response_type?
    return { success: false, errors: ['Booking cannot be modified'] } unless booking_modifiable?

    ActiveRecord::Base.transaction do
      update_booking_with_status_change
      create_response_message
      log_status_change
    end

    # Send notifications strictly after the transaction commits to PostgreSQL
    send_custom_notification_for_response

    { success: true, booking: @booking.reload }
  rescue StandardError => e
    { success: false, errors: [e.message] }
  end

  private

  def authorized?
    @booking.vendor == @vendor
  end

  def valid_response_type?
    RESPONSE_STATUS.key?(@response_action)
  end

  def booking_modifiable?
    %w[pending counter_offered].include?(@booking.status)
  end

  def update_booking_with_status_change
    new_status = RESPONSE_STATUS.fetch(@response_action)

    # Handle counter offer amount update
    @booking.update!(total_amount: @counter_amount) if @response_action == 'counter_offer' && @counter_amount.present?

    # Use explicit orchestration service to update status with side effects
    # This sends notifications and enqueues jobs as needed
    result = Bookings::UpdateBookingStatus.call(
      booking: @booking,
      new_status: new_status
    )

    raise StandardError, result[:error] unless result[:success]

    @booking = result[:booking]
  end

  def send_custom_notification_for_response
    notification_type = RESPONSE_NOTIFICATION.fetch(@response_action)
    NotificationJob.perform_later(notification_type, @booking.customer.id, { 'booking_id' => @booking.id })
  rescue StandardError => e
    Rails.logger.warn("Failed to send notification: #{e.message}")
  end

  def create_response_message
    Rails.logger.info "Vendor #{@vendor.id} responded to booking #{@booking.id} with #{@response_action}"
  end

  def log_status_change
    Rails.logger.info "Booking #{@booking.id} status changed to #{@booking.status} by vendor #{@vendor.id}"
  end
end
