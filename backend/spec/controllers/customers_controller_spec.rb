# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CustomersController do
  let(:customer_user) { create(:user, :customer, first_name: 'Jane', last_name: 'Doe') }
  let(:customer) { customer_user }

  def auth_headers(user)
    token = Auth::JwtService.encode(user_id: user.id)
    { 'Authorization' => "Bearer #{token}" }
  end

  before do
    request.headers.merge!(auth_headers(customer_user))
  end

  describe 'GET #show' do
    it 'returns the customer profile' do
      get :show, format: :json

      expect(response).to have_http_status(:ok)
      json = response.parsed_body['customer']
      expect(json['id']).to eq(customer.id)
      expect(json['first_name']).to eq('Jane')
      expect(json['last_name']).to eq('Doe')
    end
  end

  describe 'PUT/PATCH #update' do
    context 'with valid attributes' do
      let(:update_params) do
        {
          customer: {
            first_name: 'Janet',
            phone: '+15559876543',
            location: 'Chicago, IL'
          }
        }
      end

      it 'updates customer profile and user identity' do
        put :update, params: update_params, format: :json

        expect(response).to have_http_status(:ok)
        json = response.parsed_body
        expect(json['message']).to eq('Customer updated successfully')
        expect(json['customer']['first_name']).to eq('Janet')
        expect(json['customer']['phone']).to eq('+15559876543')
        expect(json['customer']['location']).to eq('Chicago, IL')
      end
    end

    context 'with invalid attributes' do
      it 'returns unprocessable_content status on failure' do
        put :update, params: { customer: { phone: 'INVALID_PHONE!!!' } }, format: :json

        expect(response).to have_http_status(:unprocessable_content)
        json = response.parsed_body
        expect(json['error']).to eq('Failed to update customer')
        expect(json['details']).to be_present
      end
    end
  end
end
