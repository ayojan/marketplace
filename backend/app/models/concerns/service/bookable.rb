# frozen_string_literal: true

module Service::Bookable
  extend ActiveSupport::Concern

  included do
    enum :status, {
      draft: 'draft',
      active: 'active',
      inactive: 'inactive',
      archived: 'archived'
    }

    validates :status, presence: true

    scope :active, -> { where(status: :active) }
    scope :inactive, -> { where(status: :inactive) }
    scope :draft, -> { where(status: :draft) }
    scope :archived, -> { where(status: :archived) }

    delegate :count, to: :bookings, prefix: true
  end

  def active?
    status == 'active'
  end

  def draft?
    status == 'draft'
  end

  def inactive?
    status == 'inactive'
  end

  def archived?
    status == 'archived'
  end

  def can_be_booked?
    active? && (vendor.present? || vendors.any?)
  end

  class_methods do
    def available_statuses
      statuses.keys.map { |key| [key.humanize, key] }
    end
  end
end
