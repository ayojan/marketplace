# frozen_string_literal: true

module Notifications
  class SendBookingReminder
    extend Dry::Initializer

    option :booking, type: Types.Instance(Booking)

    def self.call(**)
      new(**).call
    end

    def call
      booking.reload

      if booking_reminder_already_sent?
        # rubocop:disable Rails/EagerEvaluationLogMessage
        Rails.logger.debug("Booking reminder already sent for booking #{booking.id}")
        # rubocop:enable Rails/EagerEvaluationLogMessage
        return { success: true, already_sent: true }
      end

      return { success: false, error: 'Failed to mark reminder as sent' } unless mark_reminder_sent

      dispatch_reminders
      { success: true, already_sent: false }
    end

    private

    def mark_reminder_sent
      booking.update(booking_reminder_sent_at: Time.current)
    end

    def dispatch_reminders
      errors = []
      safe_dispatch(errors) { send_customer_reminder }
      safe_dispatch(errors) { send_vendor_reminder }
      raise errors.first if errors.any?
    end

    def safe_dispatch(errors)
      yield
    rescue StandardError => e
      errors << e
    end

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
        user: booking.vendor.user,
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
      date_str = booking.event_date.strftime('%B %d, %Y at %l:%M %p')
      "Your booking with #{booking.vendor.display_name} is coming up on #{date_str}."
    end

    def vendor_reminder_message
      date_str = booking.event_date.strftime('%B %d, %Y at %l:%M %p')
      "You have a booking with #{booking.customer.full_name} on #{date_str}."
    end
  end
end
