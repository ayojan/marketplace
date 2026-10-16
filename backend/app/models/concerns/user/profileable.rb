# frozen_string_literal: true

module User::Profileable
  extend ActiveSupport::Concern

  included do
    has_one :vendor, dependent: :destroy
    has_one :customer, dependent: :destroy

    accepts_nested_attributes_for :vendor
    accepts_nested_attributes_for :customer

    delegate :phone, to: :vendor, prefix: true, allow_nil: true
    delegate :phone, to: :customer, prefix: true, allow_nil: true

    after_create :create_profile
  end

  # Returns primary phone / mobile number associated with user's profile
  def phone
    vendor? ? vendor_phone : customer_phone
  end
  alias mobile_number phone

  def needs_mobile_onboarding?
    phone.blank?
  end

  private

  # Creates associated profile after user creation
  def create_profile
    case role
    when 'vendor'
      vendor || create_vendor!(business_name: "#{full_name}'s Business", location: 'Not specified')
    when 'customer'
      customer || create_customer!
    end
  rescue ActiveRecord::RecordInvalid => e
    Rails.logger.error "Failed to create profile for user #{id}: #{e.message}"
  end
end
