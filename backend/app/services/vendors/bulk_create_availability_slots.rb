# frozen_string_literal: true

module Vendors
  class BulkCreateAvailabilitySlots
    include Callable
    extend Dry::Initializer

    option :vendor, type: Types.Instance(Vendor)
    option :slots_params

    def call
      created = []
      errors = []

      slots_params.each_with_index do |slot_params, index|
        permitted_params = permit_slot_params(slot_params)
        slot = vendor.availability_slots.build(permitted_params)

        if slot.save
          created << slot
        else
          errors << { index: index, errors: slot.errors.full_messages }
        end
      end

      { created: created, errors: errors }
    end

    private

    def permit_slot_params(params)
      if params.respond_to?(:permit)
        params.permit(:date, :start_time, :end_time, :is_available)
      else
        ActionController::Parameters.new(params).permit(:date, :start_time, :end_time, :is_available)
      end
    end
  end
end
