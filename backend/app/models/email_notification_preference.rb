# frozen_string_literal: true

# == Schema Information
#
# Table name: email_notification_preferences
#
#  id                :bigint           not null, primary key
#  booking_accepted  :boolean          default(TRUE), not null
#  booking_cancelled :boolean          default(TRUE), not null
#  booking_created   :boolean          default(TRUE), not null
#  booking_rejected  :boolean          default(TRUE), not null
#  booking_reminder  :boolean          default(TRUE), not null
#  new_message       :boolean          default(TRUE), not null
#  review_received   :boolean          default(TRUE), not null
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#  user_id           :bigint           not null
#
# Indexes
#
#  index_email_notification_preferences_on_user_id  (user_id) UNIQUE
#
# Foreign Keys
#
#  fk_rails_...  (user_id => users.id)
#
class EmailNotificationPreference < ApplicationRecord
  # == Associations ==
  belongs_to :user

  # == Validations ==
  validates :user_id, uniqueness: true

  # == Scopes ==
  scope :for_user, ->(user_id) { where(user_id: user_id) }

  # == Callbacks ==
  # Auto-create preferences when user is created
  def self.create_for_user(user)
    find_or_create_by(user_id: user.id)
  end
end
