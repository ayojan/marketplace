# frozen_string_literal: true

# == Schema Information
#
# Table name: vendors
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
#  metadata            :jsonb
#  phone               :string
#  rejection_reason    :text
#  response_time_hours :decimal(5, 2)
#  slug                :string           not null
#  total_reviews       :integer          default(0)
#  verification_status :string           default("unverified")
#  verified_at         :datetime
#  website             :string
#  years_experience    :integer          default(0)
#  created_at          :datetime         not null
#  updated_at          :datetime         not null
#  user_id             :bigint           not null
#
# Indexes
#
#  index_vendors_on_business_name           (business_name)
#  index_vendors_on_business_name_tsvector  (to_tsvector('english'::regconfig, (COALESCE(business_name, ''::character varying))::text)) USING gin
#  index_vendors_on_coordinates             (latitude,longitude)
#  index_vendors_on_favorites_count         (favorites_count)
#  index_vendors_on_location                (location)
#  index_vendors_on_slug                    (slug) UNIQUE
#  index_vendors_on_user_id                 (user_id) UNIQUE
#  index_vendors_on_verification_status     (verification_status)
#
# Foreign Keys
#
#  fk_rails_...  (user_id => users.id)
#
class Vendor < ApplicationRecord
  # ── Concerns ──────────────────────────────────────────────────────────────────
  include Vendor::Sluggable           # slug generation, to_param, find_by_id_or_slug
  include Vendor::Geolocation         # coordinates, distance_to, within_radius scope
  include Vendor::RatingStats         # rating_distribution, rating_breakdown, rating_display
  include Vendor::Verification        # verification_status enum, scopes, checks & lifecycle
  include Vendor::CategoryManagement  # sync_categories, display helpers
  include Vendor::PortfolioManagement # featured items & categories

  # ── Associations ──────────────────────────────────────────────────────────────
  belongs_to :user

  has_many :services,           dependent: :destroy
  has_many :vendor_services,    dependent: :destroy
  has_many :vendor_categories,  dependent: :destroy
  has_many :categories,         through: :vendor_categories
  has_one  :primary_vendor_category, -> { where(is_primary: true) },
           class_name: 'VendorCategory', inverse_of: :vendor, dependent: :destroy
  has_one  :primary_category, through: :primary_vendor_category, source: :category
  has_many :secondary_vendor_categories, -> { where(is_primary: false) },
           class_name: 'VendorCategory', inverse_of: :vendor, dependent: :destroy
  has_many :secondary_categories, through: :secondary_vendor_categories, source: :category
  has_many :portfolio_items,    dependent: :destroy
  has_many :availability_slots, dependent: :destroy
  has_many :bookings,           dependent: :destroy
  has_many :reviews,            dependent: :destroy
  has_many :customer_favorites, dependent: :destroy
  has_many :favorited_by_users, through: :customer_favorites, source: :user

  # ── Store accessors (onboarding & operational metadata) ───────────────────────
  store_accessor :metadata, :vendor_type, :pincode, :state, :serviceable_locations,
                 :travel_radius, :travel_charges_type, :travel_charges_amount,
                 :out_of_area_approval, :min_booking_value, :package_inclusions, :package_exclusions,
                 :onboarding_completed, :onboarding_step

  # ── Callbacks ─────────────────────────────────────────────────────────────────
  before_save :normalize_website

  # ── Validations ───────────────────────────────────────────────────────────────
  validates :user_id,             uniqueness: true
  validates :business_name,       presence: true, length: { minimum: 2, maximum: 100 }
  validates :description,         length: { minimum: 50, maximum: 2000 }, allow_blank: true
  validates :location,            presence: true, length: { maximum: 255 }
  validates :phone,               format: { with: /\A[+]?[-\d\s()]{7,15}\z/ }, allow_blank: true
  validates :years_experience,    numericality: { greater_than_or_equal_to: 0, less_than: 100 }
  validates :average_rating,      numericality: { greater_than_or_equal_to: 0.0, less_than_or_equal_to: 5.0 }
  validates :total_reviews,       numericality: { greater_than_or_equal_to: 0 }
  validates :instagram_handle,    format: { with: /\A[\w.]+\z/ }, allow_blank: true, length: { maximum: 30 }
  validates :facebook_url,        format: { with: %r{\Ahttps://(www\.)?facebook\.com/} }, allow_blank: true
  validates :response_time_hours, numericality: { greater_than_or_equal_to: 0 }, allow_nil: true
  validates :completion_rate,     numericality: { greater_than_or_equal_to: 0.0, less_than_or_equal_to: 1.0 },
                                  allow_nil: true
  validate :website_format, if: -> { website.present? }

  # ── Scopes ────────────────────────────────────────────────────────────────────
  scope :by_location,       ->(location) { where('location ILIKE ?', "%#{sanitize_sql_like(location)}%") }
  scope :with_rating_above, ->(rating)   { where(average_rating: rating..) }
  scope :by_experience,     ->(min_years) { where(years_experience: min_years..) }
  scope :search_by_name_or_location, lambda { |query|
    return all if query.blank?

    sanitized = "%#{sanitize_sql_like(query)}%"
    where('business_name ILIKE ? OR location ILIKE ? OR description ILIKE ?',
          sanitized, sanitized, sanitized)
  }

  # ── Predicates ────────────────────────────────────────────────────────────────
  def description?
    description.present? && description.length >= 50
  end

  alias has_description? description?

  def profile_complete?
    business_name.present? && location.present? && description?
  end

  # ── Display helpers ───────────────────────────────────────────────────────────
  def display_name
    business_name.presence || user.full_name
  end

  # ── Stats ─────────────────────────────────────────────────────────────────────
  def update_rating_stats!
    Vendors::UpdateRatingStats.call(vendor: self)
  end

  def calculate_public_stats!
    Vendors::CalculatePublicStats.call(vendor: self)
  end

  # ── Class methods ─────────────────────────────────────────────────────────────

  # == Ransackable Associations ==
  # Explicitly allowlist safe associations for Ransack/ActiveAdmin
  def self.ransackable_associations(_auth_object = nil)
    %w[user services portfolio_items availability_slots bookings categories vendor_categories]
  end

  # == Ransackable Attributes ==
  # Explicitly allowlist safe searchable fields for Ransack/ActiveAdmin
  def self.ransackable_attributes(_auth_object = nil)
    %w[
      id slug business_name description location phone website
      business_license years_experience average_rating
      total_reviews latitude longitude created_at updated_at user_id
      instagram_handle facebook_url cancellation_policy response_time_hours
      completion_rate verification_status
    ]
  end

  private

  def normalize_website
    return if website.blank?
    return if website.match?(%r{\Ahttps?://})

    self.website = "https://#{website}"
  end

  def website_format
    return if website.blank?

    # Compute what the URL would look like after normalization, without
    # mutating self.website (that is the job of the before_save callback).
    normalized = website.match?(%r{\Ahttps?://}) ? website : "https://#{website}"
    uri = URI.parse(normalized)
    validate_url_format(uri)
  rescue URI::InvalidURIError
    errors.add(:website, 'is not a valid URL')
  end

  def validate_url_format(uri)
    valid_scheme = uri.is_a?(URI::HTTP) || uri.is_a?(URI::HTTPS)
    valid_domain = website.match?(%r{\A(https?://)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*/?(\?[^#]*)?(#.*)?\z}i)
    errors.add(:website, 'is not a valid URL') unless valid_scheme && valid_domain
  end
end
