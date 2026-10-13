# frozen_string_literal: true

module Types
  class InAppNotificationType < Types::BaseObject
    description 'An in-app notification for a user'

    field :created_at, GraphQL::Types::ISO8601DateTime, null: false,
                                                        description: 'Timestamp when notification was created'
    field :id, ID, null: false, description: 'Unique identifier for the notification'
    field :is_read, Boolean, null: false, description: 'Whether the notification has been marked as read'
    field :message, String, null: false, description: 'Notification body message'
    field :notification_type, String, null: false, description: 'Type/category of notification'
    field :related_id, Integer, null: true, description: 'ID of the related entity'
    field :related_type, String, null: true, description: 'Model class name of the related entity'
    field :title, String, null: false, description: 'Notification title'
    field :updated_at, GraphQL::Types::ISO8601DateTime, null: false,
                                                        description: 'Timestamp when notification was last updated'
    field :user_id, ID, null: false, description: 'ID of the recipient user'
  end
end
