# frozen_string_literal: true

# == Schema Information
#
# Table name: users
#
#  id                     :bigint           not null, primary key
#  budget_range           :string
#  company_name           :string
#  confirmation_sent_at   :datetime
#  confirmation_token     :string
#  confirmed_at           :datetime
#  email                  :string           default(""), not null
#  encrypted_password     :string           default(""), not null
#  event_types            :text
#  first_name             :string
#  last_name              :string
#  location               :string
#  phone                  :string
#  preferences            :text
#  remember_created_at    :datetime
#  reset_password_sent_at :datetime
#  reset_password_token   :string
#  role                   :string           default("customer"), not null
#  total_bookings         :integer          default(0)
#  unconfirmed_email      :string
#  created_at             :datetime         not null
#  updated_at             :datetime         not null
#
# Indexes
#
#  index_users_on_budget_range          (budget_range)
#  index_users_on_confirmation_token    (confirmation_token) UNIQUE
#  index_users_on_email                 (email) UNIQUE
#  index_users_on_location              (location)
#  index_users_on_reset_password_token  (reset_password_token) UNIQUE
#

class User < ApplicationRecord
  # ── Concerns ──────────────────────────────────────────────────────────────────
  include VendorProfile
  include CustomerProfile
  include Ransackable

  # ── Devise Modules ────────────────────────────────────────────────────────────
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable, :confirmable

  # ── Enums & Scopes ────────────────────────────────────────────────────────────
  enum :role, { customer: 'customer', vendor: 'vendor', admin: 'admin' }, suffix: true

  scope :customers,   -> { customer_role }
  scope :vendors,     -> { vendor_role }
  scope :admins,      -> { admin_role }
  scope :confirmed,   -> { where.not(confirmed_at: nil) }
  scope :unconfirmed, -> { where(confirmed_at: nil) }

  alias customer? customer_role?
  alias vendor? vendor_role?
  alias admin? admin_role?

  # ── Normalizations & Validations ──────────────────────────────────────────────
  normalizes :email, with: ->(email) { email.strip.downcase }

  validates :email, presence: true, uniqueness: { case_sensitive: false }
  validates :role, presence: true
  validates :password, length: { minimum: 8 }, if: :password_required?
  validates :first_name, presence: true, length: { maximum: 50 }
  validates :last_name, presence: true, length: { maximum: 50 }

  # ── Associations ──────────────────────────────────────────────────────────────
  has_many :auth_identities, dependent: :destroy
  has_many :customer_bookings, class_name: 'Booking', foreign_key: 'customer_id',
                               dependent: :destroy, inverse_of: :customer
  has_many :vendor_bookings, through: :vendor, source: :bookings
  has_many :booking_messages, foreign_key: 'sender_id', dependent: :destroy, inverse_of: :sender
  has_many :reviews, foreign_key: 'customer_id', dependent: :destroy, inverse_of: :customer
  has_many :review_votes, foreign_key: 'voter_id', dependent: :destroy, inverse_of: :voter
  has_many :checklist_items, dependent: :destroy

  # Notifications
  has_one :email_notification_preference, dependent: :destroy
  has_many :in_app_notifications, dependent: :destroy

  # Favorites
  has_many :customer_favorites, dependent: :destroy
  has_many :favorite_vendors, through: :customer_favorites, source: :vendor

  # ── Callbacks ─────────────────────────────────────────────────────────────────
  after_create :create_email_notification_preference
  after_commit :send_welcome_email, on: :create

  # ── Instance Methods ──────────────────────────────────────────────────────────
  def full_name
    "#{first_name} #{last_name}".strip
  end
  alias name full_name

  def display_name
    company_name.presence || full_name.presence || email
  end

  def google_identity
    auth_identities.find_by(provider: 'google')
  end

  def to_log
    "User(id: #{id}, email: #{email}, role: #{role})"
  end

  def send_devise_notification(notification, *args)
    super
  rescue StandardError => e
    Rails.logger.error "Failed to send Devise email notification #{notification} to #{email}: #{e.message}"
  end

  private

  def create_email_notification_preference
    EmailNotificationPreference.create_for_user(self)
  rescue StandardError => e
    Rails.logger.error "Failed to create email notification preferences for user #{id}: #{e.message}"
  end

  def send_welcome_email
    return if admin?

    WelcomeNotificationJob.perform_later(id)
  rescue StandardError => e
    Rails.logger.error "Failed to enqueue welcome email for user #{id}: #{e.message}"
  end
end
