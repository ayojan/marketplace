# frozen_string_literal: true

require 'rails_helper'

RSpec.describe VendorAvailabilityQuery do
  let(:vendor_user) { create(:user, :vendor) }
  let(:vendor) { vendor_user.vendor }

  describe '.call' do
    context 'when vendor has availability on date' do
      before do
        create(:availability_slot,
               vendor: vendor,
               date: 1.week.from_now.to_date,
               start_time: '09:00',
               end_time: '17:00',
               is_available: true)
      end

      it 'returns true' do
        result = described_class.call(
          vendor: vendor,
          date: 1.week.from_now.to_date
        )
        expect(result).to be true
      end
    end

    context 'when vendor has no availability on date' do
      it 'returns false' do
        result = described_class.call(
          vendor: vendor,
          date: 1.week.from_now.to_date
        )
        expect(result).to be false
      end
    end

    context 'when availability is marked unavailable' do
      before do
        create(:availability_slot,
               vendor: vendor,
               date: 1.week.from_now.to_date,
               start_time: '09:00',
               end_time: '17:00',
               is_available: false)
      end

      it 'returns false' do
        result = described_class.call(
          vendor: vendor,
          date: 1.week.from_now.to_date
        )
        expect(result).to be false
      end
    end

    context 'with multiple availability slots' do
      before do
        create(:availability_slot,
               vendor: vendor,
               date: 1.week.from_now.to_date,
               start_time: '09:00',
               end_time: '12:00',
               is_available: true)
        create(:availability_slot,
               vendor: vendor,
               date: 1.week.from_now.to_date,
               start_time: '13:00',
               end_time: '17:00',
               is_available: false)
      end

      it 'returns true if any slot is available' do
        result = described_class.call(
          vendor: vendor,
          date: 1.week.from_now.to_date
        )
        expect(result).to be true
      end
    end
  end
end
