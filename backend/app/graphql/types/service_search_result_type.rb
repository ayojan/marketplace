# frozen_string_literal: true

class Types::ServiceSearchResultType < Types::BaseObject
  description 'Paginated service search results with facets'
  field :current_page, Integer, null: false, description: 'Current page number'
  field :facets, Types::SearchFacetsType, null: false, description: 'Search facets for filtering'
  field :has_next_page, Boolean, null: false, description: 'Whether there are more pages'
  field :has_previous_page, Boolean, null: false, description: 'Whether there are previous pages'
  field :per_page, Integer, null: false, description: 'Number of items per page'
  field :search_time, Float, null: false, description: 'Search execution time in seconds'
  field :services, [Types::ServiceType], null: false, description: 'List of services matching the search criteria'
  field :total_count, Integer, null: false, description: 'Total number of services matching the criteria'
  field :total_pages, Integer, null: false, description: 'Total number of pages'

  # rubocop:disable Naming/PredicateMethod, Naming/PredicatePrefix
  def has_next_page
    object[:current_page] < object[:total_pages]
  end

  def has_previous_page
    object[:current_page] > 1
  end
  # rubocop:enable Naming/PredicateMethod, Naming/PredicatePrefix
end

# rubocop:enable GraphQL/ExtractType
