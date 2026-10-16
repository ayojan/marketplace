# frozen_string_literal: true

module Vendor::RatingStats
  extend ActiveSupport::Concern

  # Returns the distribution hash (e.g. { 1 => 2, 2 => 5, ... }) from the
  # cached CalculateRatingStats service object.
  def rating_distribution
    cached_rating_stats[:distribution]
  end

  # Returns the per-star breakdown percentages from the cached stats.
  def rating_breakdown
    cached_rating_stats[:breakdown]
  end

  # Returns a human-readable display string for the rating.
  def rating_display
    cached_rating_stats[:display]
  end

  private

  # Memoised wrapper around Vendors::CalculateRatingStats.
  # Reset by calling `@rating_stats = nil` when reviews change.
  def cached_rating_stats
    @cached_rating_stats ||= Vendors::CalculateRatingStats.call(vendor: self)
  end
end
