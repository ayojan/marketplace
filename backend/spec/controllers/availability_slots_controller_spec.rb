# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AvailabilitySlotsController do
  def auth_as(user)
    token = Users::JwtService.encode(user_id: user.id)
    request.headers['Authorization'] = "Bearer #{token}"
  end

  describe 'authentication and authorization' do
    let(:vendor_user) { create(:user, :vendor) }
    let(:customer_user) { create(:user, :customer) }

    context 'when not authenticated' do
      it 'returns unauthorized for index' do
        get :index
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'when authenticated as customer' do
      it 'returns forbidden for index' do
        auth_as(customer_user)
        get :index
        expect(response).to have_http_status(:forbidden)
        expect(parsed_response['error']).to eq('Access denied. Vendor account required.')
      end
    end
  end

  describe 'GET #index' do
    let(:vendor_user) { create(:user, :vendor) }
    let!(:today_slot) { create(:availability_slot, vendor: vendor_user.vendor, date: Date.current) }
    let!(:future_slot) { create(:availability_slot, vendor: vendor_user.vendor, date: 1.week.from_now) }
    let!(:past_slot) do
      slot = build(:availability_slot, vendor: vendor_user.vendor, date: 1.week.ago)
      slot.save(validate: false)
      slot
    end

    it 'returns upcoming availability slots by default' do
      auth_as(vendor_user)
      get_index
      expect_upcoming_slots(today_slot, future_slot, past_slot)
    end

    context 'with date range filter' do
      it 'filters by date range' do
        auth_as(vendor_user)
        get_index(start_date: Date.current, end_date: Date.current + 3.days)
        expect_array_to_include(today_slot, exclude: [future_slot, past_slot])
      end
    end

    context 'with specific date filter' do
      it 'filters by specific date' do
        auth_as(vendor_user)
        get_index(date: Date.current)
        expect_specific_date_slot(today_slot)
      end
    end

    it 'includes pagination metadata' do
      auth_as(vendor_user)
      get_index
      expect_pagination_meta
    end
  end

  describe 'GET #show' do
    let(:vendor_user) { create(:user, :vendor) }
    let(:availability_slot) { create(:availability_slot, vendor: vendor_user.vendor) }

    it 'returns the availability slot' do
      auth_as(vendor_user)
      get :show, params: { id: availability_slot.id }
      expect_show_slot(availability_slot)
    end

    context 'when slot does not exist' do
      it 'returns not found' do
        auth_as(vendor_user)
        get :show, params: { id: 999_999 }
        expect(response).to have_http_status(:not_found)
        expect(parsed_response['error']).to eq('Availability slot not found')
      end
    end
  end

  describe 'POST #create' do
    let(:vendor_user) { create(:user, :vendor) }
    let(:valid_params) do
      {
        availability_slot: {
          date: 1.week.from_now.to_date,
          start_time: '09:00',
          end_time: '17:00',
          is_available: true
        }
      }
    end

    it 'creates a new availability slot' do
      auth_as(vendor_user)
      expect { create_slot_request(valid_params) }.to change(AvailabilitySlot, :count).by(1)
      expect_slot_created(valid_params[:availability_slot])
    end

    context 'with invalid parameters' do
      let(:invalid_params) do
        {
          availability_slot: {
            date: nil,
            start_time: '09:00',
            end_time: '08:00'
          }
        }
      end

      it 'returns unprocessable entity' do
        auth_as(vendor_user)
        expect { create_slot_request(invalid_params) }.not_to(change(AvailabilitySlot, :count))
        expect(response).to have_http_status(:unprocessable_content)
        expect(parsed_response['errors']).to be_an(Array)
      end
    end
  end

  describe 'PUT #update' do
    let(:vendor_user) { create(:user, :vendor) }
    let(:availability_slot) { create(:availability_slot, vendor: vendor_user.vendor) }
    let(:update_params) do
      {
        id: availability_slot.id,
        availability_slot: {
          start_time: '10:00',
          end_time: '18:00',
          is_available: false
        }
      }
    end

    it 'updates the availability slot' do
      auth_as(vendor_user)
      update_slot_request(update_params)
      expect_slot_updated('10:00', '18:00', false)
    end
  end

  describe 'DELETE #destroy' do
    let(:vendor_user) { create(:user, :vendor) }

    context 'when slot has no booking conflicts' do
      it 'deletes the availability slot' do
        slot_to_delete = create_slot(vendor_user)

        auth_as(vendor_user)
        expect { delete_slot(slot_to_delete) }.to change(AvailabilitySlot, :count).by(-1)
        expect(parsed_response['message']).to eq('Availability slot deleted successfully')
      end
    end

    context 'when slot has booking conflicts' do
      it 'returns unprocessable entity' do
        slot_to_delete = create_slot(vendor_user)
        allow_any_instance_of(AvailabilitySlot).to receive(:booking_conflict?).and_return(true) # rubocop:disable RSpec/AnyInstance

        auth_as(vendor_user)
        expect { delete_slot(slot_to_delete) }.not_to(change(AvailabilitySlot, :count))
        expect(response).to have_http_status(:unprocessable_content)
        expect(parsed_response['error']).to eq('Cannot delete availability slot with existing bookings')
      end
    end
  end

  def parsed_response
    response.parsed_body
  end

  def slot_ids_from_response
    parsed_response['availability_slots'].pluck('id')
  end

  def get_index(params = {})
    get :index, params: params
  end

  def expect_upcoming_slots(today_slot, future_slot, past_slot = nil)
    expect(response).to have_http_status(:ok)
    ids = slot_ids_from_response
    expect(ids).to include(today_slot.id, future_slot.id)
    expect(ids).not_to include(past_slot.id) if past_slot
  end

  def expect_array_to_include(slot, exclude: [])
    expect(response).to have_http_status(:ok)
    ids = slot_ids_from_response
    expect(ids).to include(slot.id)
    exclude.each { |excluded_slot| expect(ids).not_to include(excluded_slot.id) }
  end

  def expect_specific_date_slot(slot)
    expect(response).to have_http_status(:ok)
    expect(slot_ids_from_response).to eq([slot.id])
  end

  def expect_pagination_meta
    expect(response).to have_http_status(:ok)
    meta = parsed_response['pagination']
    expect(meta).to include('current_page', 'total_pages', 'total_count')
  end

  def expect_show_slot(slot)
    expect(response).to have_http_status(:ok)
    expect(parsed_response['availability_slot']['id']).to eq(slot.id)
    expect(parsed_response['availability_slot']['date']).to eq(slot.date.to_s)
  end

  def create_slot_request(params)
    post :create, params: params
  end

  def expect_slot_created(expected)
    slot_json = parsed_response['availability_slot']
    expect(slot_json['date']).to eq(expected[:date].to_s)
    expect(slot_json['is_available']).to be true
  end

  def update_slot_request(params)
    put :update, params: params
  end

  def expect_slot_updated(start_time, end_time, availability)
    slot_json = parsed_response['availability_slot']
    expect(slot_json['start_time']).to eq(start_time)
    expect(slot_json['end_time']).to eq(end_time)
    expect(slot_json['is_available']).to be availability
  end

  def delete_slot(slot)
    delete :destroy, params: { id: slot.id }
  end

  def create_slot(vendor_user)
    create(:availability_slot, vendor: vendor_user.vendor)
  end
end
