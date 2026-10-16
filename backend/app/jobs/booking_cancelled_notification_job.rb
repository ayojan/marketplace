# frozen_string_literal: true

class BookingCancelledNotificationJob < ApplicationJob
  queue_as :default
  discard_on ActiveRecord::RecordNotFound

  def perform(booking_id, recipient_id)
    idempotency_key = JobIdempotencyCache.generate_key(self.class.name, booking_id, recipient_id)
    return if JobIdempotencyCache.processed?(idempotency_key)

    booking = Booking.find(booking_id)
    recipient = User.find(recipient_id)

    send_email_notification(booking, recipient)
    create_in_app_notification(booking, recipient)

    JobIdempotencyCache.mark_processed(idempotency_key)
    Rails.logger.info "Booking cancelled notification sent for booking #{booking_id} to user #{recipient_id}"
  end

  private

  def send_email_notification(booking, recipient)
    Notifications::EmailService.send_booking_cancelled(booking, recipient)
  end

  def create_in_app_notification(booking, recipient)
    vendor_name = booking.vendor&.business_name || booking.vendor&.display_name
    message = if recipient.vendor.present?
                "#{booking.customer.full_name} has cancelled their booking"
              else
                "Your booking with #{vendor_name} has been cancelled"
              end

    InAppNotification.create_notification(
      user_id: recipient.id,
      title: 'Booking Cancelled',
      message: message,
      notification_type: 'booking_cancelled',
      related_type: 'Booking',
      related_id: booking.id
    )
  end
end
