# frozen_string_literal: true

module Notifications
  class SendBookingConfirmation
    include Callable
    extend Dry::Initializer

    option :booking, type: Types.Instance(Booking)

    def call
      date_str = booking.event_date.strftime('%B %d, %Y')
      notify_customer(date_str)
      notify_vendor(date_str)
    rescue StandardError => e
      Rails.logger.error("Failed to send booking confirmation: #{e.message}")
      { success: false, error: e.message }
    end

    private

    def notify_customer(date_str)
      SendNotification.call(
        user: booking.customer,
        title: 'Booking Confirmed',
        message: "Your booking with #{booking.vendor.display_name} for #{date_str} has been confirmed.",
        notification_type: 'booking_created',
        related_type: 'Booking',
        related_id: booking.id
      )
    end

    def notify_vendor(date_str)
      SendNotification.call(
        user: booking.vendor.user,
        title: 'New Booking Request',
        message: "You have a new booking request from #{booking.customer.full_name} for #{date_str}.",
        notification_type: 'booking_created',
        related_type: 'Booking',
        related_id: booking.id,
        skip_email: false # Always notify vendor about new bookings
      )
    end
  end
end
