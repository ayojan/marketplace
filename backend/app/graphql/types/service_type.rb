# frozen_string_literal: true

class Types::ServiceType < Types::BaseObject
  description 'A service offering made available by a vendor'

  field :average_rating, Float, null: false, description: 'Average rating delivered for the service'
  field :base_price, Float, null: true, description: 'Base price configured for the service'
  field :created_at, GraphQL::Types::ISO8601DateTime, null: false, description: 'Time when the service was created'
  field :description, String, null: false, description: 'Full description of the service'
  field :id, ID, null: false, description: 'Unique identifier of the service'
  field :name, String, null: false, description: 'Name of the service'
  field :pricing_type, String, null: false, description: 'Pricing strategy used for the service'
  field :rating_distribution,
        Types::RatingDistributionType,
        null: false,
        description: 'How reviews are distributed across ratings'
  field :status, String, null: false, description: 'Current status of the service'
  field :total_reviews, Integer, null: false, description: 'Total reviews received for the service'
  field :updated_at, GraphQL::Types::ISO8601DateTime, null: false, description: 'Time when the service was last updated'

  # Associations
  field :reviews, [Types::ReviewType], null: false, complexity: 5, description: 'Reviews associated with this service'
  field :service_category,
        Types::ServiceCategoryType,
        null: false,
        complexity: 2,
        description: 'Category the service belongs to'
  field :service_images,
        [Types::ServiceImageType],
        null: false,
        complexity: 3,
        description: 'Images showcasing the service'
  field :vendor_profile,
        Types::VendorProfileType,
        null: false,
        complexity: 5,
        description: 'Vendor profile offering the service'

  # Computed fields
  field :bookings_count, Integer, null: false, description: 'Number of bookings tied to this service'
  field :can_be_booked,
        Boolean,
        null: false,
        method: :can_be_booked?,
        description: 'Indicates whether the service is currently bookable'
  field :formatted_base_price, String, null: false, description: 'Localized display version of the base price'
  field :has_images, Boolean, null: false, method: :images?, description: 'True if the service has attached images'
  field :short_description, String, null: false, description: 'Shortened version of the service description' do
    argument :limit,
             Integer,
             required: false,
             default_value: 100,
             description: 'Maximum number of characters to include'
  end

  # Location-based fields
  field :vendor_average_rating, Float, null: false, description: 'Average rating for the vendor'
  field :vendor_business_name, String, null: false, description: 'Name of the vendor business'
  field :vendor_location, String, null: true, description: 'Vendor location label'
  field :vendor_total_reviews, Integer, null: false, description: 'Total number of reviews across the vendor'

  delegate :formatted_base_price, to: :object
  delegate :bookings_count, to: :object

  def short_description(limit:)
    object.short_description(limit)
  end

  def vendor_location
    dataloader.with(Sources::AssociationLoader, :vendor_profile).load(object).then(&:location)
  end

  def vendor_business_name
    dataloader.with(Sources::AssociationLoader, :vendor_profile).load(object).then(&:business_name)
  end

  def vendor_average_rating
    dataloader.with(Sources::AssociationLoader, :vendor_profile).load(object).then { |vp| vp&.average_rating || 0.0 }
  end

  def vendor_total_reviews
    dataloader.with(Sources::AssociationLoader, :vendor_profile).load(object).then { |vp| vp&.total_reviews || 0 }
  end

  def service_category
    dataloader.with(Sources::AssociationLoader, :categories).load(object).then(&:first)
  end
end

# rubocop:enable GraphQL/ExtractType
