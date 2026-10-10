# frozen_string_literal: true

# == Schema Information
#
# Table name: customer_profiles
#
#  id             :bigint           not null, primary key
#  budget_range   :string
#  company_name   :string
#  event_types    :text
#  location       :string
#  phone          :string
#  preferences    :text
#  total_bookings :integer          default(0)
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#  user_id        :bigint           not null
#
# Indexes
#
#  index_customer_profiles_on_budget_range  (budget_range)
#  index_customer_profiles_on_location      (location)
#  index_customer_profiles_on_user_id       (user_id) UNIQUE
#
# Foreign Keys
#
#  fk_rails_...  (user_id => users.id)
#
class CustomerProfile < ApplicationRecord
  belongs_to :user

  # Future associations (will be added in later tasks)
  # has_many :bookings, through: :user
  # has_many :reviews, through: :user

  # Enums
  enum :budget_range, {
    under_500: 'under_500',
    between_500_1000: '500_1000',
    between_1000_2500: '1000_2500',
    between_2500_5000: '2500_5000',
    over_5000: 'over_5000',
    custom: 'custom'
  }, prefix: :budget

  # Validations
  validates :user_id, uniqueness: true
  validates :phone, format: { with: /\A\+?[\d\s\-()]{7,15}\z/ }, allow_blank: true
  validates :preferences, length: { maximum: 1000 }, allow_blank: true
  validates :location, length: { maximum: 255 }, allow_blank: true
  validates :company_name, length: { maximum: 100 }, allow_blank: true
  validates :total_bookings, numericality: { greater_than_or_equal_to: 0 }

  # Scopes
  scope :by_location, ->(location) { where('location ILIKE ?', "%#{location}%") }
  scope :by_budget_range, ->(range) { where(budget_range: range) }
  scope :with_company, -> { where.not(company_name: [nil, '']) }
  scope :frequent_customers, -> { where(total_bookings: 5..) }

  # Instance methods
  def event_types_list
    return [] if event_types.blank?

    event_types.split(',').map(&:strip)
  end

  def event_types_list=(types)
    self.event_types = types.is_a?(Array) ? types.join(', ') : types
  end

  def budget_range_display
    case budget_range
    when 'under_500'
      'Under ₹50,000'
    when 'between_500_1000'
      '₹50,000 - ₹1,00,000'
    when 'between_1000_2500'
      '₹1,00,000 - ₹2,50,000'
    when 'between_2500_5000'
      '₹2,50,000 - ₹5,00,000'
    when 'over_5000'
      'Over ₹5,00,000'
    when 'custom'
      'Custom Budget'
    else
      'Not specified'
    end
  end

  def profile_complete?
    location.present? && event_types.present?
  end

  def display_name
    company_name.presence || user.full_name
  end

  def is_frequent_customer?
    total_bookings >= 5
  end

  def customer_tier
    case total_bookings
    when 0
      'New Customer'
    when 1..2
      'Regular Customer'
    when 3..9
      'Valued Customer'
    else
      'VIP Customer'
    end
  end

  # Class methods
  def self.search_by_name_or_location(query)
    return all if query.blank?

    joins(:user).where(
      'users.first_name ILIKE ? OR users.last_name ILIKE ? OR customer_profiles.company_name ILIKE ? OR customer_profiles.location ILIKE ?',
      "%#{query}%", "%#{query}%", "%#{query}%", "%#{query}%"
    )
  end
end
