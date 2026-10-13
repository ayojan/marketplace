# frozen_string_literal: true

module Favorites
  class ToggleFavorite
    extend Dry::Initializer

    option :user, type: Types.Instance(User)
    option :vendor_profile_id, type: Types::Coercible::Integer

    def self.call(**)
      new(**).call
    rescue Dry::Types::ConstraintError, Dry::Types::CoercionError, ArgumentError => e
      { success: false, error: e.message }
    end

    def call
      vendor_profile = find_vendor_profile
      return { success: false, error: 'Vendor not found' } unless vendor_profile

      # Authorization check
      authorize_favorite_action(vendor_profile)

      favorite = CustomerFavorite.find_by(user_id: user.id, vendor_profile_id: vendor_profile.id)

      if favorite
        remove_favorite(favorite)
      else
        add_favorite(vendor_profile)
      end
    rescue AuthorizationService::NotAuthorizedError => e
      { success: false, error: e.message }
    end

    private

    def find_vendor_profile
      VendorProfile.find_by(id: vendor_profile_id)
    end

    def authorize_favorite_action(vendor_profile)
      AuthorizationService.authorize!(user, vendor_profile, :toggle_favorite)
    end

    def add_favorite(vendor_profile)
      CustomerFavorite.create(user_id: user.id, vendor_profile_id: vendor_profile.id)
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
