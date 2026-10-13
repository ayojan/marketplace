# frozen_string_literal: true

module Mutations
  class MarkNotificationAsRead < Mutations::BaseMutation
    description 'Marks an in-app notification as read for the current user'

    argument :notification_id, ID, required: true, description: 'ID of the notification to mark as read'

    field :errors, [String], null: false, description: 'List of error messages if the operation failed'
    field :notification, Types::InAppNotificationType, null: true, description: 'The updated notification'

    def resolve(notification_id:)
      notification = InAppNotification.find_by(id: notification_id)
      return error_response('Notification not found') unless notification

      return error_response('Unauthorized') unless notification.user_id == context[:current_user]&.id

      if notification.mark_as_read!
        { notification: notification, errors: [] }
      else
        error_response(notification.errors.full_messages)
      end
    end

    private

    def error_response(messages)
      { notification: nil, errors: Array(messages) }
    end
  end
end
