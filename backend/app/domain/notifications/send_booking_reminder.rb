# frozen_string_literal: true

module Notifications
  class SendBookingReminder
    extend Dry::Initializer

    option :booking, type: Types.Instance(Booking)

    def self.call(**)
      new(**).call
    end

    def call
      # Reload booking to check fresh state (idempotency guard)
      booking.reload

      # Return early if already sent (idempotent)
      if booking_reminder_already_sent?
        Rails.logger.debug { "Booking reminder already sent for booking #{booking.id}" }
        return { success: true, already_sent: true }
      end

      # Mark as sent immediately (before sending notifications) to prevent race conditions
      # If this fails, the notifications won't be sent, which is correct behavior
      unless booking.update(booking_reminder_sent_at: Time.current)
        return { success: false, error: 'Failed to mark reminder as sent' }
      end

      errors = []
      # Send reminders to customer
      begin
        send_customer_reminder
      rescue StandardError => e
        errors << e
      end

      # Send reminders to vendor
      begin
        send_vendor_reminder
      rescue StandardError => e
        errors << e
      end

      raise errors.first if errors.any?

      { success: true, already_sent: false }
    end

    private

    def booking_reminder_already_sent?
      booking.booking_reminder_sent_at.present?
    end

    def send_customer_reminder
      SendNotification.call(
        user: booking.customer,
        title: 'Booking Reminder',
        message: customer_reminder_message,
        notification_type: 'booking_reminder',
        related_type: 'Booking',
        related_id: booking.id
      )
    rescue StandardError => e
      Rails.logger.error("Failed to send customer reminder for booking #{booking.id}: #{e.message}")
      raise
    end

    def send_vendor_reminder
      SendNotification.call(
        user: booking.vendor_profile.user,
        title: 'Upcoming Booking',
        message: vendor_reminder_message,
        notification_type: 'booking_reminder',
        related_type: 'Booking',
        related_id: booking.id
      )
    rescue StandardError => e
      Rails.logger.error("Failed to send vendor reminder for booking #{booking.id}: #{e.message}")
      raise
    end

    def customer_reminder_message
      "Your booking with #{booking.vendor_profile.display_name} is coming up on #{booking.event_date.strftime('%B %d, %Y at %l:%M %p')}."
    end

    def vendor_reminder_message
      "You have a booking with #{booking.customer.full_name} on #{booking.event_date.strftime('%B %d, %Y at %l:%M %p')}."
    end
  end
end
