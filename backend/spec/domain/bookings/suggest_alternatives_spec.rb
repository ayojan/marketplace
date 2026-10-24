# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Bookings::SuggestAlternatives do
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
    it 'detects conflicts and suggests alternatives' do
      create(:booking,
             customer: customer,
             vendor: vendor,
             service: service,
             event_date: 1.week.from_now.change(hour: 10),
             event_end_date: 1.week.from_now.change(hour: 12),
             status: :accepted)

      result = described_class.call(
        vendor_id: vendor.id,
        date: 1.week.from_now.to_date.to_s,
        start_time: '10:00',
        end_time: '12:00'
      )

      expect(result[:has_conflict]).to be true
      expect(result[:alternative_times]).to be_an(Array)
    end

    it 'returns no conflict when times do not overlap' do
      create(:booking,
             customer: customer,
             vendor: vendor,
             service: service,
             event_date: 1.week.from_now.change(hour: 10),
             event_end_date: 1.week.from_now.change(hour: 12),
             status: :accepted)

      result = described_class.call(
        vendor_id: vendor.id,
        date: 1.week.from_now.to_date.to_s,
        start_time: '14:00',
        end_time: '16:00'
      )

      expect(result[:has_conflict]).to be false
    end

    it 'rejects past dates with conflict notice' do
      result = described_class.call(
        vendor_id: vendor.id,
        date: 1.day.ago.to_date.to_s,
        start_time: '10:00'
      )

      expect(result[:has_conflict]).to be true
      expect(result[:message]).to eq('Cannot suggest alternatives for a past date')
      expect(result[:alternative_times]).to eq([])
    end
  end
end
