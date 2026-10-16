# frozen_string_literal: true

class CustomersController < ApiController
  before_action :authenticate_user!

  # GET /customer
  def show
    render json: { customer: customer_json(current_user) }
  end

  # PUT/PATCH /customer
  def update
    result = Customers::UpdateProfile.call(
      user: current_user,
      params: params
    )

    if result[:success]
      render json: {
        message: 'Customer updated successfully',
        customer: customer_json(result[:user])
      }
    else
      render json: { error: 'Failed to update customer', details: result[:errors] },
             status: :unprocessable_content
    end
  end

  private

  def customer_json(user)
    {
      id: user.id,
      user_id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone: user.phone,
      location: user.location,
      preferences: user.preferences,
      event_types: user.event_types,
      budget_range: user.budget_range,
      company_name: user.company_name,
      total_bookings: user.total_bookings,
      customer_tier: user.customer_tier,
      created_at: user.created_at
    }
  end
end
