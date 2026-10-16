# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Vendor Management API' do
  let(:vendor_user) { create(:user, :vendor) }
  let(:customer_user) { create(:user, :customer) }
  let(:vendor) { vendor_user.vendor }

  def auth_headers(user)
    token = JwtService.encode(user_id: user.id)
    { 'Authorization' => "Bearer #{token}" }
  end

  describe 'GET /profiles/service_categories' do
    before do
      create(:category, :photography)
      create(:category, :videography)
      create(:category, name: 'Inactive', active: false)
    end

    it 'returns active service categories without authentication' do
      get '/profiles/service_categories'

      expect(response).to have_http_status(:ok)
      json_response = JSON.parse(response.body)
      categories = json_response['service_categories']

      expect(categories.length).to eq(2)
      category_names = categories.pluck('name')
      expect(category_names).to include('Photography', 'Videography')
      expect(category_names).not_to include('Inactive')
    end
  end

  describe 'GET /profiles/me' do
    context 'when vendor is authenticated' do
      it 'returns the vendor profile' do
        get '/profiles/me', headers: auth_headers(vendor_user)

        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        expect(json_response['id']).to eq(vendor.id)
        expect(json_response['user_id']).to eq(vendor_user.id)
        expect(json_response['business_name']).to be_present
      end
    end

    context 'when customer tries to access' do
      it 'returns forbidden error' do
        get '/profiles/me', headers: auth_headers(customer_user)

        expect(response).to have_http_status(:forbidden)
        json_response = JSON.parse(response.body)
        expect(json_response['error']).to eq('Access denied. Vendor role required.')
      end
    end

    context 'when not authenticated' do
      it 'returns unauthorized error' do
        get '/profiles/me'

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe 'GET /profiles/:id' do
    it 'returns vendor profile for any authenticated user' do
      get "/profiles/#{vendor.id}", headers: auth_headers(customer_user)

      expect(response).to have_http_status(:ok)
      json_response = JSON.parse(response.body)
      expect(json_response['id']).to eq(vendor.id)
      expect(json_response['business_name']).to eq(vendor.business_name)
    end

    it 'returns not found for non-existent profile' do
      get '/profiles/99999', headers: auth_headers(vendor_user)

      expect(response).to have_http_status(:not_found)
      json_response = JSON.parse(response.body)
      expect(json_response['error']).to eq('Vendor not found')
    end
  end

  describe 'PUT /profiles/:id' do
    let(:update_params) do
      {
        vendor: {
          business_name: 'Updated Business Name',
          description: 'This is an updated description that is long enough to meet validation requirements',
          location: 'Updated Location',
          years_experience: 10
        }
      }
    end

    context 'when vendor updates own profile' do
      it 'successfully updates the profile' do
        put "/profiles/#{vendor.id}",
            params: update_params,
            headers: auth_headers(vendor_user)

        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        expect(json_response['business_name']).to eq('Updated Business Name')
        expect(json_response['years_experience']).to eq(10)

        vendor.reload
        expect(vendor.business_name).to eq('Updated Business Name')
      end
    end

    context 'when vendor tries to update another vendor profile' do
      let(:other_vendor) { create(:user, :vendor) }

      it 'returns forbidden error' do
        put "/profiles/#{vendor.id}",
            params: update_params,
            headers: auth_headers(other_vendor)

        expect(response).to have_http_status(:forbidden)
        json_response = JSON.parse(response.body)
        expect(json_response['error']).to eq('Access denied. You can only manage your own profile.')
      end
    end
  end

  describe 'POST /profiles' do
    let(:new_vendor) { create(:user, role: :vendor) }
    let(:create_params) do
      {
        vendor: {
          business_name: 'New Photography Business',
          description: 'Professional photography services with years of experience in capturing special moments',
          location: 'San Francisco, CA',
          phone: '+1-555-987-6543',
          website: 'https://newphotography.com',
          years_experience: 3,
          service_categories_list: ['Photography', 'Event Management']
        }
      }
    end

    context 'when vendor does not have a profile' do
      before { new_vendor.vendor.destroy }

      it 'creates a new vendor' do
        expect do
          post '/profiles',
               params: create_params,
               headers: auth_headers(new_vendor)
        end.to change(Vendor, :count).by(1)

        expect(response).to have_http_status(:created)
        json_response = JSON.parse(response.body)
        expect(json_response['business_name']).to eq('New Photography Business')
        expect(json_response['service_categories']).to eq(['Photography', 'Event Management'])
      end
    end

    context 'when vendor already has a profile' do
      it 'returns error' do
        post '/profiles',
             params: create_params,
             headers: auth_headers(vendor_user)

        expect(response).to have_http_status(:unprocessable_content)
        json_response = JSON.parse(response.body)
        expect(json_response['error']).to eq('Profile already exists')
      end
    end
  end

  describe 'DELETE /profiles/:id' do
    context 'when vendor deletes own profile' do
      it 'successfully deletes the profile' do
        profile_id = vendor.id

        delete "/profiles/#{profile_id}",
               headers: auth_headers(vendor_user)

        expect(response).to have_http_status(:no_content)
        expect(Vendor.find_by(id: profile_id)).to be_nil
      end
    end

    context 'when vendor tries to delete another vendor profile' do
      let(:other_vendor) { create(:user, :vendor) }

      it 'returns forbidden error' do
        delete "/profiles/#{vendor.id}",
               headers: auth_headers(other_vendor)

        expect(response).to have_http_status(:forbidden)
        json_response = JSON.parse(response.body)
        expect(json_response['error']).to eq('Access denied. You can only manage your own profile.')
      end
    end
  end
end
