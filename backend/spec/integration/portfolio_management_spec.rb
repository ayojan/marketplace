# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Portfolio Management Integration' do
  let(:vendor_user) { create(:user, :vendor) }
  let(:customer_user) { create(:user, :customer) }
  let(:vendor) { vendor_user.vendor }
  let(:other_vendor) { create(:user, :vendor) }

  def auth_headers(user)
    token = JwtService.encode(user_id: user.id)
    { 'Authorization' => "Bearer #{token}" }
  end

  before do
    # Ensure we have the portfolio_items table
    # In a real test environment, this would be handled by migrations
    unless ActiveRecord::Base.connection.table_exists?('portfolio_items')
      skip 'Portfolio items table not available - run migrations first'
    end
  end

  describe 'Portfolio CRUD operations' do
    context 'when vendor is authenticated' do
      it 'allows vendor to create portfolio item' do
        portfolio_params = {
          portfolio_item: {
            title: 'Wedding Photography Session',
            description: 'Beautiful wedding photography',
            category: 'photography',
            display_order: 1,
            is_featured: true
          }
        }

        post '/portfolio_items', params: portfolio_params, headers: auth_headers(vendor_user), as: :json

        expect(response).to have_http_status(:created)
        json_response = JSON.parse(response.body)
        expect(json_response['portfolio_item']['title']).to eq('Wedding Photography Session')
        expect(json_response['message']).to eq('Portfolio item created successfully')
      end

      it 'allows vendor to view their portfolio items' do
        create(:portfolio_item, vendor: vendor)

        get '/portfolio_items', headers: auth_headers(vendor_user), as: :json

        expect(response).to have_http_status(:success)
        json_response = JSON.parse(response.body)
        expect(json_response['portfolio_items']).to be_present
        expect(json_response['categories']).to be_present
      end

      it 'allows vendor to update their portfolio item' do
        portfolio_item = create(:portfolio_item, vendor: vendor)
        update_params = {
          portfolio_item: {
            title: 'Updated Title',
            is_featured: true
          }
        }

        patch "/portfolio_items/#{portfolio_item.id}", params: update_params, headers: auth_headers(vendor_user),
                                                       as: :json

        expect(response).to have_http_status(:success)
        json_response = JSON.parse(response.body)
        expect(json_response['portfolio_item']['title']).to eq('Updated Title')
        expect(json_response['portfolio_item']['is_featured']).to be true
      end

      it 'allows vendor to delete their portfolio item' do
        portfolio_item = create(:portfolio_item, vendor: vendor)

        delete "/portfolio_items/#{portfolio_item.id}", headers: auth_headers(vendor_user), as: :json

        expect(response).to have_http_status(:success)
        json_response = JSON.parse(response.body)
        expect(json_response['message']).to eq('Portfolio item deleted successfully')
      end
    end

    context 'when customer is authenticated' do
      it 'prevents customer from creating portfolio items' do
        portfolio_params = {
          portfolio_item: {
            title: 'Test Item',
            category: 'photography'
          }
        }

        post '/portfolio_items', params: portfolio_params, headers: auth_headers(customer_user), as: :json

        expect(response).to have_http_status(:forbidden)
        json_response = JSON.parse(response.body)
        expect(json_response['errors']).to include('Vendor access required')
      end

      it 'allows customer to view vendor portfolio items' do
        create(:portfolio_item, vendor: vendor)

        get "/vendors/#{vendor.id}/portfolio_items", headers: auth_headers(customer_user), as: :json

        expect(response).to have_http_status(:success)
        json_response = JSON.parse(response.body)
        expect(json_response['portfolio_items']).to be_present
      end
    end
  end

  describe 'Portfolio filtering and categorization' do
    let!(:photo_item) { create(:portfolio_item, :photography, vendor: vendor) }
    let!(:video_item) { create(:portfolio_item, :videography, vendor: vendor) }
    let!(:featured_item) { create(:portfolio_item, :featured, vendor: vendor) }

    it 'filters portfolio items by category' do
      # Test photography category
      get "/vendors/#{vendor.id}/portfolio_items",
          params: { category: 'photography' }, headers: auth_headers(customer_user), as: :json

      expect(response).to have_http_status(:success)
      json_response = JSON.parse(response.body)
      expect(json_response['portfolio_items'].length).to eq(1)
      expect(json_response['portfolio_items'].first['id']).to eq(photo_item.id)

      # Test videography category to reference video_item
      get "/vendors/#{vendor.id}/portfolio_items",
          params: { category: 'videography' }, headers: auth_headers(customer_user), as: :json
      json_response = JSON.parse(response.body)
      expect(json_response['portfolio_items'].first['id']).to eq(video_item.id)
    end

    it 'filters featured portfolio items' do
      get "/vendors/#{vendor.id}/portfolio_items",
          params: { featured: 'true' }, headers: auth_headers(customer_user), as: :json

      expect(response).to have_http_status(:success)
      json_response = JSON.parse(response.body)
      expect(json_response['portfolio_items'].pluck('id')).to include(featured_item.id)
      featured_items = json_response['portfolio_items'].select { |item| item['is_featured'] }
      expect(featured_items.length).to be >= 1
    end
  end

  describe 'Portfolio management features' do
    it 'provides portfolio summary' do
      create_list(:portfolio_item, 3, vendor: vendor, is_featured: false)
      create(:portfolio_item, :featured, vendor: vendor)

      get '/portfolio_items/summary', headers: auth_headers(vendor_user), as: :json

      expect(response).to have_http_status(:success)
      json_response = JSON.parse(response.body)
      expect(json_response['summary']['total_items']).to eq(4)
      expect(json_response['summary']['featured_items']).to eq(1)
      expect(json_response['summary']['categories']).to be_present
    end

    it 'allows setting featured status for multiple items' do
      items = create_list(:portfolio_item, 2, vendor: vendor, is_featured: false)
      item_ids = items.map(&:id)

      patch '/portfolio_items/set_featured',
            params: { item_ids: item_ids, featured: true }, headers: auth_headers(vendor_user), as: :json

      expect(response).to have_http_status(:success)
      json_response = JSON.parse(response.body)
      expect(json_response['updated_count']).to eq(2)
    end
  end

  describe 'Access control' do
    let(:portfolio_item) { create(:portfolio_item, vendor: vendor) }

    it 'prevents vendors from accessing other vendors portfolio items' do
      patch "/portfolio_items/#{portfolio_item.id}",
            params: { portfolio_item: { title: 'Hacked' } }, headers: auth_headers(other_vendor), as: :json

      expect(response).to have_http_status(:forbidden)
      json_response = JSON.parse(response.body)
      expect(json_response['errors']).to include('Access denied')
    end

    it 'requires authentication for portfolio management' do
      post '/portfolio_items',
           params: { portfolio_item: { title: 'Test' } }, as: :json

      expect(response).to have_http_status(:unauthorized)
    end
  end
end
