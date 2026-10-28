# frozen_string_literal: true

# == Schema Information
#
# Table name: portfolio_items
#
#  id            :bigint           not null, primary key
#  category      :string           not null
#  description   :text
#  display_order :integer          default(0), not null
#  is_featured   :boolean          default(FALSE), not null
#  title         :string           not null
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#  vendor_id     :bigint           not null
#
# Indexes
#
#  index_portfolio_items_on_category                     (category)
#  index_portfolio_items_on_vendor_id                    (vendor_id)
#  index_portfolio_items_on_vendor_id_and_category       (vendor_id,category)
#  index_portfolio_items_on_vendor_id_and_display_order  (vendor_id,display_order)
#  index_portfolio_items_on_vendor_id_and_is_featured    (vendor_id,is_featured)
#
# Foreign Keys
#
#  fk_rails_...  (vendor_id => vendors.id)
#
class PortfolioItem < ApplicationRecord
  belongs_to :vendor, touch: true

  # Active Storage for images
  has_many_attached :images

  # Validations
  validates :title, presence: true, length: { minimum: 2, maximum: 100 }
  validates :description, length: { maximum: 1000 }, allow_blank: true
  validates :category, presence: true, length: { maximum: 50 }
  validates :display_order, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validate :images_count_limit
  validate :images_content_type

  # Scopes
  scope :featured, -> { where(is_featured: true) }
  scope :by_category, ->(category) { where(category: category) }
  scope :ordered, -> { order(:display_order, :created_at) }
  scope :for_vendor, ->(vendor) { where(vendor: vendor) }

  # Callbacks
  before_save :normalize_category

  # Instance methods
  def featured?
    is_featured
  end

  def images?
    images.attached?
  end

  def primary_image
    images.first if images?
  end

  def primary_image_url
    return nil unless images?

    Rails.application.routes.url_helpers.url_for(primary_image)
  rescue StandardError
    nil
  end

  def image_count
    images.count
  end

  # Class methods
  def self.categories_for_vendor(vendor)
    where(vendor: vendor).distinct.pluck(:category).compact.sort
  end

  def self.featured_for_vendor(vendor)
    where(vendor: vendor, is_featured: true).ordered
  end

  private

  def normalize_category
    self.category = category.strip.downcase if category.present?
  end

  def images_count_limit
    return unless images.attached?

    return unless images.count > 10

    errors.add(:images, 'cannot exceed 10 images per portfolio item')
  end

  def images_content_type
    return unless images.attached?

    images.each do |image|
      unless image.content_type.in?(['image/jpeg', 'image/jpg', 'image/png', 'image/webp'])
        errors.add(:images, 'must be JPEG, PNG, or WebP format')
      end

      errors.add(:images, 'must be less than 10MB each') if image.byte_size > 10.megabytes
    end
  end
end
