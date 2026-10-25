# frozen_string_literal: true

class AvailabilitySlotSerializer < Blueprinter::Base
  identifier :id
  fields :date, :start_time, :end_time, :is_available
end
