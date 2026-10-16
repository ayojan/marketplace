# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ServiceImagesController do
  before do
    allow(ImageProcessingJob).to receive(:perform_later)
  end

  let(:vendor_user) { create(:user, :vendor) }
  let(:customer_user) { create(:user, :customer) }
  let(:service) { create(:service, vendor: vendor_user.vendor) }
  let(:other_service) { create(:service) }

  let(:valid_image_params) do
    {
      service_image: {
        image: fixture_file_upload('spec/fixtures/files/test_image.jpg', 'image/jpeg'),
        title: 'Test Image',
        description: 'A test image for our service',
        alt_text: 'Test image alt text',
        display_order: 0
      }
    }
  end

  let(:invalid_image_params) do
    {
      service_image: {
        title: 'Test Image without image file'
      }
    }
  end

  describe 'authentication and authorization' do
    context 'when not authenticated' do
      it 'returns unauthorized for index' do
        get :index, params: { service_id: service.id }
        expect(response).to have_http_status(:unauthorized)
      end

      it 'returns unauthorized for create' do
        post :create, params: { service_id: service.id }.merge(valid_image_params)
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'when authenticated as customer' do
      before { sign_in customer_user }

      it 'returns forbidden for index' do
        get :index, params: { service_id: service.id }
        expect(response).to have_http_status(:forbidden)
        json_response = response.parsed_body
        expect(json_response['error']).to eq('Only vendors can manage service images')
      end
    end

    context 'when authenticated as vendor but not service owner' do
      let(:other_vendor) { create(:user, :vendor) }

      before { sign_in other_vendor }

      it 'returns forbidden for index' do
        get :index, params: { service_id: service.id }
        expect(response).to have_http_status(:forbidden)
        json_response = response.parsed_body
        expect(json_response['error']).to eq('You can only manage images for your own services')
      end
    end
  end

  describe 'GET #index' do
    let!(:service_image) { create(:service_image, service: service) }

    before { sign_in vendor_user }

    it 'returns service images' do
      get :index, params: { service_id: service.id }

      expect(response).to have_http_status(:ok)
      json_response = response.parsed_body
      expect(json_response['service_images']).to be_an(Array)
      expect(json_response['service_images'].length).to eq(1)
      expect(json_response['service_images'].first['id']).to eq(service_image.id)
    end
  end

  describe 'GET #show' do
    let!(:service_image) { create(:service_image, service: service) }

    before { sign_in vendor_user }

    it 'returns the service image' do
      get :show, params: { service_id: service.id, id: service_image.id }

      expect(response).to have_http_status(:ok)
      json_response = response.parsed_body
      expect(json_response['service_image']['id']).to eq(service_image.id)
      expect(json_response['service_image']['title']).to eq(service_image.title)
    end

    context 'when image does not exist' do
      it 'returns not found' do
        get :show, params: { service_id: service.id, id: 999_999 }

        expect(response).to have_http_status(:not_found)
        json_response = response.parsed_body
        expect(json_response['error']).to eq('Image not found')
      end
    end
  end

  describe 'POST #create' do
    before { sign_in vendor_user }

    context 'with valid parameters' do
      it 'creates a new service image' do
        expect do
          post :create, params: { service_id: service.id }.merge(valid_image_params)
        end.to change(ServiceImage, :count).by(1)

        expect(response).to have_http_status(:created)
        json_response = response.parsed_body
        expect(json_response['message']).to eq('Image uploaded successfully')
        expect(json_response['service_image']['title']).to eq('Test Image')
      end
    end

    context 'with invalid parameters' do
      it 'returns unprocessable entity' do
        expect do
          post :create, params: { service_id: service.id }.merge(invalid_image_params)
        end.not_to change(ServiceImage, :count)

        expect(response).to have_http_status(:unprocessable_content)
        json_response = response.parsed_body
        expect(json_response['error']).to eq('Image upload failed')
        expect(json_response['details']).to be_an(Array)
      end
    end
  end

  describe 'PUT #update' do
    let!(:service_image) { create(:service_image, service: service) }
    let(:update_params) do
      {
        service_image: {
          title: 'Updated Title',
          description: 'Updated Description'
        }
      }
    end

    before { sign_in vendor_user }

    it 'updates the service image' do
      put :update, params: { service_id: service.id, id: service_image.id }.merge(update_params)

      expect(response).to have_http_status(:ok)
      json_response = response.parsed_body
      expect(json_response['message']).to eq('Image updated successfully')
      expect(json_response['service_image']['title']).to eq('Updated Title')
    end
  end

  describe 'DELETE #destroy' do
    let!(:service_image) { create(:service_image, service: service) }

    before { sign_in vendor_user }

    it 'deletes the service image' do
      expect do
        delete :destroy, params: { service_id: service.id, id: service_image.id }
      end.to change(ServiceImage, :count).by(-1)

      expect(response).to have_http_status(:ok)
      json_response = response.parsed_body
      expect(json_response['message']).to eq('Image deleted successfully')
    end
  end

  describe 'POST #set_primary' do
    let!(:service_image) { create(:service_image, service: service) }

    before { sign_in vendor_user }

    it 'sets the image as primary' do
      post :set_primary, params: { service_id: service.id, id: service_image.id }

      expect(response).to have_http_status(:ok)
      json_response = response.parsed_body
      expect(json_response['message']).to eq('Primary image updated successfully')
      expect(service_image.reload.is_primary).to be true
    end
  end

  describe 'POST #reorder' do
    let!(:first_service_image) { create(:service_image, service: service, display_order: 0) }
    let!(:second_service_image) { create(:service_image, service: service, display_order: 1) }

    before { sign_in vendor_user }

    it 'reorders the images' do
      post :reorder, params: {
        service_id: service.id,
        image_ids: [second_service_image.id, first_service_image.id]
      }

      expect(response).to have_http_status(:ok)
      json_response = response.parsed_body
      expect(json_response['message']).to eq('Images reordered successfully')
    end

    context 'with invalid image IDs' do
      it 'returns bad request' do
        post :reorder, params: {
          service_id: service.id,
          image_ids: [999_999]
        }

        expect(response).to have_http_status(:bad_request)
        json_response = response.parsed_body
        expect(json_response['error']).to eq('Invalid image IDs provided')
      end
    end
  end

  describe 'POST #bulk_upload' do
    before { sign_in vendor_user }

    let(:bulk_upload_params) do
      {
        images: [
          {
            image: fixture_file_upload('spec/fixtures/files/test_image.jpg', 'image/jpeg'),
            title: 'Image 1',
            description: 'First image'
          },
          {
            image: fixture_file_upload('spec/fixtures/files/test_image2.jpg', 'image/jpeg'),
            title: 'Image 2',
            description: 'Second image'
          }
        ]
      }
    end

    it 'uploads multiple images' do
      expect do
        post :bulk_upload, params: { service_id: service.id }.merge(bulk_upload_params)
      end.to change(ServiceImage, :count).by(2)

      expect(response).to have_http_status(:created)
      json_response = response.parsed_body
      expect(json_response['message']).to eq('2 images uploaded successfully')
      expect(json_response['service_images'].length).to eq(2)
    end

    context 'with invalid images array' do
      it 'returns bad request' do
        post :bulk_upload, params: { service_id: service.id, images: 'invalid' }

        expect(response).to have_http_status(:bad_request)
        json_response = response.parsed_body
        expect(json_response['error']).to eq('images parameter is required and must be an array')
      end
    end
  end
end
