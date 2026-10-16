# frozen_string_literal: true

module BookingManagement::AvailabilitySlotBulkActions
  extend ActiveSupport::Concern

  def bulk_create
    slots_params = params[:availability_slots] || []
    result = AvailabilitySlots::BulkCreate.call(
      vendor: current_user.vendor,
      slots_params: slots_params
    )

    render_bulk_create_response(result[:created], result[:errors])
  end

  private

  def render_bulk_create_response(created_slots, errors)
    presented_slots = created_slots.map { |slot| AvailabilitySlotPresenter.new(slot).as_json }
    if errors.empty?
      render json: {
        availability_slots: presented_slots,
        message: "#{presented_slots.count} slots created successfully"
      }, status: :created
    else
      render json: {
        created_slots: presented_slots,
        errors: errors,
        message: "#{presented_slots.count} slots created, #{errors.count} failed"
      }, status: :partial_content
    end
  end
end
