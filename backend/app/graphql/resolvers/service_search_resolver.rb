# frozen_string_literal: true

# rubocop:disable Metrics/ClassLength, Metrics/MethodLength, Style/MultilineBlockChain
class Resolvers::ServiceSearchResolver < Resolvers::BaseResolver
  description 'Search for services based on various criteria'

  type Types::ServiceSearchResultType, null: false

  argument :filters, Types::ServiceFiltersInput, required: false, description: 'Service filters'
  argument :location, Types::LocationInput, required: false, description: 'Location-based filtering'
  argument :pagination, Types::PaginationInput, required: false, description: 'Pagination options'
  argument :query, String, required: false, description: 'Search query string'

  # == Constants ==
  MAX_PER_PAGE = 100
  DEFAULT_PER_PAGE = 20
  DEFAULT_SORT_BY = 'created_at'
  DEFAULT_SORT_ORDER = 'desc'
  SLOW_QUERY_THRESHOLD = 2.0 # seconds

  # == Main Resolver ==
  # Resolves a service search with query, filters, location, and pagination.
  # Returns a hash with services, pagination, facets, and search time.
  # rubocop:disable Metrics/AbcSize
  def resolve(query: nil, filters: {}, location: {}, pagination: {})
    start_time = Time.current

    # Convert GraphQL input objects to regular hashes for internal manipulation
    filters = (filters || {}).to_h
    location = (location || {}).to_h
    pagination = (pagination || {}).to_h

    # Validate and sanitize pagination
    pagination = validate_pagination(pagination)

    # Build the base query with eager loading to avoid N+1
    services = build_base_query(query)
               .includes(vendor_services: :vendor_profile).includes(:categories, :service_images)

    # Apply filters and location
    services = apply_filters(services, filters)
    services = apply_location_filter(services, location)

    # Apply sorting
    services = apply_sorting(services, pagination)

    # Get total count before pagination
    total_count = services.count

    # Apply pagination
    services = apply_pagination(services, pagination)

    # Calculate pagination metadata
    total_pages = (total_count.to_f / pagination[:per_page]).ceil
    current_page = pagination[:page]

    # Generate facets
    facets = generate_facets(query, filters, location)

    # Calculate search time
    search_time = Time.current - start_time
    if search_time > SLOW_QUERY_THRESHOLD
      Rails.logger.warn(
        "ServiceSearchResolver: Slow search (#{search_time.round(2)}s) for query: #{query.inspect}, " \
        "filters: #{filters.inspect}, location: #{location.inspect}"
      )
    end

    {
      services: services,
      total_count: total_count,
      current_page: current_page,
      per_page: pagination[:per_page],
      total_pages: total_pages,
      facets: facets,
      search_time: search_time
    }
  end
  # rubocop:enable Metrics/AbcSize

  private

  # Validates and normalizes pagination input.
  def validate_pagination(pagination)
    page = pagination[:page].present? ? [pagination[:page].to_i, 1].max : 1
    per_page = pagination[:per_page].present? ? pagination[:per_page].to_i.clamp(1, MAX_PER_PAGE) : DEFAULT_PER_PAGE
    sort_by = pagination[:sort_by] || DEFAULT_SORT_BY
    sort_order = %w[asc desc].include?(pagination[:sort_order]) ? pagination[:sort_order] : DEFAULT_SORT_ORDER
    { page: page, per_page: per_page, sort_by: sort_by, sort_order: sort_order }
  end

  # Builds the base query for services, applying search if present.
  def build_base_query(query)
    services = Service.active
    if query.present?
      services.joins(vendor_services: :vendor_profile).left_joins(:categories).where(
        'services.name ILIKE :q OR services.description ILIKE :q OR vendor_profiles.business_name ILIKE :q',
        q: "%#{query}%"
      )
    else
      services.joins(vendor_services: :vendor_profile).left_joins(:categories)
    end
  end

  def apply_filters(services, filters)
    return services if filters.blank?

    # Category filter
    if filters[:categories].present?
      services = services.joins(:service_categories).where(service_categories: { category_id: filters[:categories] })
    end

    # Price range filter
    services = apply_price_filter(services, filters)

    # Pricing type filter
    services = services.where(pricing_type: filters[:pricing_type]) if filters[:pricing_type].present?

    # Vendor rating filter
    if filters[:vendor_rating].present?
      services = services.where(vendor_profiles: { average_rating: (filters[:vendor_rating]).. })
    end

    # Verified vendors only
    services = services.where(vendor_profiles: { verification_status: :verified }) if filters[:verified_vendors_only]

    # Status filter
    services = services.where(status: filters[:status]) if filters[:status].present?

    services
  end

  def apply_location_filter(services, location)
    return services if location.blank?

    # Geospatial filtering with latitude/longitude and radius
    if location[:latitude].present? && location[:longitude].present? && location[:radius].present?
      lat = location[:latitude].to_f
      lng = location[:longitude].to_f
      radius_km = location[:radius].to_f

      # Validate coordinates
      unless lat.between?(-90, 90) && lng.between?(-180, 180)
        raise GraphQL::ExecutionError,
              'Invalid coordinates: latitude must be between -90 and 90, longitude between -180 and 180'
      end

      services = services.joins(vendor_services: :vendor_profile)
                         .merge(VendorProfile.within_radius(lat, lng, radius_km))
    end

    # Text-based location filtering
    apply_text_location_filters(services, location)
  end

  def apply_text_location_filters(services, location)
    if location[:city].present?
      services = services.joins(vendor_services: :vendor_profile).where('vendor_profiles.location ILIKE ?',
                                                                        "%#{location[:city]}%")
    end
    if location[:state].present?
      services = services.joins(vendor_services: :vendor_profile).where('vendor_profiles.location ILIKE ?',
                                                                        "%#{location[:state]}%")
    end
    if location[:country].present?
      services = services.joins(vendor_services: :vendor_profile).where('vendor_profiles.location ILIKE ?',
                                                                        "%#{location[:country]}%")
    end
    if location[:address].present?
      services = services.joins(vendor_services: :vendor_profile).where('vendor_profiles.location ILIKE ?',
                                                                        "%#{location[:address]}%")
    end
    services
  end

  def apply_sorting(services, pagination)
    case pagination[:sort_by]
    when 'name'
      services.order("services.name #{pagination[:sort_order]}")
    when 'price'
      services.order("services.base_price #{pagination[:sort_order]} NULLS LAST")
    when 'rating'
      services.order("vendor_profiles.average_rating #{pagination[:sort_order]}")
    else
      services.order("services.created_at #{pagination[:sort_order]}")
    end
  end

  def apply_pagination(services, pagination)
    offset = (pagination[:page] - 1) * pagination[:per_page]
    services.limit(pagination[:per_page]).offset(offset)
  end

  def generate_facets(query, filters, location)
    # Build base query for facet generation (without pagination)
    base_services = build_base_query(query)
    base_services = apply_location_filter(base_services, location)

    {
      categories: generate_category_facets(base_services, filters),
      price_ranges: generate_price_range_facets(base_services, filters),
      locations: generate_location_facets(base_services, filters),
      pricing_types: generate_pricing_type_facets(base_services, filters),
      vendor_ratings: generate_rating_facets(base_services, filters)
    }
  end

  def generate_category_facets(services, filters)
    # Apply all filters except categories
    facet_services = apply_filters(services, filters.except(:categories))

    facet_services
      .joins(:service_categories, :categories)
      .group('categories.id', 'categories.name', 'categories.slug')
      .count
      .map do |(id, name, slug), count|
        {
          id: id,
          name: name,
          slug: slug,
          count: count
        }
      end
  end

  def generate_price_range_facets(services, filters)
    price_ranges = [
      { min: 0, max: 10_000, label: 'Under ₹10,000' },
      { min: 10_000, max: 50_000, label: '₹10,000 - ₹50,000' },
      { min: 50_000, max: 100_000, label: '₹50,000 - ₹1,00,000' },
      { min: 100_000, max: 500_000, label: '₹1,00,000 - ₹5,00,000' },
      { min: 500_000, max: Float::INFINITY, label: 'Over ₹5,00,000' }
    ]

    # Apply all filters except price
    facet_services = apply_filters(services, filters.except(:price_min, :price_max))

    facets = price_ranges.map do |range|
      count = facet_services
              .where(services: { base_price: (range[:min])...(range[:max]) })
              .count

      {
        min_price: range[:min],
        max_price: range[:max] == Float::INFINITY ? nil : range[:max],
        label: range[:label],
        count: count
      }
    end
    facets.select { |facet| facet[:count].positive? }
  end

  def generate_location_facets(services, filters)
    # Apply all filters (locations are already in services via apply_location_filter)
    facet_services = apply_filters(services, filters)

    facet_services
      .joins(vendor_services: :vendor_profile)
      .group('vendor_profiles.location')
      .count
      .map do |location, count|
        {
          location: location,
          count: count
        }
      end
      .sort_by { |facet| -facet[:count] }
      .first(20) # Limit to top 20 locations
  end

  def generate_pricing_type_facets(services, filters)
    # Apply all filters except pricing_type
    facet_services = apply_filters(services, filters.except(:pricing_type))

    facets = Service.pricing_types.map do |pricing_type, _|
      count = facet_services.where(pricing_type: pricing_type).count

      {
        pricing_type: pricing_type,
        label: pricing_type.humanize,
        count: count
      }
    end
    facets.select { |facet| facet[:count].positive? }
  end

  def generate_rating_facets(services, filters)
    rating_ranges = [
      { min: 4.5, max: 5.0, label: '4.5+ stars' },
      { min: 4.0, max: 4.5, label: '4.0 - 4.5 stars' },
      { min: 3.5, max: 4.0, label: '3.5 - 4.0 stars' },
      { min: 3.0, max: 3.5, label: '3.0 - 3.5 stars' },
      { min: 0.0, max: 3.0, label: 'Under 3.0 stars' }
    ]

    # Apply all filters except vendor_rating
    facet_services = apply_filters(services, filters.except(:vendor_rating))

    facets = rating_ranges.map do |range|
      count = facet_services
              .joins(vendor_services: :vendor_profile)
              .where(vendor_profiles: { average_rating: (range[:min])...(range[:max]) })
              .count

      {
        min_rating: range[:min],
        max_rating: range[:max],
        label: range[:label],
        count: count
      }
    end
    facets.select { |facet| facet[:count].positive? }
  end

  def apply_price_filter(services, filters)
    services = services.where(services: { base_price: (filters[:price_min]).. }) if filters[:price_min].present?
    services = services.where(services: { base_price: ..(filters[:price_max]) }) if filters[:price_max].present?
    services
  end
end

# rubocop:enable Metrics/ClassLength, Metrics/MethodLength, Style/MultilineBlockChain
