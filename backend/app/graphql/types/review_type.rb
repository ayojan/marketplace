# frozen_string_literal: true

class Types::ReviewType < Types::BaseObject
  description 'Details of a customer review for a booking'

  field :comment, String, null: true, description: 'Customer comments about the service'
  field :communication_rating, Integer, null: true, description: 'Communication score (1-5)'
  field :created_at, GraphQL::Types::ISO8601DateTime, null: false, description: 'Timestamp when the review was created'
  field :id, ID, null: false, description: 'Unique identifier of the review'
  field :punctuality_rating, Integer, null: true, description: 'Punctuality score (1-5)'
  field :quality_rating, Integer, null: true, description: 'Quality score (1-5)'
  field :rating, Integer, null: false, description: 'Overall rating (1-5)'
  field :status, String, null: false, description: 'Current status of the review'
  field :updated_at,
        GraphQL::Types::ISO8601DateTime,
        null: false,
        description: 'Timestamp when the review was last updated'
  field :value_rating, Integer, null: true, description: 'Value for money score (1-5)'

  # Trust and credibility fields
  field :helpful_votes, Integer, null: false, description: 'Number of helpful votes for this review'
  field :is_verified_purchase, Boolean, null: false, method: :verified_purchase?,
                                        description: 'Whether this review is from a verified purchase'
  field :photos, [String], null: false, description: 'URLs of review photos'
  field :vendor_responded_at, GraphQL::Types::ISO8601DateTime, null: true, description: 'When the vendor responded'
  field :vendor_response, String, null: true, description: 'Vendor response to the review'

  # Associations
  field :booking, Types::NodeType, null: false, description: 'Booking that was reviewed'
  field :customer, Types::UserType, null: false, description: 'Customer who submitted the review'
  field :service, Types::ServiceType, null: false, description: 'Service that the review targets'
  field :vendor_profile,
        Types::VendorProfileType,
        null: false,
        description: 'Vendor profile associated with the service'
  # rubocop:enable GraphQL/ExtractType

  def photos
    object.photos.map { |photo| Rails.application.routes.url_helpers.rails_blob_url(photo) }
  end

  def booking
    dataloader.with(Sources::AssociationLoader, :booking).load(object)
  end

  def customer
    dataloader.with(Sources::AssociationLoader, :customer).load(object)
  end

  def service
    dataloader.with(Sources::AssociationLoader, :service).load(object)
  end

  def vendor_profile
    dataloader.with(Sources::AssociationLoader, :vendor_profile).load(object)
  end
end
