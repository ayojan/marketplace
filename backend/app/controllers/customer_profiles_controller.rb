# frozen_string_literal: true

class CustomerProfilesController < ApiController
  before_action :authenticate_user!
  before_action :set_customer_profile

  # GET /customer_profile
  def show
    render json: { customer_profile: customer_profile_json(@customer_profile) }
  end

  # PUT/PATCH /customer_profile
  def update
    update_user_name_if_present

    if @customer_profile.update(customer_profile_params)
      render json: {
        message: 'Customer profile updated successfully',
        customer_profile: customer_profile_json(@customer_profile)
      }
    else
      render json: { error: 'Failed to update profile', details: @customer_profile.errors.full_messages },
             status: :unprocessable_content
    end
  end

  private

  def update_user_name_if_present
    cust_data = params[:customer_profile] || params
    user_updates = {
      first_name: cust_data[:first_name].presence || params[:first_name].presence,
      last_name: cust_data[:last_name].presence || params[:last_name].presence
    }.compact

    current_user.update(user_updates) if user_updates.present?
  end

  def set_customer_profile
    @customer_profile = current_user.customer_profile || current_user.create_customer_profile!
  end

  def customer_profile_params
    params.fetch(:customer_profile, params).permit(
      :phone, :location, :preferences, :event_types, :company_name, :budget_range
    )
  end

  def customer_profile_json(profile)
    user = profile.user
    {
      id: profile.id,
      user_id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone: profile.phone,
      location: profile.location,
      preferences: profile.preferences,
      event_types: profile.event_types,
      budget_range: profile.budget_range,
      company_name: profile.company_name,
      total_bookings: profile.total_bookings,
      customer_tier: profile.customer_tier,
      created_at: profile.created_at
    }
  end
end
