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

  def perform(vendor_id)
    vendor = Vendor.find(vendor_id)
    Vendors::CalculatePublicStats.call(vendor: vendor)

    Rails.logger.info("Recalculated trust stats for vendor #{vendor_id}")
  rescue ActiveRecord::RecordNotFound
    Rails.logger.warn("Vendor not found: #{vendor_id}")
    # Don't retry if vendor doesn't exist
    raise
  rescue StandardError => e
    Rails.logger.error("Failed to recalculate trust stats: #{e.message}")
    # Sidekiq will retry according to sidekiq_options
    raise
  end
end
