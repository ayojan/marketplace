# frozen_string_literal: true

class InAppNotificationsController < ApiController
  before_action :authenticate_user!
  before_action :set_notification, only: %i[mark_as_read]

  # GET /in_app_notifications
  def index
    notifications = InAppNotification.for_user(current_user.id)
                                      .recent_first
                                      .limit(20)

    unread_count = InAppNotification.for_user(current_user.id).unread.count

    render json: {
      unread_count: unread_count,
      notifications: notifications.map { |n| notification_json(n) }
    }
  end

  # PATCH /in_app_notifications/:id/read
  def mark_as_read
    @notification.mark_as_read!
    render json: { message: 'Notification marked as read', notification: notification_json(@notification) }
  end

  # POST /in_app_notifications/read_all
  def mark_all_read
    InAppNotification.for_user(current_user.id).unread.update_all(is_read: true)
    render json: { message: 'All notifications marked as read' }
  end

  private

  def set_notification
    @notification = InAppNotification.find_by(id: params[:id], user_id: current_user.id)
    render json: { error: 'Notification not found' }, status: :not_found unless @notification
  end

  def notification_json(notification)
    {
      id: notification.id,
      title: notification.title,
      message: notification.message,
      notification_type: notification.notification_type,
      is_read: notification.is_read,
      related_type: notification.related_type,
      related_id: notification.related_id,
      created_at: notification.created_at
    }
  end
end
