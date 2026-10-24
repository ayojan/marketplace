# frozen_string_literal: true

module Notifications
  # Orchestrates enqueueing appropriate notification jobs based on type
  # Single responsibility: route notifications to correct job class
  class Orchestrator
    class UnknownNotificationTypeError < StandardError; end

    JOB_MAPPING = {
      'booking_created' => BookingCreatedNotificationJob,
      'booking_approved' => BookingApprovedNotificationJob,
      'booking_rejected' => BookingRejectedNotificationJob,
      'booking_cancelled' => BookingCancelledNotificationJob,
      'booking_reminder' => BookingReminderNotificationJob,
      'new_message' => NewMessageNotificationJob
    }.freeze

    def self.enqueue(notification_type:, recipient_id:, data:)
      new(notification_type, recipient_id, data).enqueue
    end

    def initialize(notification_type, recipient_id, data)
      @notification_type = notification_type
      @recipient_id = recipient_id
      @data = data
    end

    def enqueue
      job_class = JOB_MAPPING[@notification_type]
      raise UnknownNotificationTypeError, "Unknown notification type: #{@notification_type}" unless job_class

      case @notification_type
      when 'new_message'
        job_class.perform_later(@data['message_id'], @recipient_id)
      else
        job_class.perform_later(@data['booking_id'], @recipient_id)
      end

      Rails.logger.info(
        "Enqueued #{job_class.name} for notification_type=#{@notification_type}, recipient=#{@recipient_id}"
      )
    end
  end
end
