# frozen_string_literal: true

module Notifications
  class SendNotification
    extend Dry::Initializer

    option :user, type: Types.Instance(User)
    option :title, type: Types::String
    option :message, type: Types::String
    option :notification_type, type: Types::String
    option :related_type, type: Types::String.optional, default: proc {}
    option :related_id, type: Types::Integer.optional, default: proc {}
    option :skip_email, type: Types::Bool, default: proc { false }

    def self.call(**)
      new(**).call
    end

    def call
      # Create in-app notification
      in_app_notification = create_in_app_notification

      # Send email if enabled
      send_email_notification if should_send_email?

      { success: true, notification_id: in_app_notification.id }
    rescue StandardError => e
      Rails.logger.error("Failed to send notification: #{e.message}")
      { success: false, error: e.message }
    end

    private

    def create_in_app_notification
      InAppNotification.create_notification(
        user_id: @user.id,
        title: @title,
        message: @message,
        notification_type: @notification_type,
        related_type: @related_type,
        related_id: @related_id
      )
    end

    def should_send_email?
      return false if @skip_email
      return false unless user_has_preferences?

      pref = @user.email_notification_preference
      return false if pref.nil? || pref.destroyed?

      case @notification_type
      when 'booking_created'
        pref.booking_created?
      when 'booking_accepted'
        pref.booking_accepted?
      when 'booking_rejected'
        pref.booking_rejected?
      when 'booking_cancelled'
        pref.booking_cancelled?
      when 'booking_reminder'
        pref.booking_reminder?
      when 'new_message'
        pref.new_message?
      when 'review_received'
        pref.review_received?
      else
        true
      end
    end

    def user_has_preferences?
      pref = @user.email_notification_preference
      pref.present? && !pref.destroyed?
    end

    def send_email_notification
      case @notification_type
      when 'booking_created'
        NotificationMailer.booking_created_email(@user, @related_id).deliver_later
      when 'booking_accepted'
        NotificationMailer.booking_accepted_email(@user, @related_id).deliver_later
      when 'booking_rejected'
        NotificationMailer.booking_rejected_email(@user, @related_id).deliver_later
      when 'booking_cancelled'
        NotificationMailer.booking_cancelled_email(@user, @related_id).deliver_later
      when 'booking_reminder'
        NotificationMailer.booking_reminder_email(@user, @related_id).deliver_later
      when 'new_message'
        NotificationMailer.new_message_email(@user, @related_id).deliver_later
      when 'review_received'
        NotificationMailer.review_received_email(@user, @related_id).deliver_later
      end
    end
  end
end
