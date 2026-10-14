# frozen_string_literal: true

class BookingsController < ApiController
  include BookingManagement::BookingActions

  before_action :authenticate_user!
  before_action :ensure_vendor!, only: %i[respond] # rubocop:disable Rails/LexicallyScopedActionFilter
  before_action :set_booking, only: %i[show update destroy respond messages send_message] # rubocop:disable Rails/LexicallyScopedActionFilter

  private

  def ensure_vendor!
    return if current_user.vendor?

    render json: { error: 'Access denied. Vendor account required.' }, status: :forbidden
  end
end
