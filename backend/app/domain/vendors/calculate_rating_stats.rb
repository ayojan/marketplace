# frozen_string_literal: true

module Vendors
  class CalculateRatingStats
    extend Dry::Initializer

    option :vendor, type: Types.Instance(Vendor)

    def self.call(vendor:)
      new(vendor: vendor).call
    end

    def call
      {
        distribution: rating_distribution,
        breakdown: rating_breakdown,
        display: rating_display
      }
    end

    private

    def rating_distribution
      stats = vendor.reviews.published.pick(
        Arel.sql('COUNT(CASE WHEN rating = 5 THEN 1 END)'),
        Arel.sql('COUNT(CASE WHEN rating = 4 THEN 1 END)'),
        Arel.sql('COUNT(CASE WHEN rating = 3 THEN 1 END)'),
        Arel.sql('COUNT(CASE WHEN rating = 2 THEN 1 END)'),
        Arel.sql('COUNT(CASE WHEN rating = 1 THEN 1 END)')
      )&.map(&:to_i) || [0, 0, 0, 0, 0]

      {
        5 => stats[0],
        4 => stats[1],
        3 => stats[2],
        2 => stats[3],
        1 => stats[4]
      }
    end

    def rating_breakdown
      stats = vendor.reviews.published.pick(
        Arel.sql('AVG(quality_rating)'),
        Arel.sql('AVG(communication_rating)'),
        Arel.sql('AVG(value_rating)'),
        Arel.sql('AVG(punctuality_rating)')
      ) || [0, 0, 0, 0]

      {
        quality: stats[0].to_f.round(2),
        communication: stats[1].to_f.round(2),
        value: stats[2].to_f.round(2),
        punctuality: stats[3].to_f.round(2)
      }
    end

    def rating_display
      return 'New on Ayoj' if vendor.total_reviews.zero? || vendor.average_rating.to_f.zero?

      reviews_label = 'review'.pluralize(vendor.total_reviews)
      "#{vendor.average_rating.round(1)} (#{vendor.total_reviews} #{reviews_label})"
    end
  end
end
