# frozen_string_literal: true

module Vendor::Verification
  extend ActiveSupport::Concern

  included do
    enum :verification_status, {
      unverified: 'unverified',
      pending_verification: 'pending_verification',
      verified: 'verified',
      rejected: 'rejected'
    }, prefix: :verification

    scope :verified,     -> { where(verification_status: :verified) }
    scope :not_verified, -> { where.not(verification_status: :verified) }
    scope :unverified,   -> { not_verified }

    alias_method :verified?, :verification_verified?
  end

  def verification_checks
    @verification_checks ||= VendorVerificationPresenter.new(self).to_h
  end

  def all_verification_checks_completed?
    verification_checks.values.all? { |c| c[:completed] }
  end

  def can_display_verified_badge?
    all_verification_checks_completed?
  end

  def request_verification!
    Vendors::HandleVerification.call(vendor: self, action: :request)
  end

  def approve_verification!
    Vendors::HandleVerification.call(vendor: self, action: :approve)
  end

  def reject_verification!(reason)
    Vendors::HandleVerification.call(vendor: self, action: :reject, reason: reason)
  end
end
