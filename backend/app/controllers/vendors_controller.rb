# frozen_string_literal: true

# rubocop:disable-next Metrics/ClassLength
class VendorsController < ApiController
  # Public endpoints don't require authentication
  before_action :set_vendor, only: %i[show services availability portfolio vendor_reviews]

  def index
    @vendors = apply_filters(
      Vendor.includes(
        :user, :vendor_categories, :categories,
        :primary_vendor_category, :primary_category,
        services: :categories,
        portfolio_items: { images_attachments: :blob }
      )
    )
    total_count = @vendors.count

    @vendors = apply_pagination(@vendors)

    render json: {
      vendors: VendorSerializer.render_as_hash(@vendors, view: :summary),
      pagination: pagination_metadata(total_count)
    }
  end

  def show
    cache_key = ['vendor_detail', @vendor.id, @vendor.updated_at.to_i]
    data = Rails.cache.fetch(cache_key, expires_in: 30.minutes) do
      ActiveRecord::Associations::Preloader.new(
        records: [@vendor],
        associations: [
          :user,
          :primary_vendor_category,
          :primary_category,
          { services: :categories },
          { vendor_categories: :category },
          { portfolio_items: { images_attachments: :blob } }
        ]
      ).call

      VendorSerializer.render_as_hash(@vendor, view: :detail)
    end

    expires_in 1.minute, public: true, stale_while_revalidate: 5.minutes
    render json: { vendor: data }
  end

  def services
    if current_user && @vendor.user_id == current_user.id
      services = @vendor.services
                        .includes(:categories,
                                  service_images: { image_attachment: :blob },
                                  images_attachments: :blob)
                        .order(created_at: :desc)
      return render json: { services: ServiceSerializer.render_as_hash(services) }
    end

    cache_key = ['vendor_public_services', @vendor.id, @vendor.updated_at.to_i]
    data = Rails.cache.fetch(cache_key, expires_in: 30.minutes) do
      services = @vendor.services
                        .active
                        .includes(:categories,
                                  service_images: { image_attachment: :blob },
                                  images_attachments: :blob)
                        .order(created_at: :desc)
      ServiceSerializer.render_as_hash(services)
    end

    expires_in 1.minute, public: true, stale_while_revalidate: 5.minutes
    render json: { services: data }
  end

  def availability
    # Get availability for the next 30 days by default, disallowing past dates
    raw_start = params[:start_date]&.to_date || Date.current
    start_date = [raw_start, Date.current].max
    raw_end = params[:end_date]&.to_date || (start_date + 30.days)
    end_date = [raw_end, start_date].max

    availability_slots = @vendor.availability_slots
                                .where(date: start_date..end_date)
                                .where(is_available: true)
                                .order(:date, :start_time)
                                .reject(&:passed?)

    expires_in 1.minute, public: true, stale_while_revalidate: 2.minutes
    render json: {
      availability_slots: AvailabilitySlotSerializer.render_as_hash(availability_slots),
      date_range: {
        start_date: start_date,
        end_date: end_date
      }
    }
  end

  def portfolio
    if params[:category].present? || params[:featured].present?
      render json: filtered_portfolio_payload
      return
    end

    expires_in 1.minute, public: true, stale_while_revalidate: 5.minutes
    render json: cached_portfolio_payload
  end

  def vendor_reviews
    cache_key = ['vendor_public_reviews', @vendor.id, @vendor.updated_at.to_i]
    data = Rails.cache.fetch(cache_key, expires_in: 10.minutes) do
      reviews = Review.published.where(vendor_id: @vendor.id).recent.includes(:customer, :service)
      {
        reviews: ReviewSerializer.render_as_hash(reviews, view: :vendor_review),
        average_rating: @vendor.average_rating,
        total_reviews: @vendor.total_reviews
      }
    end

    expires_in 1.minute, public: true, stale_while_revalidate: 5.minutes
    render json: data
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

  def filtered_portfolio_payload
    portfolio_items = @vendor.portfolio_items.ordered.includes(images_attachments: :blob)
    portfolio_items = portfolio_items.by_category(params[:category]) if params[:category].present?
    portfolio_items = portfolio_items.featured if params[:featured] == 'true'

    {
      portfolio_items: PortfolioItemSerializer.render_as_hash(portfolio_items),
      categories: @vendor.portfolio_categories
    }
  end

  def cached_portfolio_payload
    cache_key = ['vendor_public_portfolio', @vendor.id, @vendor.updated_at.to_i]
    Rails.cache.fetch(cache_key, expires_in: 30.minutes) do
      items = @vendor.portfolio_items.ordered.includes(images_attachments: :blob)
      {
        portfolio_items: PortfolioItemSerializer.render_as_hash(items),
        categories: items.map(&:category).uniq.compact.sort
      }
    end
  end

  def set_vendor
    @vendor = Vendor.find_by_id_or_slug!(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Vendor not found' }, status: :not_found
  end
end
