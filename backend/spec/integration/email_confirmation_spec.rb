# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Email Confirmation Flow' do
  describe 'User registration and confirmation' do
    it 'creates unconfirmed user and allows confirmation' do
      # Register a new user
      post '/auth/register', params: {
        auth: {
          email: 'test@example.com',
          password: 'password123',
          password_confirmation: 'password123',
          first_name: 'Test',
          last_name: 'User',
          role: 'customer'
        }
      }, as: :json

      expect(response).to have_http_status(:created)

      user = User.find_by(email: 'test@example.com')
      expect(user).to be_present
      expect(user.confirmed?).to be true

      # Login works immediately after registration
      post '/auth/login', params: {
        auth: {
          email: 'test@example.com',
          password: 'password123'
        }
      }, as: :json

      expect(response).to have_http_status(:ok)
      json_response = JSON.parse(response.body)
      expect(json_response['message']).to eq('Login successful')
      expect(json_response['token']).to be_present
    end

    it 'creates appropriate profile based on user role' do
      # Test customer profile creation
      post '/auth/register', params: {
        auth: {
          email: 'customer@example.com',
          password: 'password123',
          password_confirmation: 'password123',
          first_name: 'Customer',
          last_name: 'User',
          role: 'customer'
        }
      }, as: :json

      customer = User.find_by(email: 'customer@example.com')
      expect(customer.customer_profile).to be_present
      expect(customer.vendor_profile).to be_nil

      # Test vendor profile creation
      post '/auth/register', params: {
        auth: {
          email: 'vendor@example.com',
          password: 'password123',
          password_confirmation: 'password123',
          first_name: 'Vendor',
          last_name: 'User',
          role: 'vendor'
        }
      }, as: :json

      vendor = User.find_by(email: 'vendor@example.com')
      expect(vendor.vendor_profile).to be_present
      expect(vendor.customer_profile).to be_nil
    end
  end
end
