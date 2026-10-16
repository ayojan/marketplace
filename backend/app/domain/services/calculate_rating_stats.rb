# frozen_string_literal: true

module Services
  class CalculateRatingStats
    extend Dry::Initializer

    option :service, type: Types.Instance(Service)

    def self.call(service:)
      new(service: service).call
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
      stats = service.reviews.published.pick(
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
      stats = service.reviews.published.pick(
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
      return 'No ratings yet' if service.total_reviews.zero?

      reviews_label = 'review'.pluralize(service.total_reviews)
      "#{service.average_rating.round(1)} (#{service.total_reviews} #{reviews_label})"
    end
  end
end
