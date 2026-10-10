# frozen_string_literal: true

# rubocop:disable Metrics/ClassLength
class ServiceSearchService
  include ActiveModel::Model
  include ActiveModel::Attributes
  include Callable

  # Pagination constants
  DEFAULT_PAGE = 1
  DEFAULT_PER_PAGE = 12
  MAX_PER_PAGE = 100

  # Sort constants
  VALID_SORT_FIELDS = %w[name base_price created_at updated_at].freeze
  VALID_SORT_DIRECTIONS = %w[asc desc].freeze

  # Search attributes
  attribute :query, :string
  attribute :location, :string
  attribute :category_id, :integer
  attribute :min_price, :decimal
  attribute :max_price, :decimal
  attribute :pricing_type, :string
  attribute :vendor_id, :integer
  attribute :page, :integer, default: DEFAULT_PAGE
  attribute :per_page, :integer, default: DEFAULT_PER_PAGE
  attribute :sort_by, :string, default: 'created_at'
  attribute :sort_direction, :string, default: 'desc'

  validates :page, numericality: { greater_than_or_equal_to: 1 }
  validates :per_page, numericality: { greater_than_or_equal_to: 1, less_than_or_equal_to: MAX_PER_PAGE }

  def initialize(attributes = {})
    super
    normalize_attributes
  end

  def call
    {
      services: paginated_services,
      total_count: total_count,
      page: page,
      per_page: per_page,
      total_pages: total_pages,
      pagination: pagination_info,
      filters: applied_filters,
      facets: facets,
      applied_filters: applied_filters
    }
  end

  def base_scope
    Service.active
           .joins(vendor_profile: :user)
           .where(users: { role: 'vendor' })
           .distinct
  end

  # rubocop:disable Metrics/AbcSize, Metrics/CyclomaticComplexity, Metrics/PerceivedComplexity
  def filtered_services
    # rubocop:enable Metrics/AbcSize, Metrics/CyclomaticComplexity, Metrics/PerceivedComplexity
    scope = base_scope

    # Text search
    if query.present?
      scope = scope.where(
        'services.name ILIKE ? OR services.description ILIKE ? OR vendor_profiles.business_name ILIKE ?',
        "%#{query}%", "%#{query}%", "%#{query}%"
      )
    end

    # Category filter
    if category_id.present?
      scope = scope.joins(:service_categories).where(service_categories: { category_id: category_id })
    end

    # Location filter
    scope = scope.where('vendor_profiles.location ILIKE ?', "%#{location}%") if location.present?

    # Price range filter
    scope = scope.where(services: { base_price: min_price.. }) if min_price.present?

    scope = scope.where(services: { base_price: ..max_price }) if max_price.present?

    # Pricing type filter
    scope = scope.where(pricing_type: pricing_type) if pricing_type.present? && Service.pricing_types.key?(pricing_type)

    # Vendor filter
    scope = scope.where(services: { vendor_profile_id: vendor_id }) if vendor_id.present?

    scope
  end

  def sorted_services
    return filtered_services unless VALID_SORT_FIELDS.include?(sort_by)

    case sort_by
    when 'name'
      filtered_services.order("services.name #{sort_direction}")
    when 'base_price'
      # Use subquery to avoid DISTINCT + complex ORDER BY conflict in PostgreSQL
      Service.where(id: filtered_services.select(:id)).order(
        Arel.sql("CASE WHEN services.pricing_type = #{Service.pricing_types['custom']} THEN 1 ELSE 0 END"),
        "services.base_price #{sort_direction}"
      )
    when 'updated_at'
      filtered_services.order("services.updated_at #{sort_direction}")
    else
      # Default to created_at
      filtered_services.order("services.created_at #{sort_direction}")
    end
  end

  def paginated_services
    sorted_services
      .includes(:categories, service_images: { image_attachment: :blob }, vendor_profile: { portfolio_items: { images_attachments: :blob } })
      .limit(per_page)
      .offset((page - 1) * per_page)
  end

  def total_count
    @total_count ||= filtered_services.count
  end

  def pagination_info
    {
      current_page: page,
      per_page: per_page,
      total_count: total_count,
      total_pages: total_pages,
      has_next_page: page < total_pages,
      has_prev_page: page > 1
    }
  end

  # rubocop:disable Metrics/CyclomaticComplexity
  def applied_filters
    # rubocop:enable Metrics/CyclomaticComplexity
    filters = {}
    filters[:query] = query if query.present?
    filters[:category_id] = category_id if category_id.present?
    filters[:location] = location if location.present?
    filters[:min_price] = min_price if min_price.present?
    filters[:max_price] = max_price if max_price.present?
    filters[:pricing_type] = pricing_type if pricing_type.present?
    filters[:vendor_id] = vendor_id if vendor_id.present?
    filters
  end

  def total_pages
    (total_count.to_f / per_page).ceil
  end

  def facets
    {
      categories: category_facets,
      price_ranges: price_range_facets,
      locations: location_facets,
      pricing_types: pricing_type_facets,
      vendor_ratings: vendor_rating_facets
    }
  end

  private

  def normalize_attributes
    # Strip whitespace from string parameters
    self.query = query.strip if query.present?
    self.location = location.strip if location.present?

    # Ensure page is at least 1
    self.page = [page.to_i, 1].max

    # Limit per_page to maximum allowed
    self.per_page = per_page.to_i.clamp(1, MAX_PER_PAGE)

    # Validate sort direction
    self.sort_direction = 'desc' unless VALID_SORT_DIRECTIONS.include?(sort_direction)

    # Validate sort field
    self.sort_by = 'created_at' unless VALID_SORT_FIELDS.include?(sort_by)
  end

  def category_facets
    filtered_services.except(:limit, :offset, :order)
                     .joins(:service_categories)
                     .group('service_categories.category_id')
                     .count
                     .map do |cat_id, count|
                       category = Category.find_by(id: cat_id)
                       { id: cat_id, name: category&.name, count: count }
    end
  end

  def price_range_facets
    # Placeholder for price range facets
    # In a real app, this would be more complex
    []
  end

  def location_facets
    filtered_services.except(:limit, :offset, :order)
                     .group('vendor_profiles.location')
                     .count
                     .map { |loc, count| { location: loc, count: count } }
  end

  def pricing_type_facets
    filtered_services.except(:limit, :offset, :order)
                     .group(:pricing_type)
                     .count
                     .map { |type, count| { pricing_type: type, label: type.titleize, count: count } }
  end

  def vendor_rating_facets
    []
  end
end
# rubocop:enable Metrics/ClassLength
