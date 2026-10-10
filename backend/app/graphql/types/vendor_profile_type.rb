# frozen_string_literal: true

# rubocop:disable GraphQL/ExtractType
class Types::VendorProfileType < Types::BaseObject
  description 'Details about a vendor profile, its services, and analytics'

  field :average_rating, Float, null: false, description: 'Average rating across all services'
  field :business_name, String, null: false, description: 'Official business name of the vendor'
  field :created_at, GraphQL::Types::ISO8601DateTime, null: false, description: 'When the vendor profile was created'
  field :description, String, null: true, description: 'Public-facing description provided by the vendor'
  field :id, ID, null: false, description: 'Unique identifier for the vendor profile'
  field :is_verified, Boolean, null: false, description: 'Indicates whether the vendor is verified', method: :verified?
  field :latitude, Float, null: true, description: 'Latitude portion of the vendor coordinates'
  field :location, String, null: false, description: 'Human-readable location for the vendor'
  field :longitude, Float, null: true, description: 'Longitude portion of the vendor coordinates'
  field :phone, String, null: true, description: 'Contact phone number for the vendor'
  field :rating_breakdown, Types::RatingBreakdownType, null: false, description: 'Breakdown of average ratings'
  field :rating_distribution,
        Types::RatingDistributionType,
        null: false,
        description: 'Distribution of ratings across review scores'
  field :total_reviews, Integer, null: false, description: 'Total number of reviews for the vendor'
  field :updated_at, GraphQL::Types::ISO8601DateTime, null: false, description: 'When the profile was last updated'
  field :verification_status, String, null: false, description: 'Current verification status'
  field :verified_at,
        GraphQL::Types::ISO8601DateTime,
        null: true,
        description: 'Timestamp when verification was last confirmed'
  field :website, String, null: true, description: 'Vendor website URL'
  field :years_experience, Integer, null: false, description: 'Years of experience declared by the vendor'

  # Associations
  field :portfolio_items,
        [Types::PortfolioItemType],
        null: false,
        complexity: 5,
        description: 'Portfolio entries provided by the vendor'
  field :reviews, [Types::ReviewType], null: false, complexity: 5, description: 'Reviews written for the vendor'
  field :services, [Types::ServiceType], null: false, complexity: 10, description: 'Services offered by the vendor'

  # Computed fields
  field :coordinates, [Float], null: true, description: 'Pair of latitude and longitude values from the profile'
  field :display_name, String, null: false, description: 'Friendly display name for the vendor'
  field :distance_to, Float, null: true, description: 'Distance between the vendor and provided coordinates' do
    argument :latitude, Float, required: true, description: 'Latitude of the reference point'
    argument :longitude, Float, required: true, description: 'Longitude of the reference point'
  end
  field :has_coordinates,
        Boolean,
        null: false,
        method: :has_coordinates?,
        description: 'Returns true when coordinates are present'
  field :has_description,
        Boolean,
        null: false,
        method: :has_description?,
        description: 'Returns true when the vendor profile has a description'
  field :has_portfolio,
        Boolean,
        null: false,
        method: :has_portfolio?,
        description: 'Returns true when the vendor has portfolio items'
  field :profile_complete,
        Boolean,
        null: false,
        method: :profile_complete?,
        description: 'Indicates whether the profile is considered complete'
  field :rating_display, String, null: false, description: 'Human readable rating summary'
  field :service_categories, String, null: true, description: 'Categories the vendor belongs to'
  field :service_categories_list, [String], null: false, description: 'List of categories the vendor belongs to'
  field :verified, Boolean, null: false, method: :verified?, description: 'Convenience alias for the verification state'

  # Social/transparency fields
  field :cancellation_policy, String, null: true, description: 'Vendor cancellation policy'
  field :facebook_url, String, null: true, description: 'Facebook page URL for the vendor'
  field :favorites_count, Integer, null: false, description: 'Number of customers who favorited this vendor'
  field :instagram_handle, String, null: true, description: 'Instagram handle for the vendor'

  # Trust fields
  field :member_since, GraphQL::Types::ISO8601DateTime, null: false, method: :created_at,
                                                        description: 'When vendor joined the platform'
  field :trust_stats, Types::VendorTrustStatsType, null: false, description: 'Trust and credibility metrics'

  delegate :rating_display, to: :object

  delegate :service_categories, to: :object

  delegate :service_categories_list, to: :object

  delegate :coordinates, to: :object

  def portfolio_items
    dataloader.with(Sources::AssociationLoader, :portfolio_items).load(object)
  end

  def reviews
    dataloader.with(Sources::AssociationLoader, :reviews).load(object)
  end

  def services
    dataloader.with(Sources::AssociationLoader, :services).load(object)
  end

  def display_name
    dataloader.with(Sources::AssociationLoader, :user).load(object).then do |user|
      object.business_name.presence || user&.full_name || 'Unknown Vendor'
    end
  end

  def distance_to(latitude:, longitude:)
    object.distance_to(latitude, longitude)
  end

  def trust_stats
    VendorProfiles::CalculatePublicStats.call(vendor_profile: object)
  end
end

# rubocop:enable GraphQL/ExtractType
