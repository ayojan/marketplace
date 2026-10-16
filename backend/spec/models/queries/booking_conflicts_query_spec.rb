# frozen_string_literal: true

require 'rails_helper'

RSpec.describe BookingConflictsQuery do
  let(:customer) { create(:user, :customer) }
  let(:vendor_user) { create(:user, :vendor) }
  let(:vendor) { vendor_user.vendor }
  let(:service) { create(:service, vendor: vendor) }

  describe '.call' do
    context 'when no conflicts exist' do
      it 'returns false' do
        result = described_class.call(
          vendor: vendor,
          event_date: 1.week.from_now,
          event_end_date: 1.week.from_now + 2.hours
        )
        expect(result).to be false
      end
    end

    context 'when booking exactly matches time slot' do
      before do
        create(:booking,
               customer: customer,
               vendor: vendor,
               service: service,
               event_date: 1.week.from_now,
               event_end_date: 1.week.from_now + 2.hours,
               status: :accepted)
      end

      it 'returns true' do
        result = described_class.call(
          vendor: vendor,
          event_date: 1.week.from_now,
          event_end_date: 1.week.from_now + 2.hours
        )
        expect(result).to be true
      end
    end

    context 'when booking overlaps at start' do
      before do
        create(:booking,
               customer: customer,
               vendor: vendor,
               service: service,
               event_date: 1.week.from_now.change(hour: 10),
               event_end_date: 1.week.from_now.change(hour: 12),
               status: :pending)
      end

      it 'returns true' do
        result = described_class.call(
          vendor: vendor,
          event_date: 1.week.from_now.change(hour: 11),
          event_end_date: 1.week.from_now.change(hour: 13)
        )
        expect(result).to be true
      end
    end

    context 'when booking overlaps at end' do
      before do
        create(:booking,
               customer: customer,
               vendor: vendor,
               service: service,
               event_date: 1.week.from_now.change(hour: 14),
               event_end_date: 1.week.from_now.change(hour: 16),
               status: :accepted)
      end

      it 'returns true' do
        result = described_class.call(
          vendor: vendor,
          event_date: 1.week.from_now.change(hour: 15),
          event_end_date: 1.week.from_now.change(hour: 17)
        )
        expect(result).to be true
      end
    end

    context 'when bookings are back-to-back' do
      before do
        create(:booking,
               customer: customer,
               vendor: vendor,
               service: service,
               event_date: 1.week.from_now.change(hour: 10),
               event_end_date: 1.week.from_now.change(hour: 12),
               status: :accepted)
      end

      it 'returns false' do
        result = described_class.call(
          vendor: vendor,
          event_date: 1.week.from_now.change(hour: 12),
          event_end_date: 1.week.from_now.change(hour: 14)
        )
        expect(result).to be false
      end
    end

    context 'when booking is in different status' do
      before do
        create(:booking,
               customer: customer,
               vendor: vendor,
               service: service,
               event_date: 1.week.from_now.change(hour: 10),
               event_end_date: 1.week.from_now.change(hour: 12),
               status: :cancelled)
      end

      it 'returns false' do
        result = described_class.call(
          vendor: vendor,
          event_date: 1.week.from_now.change(hour: 10),
          event_end_date: 1.week.from_now.change(hour: 12)
        )
        expect(result).to be false
      end
    end

    context 'when excluding a specific booking' do
      let!(:existing_booking) do
        create(:booking,
               customer: customer,
               vendor: vendor,
               service: service,
               event_date: 1.week.from_now.change(hour: 10),
               event_end_date: 1.week.from_now.change(hour: 12),
               status: :accepted)
      end

      it 'returns false when checking same booking' do
        result = described_class.call(
          vendor: vendor,
          event_date: 1.week.from_now.change(hour: 10),
          event_end_date: 1.week.from_now.change(hour: 12),
          exclude_id: existing_booking.id
        )
        expect(result).to be false
      end
    end
  end
end
