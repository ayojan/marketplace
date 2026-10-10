# frozen_string_literal: true

# rubocop:disable Metrics/ClassLength, Rails/UniqueValidationWithoutIndex

# == Schema Information
#
# Table name: vendor_profiles
#
#  id                  :bigint           not null, primary key
#  average_rating      :decimal(3, 2)    default(0.0)
#  business_license    :string
#  business_name       :string           not null
#  cancellation_policy :text
#  completion_rate     :decimal(5, 4)
#  description         :text
#  facebook_url        :string
#  favorites_count     :integer          default(0), not null
#  instagram_handle    :string
#  latitude            :decimal(10, 6)
#  location            :string
#  longitude           :decimal(10, 6)
#  phone               :string
#  rejection_reason    :text
#  response_time_hours :decimal(5, 2)
#  total_reviews       :integer          default(0)
#  verification_status :integer          default("unverified")
#  verified_at         :datetime
#  website             :string
#  years_experience    :integer          default(0)
#  created_at          :datetime         not null
#  updated_at          :datetime         not null
#  user_id             :bigint           not null
#
# Indexes
#
#  index_vendor_profiles_on_business_name        (business_name)
#  index_vendor_profiles_on_coordinates          (latitude,longitude)
#  index_vendor_profiles_on_favorites_count      (favorites_count)
#  index_vendor_profiles_on_location             (location)
#  index_vendor_profiles_on_user_id              (user_id) UNIQUE
#  index_vendor_profiles_on_verification_status  (verification_status)
#
# Foreign Keys
#
#  fk_rails_...  (user_id => users.id)
#
class VendorProfile < ApplicationRecord
  belongs_to :user

  # Service associations
  has_many :services, dependent: :destroy
  has_many :vendor_services, dependent: :destroy
  has_many :categories, through: :services
  has_many :portfolio_items, dependent: :destroy
  has_many :availability_slots, dependent: :destroy
  has_many :bookings, dependent: :destroy # Updated to direct association
  has_many :reviews, dependent: :destroy

  # Customer favorites
  has_many :customer_favorites, dependent: :destroy
  has_many :favorited_by_users, through: :customer_favorites, source: :user

  # Enums
  enum :verification_status, {
    unverified: 0,
    pending_verification: 1,
    verified: 2,
    rejected: 3
  }, prefix: :verification

  # Validations
  validates :user_id, uniqueness: true
  validates :business_name, presence: true, length: { minimum: 2, maximum: 100 }
  validates :description, length: { minimum: 50, maximum: 2000 }, allow_blank: true
  validates :location, presence: true, length: { maximum: 255 }
  validates :phone, format: { with: /\A[+]?[-\d\s()]{7,15}\z/ }, allow_blank: true
  validate :website_format, if: -> { website.present? }
  validates :years_experience, numericality: { greater_than_or_equal_to: 0, less_than: 100 }
  validates :average_rating, numericality: { greater_than_or_equal_to: 0.0, less_than_or_equal_to: 5.0 }
  validates :total_reviews, numericality: { greater_than_or_equal_to: 0 }
  validates :latitude, numericality: { greater_than_or_equal_to: -90, less_than_or_equal_to: 90 }, allow_nil: true
  validates :longitude, numericality: { greater_than_or_equal_to: -180, less_than_or_equal_to: 180 }, allow_nil: true
  validates :instagram_handle, format: { with: /\A[\w.]+\z/ }, allow_blank: true, length: { maximum: 30 }
  validates :facebook_url, format: { with: %r{\Ahttps://(www\.)?facebook\.com/} }, allow_blank: true
  # Trust metrics validations
  validates :response_time_hours, numericality: { greater_than_or_equal_to: 0 }, allow_nil: true
  validates :completion_rate, numericality: { greater_than_or_equal_to: 0.0, less_than_or_equal_to: 1.0 },
                              allow_nil: true

  # Scopes
  scope :verified, -> { where(verification_status: :verified) } # Updated to use enum
  scope :unverified, -> { where.not(verification_status: :verified) } # Updated to use enum
  scope :by_location, ->(location) { where('location ILIKE ?', "%#{location}%") }
  scope :with_rating_above, ->(rating) { where(average_rating: rating..) }
  scope :by_experience, ->(min_years) { where(years_experience: min_years..) }
  scope :with_coordinates, -> { where('latitude IS NOT NULL AND longitude IS NOT NULL') }
  scope :within_radius, lambda { |lat, lng, radius_km|
    where('latitude IS NOT NULL AND longitude IS NOT NULL')
      .where(VendorProfile.haversine_distance_sql, lat, lng, lat, radius_km)
  }

  # Instance methods
  def verified?
    verification_verified?
  end

  def request_verification!
    VendorProfiles::HandleVerification.call(vendor_profile: self, action: :request)
  end

  def approve_verification!
    VendorProfiles::HandleVerification.call(vendor_profile: self, action: :approve)
  end

  def reject_verification!(reason)
    VendorProfiles::HandleVerification.call(vendor_profile: self, action: :reject, reason: reason)
  end

  def description?
    description.present? && description.length >= 50
  end

  alias has_description? description?

  # Derived from services -> categories association with virtual attribute support
  def service_categories
    if @service_categories.present?
      @service_categories
    else
      list = service_categories_list
      list.present? ? list.join(', ') : ''
    end
  end

  def service_categories=(val)
    @service_categories = val.is_a?(Array) ? val.join(', ') : val.to_s
  end

  def service_categories_list
    if @service_categories.present?
      @service_categories.split(',').map(&:strip).reject(&:blank?)
    elsif services.loaded? && services.all? { |s| s.association(:categories).loaded? }
      services.flat_map(&:categories).map(&:name).uniq
    else
      services.joins(:categories).distinct.pluck('categories.name')
    end
  end

  def service_categories_list=(val)
    self.service_categories = val
  end

  def profile_complete?
    business_name.present? &&
      description.present? &&
      location.present? &&
      description?
  end

  def display_name
    business_name.presence || user.full_name
  end

  def update_rating_stats!
    VendorProfiles::UpdateRatingStats.call(vendor_profile: self)
  end

  def calculate_public_stats!
    VendorProfiles::CalculatePublicStats.call(vendor_profile: self)
  end

  def rating_distribution
    rating_stats[:distribution]
  end

  def rating_breakdown
    rating_stats[:breakdown]
  end

  def rating_display
    rating_stats[:display]
  end

  def featured_portfolio_items
    if portfolio_items.loaded?
      items = portfolio_items.select(&:is_featured).sort_by { |i| [i.display_order || 0, i.created_at || Time.current] }.first(6)
      items.presence || portfolio_items.sort_by { |i| [i.display_order || 0, i.created_at || Time.current] }.first(6)
    else
      items = portfolio_items.featured.ordered.limit(6)
      items.presence || portfolio_items.ordered.limit(6)
    end
  end

  def portfolio_categories
    portfolio_items.categories_for_vendor(self)
  end

  def portfolio?
    portfolio_items.exists?
  end

  alias has_portfolio? portfolio?

  def coordinates?
    latitude.present? && longitude.present?
  end

  alias has_coordinates? coordinates?

  def coordinates
    return nil unless coordinates?

    [latitude.to_f, longitude.to_f]
  end

  # Calculates distance from this vendor to given latitude/longitude
  def distance_to(lat, lng, unit: :meters)
    return nil unless coordinates?

    location = GeographicLocation.new(latitude, longitude)
    other_location = GeographicLocation.new(lat, lng)
    location.distance_to(other_location, unit: unit)
  rescue ArgumentError
    nil
  end

  # Class methods
  def self.search_by_name_or_location(query)
    return all if query.blank?

    where(
      'business_name ILIKE ? OR location ILIKE ? OR description ILIKE ?',
      "%#{query}%", "%#{query}%", "%#{query}%"
    )
  end

  # == Ransackable Associations ==
  # Explicitly allowlist safe associations for Ransack/ActiveAdmin
  def self.ransackable_associations(_auth_object = nil)
    %w[user services portfolio_items availability_slots bookings]
  end

  # == Ransackable Attributes ==
  # Explicitly allowlist safe searchable fields for Ransack/ActiveAdmin
  def self.ransackable_attributes(_auth_object = nil)
    %w[
      id business_name description location phone website
      business_license years_experience average_rating
      total_reviews latitude longitude created_at updated_at user_id
      instagram_handle facebook_url cancellation_policy response_time_hours
      completion_rate
    ]
  end

  # SQL distance predicate for geographic queries
  def self.haversine_distance_sql
    GeographicLocation.sql_distance_predicate
  end

  # Callbacks
  before_save :normalize_website

  private

  def rating_stats
    @rating_stats ||= VendorProfiles::CalculateRatingStats.call(vendor_profile: self)
  end

  def normalize_website
    return if website.blank?
    return if website.match?(%r{\Ahttps?://})

    self.website = "https://#{website}"
  end

  def website_format
    return if website.blank?

    normalize_website
    begin
      uri = URI.parse(website)
      validate_url_format(uri)
    rescue URI::InvalidURIError
      errors.add(:website, 'is not a valid URL')
    end
  end

  def validate_url_format(uri)
    valid_scheme = uri.is_a?(URI::HTTP) || uri.is_a?(URI::HTTPS)
    valid_domain = website.match?(%r{\A(https?://)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*/?\z}i)
    errors.add(:website, 'is not a valid URL') unless valid_scheme && valid_domain
  end
end
# rubocop:enable Metrics/ClassLength, Rails/UniqueValidationWithoutIndex
