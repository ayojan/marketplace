# frozen_string_literal: true

class BookingReminderJob
  include Sidekiq::Job

  # Low priority: batch job that can run at non-peak times
  sidekiq_options queue: 'low', retry: 3, dead: true

  def sidekiq_options
    self.class.get_sidekiq_options
  end

  def perform
    # Find bookings happening in 24 hours (+/- 30 minutes window)
    tomorrow_start = 24.hours.from_now - 30.minutes
    tomorrow_end = 24.hours.from_now + 30.minutes

    sent_count = 0
    failed_count = 0

    # Use find_in_batches for memory efficiency with large datasets
    # Prevents loading all bookings into memory at once
    Booking
      .where('event_date > ? AND event_date < ?', tomorrow_start, tomorrow_end)
      .where(status: :accepted)
      .where(booking_reminder_sent_at: nil)
      .find_in_batches(batch_size: 100) do |batch|
        batch.each do |booking|
          send_reminder_idempotently(booking)
          sent_count += 1
        rescue StandardError => e
          failed_count += 1
          Rails.logger.error("Failed to send reminder for booking #{booking.id}: #{e.class} #{e.message}")
          # Continue to next booking instead of failing the entire job
        end
      end

    log_completion(sent_count, failed_count)
  end

  private

  def send_reminder_idempotently(booking)
    # Double-check idempotency: if another worker or retry already sent the reminder, skip
    return if booking.reload.booking_reminder_sent_at.present?

    # Send reminders to customer and vendor
    Notifications::SendBookingReminder.call(booking: booking)
  end

  def log_completion(sent_count, failed_count)
    if failed_count.positive?
      Rails.logger.warn("Booking reminder job: #{sent_count} sent, #{failed_count} failed")
    else
      Rails.logger.info("Booking reminder job: #{sent_count} reminders sent successfully")
    end
  end
end
