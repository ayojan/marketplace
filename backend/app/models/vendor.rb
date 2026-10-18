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
#  index_vendors_on_business_name        (business_name)
#  index_vendors_on_coordinates          (latitude,longitude)
#  index_vendors_on_favorites_count      (favorites_count)
#  index_vendors_on_location             (location)
#  index_vendors_on_slug                 (slug) UNIQUE
#  index_vendors_on_user_id              (user_id) UNIQUE
#  index_vendors_on_verification_status  (verification_status)
#
# Foreign Keys
#
#  fk_rails_...  (user_id => users.id)
#
# rubocop:disable Metrics/ClassLength
class Vendor < ApplicationRecord
  # ── Concerns ──────────────────────────────────────────────────────────────────
  include Vendor::Sluggable    # slug generation, to_param, find_by_id_or_slug
  include Vendor::Geolocation  # coordinates, distance_to, within_radius scope
  include Vendor::RatingStats  # rating_distribution, rating_breakdown, rating_display

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

  # ── Enums ─────────────────────────────────────────────────────────────────────
  enum :verification_status, {
    unverified: 'unverified',
    pending_verification: 'pending_verification',
    verified: 'verified',
    rejected: 'rejected'
  }, prefix: :verification

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
  scope :verified,     -> { where(verification_status: :verified) }
  # All vendors that have NOT been verified (includes unverified, pending, rejected)
  scope :not_verified, -> { where.not(verification_status: :verified) }
  # Deprecated alias — use :not_verified
  scope :unverified,   -> { not_verified }
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
  alias verified? verification_verified?

  # True when description is present and at least 50 characters long
  def description?
    description.present? && description.length >= 50
  end

  alias has_description? description?

  def profile_complete?
    business_name.present? && location.present? && description?
  end

  def portfolio?
    portfolio_items.exists?
  end

  alias has_portfolio? portfolio?

  # ── Verification System & Standards ───────────────────────────────────────────
  # A vendor is awarded the "Verified Partner" badge ONLY when all corresponding
  # verification checks have been completed:
  # 1. Official business registration / GSTIN on file
  # 2. Confirmed contact phone and serviceable location
  # 3. Complete profile (name, location, description >= 50 chars)
  # 4. At least one active celebration service package
  # 5. Administrative curation & trust approval (verified_at present)
  def verification_checks
    has_active_service = if association(:services).loaded?
                           services.any?(&:active?) || services.any?
                         else
                           services.active.exists? || services.exists?
                         end

    {
      business_license: {
        key: 'business_license',
        title: 'Business Registration / GSTIN',
        description: 'Government registered business certificate, GSTIN, or trade license',
        completed: business_license.present?,
        value: business_license.presence
      },
      contact_verified: {
        key: 'contact_verified',
        title: 'Direct Contact & Base Location',
        description: 'Confirmed operational service base location and direct telephone contact',
        completed: phone.present? && location.present?,
        value: [location.presence, phone.presence].compact.join(' · ')
      },
      profile_complete: {
        key: 'profile_complete',
        title: 'Complete Professional Profile',
        description: 'Detailed studio description (50+ characters) and profile information',
        completed: profile_complete?
      },
      services_active: {
        key: 'services_active',
        title: 'Active Service Catalog & Pricing',
        description: 'At least one published celebration service package with upfront pricing',
        completed: has_active_service
      },
      curation_approved: {
        key: 'curation_approved',
        title: 'Ayoj Trust & Curation Approval',
        description: 'Quality vetting and formal partner certification by Ayoj Operations',
        completed: verification_verified? && verified_at.present?,
        verified_at: verified_at
      }
    }
  end

  def all_verification_checks_completed?
    verification_checks.values.all? { |c| c[:completed] }
  end

  def can_display_verified_badge?
    all_verification_checks_completed?
  end

  def request_verification!
    Vendors::HandleVerification.call(vendor: self, action: :request)
  end

  def approve_verification!
    Vendors::HandleVerification.call(vendor: self, action: :approve)
  end

  def reject_verification!(reason)
    Vendors::HandleVerification.call(vendor: self, action: :reject, reason: reason)
  end

  # ── Display helpers ───────────────────────────────────────────────────────────
  def display_name
    business_name.presence || user.full_name
  end

  # Derived from services → categories association with virtual attribute support.
  # @service_categories acts as a virtual backing store for form round-trips.
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
    return @service_categories.split(',').map(&:strip).compact_blank if @service_categories.present?

    vendor_category_names.presence || fallback_service_category_names
  end

  def service_categories_list=(val)
    self.service_categories = val
  end

  def primary_category_name
    primary_category&.name || categories.first&.name || services.joins(:categories).pick('categories.name')
  end

  def sync_categories(ids, primary_id: nil)
    ids = Array(ids).map(&:to_i).reject(&:zero?).uniq.first(3)
    return if ids.empty?

    primary_id = primary_id.to_i if primary_id.present?
    primary_id = ids.first unless ids.include?(primary_id)

    transaction do
      vendor_categories.where.not(category_id: ids).destroy_all
      ids.each do |cat_id|
        vc = vendor_categories.find_or_initialize_by(category_id: cat_id)
        vc.is_primary = (cat_id == primary_id)
        vc.save!
      end
    end
  end

  # ── Stats ─────────────────────────────────────────────────────────────────────
  def update_rating_stats!
    Vendors::UpdateRatingStats.call(vendor: self)
  end

  def calculate_public_stats!
    Vendors::CalculatePublicStats.call(vendor: self)
  end

  # ── Portfolio ─────────────────────────────────────────────────────────────────
  def featured_portfolio_items
    if portfolio_items.loaded?
      loaded_featured_portfolio_items
    else
      items = portfolio_items.featured.ordered.limit(6)
      items.presence || portfolio_items.ordered.limit(6)
    end
  end

  def portfolio_categories
    portfolio_items.categories_for_vendor(self)
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

  def vendor_category_names
    if vendor_categories.loaded?
      vendor_categories.sort_by { |vc| vc.is_primary? ? 0 : 1 }.map { |vc| vc.category.name }
    elsif vendor_categories.exists?
      vendor_categories.joins(:category).order(is_primary: :desc).pluck('categories.name')
    else
      []
    end
  end

  def fallback_service_category_names
    if loaded_categories?
      services.flat_map(&:categories).map(&:name).uniq
    else
      services.joins(:categories).distinct.pluck('categories.name')
    end
  end

  def loaded_categories?
    services.loaded? && services.all? { |s| s.association(:categories).loaded? }
  end

  def loaded_featured_portfolio_items
    items = sort_portfolio_items(portfolio_items.select(&:is_featured)).first(6)
    items.presence || sort_portfolio_items(portfolio_items).first(6)
  end

  def sort_portfolio_items(items)
    items.sort_by { |i| [i.display_order || 0, i.created_at || Time.current] }
  end

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
# rubocop:enable Metrics/ClassLength
