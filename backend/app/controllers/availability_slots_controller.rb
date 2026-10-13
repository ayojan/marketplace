# frozen_string_literal: true

class AvailabilitySlotsController < ApiController
  include BookingManagement::AvailabilitySlotActions
  include BookingManagement::AvailabilitySlotBulkActions
  include BookingManagement::AvailabilitySlotConflictActions

  before_action :authenticate_user!
  before_action :ensure_vendor!
  before_action :set_availability_slot, only: %i[show update destroy] # rubocop:disable Rails/LexicallyScopedActionFilter

  private

  def ensure_vendor!
    return if current_user.vendor?

    render json: { error: 'Access denied. Vendor account required.' }, status: :forbidden
  end
end
