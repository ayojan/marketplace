# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Admin Resources' do
  let(:admin_user) { create(:admin_user) }

  before do
    sign_in admin_user, scope: :admin_user
  end

  describe 'GET /admin/service_images' do
    it 'returns a successful response' do
      get '/admin/service_images'
      expect(response).to have_http_status(:ok)
    end
  end

  describe 'GET /admin/booking_messages' do
    it 'returns a successful response' do
      get '/admin/booking_messages'
      expect(response).to have_http_status(:ok)
    end
  end

  describe 'GET /admin/in_app_notifications' do
    it 'returns a successful response' do
      get '/admin/in_app_notifications'
      expect(response).to have_http_status(:ok)
    end
  end
end
