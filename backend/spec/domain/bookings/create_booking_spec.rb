# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Bookings::CreateBooking do
  let(:vendor_user) { create(:user, :vendor) }
  let(:vendor) { vendor_user.vendor }
  let(:customer) { create(:user, :customer) }
  let(:service) { create(:service, vendor: vendor) }

  let(:valid_params) do
    {
      customer: customer,
      service: service,
      vendor: vendor,
      event_date: 7.days.from_now,
      event_location: '123 Main St, City, State',
      total_amount: BigDecimal('500.00'),
      requirements: 'Professional photos needed',
      special_instructions: 'Please arrive 30 minutes early'
    }
  end

  describe '.call' do
    context 'with valid booking data' do
      it 'creates a booking record' do
        expect do
          described_class.call(**valid_params)
        end.to change(Booking, :count).by(1)
      end

      it 'returns success response with booking' do
        result = described_class.call(**valid_params)
        expect(result[:success]).to be true
        expect(result[:booking]).to be_a(Booking)
      end

      it 'creates booking with correct attributes' do
        result = described_class.call(**valid_params)
        booking = result[:booking]

        expect(booking.customer_id).to eq(customer.id)
        expect(booking.service_id).to eq(service.id)
        expect(booking.vendor_id).to eq(vendor.id)
        expect(booking.event_date).to be_within(1.second).of(valid_params[:event_date])
        expect(booking.event_location).to eq(valid_params[:event_location])
        expect(booking.total_amount).to eq(valid_params[:total_amount])
        expect(booking.requirements).to eq(valid_params[:requirements])
        expect(booking.special_instructions).to eq(valid_params[:special_instructions])
        expect(booking.status).to eq('pending')
      end
    end

    context 'with optional parameters' do
      it 'creates booking with event_end_date and event_duration' do
        end_date = valid_params[:event_date] + 4.hours
        result = described_class.call(
          **valid_params, event_end_date: end_date,
                          event_duration: '4 hours'
        )

        booking = result[:booking]
        expect(booking.event_end_date).to be_within(1.second).of(end_date)
        expect(booking.event_duration).to eq('4 hours')
      end
    end

    context 'with invalid booking data' do
      it 'returns failure for invalid event_date (past date)' do
        result = described_class.call(
          **valid_params, event_date: 1.day.ago
        )
        expect(result[:success]).to be false
        expect(result[:error]).to include('future')
      end

      it 'returns failure for invalid total_amount' do
        result = described_class.call(
          **valid_params, total_amount: -100
        )
        expect(result[:success]).to be false
      end

      it 'returns failure for missing required fields' do
        result = described_class.call(
          **valid_params, event_location: nil
        )
        expect(result[:success]).to be false
      end
    end

    context 'with explicit orchestration (side effects)' do
      it 'sends confirmation notification when booking is created' do
        allow(Notifications::SendBookingConfirmation).to receive(:call)

        described_class.call(**valid_params)

        expect(Notifications::SendBookingConfirmation).to have_received(:call) do |kwargs|
          expect(kwargs[:booking]).to be_a(Booking)
        end
      end

      it 'continues if confirmation notification fails' do
        allow(Notifications::SendBookingConfirmation).to receive(:call).and_raise(StandardError, 'Notification error')

        expect do
          result = described_class.call(**valid_params)
          expect(result[:success]).to be true
        end.not_to raise_error
      end
    end

    context 'with custom status' do
      it 'creates booking with specified status' do
        result = described_class.call(**valid_params, status: 'accepted')
        expect(result[:booking].status).to eq('accepted')
      end
    end
  end
end
