# frozen_string_literal: true

require 'ostruct'

module Vendors
  class CalculatePublicStats
    extend Dry::Initializer

    option :vendor, type: Types.Instance(Vendor)

    def self.call(vendor:)
      new(vendor: vendor).call
    end

    def call
      # Fetch all metrics with a single optimized query
      stats = fetch_aggregated_stats

      # Update vendor with cached metrics
      update_vendor_metrics(stats)

      # Return complete stats object
      build_stats_response(stats)
    end

    private

    def fetch_aggregated_stats
      stats = vendor.bookings.pick(
        Arel.sql('COUNT(*)'),
        Arel.sql('COUNT(CASE WHEN status = 3 THEN 1 END)'),
        Arel.sql('COUNT(CASE WHEN status IN (2, 3, 4) THEN 1 END)'),
        Arel.sql("COUNT(DISTINCT CASE WHEN vendor_first_response_at <= created_at + INTERVAL '48 hours' THEN id END)"),
        Arel.sql('AVG(EXTRACT(EPOCH FROM (vendor_first_response_at - created_at)))'),
        Arel.sql('COUNT(DISTINCT customer_id)')
      )

      stats ? build_stats_hash(stats) : empty_stats
    end

    PublicStats = Struct.new(
      :total_bookings, :total_completed, :total_terminal,
      :responded_48h, :avg_response_seconds, :unique_customers,
      keyword_init: true
    )
    private_constant :PublicStats

    def build_stats_hash(stats_array)
      PublicStats.new(
        total_bookings: stats_array[0].to_i,
        total_completed: stats_array[1].to_i,
        total_terminal: stats_array[2].to_i,
        responded_48h: stats_array[3].to_i,
        avg_response_seconds: stats_array[4],
        unique_customers: stats_array[5].to_i
      )
    end

    def empty_stats
      PublicStats.new(
        total_bookings: 0,
        total_completed: 0,
        total_terminal: 0,
        responded_48h: 0,
        avg_response_seconds: nil,
        unique_customers: 0
      )
    end

    def calculate_repeat_customer_rate(stats)
      return nil if stats.unique_customers.zero?

      repeat_customers = count_repeat_customers
      ((repeat_customers.to_f / stats.unique_customers) * 100).round(2)
    end

    def count_repeat_customers
      vendor.bookings
            .group(:customer_id)
            .having('COUNT(*) >= 2')
            .count
            .size
    end

    def update_vendor_metrics(stats)
      response_time_hours = stats.avg_response_seconds ? (stats.avg_response_seconds.to_f / 3600).round(2) : nil
      completion_rate = stats.total_terminal.zero? ? nil : (stats.total_completed.to_f / stats.total_terminal).round(4)

      vendor.update(
        response_time_hours: response_time_hours,
        completion_rate: completion_rate
      )
    rescue StandardError => e
      Rails.logger.error("Failed to update vendor metrics: #{e.message}")
      raise
    end

    def build_stats_response(stats)
      response_rate = calculate_response_rate(stats)
      response_time = stats.avg_response_seconds ? (stats.avg_response_seconds.to_f / 3600).round(2) : nil
      completion_rate = stats.total_terminal.zero? ? nil : (stats.total_completed.to_f / stats.total_terminal).round(4)
      repeat_customer_rate = calculate_repeat_customer_rate(stats)

      {
        response_rate: response_rate,
        response_time_hours: response_time,
        completion_rate: completion_rate,
        repeat_customer_rate: repeat_customer_rate,
        total_events: stats.total_completed,
        member_since: vendor.created_at
      }
    end

    def calculate_response_rate(stats)
      return nil if stats.total_bookings.zero?

      ((stats.responded_48h.to_f / stats.total_bookings) * 100).round(2)
    end
  end
end
