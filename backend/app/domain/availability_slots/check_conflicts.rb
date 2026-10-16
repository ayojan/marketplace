# frozen_string_literal: true

module AvailabilitySlots
  class CheckConflicts
    extend Dry::Initializer

    option :vendor, type: Types.Instance(Vendor)
    option :date
    option :start_time
    option :end_time
    option :exclude_id, optional: true

    def self.call(vendor:, date:, start_time:, end_time:, exclude_id: nil)
      new(
        vendor: vendor,
        date: date,
        start_time: start_time,
        end_time: end_time,
        exclude_id: exclude_id
      ).call
    end

    def call
      { overlapping_slots: overlapping_availability_slots, booking_conflicts: booking_conflicts }
    end

    private

    def overlapping_availability_slots
      scope = vendor.availability_slots.where(date: date)
                    .where('(start_time < ? AND end_time > ?) OR (start_time < ? AND end_time > ?)',
                           end_time, start_time, start_time, end_time)
      scope = scope.where.not(id: exclude_id) if exclude_id.present?
      scope
    end

    def booking_conflicts
      Booking.where(vendor_id: vendor.id)
             .where(status: %i[pending accepted])
             .where('DATE(event_date) = ?', date)
             .where('(TIME(event_date) < ? AND TIME(COALESCE(event_end_date, event_date + INTERVAL \'2 hours\')) > ?)',
                    end_time, start_time)
    end
  end
end
