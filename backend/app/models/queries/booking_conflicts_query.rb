# frozen_string_literal: true

# Single source of truth for booking conflict logic
class BookingConflictsQuery
  def initialize(vendor:, event_date:, event_end_date: nil, exclude_id: nil)
    @vendor = vendor
    @event_date = event_date
    @event_end_date = event_end_date || (event_date + 2.hours)
    @exclude_id = exclude_id
  end

  def self.call(**params)
    new(**params).call
  end

  def call
    bookings.exists?
  end

  def bookings
    scope = Booking
            .where(vendor: @vendor)
            .where(status: %i[pending accepted])
            .overlapping_period(@event_date, @event_end_date)

    scope = scope.where.not(id: @exclude_id) if @exclude_id.present?
    scope
  end
end
