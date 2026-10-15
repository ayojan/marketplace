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
      method_name = "#{@notification_type}?"
      return pref.public_send(method_name) if pref.respond_to?(method_name)

      true
    end

    def user_has_preferences?
      pref = @user.email_notification_preference
      pref.present? && !pref.destroyed?
    end

    def send_email_notification
      booking = Booking.find_by(id: @related_id) if @related_type == 'Booking' || @related_type.blank?
      return if booking && deliver_booking_email?(booking)

      dispatch_generic_email
    end

    def deliver_booking_email?(booking)
      mailer = booking_mailer_for(booking)
      return false unless mailer

      mailer.deliver_later
      true
    end

    def booking_mailer_for(booking)
      case @notification_type
      when 'booking_created'
        if @user.vendor?
          VendorBookingMailer.new_booking_notification(booking)
        else
          CustomerBookingMailer.booking_confirmation(booking)
        end
      when 'booking_accepted', 'booking_approved'
        CustomerBookingMailer.booking_approved_notification(booking)
      when 'booking_rejected'
        CustomerBookingMailer.booking_rejected_notification(booking)
      when 'booking_cancelled'
        cancellation_mailer_for(booking)
      when 'booking_reminder'
        CustomerBookingMailer.booking_reminder(booking)
      end
    end

    def cancellation_mailer_for(booking)
      if @user.vendor?
        VendorBookingMailer.booking_cancelled_notification(booking)
      else
        CustomerBookingMailer.booking_cancelled_notification(booking)
      end
    end

    def dispatch_generic_email
      mailer_method = "#{@notification_type}_email"
      return unless NotificationMailer.respond_to?(mailer_method)

      NotificationMailer.public_send(mailer_method, @user, @related_id).deliver_later
    end
  end
end
