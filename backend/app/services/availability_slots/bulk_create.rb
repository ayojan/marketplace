# frozen_string_literal: true

module AvailabilitySlots
  class BulkCreate
    include Callable
    extend Dry::Initializer

    option :vendor, type: Types.Instance(Vendor)
    option :slots_params

    def call
      created = []
      errors = []
      slots_params.each_with_index do |slot_params, index|
        slot = vendor.availability_slots.build(
          slot_params.permit(:date, :start_time, :end_time, :is_available)
        )
        if slot.save
          created << slot
        else
          errors << { index: index, errors: slot.errors.full_messages }
        end
      end
      { created: created, errors: errors }
    end
  end
end
