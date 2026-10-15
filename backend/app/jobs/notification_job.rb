# frozen_string_literal: true

class NotificationJob < ApplicationJob
  queue_as :default

  discard_on ActiveRecord::RecordNotFound

  BOOKING_ACTIONS = {
    'booking_created' => :send_booking_created,
    'booking_approved' => :send_booking_approved,
    'booking_rejected' => :send_booking_rejected,
    'booking_cancelled' => :send_booking_cancelled,
    'booking_reminder' => :send_booking_reminder
  }.freeze

  def perform(notification_type, recipient_id, data = {})
    idempotency_key = JobIdempotencyCache.generate_key(
      self.class.name,
      notification_type,
      recipient_id,
      data['booking_id'] || data['message_id']
    )
    return if JobIdempotencyCache.processed?(idempotency_key)

    recipient = User.find(recipient_id)

    if (action = BOOKING_ACTIONS[notification_type])
      booking = Booking.find(data['booking_id'])
      Notifications::EmailService.public_send(action, booking, recipient)
    elsif notification_type == 'new_message'
      message = BookingMessage.find(data['message_id'])
      Notifications::EmailService.send_new_message(message, recipient)
    else
      Rails.logger.warn "Unknown notification type: #{notification_type}"
    end

    JobIdempotencyCache.mark_processed(idempotency_key)
  rescue ActiveRecord::RecordNotFound => e
    Rails.logger.error "Notification job failed: #{e.message}"
  end
end
