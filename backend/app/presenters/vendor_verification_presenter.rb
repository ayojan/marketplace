# frozen_string_literal: true

class VendorVerificationPresenter
  attr_reader :vendor

  def initialize(vendor)
    @vendor = vendor
  end

  def self.call(vendor)
    new(vendor).to_h
  end

  def to_h
    {
      business_license: business_license_check,
      contact_verified: contact_verified_check,
      profile_complete: profile_complete_check,
      services_active: services_active_check,
      curation_approved: curation_approved_check
    }
  end

  alias checks to_h

  def all_completed?
    to_h.values.all? { |c| c[:completed] }
  end

  private

  def business_license_check
    {
      key: 'business_license',
      title: 'Business Registration / GSTIN',
      description: 'Government registered business certificate, GSTIN, or trade license',
      completed: vendor.business_license.present?,
      value: vendor.business_license.presence
    }
  end

  def contact_verified_check
    {
      key: 'contact_verified',
      title: 'Direct Contact & Base Location',
      description: 'Confirmed operational service base location and direct telephone contact',
      completed: vendor.phone.present? && vendor.location.present?,
      value: [vendor.location.presence, vendor.phone.presence].compact.join(' · ')
    }
  end

  def profile_complete_check
    {
      key: 'profile_complete',
      title: 'Complete Professional Profile',
      description: 'Detailed studio description (50+ characters) and profile information',
      completed: vendor.profile_complete?
    }
  end

  def services_active_check
    has_active_service = if vendor.association(:services).loaded?
                           vendor.services.any?(&:active?) || vendor.services.any?
                         else
                           vendor.services.active.exists? || vendor.services.exists?
                         end

    {
      key: 'services_active',
      title: 'Active Service Catalog & Pricing',
      description: 'At least one published celebration service package with upfront pricing',
      completed: has_active_service
    }
  end

  def curation_approved_check
    {
      key: 'curation_approved',
      title: 'Ayoj Trust & Curation Approval',
      description: 'Quality vetting and formal partner certification by Ayoj Operations',
      completed: vendor.verification_verified? && vendor.verified_at.present?,
      verified_at: vendor.verified_at
    }
  end
end
