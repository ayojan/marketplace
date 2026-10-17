# frozen_string_literal: true

class VendorCategory < ApplicationRecord
  belongs_to :vendor
  belongs_to :category

  validates :category_id, uniqueness: { scope: :vendor_id }

  scope :primary, -> { where(is_primary: true) }
  scope :secondary, -> { where(is_primary: false) }
end
