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

    # rubocop:disable Metrics/AbcSize, Metrics/CyclomaticComplexity, Metrics/PerceivedComplexity
    def filtered_services
      # rubocop:enable Metrics/AbcSize, Metrics/CyclomaticComplexity, Metrics/PerceivedComplexity
      scope = base_scope

      # Text search (searches service name, description, vendor business name, and category names)
      if query.present?
        clean_q = query.to_s.strip
        stem = clean_q.sub(/(ers|er|or|ors|ies|s)$/i, '')
        terms = [clean_q]
        terms << stem if stem.length >= 3 && stem != clean_q
        terms << 'photograph' if clean_q.downcase.start_with?('photo')
        terms << 'cater' if clean_q.downcase.start_with?('cater')
        terms << 'decor' if clean_q.downcase.start_with?('decor')
        terms = terms.uniq

        conditions = terms.map do
          '(services.name ILIKE ? OR services.description ILIKE ? OR vendors.business_name ILIKE ? OR categories.name ILIKE ?)'
        end.join(' OR ')
        query_params = terms.flat_map { |t| ["%#{t}%", "%#{t}%", "%#{t}%", "%#{t}%"] }

        scope = scope.left_joins(:categories).where(conditions, *query_params)
      end

      # Category filter
      if category_id.present?
        scope = scope.joins(:service_categories).where(service_categories: { category_id: category_id })
      end

      # Location filter
      scope = scope.where('vendors.location ILIKE ?', "%#{location}%") if location.present?

      # Price range filter
      scope = scope.where(services: { base_price: min_price.. }) if min_price.present?
      scope = scope.where(services: { base_price: ..max_price }) if max_price.present?

      # Pricing type filter
      if pricing_type.present? && Service.pricing_types.key?(pricing_type)
        scope = scope.where(pricing_type: pricing_type)
      end

      # Vendor filter
      scope = scope.where(services: { vendor_id: vendor_id }) if vendor_id.present?

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
          Arel.sql("CASE WHEN services.pricing_type = 'custom' THEN 1 ELSE 0 END"),
          "services.base_price #{sort_direction}"
        )
      when 'updated_at'
        filtered_services.order("services.updated_at #{sort_direction}")
      else
        filtered_services.order("services.created_at #{sort_direction}")
      end
    end

    def paginated_services
      sorted_services
        .includes(:categories, service_images: { image_attachment: :blob },
                               vendor: { portfolio_items: { images_attachments: :blob } })
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
      self.query = query.strip if query.present?
      self.location = location.strip if location.present?
      self.page = [page.to_i, 1].max
      self.per_page = per_page.to_i.clamp(1, MAX_PER_PAGE)
      self.sort_direction = 'desc' unless VALID_SORT_DIRECTIONS.include?(sort_direction)
      self.sort_by = 'created_at' unless VALID_SORT_FIELDS.include?(sort_by)
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
      []
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
      []
    end
  end
end
