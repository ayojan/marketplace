# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Bookings::Validate do
  let(:customer) { create(:user, :customer) }
  let(:vendor_user) { create(:user, :vendor) }
  let(:vendor) { vendor_user.vendor }
  let(:service) { create(:service, vendor: vendor) }

  before do
    create(:availability_slot,
           vendor: vendor,
           date: 1.week.from_now.to_date,
           start_time: '09:00',
           end_time: '17:00',
           is_available: true)
  end

  describe '.call' do
    context 'with valid booking' do
      let(:booking) do
        build(:booking,
              customer: customer,
              vendor: vendor,
              service: service,
              event_date: 1.week.from_now.change(hour: 10))
      end

      it 'returns empty errors array' do
        errors = described_class.call(booking: booking)
        expect(errors).to be_empty
      end
    end

    context 'with vendor unavailability' do
      let(:booking) do
        build(:booking,
              customer: customer,
              vendor: vendor,
              service: service,
              event_date: 2.weeks.from_now.change(hour: 10))
      end

      it 'returns availability error' do
        errors = described_class.call(booking: booking)
        expect(errors).to include(hash_including(
                                    field: :event_date,
                                    message: include('not available')
                                  ))
      end
    end

    context 'with booking conflicts' do
      before do
        create(:booking,
               customer: customer,
               vendor: vendor,
               service: service,
               event_date: 1.week.from_now.change(hour: 10),
               event_end_date: 1.week.from_now.change(hour: 12),
               status: :accepted)
      end

      let(:conflicting_booking) do
        build(:booking,
              customer: create(:user, :customer),
              vendor: vendor,
              service: service,
              event_date: 1.week.from_now.change(hour: 11),
              event_end_date: 1.week.from_now.change(hour: 13))
      end

      it 'returns conflict error' do
        errors = described_class.call(booking: conflicting_booking)
        expect(errors).to include(hash_including(
                                    field: :event_date,
                                    message: include('conflicts')
                                  ))
      end
    end
  end
end
