# frozen_string_literal: true

class AnalyticsController < ApiController
  before_action :authenticate_user!
  before_action :ensure_vendor

  def dashboard
    render json: Vendors::VendorAnalyticsService.call(current_user.vendor)
  end

  private

  def ensure_vendor
    return if current_user&.vendor? && current_user.vendor

    render json: { error: 'Only vendors with profiles can access analytics' }, status: :forbidden
  end
end
