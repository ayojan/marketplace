# frozen_string_literal: true

module Customers
  class ToggleFavorite
    include Callable
    extend Dry::Initializer

    option :user, type: Types.Instance(User)
    option :vendor_id, type: Types::Coercible::Integer

    def call
      vendor = find_vendor
      return { success: false, error: 'Vendor not found' } unless vendor

      return { success: false, error: 'You cannot favorite your own business profile' } if vendor.user_id == user.id

      # Authorization check
      authorize_favorite_action(vendor)

      favorite = CustomerFavorite.find_by(user_id: user.id, vendor_id: vendor.id)

      if favorite
        remove_favorite(favorite)
      else
        add_favorite(vendor)
      end
    rescue Auth::AuthorizationService::NotAuthorizedError => e
      { success: false, error: e.message }
    end

    private

    def find_vendor
      Vendor.find_by(id: vendor_id)
    end

    def authorize_favorite_action(vendor)
      Auth::AuthorizationService.authorize!(user, vendor, :toggle_favorite)
    end

    def add_favorite(vendor)
      CustomerFavorite.create(user_id: user.id, vendor_id: vendor.id)
      { success: true, action: 'added', is_favorited: true }
    rescue StandardError => e
      Rails.logger.error("Failed to add favorite: #{e.message}")
      { success: false, error: e.message }
    end

    def remove_favorite(favorite)
      favorite.destroy
      { success: true, action: 'removed', is_favorited: false }
    rescue StandardError => e
      Rails.logger.error("Failed to remove favorite: #{e.message}")
      { success: false, error: e.message }
    end
  end
end
