# frozen_string_literal: true

class Types::QueryType < Types::BaseObject
  description 'Root entry point for read operations in the GraphQL schema'
  field :node, Types::NodeType, null: true, description: 'Fetches an object given its ID.' do
    argument :id, ID, required: true, description: 'ID of the object.'
  end

  field :nodes, [Types::NodeType, { null: true }], null: true,
                                                   description: 'Fetches a list of objects given a list of IDs.' do
    argument :ids, [ID], required: true, description: 'IDs of the objects.'
  end

  # Add root-level fields here.
  # They will be entry points for queries on your schema.

  # Advanced service search with flexible filtering and faceted search
  field :search_services, resolver: Resolvers::ServiceSearchResolver,
                          description: 'Advanced service search with flexible filtering and faceted search'

  # Basic service queries
  field :service, Types::ServiceType, null: true, description: 'Find a service by ID' do
    argument :id, ID, required: true, description: 'ID of the service to fetch'
  end

  field :services, [Types::ServiceType], null: false, description: 'List all active services' do
    argument :limit, Integer, required: false, default_value: 20, description: 'Maximum number of services to return'
  end

  # Service category queries
  field :service_categories, [Types::ServiceCategoryType], null: false,
                                                           description: 'List all active service categories'

  # Vendor queries
  field :vendor, Types::VendorType, null: true, description: 'Find a vendor by ID' do
    argument :id, ID, required: true, description: 'ID of the vendor to fetch'
  end

  field :review, Types::ReviewType, null: true, description: 'Find a review by ID' do
    argument :id, ID, required: true, description: 'ID of the review to fetch'
  end

  field :reviews, [Types::ReviewType], null: false, description: 'List all published reviews' do
    argument :limit, Integer, required: false, default_value: 20, description: 'Maximum number of reviews to return'
  end

  field :vendor_dashboard, Types::VendorAnalyticsType, null: true,
                                                       description: 'Vendor analytics dashboard statistics'

  # Notification queries
  field :notifications, resolver: Resolvers::NotificationsResolver,
                        description: 'Get user in-app notifications with filtering and pagination'

  field :email_notification_preferences, resolver: Resolvers::EmailNotificationPreferencesResolver,
                                         description: 'Get user email notification preferences'

  # Favorites queries
  field :customer_favorites, resolver: Resolvers::CustomerFavoritesResolver,
                             description: 'Get user favorite vendors with sorting and pagination'

  def node(id:)
    context.schema.object_from_id(id, context)
  end

  def nodes(ids:)
    ids.map { |id| context.schema.object_from_id(id, context) }
  end

  def service(id:)
    Service.active.find_by(id: id)
  end

  def services(limit:)
    Service.active
           .includes(:vendor, :categories, :service_images)
           .limit(limit)
  end

  def service_categories
    Category.where(active: true).order(:name)
  end

  def vendor(id:)
    Vendor.includes(:user, :portfolio_items, :reviews, :services).find_by(id: id)
  end

  def review(id:)
    Review.published.find_by(id: id)
  end

  def reviews(limit:)
    Review.published.recent
          .includes(:customer, :booking, :service, :vendor,
                    photos_attachments: :blob)
          .limit(limit)
  end

  def vendor_dashboard
    user = context[:current_user]
    return nil unless user&.vendor? && user.vendor

    Vendors::VendorAnalyticsService.call(user.vendor)
  end
end
