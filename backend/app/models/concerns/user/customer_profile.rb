# frozen_string_literal: true

module User::CustomerProfile
  extend ActiveSupport::Concern

  included do
    # rubocop:disable Naming/VariableNumber
    enum :budget_range, {
      under_500: 'under_500',
      between_500_1000: '500_1000',
      between_1000_2500: '1000_2500',
      between_2500_5000: '2500_5000',
      over_5000: 'over_5000',
      custom: 'custom'
    }, prefix: :budget
    # rubocop:enable Naming/VariableNumber

    scope :by_location,        ->(loc) { where('location ILIKE ?', "%#{loc}%") }
    scope :by_budget_range,    ->(range) { where(budget_range: range) }
    scope :with_company,       -> { where.not(company_name: [nil, '']) }
    scope :frequent_customers, -> { where(total_bookings: 5..) }

    validates :phone, format: { with: /\A\+?[\d\s\-()]{7,15}\z/ }, allow_blank: true
    validates :preferences, length: { maximum: 1000 }, allow_blank: true
    validates :location, length: { maximum: 255 }, allow_blank: true
    validates :company_name, length: { maximum: 100 }, allow_blank: true
    validates :total_bookings, numericality: { greater_than_or_equal_to: 0 }, allow_nil: true
  end

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

  def frequent_customer?
    total_bookings.to_i >= 5
  end
  alias is_frequent_customer? frequent_customer?

  def customer_tier
    case total_bookings.to_i
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

  def customer
    self if customer?
  end
end
