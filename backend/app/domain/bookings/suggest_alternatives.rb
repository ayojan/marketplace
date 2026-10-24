# frozen_string_literal: true

module Bookings
  class SuggestAlternatives
    include Callable

    def initialize(params)
      @params = params
    end

    def call
      parsed_date = Date.parse(@params[:date].to_s)
      if parsed_date < Date.current
        return {
          has_conflict: true,
          message: 'Cannot suggest alternatives for a past date',
          alternative_times: []
        }
      end

      resolver = build_resolver(parsed_date)
      {
        has_conflict: resolver.conflict?,
        alternative_times: resolver.suggest_alternative_times
      }
    end

    private

    def build_resolver(date)
      start_dt = DateTime.parse("#{date} #{@params[:start_time]}")
      end_dt = calculate_end_datetime(start_dt)

      ConflictResolutionService.new(
        vendor: find_vendor,
        event_date: start_dt,
        event_end_date: end_dt
      )
    end

    def find_vendor
      if @params[:vendor_id]
        user = User.find_by(id: @params[:vendor_id])
        user&.vendor || Vendor.find_by_id_or_slug(@params[:vendor_id])
      elsif @params[:service_id]
        Service.find_by(id: @params[:service_id])&.vendor
      end
    end

    def calculate_end_datetime(start_dt)
      if @params[:end_time].present?
        DateTime.parse("#{@params[:date]} #{@params[:end_time]}")
      else
        duration = (@params[:duration] || 4).to_i
        duration = 4 if duration <= 0
        start_dt + duration.hours
      end
    end
  end
end
