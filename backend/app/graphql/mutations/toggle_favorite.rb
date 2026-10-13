# frozen_string_literal: true

module Mutations
  class ToggleFavorite < Mutations::BaseMutation
    description 'Toggle favorite status for a vendor profile'

    argument :vendor_profile_id, ID, required: true, description: 'ID of the vendor profile to favorite or unfavorite'

    field :errors, [String], null: false, description: 'List of error messages if the operation failed'
    field :is_favorited, Boolean, null: false, description: 'Whether the vendor profile is now favorited'
    field :vendor_profile, Types::VendorProfileType, null: true, description: 'The affected vendor profile'

    def resolve(vendor_profile_id:)
      result = Favorites::ToggleFavorite.call(
        user: context[:current_user],
        vendor_profile_id: vendor_profile_id.to_i
      )

      handle_toggle_result(result, vendor_profile_id)
    rescue StandardError => e
      failure_response(e.message)
    end

    private

    def handle_toggle_result(result, vendor_profile_id)
      if result[:success]
        {
          is_favorited: result[:is_favorited],
          vendor_profile: VendorProfile.find(vendor_profile_id),
          errors: []
        }
      else
        failure_response(result[:error])
      end
    end

    def failure_response(messages)
      { is_favorited: false, vendor_profile: nil, errors: Array(messages) }
    end
  end
end
