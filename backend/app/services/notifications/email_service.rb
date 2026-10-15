# frozen_string_literal: true

module Notifications
  # Abstracts email delivery for notifications
  # Allows swapping mailers or notification channels without touching jobs
  class EmailService
    def self.send_welcome_email(user)
      new.send_welcome_email(user)
    end

    def self.send_booking_created(booking, recipient)
      new.send_booking_created(booking, recipient)
    end

    def self.send_booking_approved(booking, recipient)
      new.send_booking_approved(booking, recipient)
    end

    def self.send_booking_rejected(booking, recipient)
      new.send_booking_rejected(booking, recipient)
    end

    def self.send_booking_cancelled(booking, recipient)
      new.send_booking_cancelled(booking, recipient)
    end

    def self.send_booking_reminder(booking, recipient)
      new.send_booking_reminder(booking, recipient)
    end

    def self.send_new_message(message, recipient)
      new.send_new_message(message, recipient)
    end

    def send_welcome_email(user)
      UserMailer.welcome_email(user).deliver_now
    end

    def send_booking_created(booking, recipient)
      if recipient.vendor_profile.present?
        VendorBookingMailer.new_booking_notification(booking).deliver_now
      else
        CustomerBookingMailer.booking_confirmation(booking).deliver_now
      end
    end

    def send_booking_approved(booking, _recipient)
      CustomerBookingMailer.booking_approved_notification(booking).deliver_now
    end

    def send_booking_rejected(booking, _recipient)
      CustomerBookingMailer.booking_rejected_notification(booking).deliver_now
    end

    def send_booking_cancelled(booking, recipient)
      mailer = if recipient.vendor_profile.blank?
                 CustomerBookingMailer
               else
                 VendorBookingMailer
               end
      mailer.booking_cancelled_notification(booking).deliver_now
    end

    def send_booking_reminder(booking, _recipient)
      CustomerBookingMailer.booking_reminder(booking).deliver_now
    end

    def send_new_message(message, _recipient)
      MessageMailer.new_message_notification(message).deliver_now
    end
  end
end
