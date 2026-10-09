# frozen_string_literal: true

# rubocop:disable Metrics/ClassLength
# == Schema Information
#
# Table name: services
#
#  id                :bigint           not null, primary key
#  average_rating    :decimal(3, 2)    default(0.0)
#  base_price        :decimal(10, 2)
#  description       :text
#  name              :string
#  pricing_type      :integer          default("hourly")
#  status            :integer          default("draft")
#  total_reviews     :integer          default(0)
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#  vendor_profile_id :bigint           not null
#
# Indexes
#
#  index_services_on_average_rating                (average_rating)
#  index_services_on_status                        (status)
#  index_services_on_vendor_profile_id             (vendor_profile_id)
#  index_services_on_vendor_profile_id_and_status  (vendor_profile_id,status)
#
# Foreign Keys
#
#  fk_rails_...  (vendor_profile_id => vendor_profiles.id)
#
class Service < ApplicationRecord
  # Associations
  belongs_to :vendor_profile
  has_many :vendor_services, dependent: :destroy
  has_many :service_categories, dependent: :destroy
  has_many :categories, through: :service_categories
  has_many :bookings, dependent: :destroy
  has_many :service_images, dependent: :destroy
  has_many :reviews, dependent: :destroy
  has_many_attached :images

  # Enums
  enum :pricing_type, {
    hourly: 0,
    package: 1,
    custom: 2
  }

  enum :status, {
    draft: 0,
    active: 1,
    inactive: 2,
    archived: 3
  }

  # Validations
  validates :name, presence: true, length: { minimum: 3, maximum: 100 }
  validates :description, presence: true, length: { minimum: 50, maximum: 2000 }
  validates :base_price, numericality: { greater_than: 0, less_than: 1_000_000 }, allow_nil: true
  validates :pricing_type, presence: true
  validates :status, presence: true

  # Custom validations
  validate :base_price_required_for_non_custom_pricing

  # Scopes
  scope :active, -> { where(status: :active) }
  scope :inactive, -> { where(status: :inactive) }
  scope :draft, -> { where(status: :draft) }
  scope :archived, -> { where(status: :archived) }
  scope :by_category, ->(category) { joins(:categories).where(categories: { id: category }) }
  scope :by_vendor, ->(vendor_profile) { where(vendor_profile: vendor_profile) }
  scope :by_pricing_type, ->(pricing_type) { where(pricing_type: pricing_type) }
  scope :price_range, ->(min_price, max_price) { where(base_price: min_price..max_price) }
  scope :search_by_name, ->(query) { where('name ILIKE ?', "%#{query}%") if query.present? }
  scope :search_by_description, ->(query) { where('description ILIKE ?', "%#{query}%") if query.present? }
  scope :ordered_by_name, -> { order(:name) }
  scope :ordered_by_price, -> { order(:base_price) }
  scope :ordered_by_created, -> { order(created_at: :desc) }

  # Convenience accessor for category (through join table)
  def service_category
    categories.first
  end

  # Instance methods
  def active?
    status == 'active'
  end

  def draft?
    status == 'draft'
  end

  def inactive?
    status == 'inactive'
  end

  def archived?
    status == 'archived'
  end

  def hourly_pricing?
    pricing_type == 'hourly'
  end

  def package_pricing?
    pricing_type == 'package'
  end

  def custom_pricing?
    pricing_type == 'custom'
  end

  def formatted_base_price
    return 'Custom Quote' if custom_pricing?
    return "₹#{base_price.to_i}/hr" if hourly_pricing?

    "₹#{base_price.to_i}"
  end

  def can_be_booked?
    active? && vendor_profile.present?
  end

  delegate :count, to: :bookings, prefix: true

  def images?
    images.attached? || service_images.any?
  end

  def primary_image
    service_images.primary.first&.image || images.first
  end

  def primary_service_image
    service_images.primary.first
  end

  def ordered_service_images
    service_images.ordered
  end

  delegate :count, to: :service_images, prefix: true

  def display_name
    name
  end

  def short_description(limit = 100)
    return description if description.length <= limit

    "#{description.truncate(limit)}..."
  end

  def update_rating_stats!
    stats = reviews.published.pick('COUNT(id)', 'AVG(rating)')
    count = stats[0].to_i
    avg = stats[1].to_f.round(2)

    # rubocop:disable Rails/SkipsModelValidations
    update_columns(average_rating: avg, total_reviews: count)
    # rubocop:enable Rails/SkipsModelValidations
  end

  def rating_distribution
    dist = reviews.published.group(:rating).count
    {
      5 => dist[5] || 0,
      4 => dist[4] || 0,
      3 => dist[3] || 0,
      2 => dist[2] || 0,
      1 => dist[1] || 0
    }
  end

  # Class methods
  def self.featured(limit = 6)
    active.joins(:vendor_profiles)
          .where(vendor_profiles: { verification_status: :verified })
          .distinct
          .order(created_at: :desc)
          .limit(limit)
  end

  def self.search(query)
    return all if query.blank?

    where(
      'services.name ILIKE ? OR services.description ILIKE ?',
      "%#{query}%", "%#{query}%"
    )
  end

  def self.filter_by_category(category_id)
    return all if category_id.blank?

    joins(:categories).where(categories: { id: category_id })
  end

  def self.filter_by_price_range(min_price, max_price)
    return all if min_price.blank? && max_price.blank?

    scope = all
    scope = scope.where(base_price: min_price..) if min_price.present?
    scope = scope.where(base_price: ..max_price) if max_price.present?
    scope
  end

  def self.available_pricing_types
    pricing_types.keys.map { |key| [key.humanize, key] }
  end

  def self.available_statuses
    statuses.keys.map { |key| [key.humanize, key] }
  end

  private

  def base_price_required_for_non_custom_pricing
    return if custom_pricing?
    return if base_price.present? && base_price.positive?

    errors.add(:base_price, 'must be present and greater than 0 for non-custom pricing')
  end
end
# rubocop:enable Metrics/ClassLength
