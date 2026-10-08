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
    # Update user names if provided in user params or root params
    if params[:first_name].present? || params[:last_name].present?
      user_params = {}
      user_params[:first_name] = params[:first_name] if params[:first_name].present?
      user_params[:last_name] = params[:last_name] if params[:last_name].present?
      current_user.update(user_params)
    end

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
