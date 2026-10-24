# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Bookings::CheckAvailability do
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
    it 'returns available status when time slot is open' do
      result = described_class.call(
        service_id: service.id,
        date: 1.week.from_now.to_date.to_s,
        start_time: '10:00',
        end_time: '12:00'
      )

      expect(result[:available]).to be true
      expect(result[:message]).to eq('Time slot is available')
    end

    it 'returns unavailable status with suggested times when slot is outside availability' do
      result = described_class.call(
        service_id: service.id,
        date: 1.week.from_now.to_date.to_s,
        start_time: '18:00',
        end_time: '20:00'
      )

      expect(result[:available]).to be false
      expect(result[:message]).to eq('Time slot is not available')
      expect(result[:suggested_times]).to be_an(Array)
    end

    it 'rejects past dates' do
      result = described_class.call(
        service_id: service.id,
        date: 1.day.ago.to_date.to_s,
        start_time: '10:00'
      )

      expect(result[:available]).to be false
      expect(result[:message]).to eq('Cannot book a date in the past')
      expect(result[:errors]).to include('Booking date cannot be in the past')
    end

    it 'rejects past time slots on today' do
      result = described_class.call(
        service_id: service.id,
        date: Date.current.to_s,
        start_time: 2.hours.ago.strftime('%H:%M')
      )

      expect(result[:available]).to be false
      expect(result[:message]).to eq('Cannot book a time slot in the past')
      expect(result[:errors]).to include('Booking time slot has already passed')
    end
  end
end
