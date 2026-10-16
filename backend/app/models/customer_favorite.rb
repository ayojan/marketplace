# frozen_string_literal: true

# == Schema Information
#
# Table name: customer_favorites
#
#  id         :bigint           not null, primary key
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  user_id    :bigint           not null
#  vendor_id  :bigint           not null
#
# Indexes
#
#  index_customer_favorites_on_user_id                (user_id)
#  index_customer_favorites_on_user_id_and_vendor_id  (user_id,vendor_id) UNIQUE
#  index_customer_favorites_on_vendor_id              (vendor_id)
#
# Foreign Keys
#
#  fk_rails_...  (user_id => users.id)
#  fk_rails_...  (vendor_id => vendors.id)
#
class CustomerFavorite < ApplicationRecord
  # == Associations ==
  belongs_to :user
  belongs_to :vendor, counter_cache: :favorites_count

  # == Validations ==
  validates :user_id, uniqueness: { scope: :vendor_id, message: :already_favorited }

  # == Scopes ==
  scope :for_user, ->(user_id) { where(user_id: user_id) }
  scope :by_vendor, ->(vendor_id) { where(vendor_id: vendor_id) }
  scope :recent_first, -> { order(created_at: :desc) }
end
