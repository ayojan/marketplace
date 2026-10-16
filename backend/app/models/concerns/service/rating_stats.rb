# frozen_string_literal: true

module Service::RatingStats
  extend ActiveSupport::Concern

  included do
    validates :average_rating, numericality: { greater_than_or_equal_to: 0.0, less_than_or_equal_to: 5.0 }
    validates :total_reviews,  numericality: { greater_than_or_equal_to: 0 }
  end

  def update_rating_stats!
    @cached_rating_stats = nil
    Services::UpdateRatingStats.call(service: self)
  end

  def rating_distribution
    cached_rating_stats[:distribution]
  end

  def rating_breakdown
    cached_rating_stats[:breakdown]
  end

  def rating_display
    cached_rating_stats[:display]
  end

  private

  def cached_rating_stats
    @cached_rating_stats ||= Services::CalculateRatingStats.call(service: self)
  end
end
