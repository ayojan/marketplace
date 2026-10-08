# frozen_string_literal: true

# == Schema Information
#
# Table name: checklist_items
#
#  id         :bigint           not null, primary key
#  category   :string
#  completed  :boolean          default(FALSE), not null
#  due_date   :date
#  title      :string           not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  user_id    :bigint           not null
#
# Indexes
#
#  index_checklist_items_on_user_id                (user_id)
#  index_checklist_items_on_user_id_and_completed  (user_id,completed)
#
# Foreign Keys
#
#  fk_rails_...  (user_id => users.id)
#
class ChecklistItem < ApplicationRecord
  # == Associations ==
  belongs_to :user

  # == Validations ==
  validates :title, presence: true

  # == Scopes ==
  scope :for_user, ->(user_id) { where(user_id: user_id) }
  scope :completed, -> { where(completed: true) }
  scope :pending, -> { where(completed: false) }
  scope :recent_first, -> { order(created_at: :desc) }
end
