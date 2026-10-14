# frozen_string_literal: true

class VendorAnalyticsService
  include Callable

  def initialize(vendor_profile)
    @vendor_profile = vendor_profile
    @user = vendor_profile.user
  end

  def call
    {
      overview: overview_stats,
      revenue_stats: revenue_stats,
      booking_stats: booking_stats,
      rating_stats: rating_stats,
      recent_activity: recent_activity
    }
  end

  private

  def overview_stats
    {
      total_bookings: @vendor_profile.bookings.count,
      active_services: @vendor_profile.services.active.count,
      average_rating: @vendor_profile.average_rating.to_f,
      total_reviews: @vendor_profile.total_reviews,
      verification_status: @vendor_profile.verification_status
    }
  end

  def revenue_stats
    completed_bookings = @vendor_profile.bookings.completed
    {
      total_revenue: completed_bookings.sum(:total_amount).to_f,
      pending_revenue: @vendor_profile.bookings.accepted.sum(:total_amount).to_f,
      average_booking_value: completed_bookings.average(:total_amount).to_f.round(2)
    }
  end

  def booking_stats
    bookings = @vendor_profile.bookings
    {
      pending: bookings.pending.count,
      accepted: bookings.accepted.count,
      completed: bookings.completed.count,
      cancelled: bookings.cancelled.count,
      conversion_rate: calculate_conversion_rate
    }
  end

  def rating_stats
    {
      average: @vendor_profile.average_rating.to_f,
      distribution: @vendor_profile.rating_distribution,
      breakdown: @vendor_profile.rating_breakdown
    }
  end

  def recent_activity
    (recent_bookings + recent_reviews).sort_by { |a| a[:date] || a[:created_at] }.last(10).reverse
  end

  def recent_bookings
    @vendor_profile.bookings.includes(:customer).order(created_at: :desc).limit(5).map do |b|
      { type: 'booking', id: b.id, customer: b.customer&.full_name, date: b.event_date, status: b.status,
        amount: b.total_amount.to_f }
    end
  end

  def recent_reviews
    @vendor_profile.reviews.published.includes(:customer).order(created_at: :desc).limit(5).map do |r|
      { type: 'review', id: r.id, customer: r.customer&.full_name, rating: r.rating, date: r.created_at }
    end
  end

  def calculate_conversion_rate
    # This is a placeholder. In a real app, you'd track profile views vs bookings.
    # For now, let's just return a mock or a simple ratio if we had "leads"
    0.0
  end
end
