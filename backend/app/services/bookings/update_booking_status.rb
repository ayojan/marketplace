# frozen_string_literal: true

module Bookings
  class UpdateBookingStatus
    include Callable
    extend Dry::Initializer

    option :booking, type: Types.Instance(Booking)
    option :new_status, type: Types::String
    option :skip_notifications, type: Types::Bool, default: proc { false }

    def call
      old_status = booking.status

      # 1. Update the booking status
      unless booking.update(status: new_status)
        return { success: false, error: booking.errors.full_messages.join(', ') }
      end

      # 2. Send status change notification if applicable
      send_status_notification_if_needed(old_status, new_status)

      # 3. Calculate trust stats if needed (inline, fails fast if there's an issue)
      calculate_trust_stats_if_needed(new_status)

      { success: true, booking: booking }
    rescue StandardError => e
      # Only catch errors from step 3 (stats calculation)
      # Steps 1-2 are handled with error returns or logged warnings
      Rails.logger.error("Failed to update booking status: #{e.class} #{e.message}")
      { success: false, error: "Booking updated but stats calculation failed: #{e.message}" }
    end

    private

    def send_status_notification_if_needed(_old_status, new_status)
      return if skip_notifications

      # Only send notifications for accepted or cancelled status changes
      return unless %w[accepted cancelled].include?(new_status)

      Notifications::SendBookingStatusChange.call(booking: booking, status: new_status)
    rescue StandardError => e
      Rails.logger.error("Failed to send status change notification for booking #{booking.id}: #{e.message}")
      # Don't re-raise; booking status is already updated
    end

    def calculate_trust_stats_if_needed(status)
      # Recalculate trust stats for terminal statuses
      # Using inline calculation (fast, ~100ms) instead of async to avoid silent failures
      # If the calculation fails, the error is visible and not hidden in job queue
      return unless %w[completed declined cancelled].include?(status)

      # Calculate stats inline - this is fast enough (single optimized query)
      # In high-traffic scenarios, could be moved to async with proper error handling
      vendor = booking.vendor
      Vendors::CalculatePublicStats.call(vendor: vendor)
    rescue StandardError => e
      # Log the error and re-raise it
      # This is better than silent failure (swallowing error)
      # Caller can decide whether to fail loudly or handle gracefully
      Rails.logger.error("Failed to recalculate trust stats for booking #{booking.id}: #{e.class} #{e.message}")
      raise
    end
  end
end
