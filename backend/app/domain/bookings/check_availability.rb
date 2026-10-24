# frozen_string_literal: true

module Bookings
  class CheckAvailability
    include Callable

    def initialize(params)
      @params = params
    end

    def call
      parsed_date = Date.parse(@params[:date].to_s)
      return past_date_result if parsed_date < Date.current
      return past_time_result if past_time_today?(parsed_date)

      service = Service.find(@params[:service_id])
      checker = AvailabilityCheckerService.new(
        vendor: service.vendor,
        date: parsed_date,
        start_time: @params[:start_time],
        end_time: @params[:end_time],
        duration: @params[:duration]
      )

      build_availability_result(checker)
    end

    private

    def build_availability_result(checker)
      if checker.available?
        { available: true, message: 'Time slot is available' }
      else
        {
          available: false,
          message: 'Time slot is not available',
          suggested_times: checker.suggested_times
        }
      end
    end

    def past_date_result
      {
        available: false,
        message: 'Cannot book a date in the past',
        errors: ['Booking date cannot be in the past']
      }
    end

    def past_time_result
      {
        available: false,
        message: 'Cannot book a time slot in the past',
        errors: ['Booking time slot has already passed']
      }
    end

    def past_time_today?(parsed_date)
      return false unless parsed_date == Date.current && @params[:start_time].present?

      time = Time.zone.parse("#{parsed_date} #{@params[:start_time]}")
      time && time <= Time.current
    rescue StandardError
      false
    end
  end
end
