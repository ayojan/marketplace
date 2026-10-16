# frozen_string_literal: true

module User::VendorProfile
  extend ActiveSupport::Concern

  included do
    has_one :vendor, dependent: :destroy

    accepts_nested_attributes_for :vendor

    delegate :phone, to: :vendor, prefix: true, allow_nil: true

    after_create :create_profile
  end

  # Returns primary phone / mobile number associated with user's profile
  def mobile_number
    vendor? && vendor&.phone.present? ? vendor.phone : phone
  end

  def needs_mobile_onboarding?
    mobile_number.blank?
  end

  private

  # Creates associated profile after user creation
  def create_profile
    return unless vendor?

    vendor || create_vendor!(business_name: "#{full_name}'s Business", location: 'Not specified')
  rescue ActiveRecord::RecordInvalid => e
    Rails.logger.error "Failed to create profile for user #{id}: #{e.message}"
  end
end
