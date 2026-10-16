# frozen_string_literal: true

module AvailabilitySlots
  class FilterForVendor
    extend Dry::Initializer

    option :vendor, type: Types.Instance(Vendor)
    option :start_date, optional: true
    option :end_date, optional: true
    option :date, optional: true

    def self.call(vendor:, **params)
      new(vendor: vendor, **params).call
    end

    def call
      scope = vendor.availability_slots.includes(:vendor)
      if start_date.present? && end_date.present?
        scope.where(date: start_date..end_date)
      elsif date.present?
        scope.for_date(date)
      else
        scope.upcoming
      end
    end
  end
end
