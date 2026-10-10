# frozen_string_literal: true

class ConflictResolutionService
  include ActiveModel::Model
  include ActiveModel::Attributes
  include Callable

  attr_accessor :vendor_profile

  attribute :event_date, :datetime
  attribute :event_end_date, :datetime
  attribute :exclude_booking_id, :integer

  validates :vendor_profile, presence: true
  validates :event_date, presence: true

  def initialize(attributes = {})
    super
    @errors = ActiveModel::Errors.new(self)
    @event_end_date = event_end_date || (event_date + 2.hours) if event_date
  end

  def call
    { has_conflict: conflict?, conflicting_bookings: conflicting_bookings,
      suggested_times: suggest_alternative_times }
  end

  def conflict?
    return false unless valid?

    conflicting_bookings.exists?
  end

  def conflicting_bookings
    @conflicting_bookings ||= begin
      bookings = Booking.where(vendor_profile: vendor_profile)
                        .where(status: %i[pending accepted])
                        .where('DATE(event_date) = ?', event_date.to_date)

      # Exclude specific booking if provided (for updates)
      bookings = bookings.where.not(id: exclude_booking_id) if exclude_booking_id

      # Check for time overlaps
      bookings.where(
        '(event_date < ? AND COALESCE(event_end_date, event_date + INTERVAL \'2 hours\') > ?) OR ' \
        '(event_date < ? AND COALESCE(event_end_date, event_date + INTERVAL \'2 hours\') > ?)',
        @event_end_date, event_date,
        event_date, @event_end_date
      )
    end
  end

  def suggest_alternative_times
    return [] unless conflict?
    return [] if event_date && event_date < Date.current.beginning_of_day

    # Get vendor's availability for the requested date
    availability_slots = vendor_profile.availability_slots
                                       .available
                                       .for_date(event_date.to_date)

    return [] unless availability_slots.any?

    suggested_times = []
    duration = calculate_duration

    availability_slots.each do |slot|
      # Find free time slots within this availability slot
      free_slots = find_free_slots_in_availability(slot, duration)
      suggested_times.concat(free_slots)
    end

    suggested_times.uniq.sort_by { |slot| slot[:start_time] }
  end

  attr_reader :errors

  private

  def calculate_duration
    return 2.hours unless @event_end_date

    (@event_end_date - event_date).seconds
  end

  def find_free_slots_in_availability(availability_slot, duration)
    slot_start, slot_end = availability_slot_bounds(availability_slot)
    existing_bookings = bookings_for_date(availability_slot.date)

    build_free_slots(existing_bookings, duration, slot_start, slot_end)
  end
end

module ConflictResolutionService::FreeSlotCalculator
  private

  def availability_slot_bounds(availability_slot)
    slot_start = availability_slot.date.beginning_of_day +
                 availability_slot.start_time.seconds_since_midnight.seconds
    slot_end = availability_slot.date.beginning_of_day +
               availability_slot.end_time.seconds_since_midnight.seconds
    slot_end += 1.day if availability_slot.end_time < availability_slot.start_time

    [slot_start, slot_end]
  end

  def bookings_for_date(date)
    Booking.where(vendor_profile: vendor_profile)
           .where(status: %i[pending accepted])
           .where('DATE(event_date) = ?', date)
           .order(:event_date)
  end

  def build_free_slots(existing_bookings, duration, slot_start, slot_end)
    free_slots = []
    current_time = slot_start

    existing_bookings.each do |booking|
      current_time = append_free_slot_before_booking(free_slots, booking, duration, current_time)
    end

    append_final_slot(free_slots, current_time, slot_end, duration)
    free_slots
  end

  def append_free_slot_before_booking(free_slots, booking, duration, current_time)
    booking_start = booking.event_date
    booking_end = booking.event_end_date || (booking.event_date + 2.hours)

    add_free_slot(free_slots, current_time, duration) if booking_start - current_time >= duration

    [current_time, booking_end].max
  end

  def append_final_slot(free_slots, current_time, slot_end, duration)
    return if slot_end - current_time < duration

    add_free_slot(free_slots, current_time, duration)
  end

  def add_free_slot(free_slots, start_time, duration)
    return if start_time <= Time.current

    free_slots << {
      start_time: start_time.strftime('%H:%M'),
      end_time: (start_time + duration).strftime('%H:%M'),
      duration_hours: (duration / 1.hour).round(2)
    }
  end
end

ConflictResolutionService.include(ConflictResolutionService::FreeSlotCalculator)
