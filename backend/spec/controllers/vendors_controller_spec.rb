# frozen_string_literal: true

require 'rails_helper'

RSpec.describe VendorsController do
  let(:user) { create(:user, :vendor, :confirmed) }
  let(:vendor_profile) { user.vendor_profile }
  let(:customer_user) { create(:user, :customer, :confirmed) }

  describe 'GET #index' do
    let(:vendors) do
      [
        create(:user, :vendor, :confirmed).vendor_profile.tap do |vp|
          vp.update!(business_name: 'Photography Pro', location: 'New York')
        end,
        create(:user, :vendor, :confirmed).vendor_profile.tap do |vp|
          vp.update!(business_name: 'Video Masters', location: 'Los Angeles')
        end,
        create(:user, :vendor, :confirmed).vendor_profile.tap do |vp|
          vp.update!(business_name: 'Event Planners', location: 'New York')
        end
      ]
    end

    before { vendors }

    context 'without filters' do
      it 'returns all vendors with pagination' do
        get :index
        expect(response).to have_http_status(:ok)
        json = response.parsed_body
        expect(json['vendors'].length).to eq(3)
        expect(json['pagination']).to include('current_page' => 1, 'total_count' => 3)
      end
    end

    context 'with location filter' do
      it 'filters vendors by location' do
        get :index, params: { location: 'New York' }
        expect(response).to have_http_status(:ok)
        business_names = response.parsed_body['vendors'].pluck('business_name')
        expect(business_names).to contain_exactly('Photography Pro', 'Event Planners')
      end
    end

    context 'with service category filter' do
      let(:photography_category) { create(:category, :photography) }

      before do
        create(:service, vendor_profile: vendors.first, service_category: photography_category)
        vendors.first.update!(service_categories: 'Photography, Event Planning')
      end

      it 'returns vendors including those with service categories' do
        get :index
        expect(response).to have_http_status(:ok)
        business_names = response.parsed_body['vendors'].pluck('business_name')
        expect(business_names).to include('Photography Pro')
      end
    end

    context 'with pagination' do
      it 'respects pagination parameters' do
        get :index, params: { page: 1, per_page: 2 }
        expect(response).to have_http_status(:ok)
        expect(response.parsed_body['pagination']).to include('per_page' => 2, 'total_pages' => 2)
      end
    end
  end

  describe 'GET #show' do
    before do
      create(:portfolio_item, vendor_profile: vendor_profile, is_featured: true)
      create(:portfolio_item, vendor_profile: vendor_profile, is_featured: false)
    end

    context 'when vendor exists' do
      it 'returns detailed vendor information' do
        get :show, params: { id: vendor_profile.id }
        expect(response).to have_http_status(:ok)
        vendor_data = response.parsed_body['vendor']
        expect(vendor_data).to include('id' => vendor_profile.id, 'business_name' => vendor_profile.business_name)
        expect(vendor_data['portfolio_items_count']).to eq(2)
      end
    end

    context 'when vendor does not exist' do
      it 'returns not found error' do
        get :show, params: { id: 99_999 }
        expect(response).to have_http_status(:not_found)
        expect(response.parsed_body['error']).to eq('Vendor not found')
      end
    end
  end

  describe 'GET #services' do
    let!(:active_service) { create(:service, vendor_profile: vendor_profile, status: :active) }

    before { create(:service, vendor_profile: vendor_profile, status: :inactive) }

    context 'when vendor exists' do
      it 'returns only active services' do
        get :services, params: { id: vendor_profile.id }
        expect(response).to have_http_status(:ok)
        services = response.parsed_body['services']
        expect(services.length).to eq(1)
        expect(services.first['id']).to eq(active_service.id)
      end
    end
  end

  describe 'GET #availability' do
    let!(:available_slot) do
      create(:availability_slot, vendor_profile: vendor_profile, date: Date.current + 1.day, is_available: true)
    end

    before do
      create(:availability_slot, vendor_profile: vendor_profile, date: Date.current + 2.days, is_available: false)
    end

    context 'when vendor exists' do
      it 'returns only available slots' do
        get :availability, params: { id: vendor_profile.id }
        expect(response).to have_http_status(:ok)
        slots = response.parsed_body['availability_slots']
        expect(slots.length).to eq(1)
        expect(slots.first['id']).to eq(available_slot.id)
      end
    end

    context 'with date range parameters' do
      before do
        create(:availability_slot, vendor_profile: vendor_profile, date: Date.current + 5.days, is_available: true)
        create(:availability_slot, vendor_profile: vendor_profile, date: Date.current + 35.days, is_available: true)
      end

      it 'filters slots by date range' do
        params = { id: vendor_profile.id, start_date: Date.current.to_s, end_date: (Date.current + 10.days).to_s }
        get :availability, params: params
        expect(response).to have_http_status(:ok)
        expect(response.parsed_body['availability_slots'].length).to eq(2)
      end

      it 'does not return slots in the past even when start_date is in the past' do
        past_slot = build(:availability_slot, vendor_profile: vendor_profile, date: 2.days.ago, is_available: true)
        past_slot.save(validate: false)

        params = { id: vendor_profile.id, start_date: 5.days.ago.to_date.to_s, end_date: (Date.current + 10.days).to_s }
        get :availability, params: params

        expect(response).to have_http_status(:ok)
        slot_ids = response.parsed_body['availability_slots'].pluck('id')
        expect(slot_ids).not_to include(past_slot.id)
      end
    end
  end

  describe 'GET #portfolio' do
    before do
      create(:portfolio_item, vendor_profile: vendor_profile, category: 'photography', is_featured: true)
      create(:portfolio_item, vendor_profile: vendor_profile, category: 'videography', is_featured: false)
    end

    context 'when vendor exists' do
      it 'returns all portfolio items' do
        get :portfolio, params: { id: vendor_profile.id }
        expect(response).to have_http_status(:ok)
        json = response.parsed_body
        expect(json['portfolio_items'].length).to eq(2)
        expect(json['categories']).to contain_exactly('photography', 'videography')
      end
    end

    context 'with category filter' do
      it 'filters portfolio items by category' do
        get :portfolio, params: { id: vendor_profile.id, category: 'photography' }
        expect(response).to have_http_status(:ok)
        expect(response.parsed_body['portfolio_items'].first['category']).to eq('photography')
      end
    end
  end

  describe 'GET #vendor_reviews' do
    it 'returns review data (placeholder for now)' do
      get :vendor_reviews, params: { id: vendor_profile.id }
      expect(response).to have_http_status(:ok)
      json = response.parsed_body
      expect(json['reviews']).to be_empty
      expect(json['average_rating']).to eq(vendor_profile.average_rating.to_s)
    end
  end
end
