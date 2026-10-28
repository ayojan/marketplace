# frozen_string_literal: true

module Services
  # rubocop:disable-next Metrics/ClassLength
  class SearchService
    include ActiveModel::Model
    include ActiveModel::Attributes
    include Callable

    # Pagination constants
    DEFAULT_PAGE = 1
    DEFAULT_PER_PAGE = 12
    MAX_PER_PAGE = 100

    # Sort constants
    VALID_SORT_FIELDS = %w[relevance name base_price created_at updated_at].freeze
    VALID_SORT_DIRECTIONS = %w[asc desc].freeze

    # Facet definitions
    PRICE_RANGES = [
      { id: 'under_1000', label: 'Under ₹1,000', min: nil, max: 1000 },
      { id: '1000_to_5000', label: '₹1,000 - ₹5,000', min: 1000, max: 5000 },
      { id: '5000_to_15000', label: '₹5,000 - ₹15,000', min: 5000, max: 15_000 },
      { id: '15000_to_50000', label: '₹15,000 - ₹50,000', min: 15_000, max: 50_000 },
      { id: 'above_50000', label: '₹50,000+', min: 50_000, max: nil }
    ].freeze

    RATING_RANGES = [
      { id: '4_5_plus', label: '4.5 & above', min_rating: 4.5 },
      { id: '4_0_plus', label: '4.0 & above', min_rating: 4.0 },
      { id: '3_5_plus', label: '3.5 & above', min_rating: 3.5 },
      { id: '3_0_plus', label: '3.0 & above', min_rating: 3.0 }
    ].freeze

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
    attribute :include_facets, :boolean, default: false

    validates :page, numericality: { greater_than_or_equal_to: 1 }
    validates :per_page, numericality: { greater_than_or_equal_to: 1, less_than_or_equal_to: MAX_PER_PAGE }

    def initialize(attributes = {})
      super
      normalize_attributes
    end

    def call
      response = {
        services: paginated_services,
        total_count: total_count,
        page: page,
        per_page: per_page,
        total_pages: total_pages,
        pagination: pagination_info,
        filters: applied_filters,
        applied_filters: applied_filters
      }
      response[:facets] = facets if include_facets
      response
    end

    def base_scope
      Service.active
             .joins(vendor: :user)
             .where(users: { role: 'vendor' })
             .distinct
    end

    def filtered_services
      scope = base_scope
      scope = apply_text_search(scope)
      scope = apply_category_filter(scope)
      scope = apply_location_filter(scope)
      scope = apply_price_filter(scope)
      scope = apply_pricing_type_filter(scope)
      apply_vendor_filter(scope)
    end

    def sorted_services
      return filtered_services unless VALID_SORT_FIELDS.include?(sort_by)

      case sort_by
      when 'relevance'
        sort_by_relevance
      when 'name'
        filtered_services.order("services.name #{sort_direction}")
      when 'base_price'
        sort_by_base_price
      when 'updated_at'
        filtered_services.order("services.updated_at #{sort_direction}")
      else
        filtered_services.order("services.created_at #{sort_direction}")
      end
    end

    def paginated_services
      sorted_services
        .includes(
          :categories,
          service_images: { image_attachment: :blob },
          vendor: [:primary_vendor_category,
                   :primary_category,
                   :categories,
                   { portfolio_items: { images_attachments: :blob } }]
        )
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

    def applied_filters
      {
        query: query,
        category_id: category_id,
        location: location,
        min_price: min_price,
        max_price: max_price,
        pricing_type: pricing_type,
        vendor_id: vendor_id
      }.compact_blank
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
      self.query = query.strip if query.present?
      self.location = location.strip if location.present?
      self.page = [page.to_i, 1].max
      self.per_page = per_page.to_i.clamp(1, MAX_PER_PAGE)
      self.sort_direction = 'desc' unless VALID_SORT_DIRECTIONS.include?(sort_direction)
      self.sort_by = 'created_at' unless VALID_SORT_FIELDS.include?(sort_by)
    end

    def apply_text_search(scope)
      return scope if query.blank?

      tsquery = build_tsquery(query)
      return scope if tsquery.blank?

      scope.left_joins(:categories).where(full_text_search_clause, tsquery: tsquery)
    end

    def build_tsquery(input)
      words = input.to_s.scan(/\w+/)
      return nil if words.empty?

      words.map { |w| "#{w}:*" }.join(' & ')
    end

    def vector_sql
      Service.column_names.include?('search_vector') ? 'services.search_vector' : fallback_vector_sql
    end

    def fallback_vector_sql
      "to_tsvector('english', coalesce(services.name, '') || ' ' || coalesce(services.description, ''))"
    end

    def full_text_search_clause
      "(#{vector_sql} @@ to_tsquery('english', :tsquery) OR " \
        "to_tsvector('english', coalesce(vendors.business_name, '')) @@ to_tsquery('english', :tsquery) OR " \
        "to_tsvector('english', coalesce(categories.name, '')) @@ to_tsquery('english', :tsquery))"
    end

    def sort_by_relevance
      tsquery = build_tsquery(query)
      if tsquery.present?
        sanitized_ts = Service.sanitize_sql_array(['?', tsquery])
        rank_sql = "ts_rank(#{vector_sql}, to_tsquery('english', #{sanitized_ts}))"
        filtered_services.order(Arel.sql("#{rank_sql} DESC"), 'services.created_at DESC')
      else
        filtered_services.order("services.created_at #{sort_direction}")
      end
    end

    def sort_by_base_price
      Service.where(id: filtered_services.select(:id)).order(
        Arel.sql("CASE WHEN services.pricing_type = 'custom' THEN 1 ELSE 0 END"),
        "services.base_price #{sort_direction}"
      )
    end

    def apply_category_filter(scope)
      return scope if category_id.blank?

      scope.joins(:service_categories).where(service_categories: { category_id: category_id })
    end

    def apply_location_filter(scope)
      return scope if location.blank?

      scope.where('vendors.location ILIKE ?', "%#{location}%")
    end

    def apply_price_filter(scope)
      scope = scope.where(services: { base_price: min_price.. }) if min_price.present?
      scope = scope.where(services: { base_price: ..max_price }) if max_price.present?
      scope
    end

    def apply_pricing_type_filter(scope)
      return scope unless pricing_type.present? && Service.pricing_types.key?(pricing_type)

      scope.where(pricing_type: pricing_type)
    end

    def apply_vendor_filter(scope)
      return scope if vendor_id.blank?

      scope.where(services: { vendor_id: vendor_id })
    end

    def category_facets
      counts = filtered_services.except(:limit, :offset, :order)
                                .joins(:service_categories)
                                .group('service_categories.category_id')
                                .count
      return [] if counts.empty?

      categories = Category.where(id: counts.keys).index_by(&:id)
      counts.map do |cat_id, count|
        category = categories[cat_id]
        { id: cat_id, name: category&.name, count: count }
      end
    end

    def price_range_facets
      base = filtered_services.except(:limit, :offset, :order)
      PRICE_RANGES.filter_map do |range|
        scope = base
        scope = scope.where(services: { base_price: ..range[:max] }) if range[:min].nil?
        scope = scope.where(services: { base_price: range[:min].. }) if range[:max].nil?
        scope = scope.where(services: { base_price: range[:min]..range[:max] }) if range[:min] && range[:max]

        count = scope.count
        next if count.zero?

        { id: range[:id], label: range[:label], min_price: range[:min], max_price: range[:max], count: count }
      end
    end

    def location_facets
      filtered_services.except(:limit, :offset, :order)
                       .group('vendors.location')
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
      base = filtered_services.except(:limit, :offset, :order)
      RATING_RANGES.filter_map do |range|
        count = base.where(vendors: { average_rating: (range[:min_rating]).. }).count
        next if count.zero?

        { id: range[:id], label: range[:label], min_rating: range[:min_rating], count: count }
      end
    end
  end
end
