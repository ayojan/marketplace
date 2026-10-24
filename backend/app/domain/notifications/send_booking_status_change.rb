# frozen_string_literal: true

module Notifications
  class SendBookingStatusChange
    include Callable
    extend Dry::Initializer

    option :booking, type: Types.Instance(Booking)
    option :status, type: Types::String

    def call
      case status
      when 'accepted', 'confirmed'
        send_confirmation_notification
      when 'declined', 'rejected'
        send_rejection_notification
      when 'cancelled'
        send_cancellation_notification
      else
        { success: false, error: "Unknown status: #{status}" }
      end
    end

    private

    def send_confirmation_notification
      # Notify customer that vendor accepted their booking
      date_str = booking.event_date.strftime('%B %d, %Y')
      SendNotification.call(
        user: booking.customer,
        title: 'Booking Accepted',
        message: "#{booking.vendor.display_name} has accepted your booking request for #{date_str}.",
        notification_type: 'booking_accepted',
        related_type: 'Booking',
        related_id: booking.id
      )
      { success: true }
    rescue StandardError => e
      Rails.logger.error("Failed to send confirmation notification: #{e.message}")
      { success: false, error: e.message }
    end

    def send_rejection_notification
      # Notify customer that vendor declined their booking
      date_str = booking.event_date.strftime('%B %d, %Y')
      SendNotification.call(
        user: booking.customer,
        title: 'Booking Declined',
        message: "#{booking.vendor.display_name} has declined your booking request for #{date_str}.",
        notification_type: 'booking_rejected',
        related_type: 'Booking',
        related_id: booking.id
      )
      { success: true }
    rescue StandardError => e
      Rails.logger.error("Failed to send rejection notification: #{e.message}")
      { success: false, error: e.message }
    end

    def send_cancellation_notification
      date_str = booking.event_date.strftime('%B %d, %Y')
      notify_cancellation_customer(date_str)
      notify_cancellation_vendor(date_str)
      { success: true }
    rescue StandardError => e
      Rails.logger.error("Failed to send cancellation notification: #{e.message}")
      { success: false, error: e.message }
    end

    def notify_cancellation_customer(date_str)
      SendNotification.call(
        user: booking.customer,
        title: 'Booking Cancelled',
        message: "Your booking with #{booking.vendor.display_name} for #{date_str} has been cancelled.",
        notification_type: 'booking_cancelled',
        related_type: 'Booking',
        related_id: booking.id
      )
    end

    def notify_cancellation_vendor(date_str)
      SendNotification.call(
        user: booking.vendor.user,
        title: 'Booking Cancelled',
        message: "The booking from #{booking.customer.full_name} for #{date_str} has been cancelled.",
        notification_type: 'booking_cancelled',
        related_type: 'Booking',
        related_id: booking.id
      )
    end
  end
end
