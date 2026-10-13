# frozen_string_literal: true

module Favorites
  class GetCustomerFavorites
    extend Dry::Initializer

    option :user, type: Types.Instance(User)
    option :page, type: Types::Integer, default: proc { 1 }
    option :per_page, type: Types::Integer, default: proc { 12 }
    option :sort, type: Types::String, default: proc { 'recent' }

    def self.call(**)
      new(**).call
    end

    def call
      favorites = build_query
      total_count = favorites.count
      paginated = paginate(favorites)

      {
        success: true,
        vendor_profiles: paginated,
        total_count: total_count,
        page: page,
        per_page: per_page,
        total_pages: (total_count.to_f / per_page).ceil
      }
    rescue StandardError => e
      Rails.logger.error("Failed to get customer favorites: #{e.message}")
      { success: false, error: e.message }
    end

    private

    def build_query
      query = user.customer_favorites.includes(:vendor_profile)

      case sort
      when 'rating'
        query.joins(:vendor_profile).order('vendor_profiles.average_rating DESC')
      when 'reviews'
        query.joins(:vendor_profile).order('vendor_profiles.total_reviews DESC')
      else
        query.recent_first
      end
    end

    def paginate(query)
      query.page(page).per(per_page).map(&:vendor_profile)
    end
  end
end
