# frozen_string_literal: true

class RecalculateVendorTrustStatsJob
  include Sidekiq::Job

  sidekiq_options retry: 3, dead: true, queue: 'low'

  def sidekiq_options
    self.class.get_sidekiq_options
  end

  # Use unique job constraint to prevent duplicate jobs for same vendor
  # Requires: gem 'sidekiq-unique-jobs'
  # For now, document the intention to add this

  def perform(vendor_profile_id)
    vendor_profile = VendorProfile.find(vendor_profile_id)
    VendorProfiles::CalculatePublicStats.call(vendor_profile: vendor_profile)

    Rails.logger.info("Recalculated trust stats for vendor #{vendor_profile_id}")
  rescue VendorProfile::RecordNotFound
    Rails.logger.warn("Vendor profile not found: #{vendor_profile_id}")
    # Don't retry if vendor doesn't exist
    raise
  rescue StandardError => e
    Rails.logger.error("Failed to recalculate trust stats: #{e.message}")
    # Sidekiq will retry according to sidekiq_options
    raise
  end
end
