# frozen_string_literal: true

require 'rails_helper'

RSpec.describe BookingCreationService, type: :service do
  let(:customer) { create(:user, :customer) }
  let(:vendor) { create(:user, :vendor) }
  let(:service) { create(:service, vendor_profile: vendor.vendor_profile) }
  let(:event_date) { 1.week.from_now.change(hour: 10, min: 0) }
  let(:event_end_date) { event_date + 2.hours }

  let!(:availability_slot) do
    create(:availability_slot,
           vendor_profile: vendor.vendor_profile,
           date: event_date.to_date,
           start_time: '09:00',
           end_time: '17:00',
           is_available: true)
  end

  let(:valid_params) do
    {
      customer: customer,
      service_id: service.id,
      event_date: event_date,
      event_end_date: event_end_date,
      event_location: 'Test Location',
      total_amount: 500.00,
      requirements: 'Test requirements',
      special_instructions: 'Test instructions',
      event_duration: '2 hours'
    }
  end

  describe '#call' do
    context 'with valid parameters' do
      it 'creates a booking successfully' do
        service_instance = described_class.new(valid_params)

        expect do
          result = service_instance.call
          expect(result[:success]).to be true
        end.to change(Booking, :count).by(1)

        booking = service_instance.booking
        expect(booking.customer).to eq(customer)
        expect(booking.vendor).to eq(vendor)
        expect(booking.service).to eq(service)
        expect(booking.status).to eq('pending')
        expect(booking.event_date).to eq(event_date)
        expect(booking.event_location).to eq('Test Location')
        expect(booking.total_amount).to eq(500.00)
      end

      it 'sets the correct vendor from the service' do
        service_instance = described_class.new(valid_params)
        service_instance.call

        expect(service_instance.booking.vendor).to eq(service.vendor_profile.user)
      end
    end

    context 'with invalid parameters' do
      it 'fails when customer is missing' do
        params = valid_params.except(:customer)
        service_instance = described_class.new(params)

        expect(service_instance.call[:success]).to be false
        expect(service_instance.errors[:customer]).to include("can't be blank")
      end

      it 'fails when service_id is missing' do
        params = valid_params.except(:service_id)
        service_instance = described_class.new(params)

        expect(service_instance.call[:success]).to be false
        expect(service_instance.errors[:service_id]).to include("can't be blank")
      end

      it 'fails when event_date is missing' do
        params = valid_params.except(:event_date)
        service_instance = described_class.new(params)

        expect(service_instance.call[:success]).to be false
        expect(service_instance.errors[:event_date]).to include("can't be blank")
      end

      it 'fails when total_amount is invalid' do
        params = valid_params.merge(total_amount: -100)
        service_instance = described_class.new(params)

        expect(service_instance.call[:success]).to be false
        expect(service_instance.errors[:total_amount]).to include('must be greater than 0')
      end
    end

    context 'with availability checking' do
      it 'fails when vendor has no availability for the date' do
        # Remove the availability slot
        availability_slot.destroy

        service_instance = described_class.new(valid_params)

        expect(service_instance.call[:success]).to be false
        expect(service_instance.errors[:event_date]).to include('is not available for this vendor')
      end

      it 'fails when the time slot is outside vendor availability' do
        # Create availability slot that doesn't cover the requested time
        availability_slot.update!(start_time: '14:00', end_time: '18:00')

        service_instance = described_class.new(valid_params)

        expect(service_instance.call[:success]).to be false
        expect(service_instance.errors[:event_date]).to include('is not available for this vendor')
      end
    end

    context 'with conflict prevention' do
      let!(:existing_booking) do
        create(:booking,
               customer: create(:user, :customer),
               vendor: vendor,
               service: service,
               event_date: event_date,
               event_end_date: event_date + 1.hour,
               status: :accepted)
      end

      it 'fails when there is a conflicting booking' do
        service_instance = described_class.new(valid_params)

        expect(service_instance.call[:success]).to be false
        expect(service_instance.errors[:event_date]).to include('conflicts with another booking')
      end

      it 'allows booking when existing booking is declined' do
        existing_booking.update!(status: :declined)

        service_instance = described_class.new(valid_params)

        expect(service_instance.call[:success]).to be true
      end

      it 'allows booking when existing booking is cancelled' do
        existing_booking.update!(status: :cancelled)

        service_instance = described_class.new(valid_params)

        expect(service_instance.call[:success]).to be true
      end
    end

    context 'when event_date is in the past' do
      it 'fails validation and does not create booking' do
        service_instance = described_class.new(valid_params.merge(event_date: 1.day.ago))

        expect { service_instance.call }.not_to change(Booking, :count)
        result = service_instance.call
        expect(result[:success]).to be false
        expect(service_instance.errors[:event_date]).to include('must be in the future')
      end
    end

    context 'when transaction rollback' do
      it 'rolls back when booking save fails' do
        # Make the booking invalid by stubbing save to return false
        booking_double = instance_double(Booking)
        allow(booking_double).to receive_messages(save: false, errors: double(full_messages: ['Some error']))
        allow(Booking).to receive(:new).and_return(booking_double)

        service_instance = described_class.new(valid_params)

        expect { service_instance.call }.not_to change(Booking, :count)
        expect(service_instance.call[:success]).to be false
      end
    end
  end

  describe '#booking' do
    it 'returns the created booking' do
      service_instance = described_class.new(valid_params)
      service_instance.call

      expect(service_instance.booking).to be_a(Booking)
      expect(service_instance.booking.persisted?).to be true
    end

    it 'returns nil when booking creation fails' do
      params = valid_params.except(:customer)
      service_instance = described_class.new(params)
      service_instance.call

      expect(service_instance.booking).to be_nil
    end
  end

  describe '#errors' do
    it 'returns validation errors' do
      params = valid_params.except(:customer)
      service_instance = described_class.new(params)
      service_instance.call

      expect(service_instance.errors).to be_present
      expect(service_instance.errors[:customer]).to include("can't be blank")
    end

    it 'returns booking model errors when save fails' do
      # Create a scenario where booking validation fails
      availability_slot.destroy

      service_instance = described_class.new(valid_params)
      service_instance.call

      expect(service_instance.errors[:event_date]).to include('is not available for this vendor')
    end
  end
end
