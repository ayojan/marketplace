# frozen_string_literal: true

module Bookings
  # Validates booking business rules - can be called before saving
  class Validate
    extend Dry::Initializer

    option :booking, type: Types.Instance(Booking)

    def self.call(booking:)
      new(booking: booking).call
    end

    def call
      errors = []
      errors << validate_vendor_availability
      errors << validate_no_conflicts
      errors.compact
    end

    private

    def validate_vendor_availability
      return unless booking.vendor && booking.event_date

      return if VendorAvailabilityQuery.call(vendor: booking.vendor, date: booking.event_date.to_date)

      { field: :event_date, message: 'is not available for this vendor' }
    end

    def validate_no_conflicts
      return unless booking.vendor && booking.event_date

      if BookingConflictsQuery.call(
        vendor: booking.vendor,
        event_date: booking.event_date,
        event_end_date: booking.event_end_date
      )
        { field: :event_date, message: 'conflicts with another booking' }
      end
    end
  end
end
