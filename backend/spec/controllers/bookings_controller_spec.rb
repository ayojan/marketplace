# frozen_string_literal: true

require 'rails_helper'

RSpec.describe BookingsController do
  let(:customer) { create(:user, :customer) }
  let(:vendor) { create(:user, :vendor) }
  let(:service) { create(:service, vendor_profile: vendor.vendor_profile) }
  let!(:availability_slot) do
    create(:availability_slot,
           vendor_profile: vendor.vendor_profile,
           date: 1.week.from_now.to_date,
           start_time: '09:00',
           end_time: '17:00',
           is_available: true)
  end
  let(:booking) do
    create(:booking, customer: customer, vendor: vendor, service: service, event_date: 1.week.from_now.change(hour: 10))
  end

  def auth_as(user)
    token = JwtService.encode(user_id: user.id)
    request.headers['Authorization'] = "Bearer #{token}"
  end

  describe 'GET #index' do
    context 'when user is a customer' do
      it 'returns customer bookings' do
        customer_booking = create(:booking, customer: customer, vendor: vendor, service: service)
        create(:booking, vendor: vendor, service: service)

        auth_as(customer)
        get :index

        expect(response).to have_http_status(:ok)
        json_response = response.parsed_body
        expect(json_response['bookings'].length).to eq(1)
        expect(json_response['bookings'].first['id']).to eq(customer_booking.id)
      end
    end

    context 'when user is a vendor' do
      it 'returns vendor bookings' do
        # Create availability slots for both vendors
        create(:availability_slot,
               vendor_profile: vendor.vendor_profile,
               date: 1.week.from_now.to_date,
               start_time: '09:00',
               end_time: '17:00',
               is_available: true)

        other_vendor = create(:user, :vendor)
        create(:availability_slot,
               vendor_profile: other_vendor.vendor_profile,
               date: 1.week.from_now.to_date,
               start_time: '09:00',
               end_time: '17:00',
               is_available: true)

        vendor_booking = create(:booking, customer: customer, vendor: vendor, service: service)
        other_customer = create(:user, :customer)
        other_service = create(:service, vendor_profile: other_vendor.vendor_profile)
        create(:booking, customer: other_customer, vendor: other_vendor, service: other_service)

        auth_as(vendor)
        get :index

        expect(response).to have_http_status(:ok)
        json_response = response.parsed_body
        expect(json_response['bookings'].length).to eq(1)
        expect(json_response['bookings'].first['id']).to eq(vendor_booking.id)
      end
    end
  end

  describe 'GET #show' do
    context 'when user is the customer' do
      it 'returns the booking details' do
        auth_as(customer)
        get :show, params: { id: booking.id }

        expect(response).to have_http_status(:ok)
        json_response = response.parsed_body
        expect(json_response['booking']['id']).to eq(booking.id)
        expect(json_response['booking']['status']).to eq(booking.status)
      end
    end

    context 'when user is the vendor' do
      it 'returns the booking details' do
        auth_as(vendor)
        get :show, params: { id: booking.id }

        expect(response).to have_http_status(:ok)
        json_response = response.parsed_body
        expect(json_response['booking']['id']).to eq(booking.id)
      end
    end

    context 'when user is not involved in the booking' do
      let(:other_user) { create(:user, :customer) }

      it 'returns not found' do
        auth_as(other_user)
        get :show, params: { id: booking.id }

        expect(response).to have_http_status(:not_found)
        json_response = response.parsed_body
        expect(json_response).to have_key('errors')
      end
    end
  end

  describe 'POST #create' do
    let!(:availability_slot) do
      create(:availability_slot,
             vendor_profile: vendor.vendor_profile,
             date: 1.week.from_now.to_date,
             start_time: '09:00',
             end_time: '17:00',
             is_available: true)
    end

    let(:valid_params) do
      {
        booking: {
          service_id: service.id,
          event_date: 1.week.from_now.change(hour: 10),
          event_end_date: 1.week.from_now.change(hour: 12),
          event_location: 'Test Location',
          total_amount: 100.00,
          requirements: 'Test requirements',
          special_instructions: 'Test instructions'
        }
      }
    end

    it 'creates a new booking using BookingCreationService' do
      auth_as(customer)
      expect do
        post :create, params: valid_params
      end.to change(Booking, :count).by(1)

      expect(response).to have_http_status(:created)
      json_response = response.parsed_body
      expect(json_response['booking']['service']['id']).to eq(service.id)
      expect(json_response['booking']['customer']['id']).to eq(customer.id)
      expect(json_response['booking']['vendor']['id']).to eq(vendor.vendor_profile.id)
      expect(json_response['booking']['status']).to eq('pending')
      expect(json_response['message']).to eq('Booking created successfully')
    end

    context 'with invalid parameters' do
      let(:invalid_params) do
        {
          booking: {
            service_id: 999_999,
            event_date: 1.week.from_now.change(hour: 10),
            event_location: 'Test Location',
            total_amount: 100.00,
            requirements: 'Test requirements',
            special_instructions: 'Test instructions'
          }
        }
      end

      it 'returns unprocessable entity' do
        auth_as(customer)
        expect do
          post :create, params: invalid_params
        end.not_to change(Booking, :count)

        expect(response).to have_http_status(:unprocessable_content)
        json_response = response.parsed_body
        expect(json_response).to have_key('errors')
      end
    end

    context 'when vendor has no availability' do
      it 'returns unprocessable entity with availability error' do
        availability_slot.destroy
        auth_as(customer)
        expect do
          post :create, params: valid_params
        end.not_to change(Booking, :count)

        expect(response).to have_http_status(:unprocessable_content)
        json_response = response.parsed_body
        expect(json_response['errors']).to include('Event date is not available for this vendor')
      end
    end
  end

  describe 'PUT #update' do
    let(:update_params) do
      {
        id: booking.id,
        booking: {
          event_location: 'Updated Location',
          requirements: 'Updated requirements'
        }
      }
    end

    context 'when booking can be modified' do
      it 'updates the booking' do
        allow(booking).to receive(:can_be_modified?).and_return(true)
        auth_as(customer)
        put :update, params: update_params

        expect(response).to have_http_status(:ok)
        json_response = response.parsed_body
        expect(json_response['booking']['event_location']).to eq('Updated Location')
        expect(json_response['booking']['requirements']).to eq('Updated requirements')
      end
    end

    context 'when booking cannot be modified' do
      it 'returns forbidden' do
        non_modifiable_booking = create(:booking, customer: customer, vendor: vendor, service: service,
                                                  status: :accepted)
        update_params = {
          id: non_modifiable_booking.id,
          booking: {
            event_location: 'Updated Location',
            requirements: 'Updated requirements'
          }
        }

        auth_as(customer)
        put :update, params: update_params

        expect(response).to have_http_status(:forbidden)
      end
    end
  end

  describe 'DELETE #destroy' do
    context 'when booking can be cancelled' do
      it 'cancels the booking' do
        allow(booking).to receive(:can_be_cancelled?).and_return(true)
        auth_as(customer)
        delete :destroy, params: { id: booking.id }

        expect(response).to have_http_status(:ok)
        json_response = response.parsed_body
        expect(json_response['message']).to eq('Booking cancelled successfully')
        expect(booking.reload.status).to eq('cancelled')
      end
    end

    context 'when booking cannot be cancelled' do
      it 'returns unprocessable entity' do
        allow_any_instance_of(Booking).to receive(:can_be_cancelled?).and_return(false)
        auth_as(customer)
        delete :destroy, params: { id: booking.id }

        expect(response).to have_http_status(:unprocessable_content)
        json_response = response.parsed_body
        expect(json_response).to have_key('error')
      end
    end
  end

  describe 'POST #respond' do
    context 'when accepting a booking' do
      it 'accepts the booking' do
        auth_as(vendor)
        post :respond, params: { id: booking.id, response_action: 'accept' }

        expect(response).to have_http_status(:ok)
        json_response = response.parsed_body
        expect(json_response['message']).to eq('Booking accepted successfully')
        expect(booking.reload.status).to eq('accepted')
      end
    end

    context 'when declining a booking' do
      it 'declines the booking' do
        auth_as(vendor)
        post :respond, params: { id: booking.id, response_action: 'decline' }

        expect(response).to have_http_status(:ok)
        json_response = response.parsed_body
        expect(json_response['message']).to eq('Booking declined')
        expect(booking.reload.status).to eq('declined')
      end
    end

    context 'when making a counter offer' do
      it 'creates a counter offer' do
        auth_as(vendor)
        post :respond, params: {
          id: booking.id,
          response_action: 'counter_offer',
          counter_amount: 150.00,
          counter_message: 'Counter offer message'
        }

        expect(response).to have_http_status(:ok)
        json_response = response.parsed_body
        expect(json_response['message']).to eq('Counter offer sent')
        expect(booking.reload.status).to eq('counter_offered')
        expect(booking.total_amount).to eq(150.00)
      end
    end

    context 'with invalid response action' do
      it 'returns bad request' do
        auth_as(vendor)
        post :respond, params: { id: booking.id, response_action: 'invalid' }

        expect(response).to have_http_status(:bad_request)
        json_response = response.parsed_body
        expect(json_response['error']).to eq('Invalid response action')
      end
    end

    context 'when user is not the vendor' do
      it 'returns forbidden' do
        auth_as(customer)
        post :respond, params: { id: booking.id, response_action: 'accept' }

        expect(response).to have_http_status(:forbidden)
        json_response = response.parsed_body
        expect(json_response['error']).to eq('Access denied. Vendor account required.')
      end
    end
  end

  describe 'GET #messages' do
    let!(:message) { create(:booking_message, booking: booking, sender: customer) }

    context 'when user is involved in the booking' do
      it 'returns booking messages' do
        auth_as(customer)
        get :messages, params: { id: booking.id }

        expect(response).to have_http_status(:ok)
        json_response = response.parsed_body
        expect(json_response['messages'].length).to eq(1)
        expect(json_response['messages'].first['id']).to eq(message.id)
      end
    end

    context 'when user is not involved in the booking' do
      let(:other_user) { create(:user, :customer) }

      it 'returns not found' do
        auth_as(other_user)
        get :messages, params: { id: booking.id }

        expect(response).to have_http_status(:not_found)
        json_response = response.parsed_body
        expect(json_response).to have_key('errors')
      end
    end
  end

  describe 'POST #send_message' do
    it 'creates a new message' do
      auth_as(customer)
      expect do
        post :send_message, params: { id: booking.id, message: 'Test message' }
      end.to change(BookingMessage, :count).by(1)

      expect(response).to have_http_status(:created)
      json_response = response.parsed_body
      expect(json_response['message']['message']).to eq('Test message')
      expect(json_response['message']['sender']['id']).to eq(customer.id)
    end

    context 'with invalid message' do
      it 'returns unprocessable entity' do
        auth_as(customer)
        expect do
          post :send_message, params: { id: booking.id, message: '' }
        end.not_to change(BookingMessage, :count)

        expect(response).to have_http_status(:unprocessable_content)
        json_response = response.parsed_body
        expect(json_response['errors']).to be_an(Array)
      end
    end
  end

  describe 'POST #check_availability' do
    let!(:availability_slot) do
      create(:availability_slot,
             vendor_profile: vendor.vendor_profile,
             date: 1.week.from_now.to_date,
             start_time: '09:00',
             end_time: '17:00',
             is_available: true)
    end

    let(:valid_params) do
      {
        service_id: service.id,
        date: 1.week.from_now.to_date.to_s,
        start_time: '10:00',
        end_time: '12:00'
      }
    end

    it 'returns availability status when time is available' do
      auth_as(customer)
      post :check_availability, params: valid_params

      expect(response).to have_http_status(:ok)
      json_response = response.parsed_body
      expect(json_response['available']).to be true
      expect(json_response['message']).to eq('Time slot is available')
    end

    it 'returns unavailable status when time is not available' do
      auth_as(customer)
      params = valid_params.merge(start_time: '18:00', end_time: '20:00')
      post :check_availability, params: params

      expect(response).to have_http_status(:ok)
      json_response = response.parsed_body
      expect(json_response['available']).to be false
      expect(json_response['message']).to eq('Time slot is not available')
      expect(json_response['suggested_times']).to be_an(Array)
    end

    it 'returns bad request for invalid date format' do
      auth_as(customer)
      params = valid_params.merge(date: 'invalid-date')
      post :check_availability, params: params

      expect(response).to have_http_status(:bad_request)
      json_response = response.parsed_body
      expect(json_response['errors']).to be_present
    end

    it 'returns unavailable status when date is in the past' do
      auth_as(customer)
      params = valid_params.merge(date: 1.day.ago.to_date.to_s)
      post :check_availability, params: params

      expect(response).to have_http_status(:ok)
      json_response = response.parsed_body
      expect(json_response['available']).to be false
      expect(json_response['message']).to eq('Cannot book a date in the past')
    end

    it 'returns unavailable status when time has already passed today' do
      auth_as(customer)
      params = valid_params.merge(date: Date.current.to_s, start_time: 2.hours.ago.strftime('%H:%M'))
      post :check_availability, params: params

      expect(response).to have_http_status(:ok)
      json_response = response.parsed_body
      expect(json_response['available']).to be false
      expect(json_response['message']).to eq('Cannot book a time slot in the past')
    end
  end

  describe 'POST #suggest_alternatives' do
    let!(:availability_slot) do
      create(:availability_slot,
             vendor_profile: vendor.vendor_profile,
             date: 1.week.from_now.to_date,
             start_time: '09:00',
             end_time: '17:00',
             is_available: true)
    end

    let(:valid_params) do
      {
        vendor_id: vendor.id,
        date: 1.week.from_now.to_date.to_s,
        start_time: '10:00',
        end_time: '12:00'
      }
    end

    it 'returns conflict status and alternative times' do
      create(:booking,
             customer: create(:user, :customer),
             vendor: vendor,
             service: service,
             event_date: 1.week.from_now.change(hour: 10),
             event_end_date: 1.week.from_now.change(hour: 12),
             status: :accepted)

      auth_as(customer)
      post :suggest_alternatives, params: valid_params

      expect(response).to have_http_status(:ok)
      json_response = response.parsed_body
      expect(json_response['has_conflict']).to be true
      expect(json_response['alternative_times']).to be_an(Array)
    end

    it 'returns no conflict when times do not overlap' do
      create(:booking,
             customer: create(:user, :customer),
             vendor: vendor,
             service: service,
             event_date: 1.week.from_now.change(hour: 10),
             event_end_date: 1.week.from_now.change(hour: 12),
             status: :accepted)

      auth_as(customer)
      params = valid_params.merge(start_time: '14:00', end_time: '16:00')
      post :suggest_alternatives, params: params

      expect(response).to have_http_status(:ok)
      json_response = response.parsed_body
      expect(json_response['has_conflict']).to be false
    end

    it 'returns bad request for invalid date format' do
      auth_as(customer)
      params = valid_params.merge(date: 'invalid-date')
      post :suggest_alternatives, params: params

      expect(response).to have_http_status(:bad_request)
      json_response = response.parsed_body
      expect(json_response['errors']).to be_present
    end
  end
end
