# frozen_string_literal: true

module Service::Pricing
  extend ActiveSupport::Concern

  included do
    enum :pricing_type, {
      hourly: 'hourly',
      package: 'package',
      custom: 'custom'
    }

    validates :pricing_type, presence: true
    validates :base_price, numericality: { greater_than: 0, less_than: 1_000_000 }, allow_nil: true
    validate :base_price_required_for_non_custom_pricing

    scope :by_pricing_type, ->(pricing_type) { where(pricing_type: pricing_type) }
    scope :price_range, ->(min_price, max_price) { where(base_price: min_price..max_price) }
    scope :ordered_by_price, -> { order(:base_price) }
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
    return "#{base_price.to_f}/hour" if hourly_pricing?

    base_price.to_f.to_s
  end

  class_methods do
    def available_pricing_types
      pricing_types.keys.map { |key| [key.humanize, key] }
    end

    def filter_by_price_range(min_price, max_price)
      return all if min_price.blank? && max_price.blank?

      scope = all
      scope = scope.where(base_price: min_price..) if min_price.present?
      scope = scope.where(base_price: ..max_price) if max_price.present?
      scope
    end
  end

  private

  def base_price_required_for_non_custom_pricing
    return if custom_pricing?
    return if base_price.present? && base_price.positive?

    errors.add(:base_price, 'must be present and greater than 0 for non-custom pricing')
  end
end
