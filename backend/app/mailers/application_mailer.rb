# frozen_string_literal: true

class ApplicationMailer < ActionMailer::Base
  default from: ENV.fetch('MAILER_FROM_EMAIL', 'noreply@marketplace.com')
  layout 'mailer'

  helper_method :format_booking_time, :time_duration

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
