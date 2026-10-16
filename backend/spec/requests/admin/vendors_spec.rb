# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Admin Vendors' do
  let(:admin_user) { create(:admin_user) }
  let!(:vendor) do
    create(:vendor,
           business_name: 'Ajeet Kumar Business',
           verification_status: :pending_verification)
  end

  before do
    sign_in admin_user, scope: :admin_user
  end

  describe 'GET /admin/vendors/:id' do
    it 'finds vendor by slug' do
      get "/admin/vendors/#{vendor.slug}"
      expect(response).to have_http_status(:ok)
      expect(response.body).to include(vendor.business_name)
    end

    it 'finds vendor by numeric id' do
      get "/admin/vendors/#{vendor.id}"
      expect(response).to have_http_status(:ok)
      expect(response.body).to include(vendor.business_name)
    end
  end

  describe 'PUT /admin/vendors/:id/verify' do
    it 'verifies vendor using slug parameter' do
      put "/admin/vendors/#{vendor.slug}/verify"
      expect(response).to have_http_status(:redirect)
      expect(vendor.reload.verification_status).to eq('verified')
      expect(vendor.verified_at).to be_present
    end

    it 'verifies vendor using numeric id parameter' do
      put "/admin/vendors/#{vendor.id}/verify"
      expect(response).to have_http_status(:redirect)
      expect(vendor.reload.verification_status).to eq('verified')
    end
  end

  describe 'GET /admin/vendors/:id/verify' do
    it 'allows direct GET verification using slug parameter' do
      get "/admin/vendors/#{vendor.slug}/verify"
      expect(response).to have_http_status(:redirect)
      expect(vendor.reload.verification_status).to eq('verified')
    end
  end
end
