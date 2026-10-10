# frozen_string_literal: true

class AvailabilityCheckerService
  include ActiveModel::Model
  include ActiveModel::Attributes
  include Callable

  attr_accessor :vendor_profile

  attribute :date, :date
  attribute :start_time, :string
  attribute :end_time, :string

  validates :vendor_profile, presence: true
  validates :date, presence: true
  validates :start_time, presence: true
  validates :end_time, presence: true
  validate :date_and_time_in_future

  def initialize(attributes = {})
    super
    @errors = ActiveModel::Errors.new(self)
  end

  def call
    {
      available: available?,
      errors: errors.full_messages,
      suggested_times: suggested_times
    }
  end

  def available?
    return false unless valid?

    # Check if vendor has availability slots for the requested date
    availability_slot = find_availability_slot
    return false unless availability_slot

    # Check if the requested time falls within the availability slot
    time_within_slot?(availability_slot)
  end

  attr_reader :errors

  def availability_slots
    @availability_slots ||= vendor_profile.availability_slots
                                          .available
                                          .for_date(date)
  end

  def suggested_times
    return [] unless availability_slots.any?

    future_slots = availability_slots.reject(&:passed?)

    future_slots.map do |slot|
      {
        start_time: slot.start_time.strftime('%H:%M'),
        end_time: slot.end_time.strftime('%H:%M'),
        duration_hours: slot.duration_hours
      }
    end
  end

  private

  def find_availability_slot
    availability_slots.find do |slot|
      time_within_slot?(slot)
    end
  end

  def time_within_slot?(slot)
    requested_start_minutes = parse_time_to_minutes(start_time)
    requested_end_minutes = parse_time_to_minutes(end_time)
    slot_start_minutes = (slot.start_time.hour * 60) + slot.start_time.min
    slot_end_minutes = (slot.end_time.hour * 60) + slot.end_time.min

    # For now, only handle same-day slots to get basic functionality working
    # TODO: Add proper overnight slot support later
    if slot_end_minutes < slot_start_minutes
      # Skip overnight slots for now
      return false
    end

    # Same-day slot
    requested_start_minutes >= slot_start_minutes && requested_end_minutes <= slot_end_minutes
  end

  def parse_time_to_minutes(time_string)
    time = Time.zone.parse("#{Date.current} #{time_string}")
    (time.hour * 60) + time.min
  end

  def date_and_time_in_future
    return if date.blank?

    if date < Date.current
      errors.add(:date, 'cannot be in the past')
      return
    end

    return unless date == Date.current && start_time.present?

    parsed = parse_time(start_time)
    errors.add(:start_time, 'cannot be in the past') if parsed && parsed <= Time.current
  end

  def parse_time(time_string)
    Time.zone.parse("#{date} #{time_string}")
  rescue ArgumentError, TypeError
    nil
  end
end
