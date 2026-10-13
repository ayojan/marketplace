# frozen_string_literal: true

module Resolvers
  class NotificationsResolver < GraphQL::Schema::Resolver
    description 'Resolver for fetching in-app notifications for the current user'

    type [Types::InAppNotificationType], null: false

    argument :filter, String, required: false, description: 'Filter by: unread, read, or all (default)'
    argument :notification_type, String, required: false, description: 'Filter by notification type'
    argument :page, Int, required: false, default_value: 1, description: 'Page number for pagination'
    argument :per_page, Int, required: false, default_value: 20, description: 'Items per page'

    def resolve(filter: 'unread', notification_type: nil, page: 1, per_page: 20)
      user = context[:current_user]
      return [] unless user

      query = InAppNotification.for_user(user.id)
      query = apply_filter(query, filter)
      query = query.by_type(notification_type) if notification_type.present?

      query
        .recent_first
        .page(page)
        .per(per_page)
    end

    private

    def apply_filter(query, filter)
      case filter
      when 'unread'
        query.unread
      when 'read'
        query.read
      else
        query
      end
    end
  end
end
