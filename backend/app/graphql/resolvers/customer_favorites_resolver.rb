# frozen_string_literal: true

module Resolvers
  class CustomerFavoritesResolver < GraphQL::Schema::Resolver
    description 'Resolver for customer favorite vendors'

    type [Types::VendorType], null: false

    argument :page, Int, required: false, default_value: 1, description: 'Page number for pagination'
    argument :per_page, Int, required: false, default_value: 12, description: 'Items per page'
    argument :sort, String, required: false, default_value: 'recent', description: 'Sort by: recent, rating, or reviews'

    def resolve(sort: 'recent', page: 1, per_page: 12)
      user = context[:current_user]
      return [] unless user

      result = Customers::GetFavorites.call(
        user: user,
        sort: sort,
        page: page,
        per_page: per_page
      )

      return [] unless result[:success]

      result[:vendors]
    end
  end
end
