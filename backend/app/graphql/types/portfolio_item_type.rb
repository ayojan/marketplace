# frozen_string_literal: true

class Types::PortfolioItemType < Types::BaseObject
  description 'An entry in a vendor portfolio highlighting previous work'

  field :category, String, null: true, description: 'Category label for the portfolio item'
  field :created_at, GraphQL::Types::ISO8601DateTime, null: false, description: 'When the portfolio entry was created'
  field :description, String, null: true, description: 'Detailed information about the work'
  field :display_order, Integer, null: false, description: 'Display priority for ordering the portfolio'
  field :id, ID, null: false, description: 'Unique identifier for the portfolio item'
  field :is_featured, Boolean, null: false, description: 'Whether the item should be highlighted'
  field :title, String, null: false, description: 'Title of the portfolio item'
  field :updated_at,
        GraphQL::Types::ISO8601DateTime,
        null: false,
        description: 'Last updated timestamp for the portfolio item'

  # Associations
  field :vendor, Types::VendorType, null: false, description: 'Owner of this portfolio entry'

  # Computed fields
  field :featured,
        Boolean,
        null: false,
        method: :featured?,
        description: 'Computed flag indicating if the item is featured'
end
