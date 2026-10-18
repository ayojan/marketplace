# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ProfilesController do
  let(:vendor_user) { create(:user, :vendor) }
  let(:customer_user) { create(:user, :customer) }
  let(:vendor) { vendor_user.vendor }
  let(:other_vendor_user) { create(:user, :vendor) }
  let(:other_vendor) { other_vendor_user.vendor }

  # Helper method to generate JWT token for authentication
  def auth_headers(user)
    token = Auth::JwtService.encode(user_id: user.id)
    { 'Authorization' => "Bearer #{token}" }
  end

  describe 'GET #show' do
    context 'when vendor exists' do
      it 'returns the vendor profile' do
        request.headers.merge!(auth_headers(vendor_user))
        get :show, params: { id: vendor.id }, format: :json

        expect(response).to have_http_status(:ok)
        json_response = response.parsed_body
        expect(json_response['id']).to eq(vendor.id)
        expect(json_response['slug']).to eq(vendor.slug)
        expect(json_response['business_name']).to eq(vendor.business_name)
      end

      it 'returns the vendor profile when queried by slug' do
        request.headers.merge!(auth_headers(vendor_user))
        get :show, params: { id: vendor.slug }, format: :json

        expect(response).to have_http_status(:ok)
        json_response = response.parsed_body
        expect(json_response['id']).to eq(vendor.id)
        expect(json_response['slug']).to eq(vendor.slug)
        expect(json_response['business_name']).to eq(vendor.business_name)
      end
    end

    context 'when vendor does not exist' do
      it 'returns not found' do
        request.headers.merge!(auth_headers(vendor_user))
        get :show, params: { id: 999_999 }, format: :json

        expect(response).to have_http_status(:not_found)
        json_response = response.parsed_body
        expect(json_response['error']).to eq('Vendor not found')
      end
    end
  end

  describe 'POST #create' do
    context 'when user is a vendor without existing profile' do
      let(:valid_params) do
        {
          vendor: {
            business_name: 'Test Business',
            description: 'This is a detailed test description that meets the minimum length requirement of fifty.',
            location: 'Test Location',
            phone: '123-456-7890',
            website: 'https://test.com',
            years_experience: 5
          }
        }
      end

      it 'creates a new vendor' do
        user_without_profile = create(:user, :vendor)
        user_without_profile.vendor.destroy!
        user_without_profile.reload

        request.headers.merge!(auth_headers(user_without_profile))

        expect do
          post :create, params: valid_params, format: :json
        end.to change(Vendor, :count).by(1)

        expect(response).to have_http_status(:created)
        json_response = response.parsed_body
        expect(json_response['business_name']).to eq('Test Business')
        expect(json_response['user_id']).to eq(user_without_profile.id)
      end
    end

    context 'when user already has a vendor profile' do
      let(:valid_params) do
        {
          vendor: {
            business_name: 'Another Business',
            description: 'Another Description'
          }
        }
      end

      it 'returns unprocessable entity' do
        request.headers.merge!(auth_headers(vendor_user))

        post :create, params: valid_params, format: :json

        expect(response).to have_http_status(:unprocessable_content)
        json_response = response.parsed_body
        expect(json_response['error']).to eq('Profile already exists')
      end
    end

    context 'when user is not a vendor' do
      it 'returns forbidden' do
        request.headers.merge!(auth_headers(customer_user))

        post :create, params: { vendor: { business_name: 'Test' } }, format: :json

        expect(response).to have_http_status(:forbidden)
        json_response = response.parsed_body
        expect(json_response['error']).to eq('Access denied. Vendor role required.')
      end
    end
  end

  describe 'PUT #update' do
    let(:update_params) do
      {
        id: vendor.id,
        vendor: {
          business_name: 'Updated Business Name',
          description: 'This is an updated description that meets the minimum length'
        }
      }
    end

    context 'when user owns the profile' do
      it 'updates the vendor' do
        request.headers.merge!(auth_headers(vendor_user))

        put :update, params: update_params, format: :json

        expect(response).to have_http_status(:ok)
        json_response = response.parsed_body
        expect(json_response['business_name']).to eq('Updated Business Name')
        expect(json_response['description']).to eq('This is an updated description that meets the minimum length')
      end
    end

    context 'when user does not own the profile' do
      it 'returns forbidden' do
        request.headers.merge!(auth_headers(other_vendor_user))

        put :update, params: update_params, format: :json

        expect(response).to have_http_status(:forbidden)
        json_response = response.parsed_body
        expect(json_response['error']).to eq('Access denied. You can only manage your own profile.')
      end
    end
  end

  describe 'DELETE #destroy' do
    context 'when user owns the profile' do
      it 'deletes the vendor' do
        request.headers.merge!(auth_headers(vendor_user))

        expect do
          delete :destroy, params: { id: vendor.id }, format: :json
        end.to change(Vendor, :count).by(-1)

        expect(response).to have_http_status(:no_content)
      end
    end

    context 'when user does not own the profile' do
      it 'returns forbidden' do
        request.headers.merge!(auth_headers(other_vendor_user))

        delete :destroy, params: { id: vendor.id }, format: :json

        expect(response).to have_http_status(:forbidden)
        json_response = response.parsed_body
        expect(json_response['error']).to eq('Access denied. You can only manage your own profile.')
      end
    end
  end

  describe 'GET #me' do
    context 'when user has a vendor' do
      it 'returns the current user vendor' do
        request.headers.merge!(auth_headers(vendor_user))

        get :me, format: :json

        expect(response).to have_http_status(:ok)
        json_response = response.parsed_body
        expect(json_response['id']).to eq(vendor.id)
        expect(json_response['user_id']).to eq(vendor_user.id)
      end
    end

    context 'when user does not have a vendor' do
      let(:user_without_profile) { create(:user, :vendor) }

      before do
        user_without_profile.vendor&.destroy
        user_without_profile.reload
      end

      it 'returns not found' do
        request.headers.merge!(auth_headers(user_without_profile))

        get :me, format: :json

        expect(response).to have_http_status(:not_found)
        json_response = response.parsed_body
        expect(json_response['error']).to eq('No profile found')
      end
    end
  end

  describe 'PUT #update_me' do
    let(:update_params) do
      {
        vendor: {
          business_name: 'Updated My Business',
          description: 'This is an updated description that meets the minimum length requirement easily.',
          metadata: {
            onboarding_completed: true,
            packages: [{ title: 'Royal Package', price: 50_000 }]
          }
        }
      }
    end

    context 'when authenticated as vendor' do
      it 'updates the vendor and merges metadata' do
        request.headers.merge!(auth_headers(vendor_user))
        vendor.update!(metadata: { initial_key: 'initial_val' })

        put :update_me, params: update_params, as: :json

        expect(response).to have_http_status(:ok)
        json_response = response.parsed_body
        expect(json_response['business_name']).to eq('Updated My Business')
        expect(json_response['metadata']['onboarding_completed']).to be(true)
        expect(json_response['metadata']['initial_key']).to eq('initial_val')
        expect(json_response['metadata']['packages']).to be_an(Array)
      end
    end

    context 'when not authenticated' do
      it 'returns unauthorized' do
        put :update_me, params: update_params, format: :json
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe 'GET #service_categories' do
    before do
      create(:category, name: 'Active Category', active: true)
      create(:category, name: 'Inactive Category', active: false)
    end

    it 'returns active service categories without authentication' do
      get :service_categories, format: :json

      expect(response).to have_http_status(:ok)
      json_response = response.parsed_body
      expect(json_response['service_categories']).to be_an(Array)
      expect(json_response['service_categories'].length).to eq(1)
      expect(json_response['service_categories'].first['name']).to eq('Active Category')
    end
  end

  describe 'POST #request_verification' do
    context 'when authenticated as vendor' do
      before do
        request.headers.merge!(auth_headers(vendor_user))
      end

      it 'returns unprocessable_content when verification requirements are missing' do
        vendor.update!(business_license: nil)
        vendor.services.destroy_all

        post :request_verification, format: :json

        expect(response).to have_http_status(:unprocessable_content)
        json_response = response.parsed_body
        expect(json_response['error']).to include('Cannot submit verification request yet')
        expect(json_response['missing_requirements']).to include('Business registration or GSTIN number')
      end

      it 'submits verification request successfully when all requirements are met' do
        vendor.update!(
          business_license: '07AABCT2345D1Z5',
          phone: '+91 98111 22334',
          location: 'Delhi NCR',
          description: 'A' * 60
        )
        create(:service, vendor: vendor, status: :active)

        post :request_verification, format: :json

        expect(response).to have_http_status(:ok)
        json_response = response.parsed_body
        expect(json_response['status']).to eq('pending_verification')
        expect(json_response['verification_checks']).to be_present
      end
    end

    context 'when not authenticated' do
      it 'returns unauthorized' do
        post :request_verification, format: :json
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end
end
