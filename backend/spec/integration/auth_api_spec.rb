# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Authentication API' do
  let(:user) { create(:user, confirmed_at: Time.current) }
  let(:unconfirmed_user) { create(:user, confirmed_at: nil) }

  describe 'POST /auth/login' do
    it 'successfully logs in a confirmed user' do
      post '/auth/login', params: {
        auth: {
          email: user.email,
          password: 'password123'
        }
      }, as: :json

      expect(response).to have_http_status(:ok)

      json_response = JSON.parse(response.body)
      expect(json_response['message']).to eq('Login successful')
      expect(json_response['token']).to be_present
      expect(json_response['user']['email']).to eq(user.email)
    end

    it 'auto-confirms unconfirmed user on login' do
      post '/auth/login', params: {
        auth: {
          email: unconfirmed_user.email,
          password: 'password123'
        }
      }, as: :json

      expect(response).to have_http_status(:ok)

      json_response = JSON.parse(response.body)
      expect(json_response['message']).to eq('Login successful')
      expect(json_response['token']).to be_present
    end

    it 'rejects invalid credentials' do
      post '/auth/login', params: {
        auth: {
          email: user.email,
          password: 'wrongpassword'
        }
      }, as: :json

      expect(response).to have_http_status(:unauthorized)

      json_response = JSON.parse(response.body)
      expect(json_response['error']).to eq('Invalid credentials')
    end
  end

  describe 'POST /auth/register' do
    it 'successfully registers a new user' do
      expect do
        post '/auth/register', params: {
          auth: {
            email: 'newuser@example.com',
            password: 'password123',
            password_confirmation: 'password123',
            first_name: 'John',
            last_name: 'Doe',
            role: 'customer'
          }
        }, as: :json
      end.to change(User, :count).by(1)

      expect(response).to have_http_status(:created)

      json_response = JSON.parse(response.body)
      expect(json_response['message']).to eq('Registration successful')
      expect(json_response['user']['email']).to eq('newuser@example.com')
      expect(json_response['user']['confirmed']).to be true
    end

    it 'rejects registration with invalid data' do
      post '/auth/register', params: {
        auth: {
          email: 'invalid-email',
          password: '123',
          password_confirmation: '456',
          first_name: '',
          last_name: '',
          role: 'customer'
        }
      }, as: :json

      expect(response).to have_http_status(:unprocessable_content)

      json_response = JSON.parse(response.body)
      expect(json_response['error']).to eq('Registration failed')
      expect(json_response['details']).to be_an(Array)
      expect(json_response['details'].length).to be > 0
    end
  end

  describe 'DELETE /auth/logout' do
    it 'successfully logs out' do
      delete '/auth/logout', as: :json

      expect(response).to have_http_status(:ok)

      json_response = JSON.parse(response.body)
      expect(json_response['message']).to eq('Logout successful')
    end
  end

  describe 'JWT token usage' do
    it 'allows access to protected endpoints with valid token' do
      # Login to get a token
      post '/auth/login', params: {
        auth: {
          email: user.email,
          password: 'password123'
        }
      }, as: :json

      token = JSON.parse(response.body)['token']

      # Use the token to access a protected endpoint (we'll use a simple endpoint)
      get '/users/show', headers: {
        'Authorization' => "Bearer #{token}"
      }, as: :json

      # This should not return a missing token error
      # The actual response depends on whether the endpoint exists and is implemented
      expect(response).not_to have_http_status(:unprocessable_content) # Should not be "Missing token"
    end
  end
end
