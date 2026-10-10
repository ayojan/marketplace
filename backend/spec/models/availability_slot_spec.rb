# frozen_string_literal: true

# == Schema Information
#
# Table name: availability_slots
#
#  id                :bigint           not null, primary key
#  date              :date             not null
#  end_time          :time             not null
#  is_available      :boolean          default(TRUE), not null
#  start_time        :time             not null
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#  vendor_profile_id :bigint           not null
#
# Indexes
#
#  index_availability_slots_on_date_and_is_available       (date,is_available)
#  index_availability_slots_on_vendor_profile_id           (vendor_profile_id)
#  index_availability_slots_on_vendor_profile_id_and_date  (vendor_profile_id,date)
#
# Foreign Keys
#
#  fk_rails_...  (vendor_profile_id => vendor_profiles.id)
#
require 'rails_helper'

RSpec.describe AvailabilitySlot do
  let(:vendor) { create(:user, :vendor) }
  let(:vendor_profile) { vendor.vendor_profile }

  describe 'associations' do
    it { is_expected.to belong_to(:vendor_profile) }
  end

  describe 'validations' do
    subject { build(:availability_slot, vendor_profile: vendor_profile) }

    it { is_expected.to validate_presence_of(:date) }
    it { is_expected.to validate_presence_of(:start_time) }
    it { is_expected.to validate_presence_of(:end_time) }
    it { is_expected.to validate_inclusion_of(:is_available).in_array([true, false]) }

    it 'validates end_time is after start_time for same-day slots' do
      slot = build(:availability_slot,
                   vendor_profile: vendor_profile,
                   start_time: '14:00',
                   end_time: '14:00')  # Same time should be invalid
      expect(slot).not_to be_valid
      expect(slot.errors[:end_time]).to include('must be after start time')
    end

    it 'allows overnight slots' do
      slot = build(:availability_slot,
                   vendor_profile: vendor_profile,
                   start_time: '22:00',
                   end_time: '06:00')  # Overnight slot should be valid
      expect(slot).to be_valid
    end

    it 'validates date is not in the past on create' do
      slot = build(:availability_slot,
                   vendor_profile: vendor_profile,
                   date: 1.day.ago)
      expect(slot).not_to be_valid
      expect(slot.errors[:date]).to include('cannot be in the past')
    end

    it 'validates date is not in the past on update' do
      slot = create(:availability_slot, vendor_profile: vendor_profile)
      slot.date = 1.day.ago
      expect(slot).not_to be_valid
      expect(slot.errors[:date]).to include('cannot be in the past')
    end

    it 'validates start_time is not in the past for today slots' do
      slot = build(:availability_slot,
                   vendor_profile: vendor_profile,
                   date: Date.current,
                   start_time: 2.hours.ago.strftime('%H:%M'))
      expect(slot).not_to be_valid
      expect(slot.errors[:start_time]).to include('cannot be in the past')
    end
  end

  describe 'scopes' do
    let!(:available_slot) { create(:availability_slot, vendor_profile: vendor_profile, is_available: true) }
    let!(:unavailable_slot) { create(:availability_slot, vendor_profile: vendor_profile, is_available: false) }
    let!(:today_slot) { create(:availability_slot, vendor_profile: vendor_profile, date: Date.current) }
    let!(:future_slot) { create(:availability_slot, vendor_profile: vendor_profile, date: 1.week.from_now) }

    describe '.available' do
      it 'returns only available slots' do
        expect(described_class.available).to include(available_slot)
        expect(described_class.available).not_to include(unavailable_slot)
      end
    end

    describe '.for_date' do
      it 'returns slots for specific date' do
        expect(described_class.for_date(Date.current)).to include(today_slot)
        expect(described_class.for_date(Date.current)).not_to include(future_slot)
      end
    end

    describe '.for_vendor' do
      let(:other_vendor) { create(:user, :vendor) }
      let!(:other_slot) { create(:availability_slot, vendor_profile: other_vendor.vendor_profile) }

      it 'returns slots for specific vendor' do
        expect(described_class.for_vendor(vendor_profile)).to include(available_slot)
        expect(described_class.for_vendor(vendor_profile)).not_to include(other_slot)
      end
    end

    describe '.upcoming' do
      it 'returns slots from today onwards' do
        expect(described_class.upcoming).to include(today_slot, future_slot)
      end
    end
  end

  describe 'instance methods' do
    let(:slot) do
      create(:availability_slot,
             vendor_profile: vendor_profile,
             start_time: '09:00',
             end_time: '17:00')
    end

    describe '#duration_hours' do
      it 'calculates duration in hours' do
        expect(slot.duration_hours).to eq(8.0)
      end

      it 'handles overnight slots' do
        overnight_slot = build(:availability_slot,
                               vendor_profile: vendor_profile,
                               start_time: '22:00',
                               end_time: '06:00')
        # Skip validation for this test since we're testing the duration calculation
        overnight_slot.save(validate: false)
        expect(overnight_slot.duration_hours).to eq(8.0)
      end
    end

    describe '#time_range' do
      it 'returns formatted time range' do
        expect(slot.time_range).to eq('09:00 AM - 05:00 PM')
      end
    end

    describe '#overlaps_with?' do
      let(:other_slot) do
        build(:availability_slot,
              vendor_profile: vendor_profile,
              date: slot.date,
              start_time: '14:00',
              end_time: '18:00')
      end

      let(:non_overlapping_slot) do
        build(:availability_slot,
              vendor_profile: vendor_profile,
              date: slot.date,
              start_time: '18:00',
              end_time: '20:00')
      end

      it 'detects overlapping slots' do
        expect(slot.overlaps_with?(other_slot)).to be true
      end

      it 'detects non-overlapping slots' do
        expect(slot.overlaps_with?(non_overlapping_slot)).to be false
      end

      it 'returns false for different dates' do
        other_slot.date = slot.date + 1.day
        expect(slot.overlaps_with?(other_slot)).to be false
      end

      it 'returns false for non-AvailabilitySlot objects' do
        expect(slot.overlaps_with?('not a slot')).to be false
      end
    end

    describe '#booking_conflict?' do
      let(:customer) { create(:user, :customer) }
      let(:service) { create(:service, vendor_profile: vendor_profile) }

      context 'when there are conflicting bookings' do
        before do
          create(:booking,
                 customer: customer,
                 vendor: vendor,
                 service: service,
                 event_date: slot.date.beginning_of_day + 10.hours,
                 event_end_date: slot.date.beginning_of_day + 12.hours,
                 status: :accepted)
        end

        it 'returns true' do
          expect(slot.booking_conflict?).to be true
        end
      end

      context 'when there are no conflicting bookings' do
        it 'returns false' do
          expect(slot.booking_conflict?).to be false
        end
      end

      context 'when bookings are declined or cancelled' do
        before do
          create(:booking,
                 customer: customer,
                 vendor: vendor,
                 service: service,
                 event_date: slot.date.beginning_of_day + 10.hours,
                 status: :declined)
        end

        it 'returns false' do
          expect(slot.booking_conflict?).to be false
        end
      end
    end

    describe '#passed?' do
      it 'returns true when date is before Date.current' do
        past_slot = build(:availability_slot, vendor_profile: vendor_profile, date: 1.day.ago)
        expect(past_slot.passed?).to be true
      end

      it 'returns false when date is after Date.current' do
        future_slot = build(:availability_slot, vendor_profile: vendor_profile, date: 2.days.from_now.to_date)
        expect(future_slot.passed?).to be false
      end

      it 'checks start_time when date is today' do
        slot_past_today = build(:availability_slot, vendor_profile: vendor_profile, date: Date.current, start_time: 2.hours.ago.strftime('%H:%M'))
        slot_future_today = build(:availability_slot, vendor_profile: vendor_profile, date: Date.current, start_time: 2.hours.from_now.strftime('%H:%M'))

        expect(slot_past_today.passed?).to be true
        expect(slot_future_today.passed?).to be false
      end
    end
  end
end
