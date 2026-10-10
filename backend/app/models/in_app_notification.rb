# frozen_string_literal: true

# == Schema Information
#
# Table name: in_app_notifications
#
#  id                :bigint           not null, primary key
#  is_read           :boolean          default(FALSE), not null
#  message           :text             not null
#  notification_type :string(50)       not null
#  related_type      :string(50)
#  title             :string(255)      not null
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#  related_id        :bigint
#  user_id           :bigint           not null
#
# Indexes
#
#  idx_notifications_user_read_date                 (user_id,is_read,created_at)
#  index_in_app_notifications_on_is_read            (is_read)
#  index_in_app_notifications_on_notification_type  (notification_type)
#  index_in_app_notifications_on_user_id            (user_id)
#  index_notifications_on_polymorphic               (related_type,related_id)
#
# Foreign Keys
#
#  fk_rails_...  (user_id => users.id)
#
class InAppNotification < ApplicationRecord
  # == Associations ==
  belongs_to :user

  # == Validations ==
  validates :title, :message, :notification_type, presence: true
  validates :notification_type, inclusion: {
    in: %w[booking_created booking_accepted booking_rejected booking_cancelled booking_reminder
           new_message review_received],
    message: '%<value>s is not a valid notification type'
  }

  # == Scopes ==
  scope :unread, -> { where(is_read: false) }
  scope :read, -> { where(is_read: true) }
  scope :for_user, ->(user_id) { where(user_id: user_id) }
  scope :recent_first, -> { order(created_at: :desc) }
  scope :by_type, ->(type) { where(notification_type: type) }

  # == Instance Methods ==
  def mark_as_read!
    update(is_read: true)
  end

  def mark_as_unread!
    update(is_read: false)
  end

  def self.create_notification(user_id:, title:, message:, notification_type:, related_type: nil, related_id: nil)
    create!(
      user_id: user_id,
      title: title,
      message: message,
      notification_type: notification_type,
      related_type: related_type.presence,
      related_id: related_id
    )
  end
end
