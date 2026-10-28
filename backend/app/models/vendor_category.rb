# frozen_string_literal: true

# == Schema Information
#
# Table name: vendor_categories
#
#  id          :bigint           not null, primary key
#  is_primary  :boolean          default(FALSE), not null
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#  category_id :bigint           not null
#  vendor_id   :bigint           not null
#
# Indexes
#
#  index_vendor_categories_on_category_id                (category_id)
#  index_vendor_categories_on_vendor_id                  (vendor_id)
#  index_vendor_categories_on_vendor_id_and_category_id  (vendor_id,category_id) UNIQUE
#  index_vendor_categories_on_vendor_id_and_is_primary   (vendor_id,is_primary)
#
# Foreign Keys
#
#  fk_rails_...  (category_id => categories.id)
#  fk_rails_...  (vendor_id => vendors.id)
#
class VendorCategory < ApplicationRecord
  belongs_to :vendor, touch: true
  belongs_to :category

  validates :category_id, uniqueness: { scope: :vendor_id }

  scope :primary, -> { where(is_primary: true) }
  scope :secondary, -> { where(is_primary: false) }
end
