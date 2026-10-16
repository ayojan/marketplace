# frozen_string_literal: true

module Vendors
  class UpdateRatingStats
    extend Dry::Initializer

    option :vendor, type: Types.Instance(Vendor)

    def self.call(vendor:)
      new(vendor: vendor).call
    end

    def call
      stats = vendor.reviews.published.pick(
        'COUNT(id)',
        'AVG(rating)',
        'AVG(quality_rating)',
        'AVG(communication_rating)',
        'AVG(value_rating)',
        'AVG(punctuality_rating)'
      )

      count = stats[0].to_i
      avg = stats[1].to_f.round(2)

      vendor.update(average_rating: avg, total_reviews: count)

      {
        count: count,
        average: avg,
        quality: stats[2].to_f.round(2),
        communication: stats[3].to_f.round(2),
        value: stats[4].to_f.round(2),
        punctuality: stats[5].to_f.round(2)
      }
    end
  end
end
