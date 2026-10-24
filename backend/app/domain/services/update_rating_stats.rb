# frozen_string_literal: true

module Services
  class UpdateRatingStats
    extend Dry::Initializer

    option :service, type: Types.Instance(Service)

    def self.call(service:)
      new(service: service).call
    end

    def call
      stats = service.reviews.published.pick('COUNT(id)', 'AVG(rating)')
      count = stats[0].to_i
      avg = stats[1].to_f.round(2)

      # rubocop:disable-next Rails/SkipsModelValidations
      service.update_columns(average_rating: avg, total_reviews: count)

      { count: count, average: avg }
    end
  end
end
