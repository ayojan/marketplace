# frozen_string_literal: true

# == Schema Information
#
# Table name: users
#
#  id                     :bigint           not null, primary key
#  confirmation_sent_at   :datetime
#  confirmation_token     :string
#  confirmed_at           :datetime
#  email                  :string           default(""), not null
#  encrypted_password     :string           default(""), not null
#  first_name             :string
#  last_name              :string
#  remember_created_at    :datetime
#  reset_password_sent_at :datetime
#  reset_password_token   :string
#  role                   :integer          default("customer"), not null
#  unconfirmed_email      :string
#  created_at             :datetime         not null
#  updated_at             :datetime         not null
#
# Indexes
#
#  index_users_on_confirmation_token    (confirmation_token) UNIQUE
#  index_users_on_email                 (email) UNIQUE
#  index_users_on_reset_password_token  (reset_password_token) UNIQUE
#
class User < ApplicationRecord
  # == Devise Modules ==
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable, :confirmable

  # == Enums ==
  # Role enum - customer: 0, vendor: 1, admin: 2
  enum :role, { customer: 0, vendor: 1, admin: 2 }, suffix: true

  # == Associations ==
  has_one :vendor_profile, dependent: :destroy
  has_one :customer_profile, dependent: :destroy

  accepts_nested_attributes_for :vendor_profile
  accepts_nested_attributes_for :customer_profile

  has_many :customer_bookings, class_name: 'Booking', foreign_key: 'customer_id',
                               dependent: :destroy, inverse_of: :customer
  has_many :vendor_bookings, through: :vendor_profile, source: :bookings
  has_many :booking_messages, foreign_key: 'sender_id', dependent: :destroy, inverse_of: :sender
  has_many :reviews, foreign_key: 'customer_id', dependent: :destroy, inverse_of: :customer

  # Notifications
  has_one :email_notification_preference, dependent: :destroy
  has_many :in_app_notifications, dependent: :destroy

  # Favorites
  has_many :customer_favorites, dependent: :destroy
  has_many :favorite_vendors, through: :customer_favorites, source: :vendor_profile

  # == Validations ==
  # NOTE: Ensure DB-level constraints for email and role presence/uniqueness
  before_validation :downcase_email

  validates :email, presence: true, uniqueness: { case_sensitive: false }
  validates :role, presence: true
  validates :password, length: { minimum: 8 }, if: :password_required?
  validates :first_name, presence: true, length: { maximum: 50 }
  validates :last_name, presence: true, length: { maximum: 50 }

  # == Callbacks ==
  after_create :create_profile
  after_create :create_email_notification_preference
  # NOTE: auto_confirm_user is removed to enforce proper email confirmation flow
  # Users should confirm via email, not be auto-confirmed

  # == Scopes ==
  scope :customers, -> { where(role: roles[:customer]) }
  scope :vendors, -> { where(role: roles[:vendor]) }
  scope :admins, -> { where(role: roles[:admin]) }
  scope :confirmed, -> { where.not(confirmed_at: nil) }
  scope :unconfirmed, -> { where(confirmed_at: nil) }

  # == Ransackable Attributes ==
  # Explicitly allowlist safe searchable fields for Ransack/ActiveAdmin
  def self.ransackable_attributes(_auth_object = nil)
    %w[id email first_name last_name role confirmed_at created_at updated_at]
  end

  # == Ransackable Associations ==
  # Explicitly allowlist safe associations for Ransack/ActiveAdmin
  def self.ransackable_associations(_auth_object = nil)
    %w[vendor_profile customer_profile customer_bookings vendor_bookings booking_messages]
  end

  # == Instance Methods ==
  def customer?
    role == 'customer'
  end

  def vendor?
    role == 'vendor'
  end

  def admin?
    role == 'admin'
  end

  def confirmed?
    confirmed_at.present?
  end

  # Returns the user's full name, memoized for performance if called frequently
  def full_name
    @full_name ||= "#{first_name} #{last_name}".strip
  end

  # Returns a display name for UI or logs
  def display_name
    full_name.presence || email
  end

  # Safe representation for logs/debugging
  def to_log
    "User(id: #{id}, email: #{email}, role: #{role})"
  end

  # Rescue mailer failures so SMTP downtime doesn't crash signup
  def send_devise_notification(notification, *args)
    super
  rescue StandardError => e
    Rails.logger.error "Failed to send Devise email notification #{notification} to #{email}: #{e.message}"
  end

  private

  # Creates associated profile after user creation
  def create_profile
    case role
    when 'vendor'
      vendor_profile || create_vendor_profile!(business_name: "#{full_name}'s Business", location: 'Not specified')
    when 'customer'
      customer_profile || create_customer_profile!
    end
  rescue ActiveRecord::RecordInvalid => e
    Rails.logger.error "Failed to create profile for user #{id}: #{e.message}"
  end

  # Creates default email notification preferences for new user
  def create_email_notification_preference
    EmailNotificationPreference.create_for_user(self)
  rescue StandardError => e
    Rails.logger.error "Failed to create email notification preferences for user #{id}: #{e.message}"
  end

  # Ensures email is always downcased for validation and storage
  def downcase_email
    self.email = email.downcase if email.present?
  end

  # Determines if password is required for validation
  def password_required?
    !persisted? || password.present? || password_confirmation.present?
  end
end
