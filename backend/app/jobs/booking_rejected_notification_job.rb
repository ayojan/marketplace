# frozen_string_literal: true

class BookingRejectedNotificationJob < ApplicationJob
  queue_as :default
  discard_on ActiveRecord::RecordNotFound

  def perform(booking_id, recipient_id)
    idempotency_key = JobIdempotencyCache.generate_key(self.class.name, booking_id, recipient_id)
    return if JobIdempotencyCache.processed?(idempotency_key)

    booking = Booking.find(booking_id)
    recipient = User.find(recipient_id)

    # Send email notification via service layer
    Notifications::EmailService.send_booking_rejected(booking, recipient)

    # Create in-app notification
    vendor_name = booking.vendor&.business_name || booking.vendor&.display_name
    InAppNotification.create_notification(
      user_id: recipient.id,
      title: 'Booking Declined',
      message: "Your booking with #{vendor_name} has been declined",
      notification_type: 'booking_rejected',
      related_type: 'Booking',
      related_id: booking.id
    )

    JobIdempotencyCache.mark_processed(idempotency_key)
    Rails.logger.info "Booking rejected notification sent for booking #{booking_id} to user #{recipient_id}"
  end
end
