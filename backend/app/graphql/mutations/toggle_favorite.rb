# frozen_string_literal: true

module Mutations
  class ToggleFavorite < Mutations::BaseMutation
    description 'Toggle favorite status for a vendor'

    argument :vendor_id, ID, required: true, description: 'ID of the vendor to favorite or unfavorite'

    field :errors, [String], null: false, description: 'List of error messages if the operation failed'
    field :is_favorited, Boolean, null: false, description: 'Whether the vendor is now favorited'
    field :vendor, Types::VendorType, null: true, description: 'The affected vendor'

    def resolve(vendor_id:)
      result = Favorites::ToggleFavorite.call(
        user: context[:current_user],
        vendor_id: vendor_id.to_i
      )

      handle_toggle_result(result, vendor_id)
    rescue StandardError => e
      failure_response(e.message)
    end

    private

    def handle_toggle_result(result, vendor_id)
      if result[:success]
        {
          is_favorited: result[:is_favorited],
          vendor: Vendor.find(vendor_id),
          errors: []
        }
      else
        failure_response(result[:error])
      end
    end

    def failure_response(messages)
      { is_favorited: false, vendor: nil, errors: Array(messages) }
    end
  end
end
