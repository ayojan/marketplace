# frozen_string_literal: true

class NotificationJob < ApplicationJob
  queue_as :default

  discard_on ActiveRecord::RecordNotFound

  def perform(notification_type, recipient_id, data = {})
    recipient = User.find(recipient_id)

    case notification_type
    when 'booking_created'
      booking = Booking.find(data['booking_id'])
      Notifications::EmailService.send_booking_created(booking, recipient)
    when 'booking_approved'
      booking = Booking.find(data['booking_id'])
      Notifications::EmailService.send_booking_approved(booking, recipient)
    when 'booking_rejected'
      booking = Booking.find(data['booking_id'])
      Notifications::EmailService.send_booking_rejected(booking, recipient)
    when 'booking_cancelled'
      booking = Booking.find(data['booking_id'])
      Notifications::EmailService.send_booking_cancelled(booking, recipient)
    when 'booking_reminder'
      booking = Booking.find(data['booking_id'])
      Notifications::EmailService.send_booking_reminder(booking, recipient)
    when 'new_message'
      message = BookingMessage.find(data['message_id'])
      Notifications::EmailService.send_new_message(message, recipient)
    else
      Rails.logger.warn "Unknown notification type: #{notification_type}"
    end
  rescue ActiveRecord::RecordNotFound => e
    Rails.logger.error "Notification job failed: #{e.message}"
  end
end
