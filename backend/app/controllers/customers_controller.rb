# frozen_string_literal: true

class CustomersController < ApiController
  before_action :authenticate_user!
  before_action :set_customer

  # GET /customer
  def show
    render json: { customer: customer_json(@customer) }
  end

  # PUT/PATCH /customer
  def update
    update_user_name_if_present

    if @customer.update(customer_params)
      render json: {
        message: 'Customer updated successfully',
        customer: customer_json(@customer)
      }
    else
      render json: { error: 'Failed to update customer', details: @customer.errors.full_messages },
             status: :unprocessable_content
    end
  end

  private

  def update_user_name_if_present
    cust_data = params[:customer] || params
    user_updates = {
      first_name: cust_data[:first_name].presence || params[:first_name].presence,
      last_name: cust_data[:last_name].presence || params[:last_name].presence
    }.compact

    current_user.update(user_updates) if user_updates.present?
  end

  def set_customer
    @customer = current_user.customer || current_user.create_customer!
  end

  def customer_params
    cust_params = params[:customer] || params
    cust_params.permit(
      :phone, :location, :preferences, :event_types, :company_name, :budget_range
    )
  end

  def customer_json(customer)
    user = customer.user
    {
      id: customer.id,
      user_id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone: customer.phone,
      location: customer.location,
      preferences: customer.preferences,
      event_types: customer.event_types,
      budget_range: customer.budget_range,
      company_name: customer.company_name,
      total_bookings: customer.total_bookings,
      customer_tier: customer.customer_tier,
      created_at: customer.created_at
    }
  end
end
