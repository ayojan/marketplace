# frozen_string_literal: true

class VendorsController < ApiController
  include VendorSerializable

  # Public endpoints don't require authentication
  before_action :set_vendor_profile, only: %i[show services availability portfolio vendor_reviews]

  def index
    @vendors = apply_filters(
      VendorProfile.includes(:user, services: :categories, portfolio_items: { images_attachments: :blob })
    )
    total_count = @vendors.count

    @vendors = apply_pagination(@vendors)

    render json: {
      vendors: @vendors.map { |vendor| vendor_summary_json(vendor) },
      pagination: pagination_metadata(total_count)
    }
  end

  def show
    render json: { vendor: vendor_detail_json(@vendor_profile) }
  end

  def services
    services = @vendor_profile.services.active.includes(:categories, :service_images)

    render json: {
      services: services.map { |service| service_json(service) }
    }
  end

  def availability
    # Get availability for the next 30 days by default, disallowing past dates
    raw_start = params[:start_date]&.to_date || Date.current
    start_date = [raw_start, Date.current].max
    raw_end = params[:end_date]&.to_date || (start_date + 30.days)
    end_date = [raw_end, start_date].max

    availability_slots = @vendor_profile.availability_slots
                                        .where(date: start_date..end_date)
                                        .where(is_available: true)
                                        .order(:date, :start_time)
                                        .reject(&:passed?)

    render json: {
      availability_slots: availability_slots.map { |slot| availability_slot_json(slot) },
      date_range: {
        start_date: start_date,
        end_date: end_date
      }
    }
  end

  def portfolio
    portfolio_items = @vendor_profile.portfolio_items.ordered
    portfolio_items = portfolio_items.by_category(params[:category]) if params[:category].present?
    portfolio_items = portfolio_items.featured if params[:featured] == 'true'

    render json: {
      portfolio_items: portfolio_items.map { |item| portfolio_item_json(item) },
      categories: @vendor_profile.portfolio_categories
    }
  end

  def vendor_reviews
    reviews = Review.published.where(vendor_profile_id: @vendor_profile.id).recent.includes(:customer, :service)
    render json: {
      reviews: reviews.map { |r| { id: r.id, rating: r.rating, comment: r.comment, created_at: r.created_at } },
      average_rating: @vendor_profile.average_rating,
      total_reviews: @vendor_profile.total_reviews
    }
  end

  private

  def apply_filters(vendors)
    vendors = vendors.by_location(params[:location]) if params[:location].present?
    vendors = vendors.with_rating_above(params[:min_rating].to_f) if params[:min_rating].present?
    vendors = vendors.by_experience(params[:min_experience].to_i) if params[:min_experience].present?
    vendors = vendors.verified if params[:verified] == 'true'
    apply_location_search(vendors)
  end

  def apply_location_search(vendors)
    return vendors unless params[:latitude].present? && params[:longitude].present?

    radius = params[:radius]&.to_f || 50 # Default 50km radius
    vendors.within_radius(params[:latitude].to_f, params[:longitude].to_f, radius)
  end

  def apply_pagination(vendors)
    vendors.offset((current_page - 1) * per_page).limit(per_page)
  end

  def current_page
    params[:page]&.to_i || 1
  end

  def per_page
    [params[:per_page]&.to_i || 20, 50].min # Max 50 per page
  end

  def pagination_metadata(total_count)
    {
      current_page: current_page,
      per_page: per_page,
      total_count: total_count,
      total_pages: (total_count.to_f / per_page).ceil
    }
  end

  def set_vendor_profile
    @vendor_profile = VendorProfile.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Vendor not found' }, status: :not_found
  end
end
