# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ServicesController do
  let(:vendor_user) { create(:user, role: 'vendor') }
  let(:customer_user) { create(:user, role: 'customer') }
  let(:vendor) { vendor_user.vendor }
  let(:service_category) { create(:category, :photography) }
  let(:videography_category) { create(:category, :videography) }

  let(:photography_service) do
    create(:service,
           name: 'Wedding Photography',
           description: 'Professional wedding photography services in New York capturing ' \
                        'your special moments with artistic flair',
           base_price: 1000,
           pricing_type: 'package',
           status: 'active',
           vendor: vendor,
           service_category: service_category)
  end

  let(:portrait_service) do
    create(:service,
           name: 'Portrait Photography',
           description: 'Studio portrait photography sessions with professional lighting ' \
                        'and editing for stunning results',
           base_price: 200,
           pricing_type: 'hourly',
           status: 'active',
           vendor: vendor,
           service_category: service_category)
  end

  let(:videography_service) do
    create(:service,
           name: 'Event Videography',
           description: 'Professional event video recording with multi-camera setup ' \
                        'and post-production editing services',
           base_price: 1500,
           pricing_type: 'package',
           status: 'active',
           vendor: vendor,
           service_category: videography_category)
  end

  let(:inactive_service) do
    create(:service,
           name: 'Inactive Service',
           description: 'This service is currently inactive and not available for booking ' \
                        'at this time',
           status: 'inactive',
           vendor: vendor,
           service_category: service_category)
  end

  before do
    photography_service
    portrait_service
    videography_service
    inactive_service
  end

  describe 'GET #index' do
    context 'without authentication' do
      it 'returns paginated services with default parameters' do
        get :index
        expect(response).to have_http_status(:ok)
        json_response = response.parsed_body

        expect(json_response).to have_key('services')
        expect(json_response).to have_key('pagination')
        expect(json_response).to have_key('filters')

        expect(json_response['services'].length).to eq(3) # Only active services
        expect(json_response['pagination']['current_page']).to eq(1)
        expect(json_response['pagination']['per_page']).to eq(20)
        expect(json_response['pagination']['total_count']).to eq(3)
      end

      it 'filters by vendor_id' do
        other_vendor = create(:user, role: 'vendor')
        create(:service, vendor: other_vendor.vendor, status: 'active')

        get :index, params: { vendor_id: vendor.id }

        expect(response).to have_http_status(:ok)
        json_response = response.parsed_body

        expect(json_response['services'].length).to eq(3)
        json_response['services'].each do |service|
          expect(service['vendor']['id']).to eq(vendor.id)
        end
        expect(json_response['filters']['vendor_id']).to eq(vendor.id)
      end

      it 'filters by category_id' do
        get :index, params: { category_id: service_category.id }

        expect(response).to have_http_status(:ok)
        json_response = response.parsed_body

        expect(json_response['services'].length).to eq(2) # photography services only
        json_response['services'].each do |service|
          expect(service['category']['id']).to eq(service_category.id)
        end
        expect(json_response['filters']['category_id']).to eq(service_category.id)
      end

      it 'supports pagination' do
        get :index, params: { per_page: 2, page: 1 }

        expect(response).to have_http_status(:ok)
        json_response = response.parsed_body

        expect(json_response['services'].length).to eq(2)
        expect(json_response['pagination']['current_page']).to eq(1)
        expect(json_response['pagination']['per_page']).to eq(2)
        expect(json_response['pagination']['total_pages']).to eq(2)
        expect(json_response['pagination']['has_next_page']).to be true
        expect(json_response['pagination']['has_prev_page']).to be false
      end

      it 'supports sorting by name' do
        get :index, params: { sort_by: 'name', sort_direction: 'asc' }

        expect(response).to have_http_status(:ok)
        json_response = response.parsed_body

        service_names = json_response['services'].pluck('name')
        expect(service_names).to eq(['Event Videography', 'Portrait Photography', 'Wedding Photography'])
      end

      it 'supports sorting by price' do
        get :index, params: { sort_by: 'base_price', sort_direction: 'asc' }

        expect(response).to have_http_status(:ok)
        json_response = response.parsed_body

        service_prices = json_response['services'].map { |s| s['base_price'].to_f }
        expect(service_prices).to eq([200.0, 1000.0, 1500.0])
      end
    end
  end

  describe 'GET #show' do
    it 'returns service details without authentication' do
      get :show, params: { id: photography_service.id }

      expect(response).to have_http_status(:ok)
      json_response = response.parsed_body

      expect(json_response['id']).to eq(photography_service.id)
      expect(json_response['name']).to eq('Wedding Photography')
      expect(json_response['vendor']['id']).to eq(vendor.id)
      expect(json_response['vendor']['business_name']).to eq(vendor.business_name)
      expect(json_response['category']['id']).to eq(service_category.id)
    end

    it 'returns 404 for non-existent service' do
      get :show, params: { id: 999_999 }

      expect(response).to have_http_status(:not_found)
    end
  end

  describe 'GET #search' do
    context 'without authentication' do
      it 'searches services by query parameter' do
        get :search, params: { q: 'Wedding' }

        expect(response).to have_http_status(:ok)
        json_response = response.parsed_body

        expect(json_response).to have_key('services')
        expect(json_response).to have_key('pagination')
        expect(json_response).to have_key('filters')
        expect(json_response).to have_key('total_count')

        expect(json_response['services'].length).to eq(1)
        expect(json_response['services'].first['name']).to eq('Wedding Photography')
        expect(json_response['filters']['query']).to eq('Wedding')
        expect(json_response['total_count']).to eq(1)
      end

      it 'searches services by query parameter (alternative param name)' do
        get :search, params: { query: 'Portrait' }

        expect(response).to have_http_status(:ok)
        json_response = response.parsed_body

        expect(json_response['services'].length).to eq(1)
        expect(json_response['services'].first['name']).to eq('Portrait Photography')
        expect(json_response['filters']['query']).to eq('Portrait')
      end

      it 'filters by location' do
        # Update vendor location for testing
        vendor.update!(location: 'New York, NY')

        get :search, params: { location: 'New York' }

        expect(response).to have_http_status(:ok)
        json_response = response.parsed_body

        expect(json_response['services'].length).to eq(3)
        expect(json_response['filters']['location']).to eq('New York')
      end

      it 'filters by price range' do
        get :search, params: { min_price: 500, max_price: 1200 }

        expect(response).to have_http_status(:ok)
        json_response = response.parsed_body

        expect(json_response['services'].length).to eq(1)
        expect(json_response['services'].first['name']).to eq('Wedding Photography')
        expect(json_response['filters']['min_price'].to_f).to eq(500.0)
        expect(json_response['filters']['max_price'].to_f).to eq(1200.0)
      end

      it 'filters by pricing type' do
        get :search, params: { pricing_type: 'hourly' }

        expect(response).to have_http_status(:ok)
        json_response = response.parsed_body

        expect(json_response['services'].length).to eq(1)
        expect(json_response['services'].first['name']).to eq('Portrait Photography')
        expect(json_response['services'].first['pricing_type']).to eq('hourly')
        expect(json_response['filters']['pricing_type']).to eq('hourly')
      end

      it 'combines multiple filters' do
        get :search, params: {
          query: 'Photography',
          category_id: service_category.id,
          min_price: 100,
          max_price: 500
        }

        expect(response).to have_http_status(:ok)
        json_response = response.parsed_body

        expect(json_response['services'].length).to eq(1)
        expect(json_response['services'].first['name']).to eq('Portrait Photography')
        expect(json_response['filters'].keys).to include('query', 'category_id', 'min_price', 'max_price')
      end

      it 'returns empty results when no services match' do
        get :search, params: { query: 'NonExistentService' }

        expect(response).to have_http_status(:ok)
        json_response = response.parsed_body

        expect(json_response['services']).to be_empty
        expect(json_response['total_count']).to eq(0)
        expect(json_response['pagination']['total_pages']).to eq(0)
      end

      it 'supports pagination in search results' do
        get :search, params: { per_page: 2, page: 1 }

        expect(response).to have_http_status(:ok)
        json_response = response.parsed_body

        expect(json_response['services'].length).to eq(2)
        expect(json_response['pagination']['current_page']).to eq(1)
        expect(json_response['pagination']['per_page']).to eq(2)
        expect(json_response['pagination']['has_next_page']).to be true
      end

      it 'supports sorting in search results' do
        get :search, params: { sort_by: 'base_price', sort_direction: 'desc' }

        expect(response).to have_http_status(:ok)
        json_response = response.parsed_body

        service_prices = json_response['services'].map { |s| s['base_price'].to_f }
        expect(service_prices).to eq([1500.0, 1000.0, 200.0])
      end
    end
  end

  describe 'POST #create' do
    context 'when authenticated as vendor' do
      before do
        token = JwtService.encode(user_id: vendor_user.id)
        request.headers['Authorization'] = "Bearer #{token}"
      end

      let(:valid_service_params) do
        {
          service: {
            name: 'New Photography Service',
            description: 'A comprehensive new photography service offering ' \
                         'professional quality images for all occasions',
            base_price: 300,
            pricing_type: 'hourly',
            category_id: service_category.id,
            status: 'active'
          }
        }
      end

      it 'creates a new service successfully' do
        expect do
          post :create, params: valid_service_params
        end.to change(Service, :count).by(1)

        expect(response).to have_http_status(:created)
        json_response = response.parsed_body

        expect(json_response['message']).to eq('Service created successfully')
        expect(json_response['service']['name']).to eq('New Photography Service')
        expect(json_response['service']['vendor']['id']).to eq(vendor.id)
      end

      it 'returns validation errors for invalid service data' do
        invalid_params = {
          service: {
            name: '', # Invalid: empty name
            description: 'Short' # Invalid: too short
          }
        }

        expect do
          post :create, params: invalid_params
        end.not_to change(Service, :count)

        expect(response).to have_http_status(:unprocessable_content)
        json_response = response.parsed_body

        expect(json_response['error']).to eq('Service creation failed')
        expect(json_response['details']).to be_an(Array)
        expect(json_response['details']).not_to be_empty
      end
    end

    context 'when authenticated as customer' do
      before do
        token = JwtService.encode(user_id: customer_user.id)
        request.headers['Authorization'] = "Bearer #{token}"
      end

      it 'returns forbidden error' do
        post :create, params: { service: { name: 'Test Service' } }

        expect(response).to have_http_status(:forbidden)
        json_response = response.parsed_body
        expect(json_response['error']).to eq('Only vendors can manage services')
      end
    end

    context 'when not authenticated' do
      it 'returns unauthorized error' do
        post :create, params: { service: { name: 'Test Service' } }

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe 'PUT #update' do
    context 'when authenticated as vendor' do
      before do
        token = JwtService.encode(user_id: vendor_user.id)
        request.headers['Authorization'] = "Bearer #{token}"
      end

      let(:update_params) do
        {
          id: photography_service.id,
          service: {
            name: 'Updated Wedding Photography',
            description: 'Updated description for the wedding photography service with more comprehensive details',
            base_price: 1200
          }
        }
      end

      it 'updates the service successfully' do
        put :update, params: update_params

        expect(response).to have_http_status(:ok)
        json_response = response.parsed_body

        expect(json_response['message']).to eq('Service updated successfully')
        expect(json_response['service']['name']).to eq('Updated Wedding Photography')
        expect(json_response['service']['base_price'].to_f).to eq(1200.0)
      end

      it 'returns validation errors for invalid update data' do
        invalid_update_params = {
          id: photography_service.id,
          service: {
            name: '', # Invalid: empty name
            base_price: -100 # Invalid: negative price
          }
        }

        put :update, params: invalid_update_params

        expect(response).to have_http_status(:unprocessable_content)
        json_response = response.parsed_body

        expect(json_response['error']).to eq('Service update failed')
        expect(json_response['details']).to be_an(Array)
      end

      it 'returns 404 for non-existent service' do
        put :update, params: { id: 999_999, service: { name: 'Test' } }

        expect(response).to have_http_status(:not_found)
      end
    end

    context 'when authenticated as different vendor' do
      let(:other_vendor) { create(:user, :vendor) }

      before do
        token = JwtService.encode(user_id: other_vendor.id)
        request.headers['Authorization'] = "Bearer #{token}"
      end

      it 'returns forbidden error when trying to update another vendor\'s service' do
        put :update, params: { id: photography_service.id, service: { name: 'Hacked Service' } }

        expect(response).to have_http_status(:forbidden)
      end
    end
  end

  describe 'DELETE #destroy' do
    context 'when authenticated as vendor' do
      before do
        token = JwtService.encode(user_id: vendor_user.id)
        request.headers['Authorization'] = "Bearer #{token}"
      end

      it 'deletes the service successfully' do
        service_to_delete = create(:service, vendor: vendor)

        expect do
          delete :destroy, params: { id: service_to_delete.id }
        end.to change(Service, :count).by(-1)

        expect(response).to have_http_status(:ok)
        json_response = response.parsed_body
        expect(json_response['message']).to eq('Service deleted successfully')
      end

      it 'returns 404 for non-existent service' do
        delete :destroy, params: { id: 999_999 }

        expect(response).to have_http_status(:not_found)
      end
    end

    context 'when authenticated as different vendor' do
      let(:other_vendor) { create(:user, :vendor) }

      before do
        token = JwtService.encode(user_id: other_vendor.id)
        request.headers['Authorization'] = "Bearer #{token}"
      end

      it 'returns forbidden error when trying to delete another vendor\'s service' do
        delete :destroy, params: { id: photography_service.id }

        expect(response).to have_http_status(:forbidden)
      end
    end
  end

  # Helper method tests
  describe 'service response format' do
    it 'includes all required fields in basic response' do
      get :show, params: { id: photography_service.id }

      expect(response).to have_http_status(:ok)
      json_response = response.parsed_body

      expect(json_response).to include(
        'id', 'name', 'description', 'base_price', 'pricing_type',
        'formatted_price', 'status', 'vendor', 'category', 'images',
        'created_at', 'updated_at'
      )

      expect(json_response['vendor']).to include('id', 'business_name', 'location')
      expect(json_response['category']).to include('id', 'name')
    end
  end
end
