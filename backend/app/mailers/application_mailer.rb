# frozen_string_literal: true

class ApplicationMailer < ActionMailer::Base
  class << self
    def welcome_sender
      return 'noreply@marketplace.com' if Rails.env.test?

      ENV.fetch('MAILER_WELCOME_FROM', 'Ayoj Welcome <welcome@ayoj.in>')
    end

    def bookings_sender
      return 'noreply@marketplace.com' if Rails.env.test?

      ENV.fetch('MAILER_BOOKINGS_FROM', 'Ayoj Bookings <bookings@ayoj.in>')
    end

    def reminders_sender
      return 'noreply@marketplace.com' if Rails.env.test?

      ENV.fetch('MAILER_REMINDERS_FROM', 'Ayoj Reminders <reminders@ayoj.in>')
    end

    def support_sender
      return 'noreply@marketplace.com' if Rails.env.test?

      ENV.fetch('MAILER_SUPPORT_FROM', 'Ayoj Support <support@ayoj.in>')
    end

    def default_sender
      return 'noreply@marketplace.com' if Rails.env.test?

      ENV['MAILER_FROM_EMAIL'].presence ||
        Rails.application.credentials.dig(:resend, :from_email).presence ||
        'Ayoj <notifications@ayoj.in>'
    end
  end

  delegate :welcome_sender, :bookings_sender, :reminders_sender, :support_sender, :default_sender, to: :class

  default from: -> { default_sender }
  layout 'mailer'

  helper_method :format_booking_time, :time_duration, :frontend_url

  def frontend_url(path = '')
    base = ENV.fetch('FRONTEND_URL', 'http://localhost:3000').chomp('/')
    return base if path.blank?

    path = "/#{path}" unless path.start_with?('/')
    "#{base}#{path}"
  end

  def format_booking_time(booking)
    booking.event_date.strftime('%B %d, %Y at %I:%M %p')
  end

  def time_duration(start_time, end_time)
    return 'Duration not specified' unless start_time && end_time

    duration = ((end_time - start_time) / 1.hour).round(1)
    if (duration - 1.0).abs < Float::EPSILON
      '1 hour'
    elsif duration < 1.0
      minutes = ((end_time - start_time) / 1.minute).round
      "#{minutes} minutes"
    else
      "#{duration} hours"
    end
  end
end
