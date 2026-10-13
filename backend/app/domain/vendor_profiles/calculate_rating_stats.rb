# frozen_string_literal: true

module VendorProfiles
  class CalculateRatingStats
    extend Dry::Initializer

    option :vendor_profile, type: Types.Instance(VendorProfile)

    def self.call(vendor_profile:)
      new(vendor_profile: vendor_profile).call
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
      # Single optimized query instead of filter + group
      stats = vendor_profile.reviews.published.pick(
        Arel.sql('COUNT(CASE WHEN rating = 5 THEN 1 END)'),
        Arel.sql('COUNT(CASE WHEN rating = 4 THEN 1 END)'),
        Arel.sql('COUNT(CASE WHEN rating = 3 THEN 1 END)'),
        Arel.sql('COUNT(CASE WHEN rating = 2 THEN 1 END)'),
        Arel.sql('COUNT(CASE WHEN rating = 1 THEN 1 END)')
      ).map(&:to_i)

      {
        5 => stats[0],
        4 => stats[1],
        3 => stats[2],
        2 => stats[3],
        1 => stats[4]
      }
    end

    def rating_breakdown
      stats = vendor_profile.reviews.published.pick(
        Arel.sql('AVG(quality_rating)'),
        Arel.sql('AVG(communication_rating)'),
        Arel.sql('AVG(value_rating)'),
        Arel.sql('AVG(punctuality_rating)')
      )

      {
        quality: stats[0].to_f.round(2),
        communication: stats[1].to_f.round(2),
        value: stats[2].to_f.round(2),
        punctuality: stats[3].to_f.round(2)
      }
    end

    def rating_display
      return 'No ratings yet' if vendor_profile.total_reviews.zero?

      reviews_label = 'review'.pluralize(vendor_profile.total_reviews)
      "#{vendor_profile.average_rating.round(1)} (#{vendor_profile.total_reviews} #{reviews_label})"
    end
  end
end
