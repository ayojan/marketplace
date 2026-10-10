# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AvailabilityCheckerService, type: :service do
  let(:vendor) { create(:user, :vendor) }
  let(:vendor_profile) { vendor.vendor_profile }
  let(:date) { 1.week.from_now.to_date }

  describe '#available?' do
    context 'when vendor has availability slots' do
      before do
        create(:availability_slot,
               vendor_profile: vendor_profile,
               date: date,
               start_time: '09:00',
               end_time: '17:00',
               is_available: true)
      end

      it 'returns true for time within availability slot' do
        service = described_class.new(
          vendor_profile: vendor_profile,
          date: date,
          start_time: '10:00',
          end_time: '12:00'
        )

        expect(service.available?).to be true
      end

      it 'returns false for time outside availability slot' do
        service = described_class.new(
          vendor_profile: vendor_profile,
          date: date,
          start_time: '18:00',
          end_time: '20:00'
        )

        expect(service.available?).to be false
      end

      it 'returns false for time partially outside availability slot' do
        service = described_class.new(
          vendor_profile: vendor_profile,
          date: date,
          start_time: '16:00',
          end_time: '18:00'
        )

        expect(service.available?).to be false
      end

      it 'returns true for time exactly matching availability slot' do
        service = described_class.new(
          vendor_profile: vendor_profile,
          date: date,
          start_time: '09:00',
          end_time: '17:00'
        )

        expect(service.available?).to be true
      end
    end

    context 'when checking past date or past time' do
      it 'returns false and adds errors when date is in the past' do
        service = described_class.new(
          vendor_profile: vendor_profile,
          date: 1.day.ago.to_date,
          start_time: '10:00',
          end_time: '12:00'
        )

        expect(service.available?).to be false
        expect(service.errors[:date]).to include('cannot be in the past')
      end

      it 'returns false and adds errors when start_time has already passed today' do
        service = described_class.new(
          vendor_profile: vendor_profile,
          date: Date.current,
          start_time: 2.hours.ago.strftime('%H:%M'),
          end_time: 1.hour.ago.strftime('%H:%M')
        )

        expect(service.available?).to be false
        expect(service.errors[:start_time]).to include('cannot be in the past')
      end
    end

    context 'when vendor has overnight availability slots' do
      before do
        slot = build(:availability_slot,
                     vendor_profile: vendor_profile,
                     date: date,
                     start_time: '22:00',
                     end_time: '06:00',
                     is_available: true)
        slot.save(validate: false) # Skip validation for overnight slot
      end

      it 'returns false for time within overnight slot (late night) - not yet supported' do
        service = described_class.new(
          vendor_profile: vendor_profile,
          date: date,
          start_time: '23:00',
          end_time: '01:00'
        )

        expect(service.available?).to be false
      end

      it 'returns false for time within overnight slot (early morning) - not yet supported' do
        service = described_class.new(
          vendor_profile: vendor_profile,
          date: date,
          start_time: '05:00',
          end_time: '06:00'
        )

        expect(service.available?).to be false
      end

      it 'returns false for time outside overnight slot' do
        service = described_class.new(
          vendor_profile: vendor_profile,
          date: date,
          start_time: '10:00',
          end_time: '12:00'
        )

        expect(service.available?).to be false
      end
    end

    context 'when vendor has no availability slots' do
      it 'returns false' do
        service = described_class.new(
          vendor_profile: vendor_profile,
          date: date,
          start_time: '10:00',
          end_time: '12:00'
        )

        expect(service.available?).to be false
      end
    end

    context 'when vendor has unavailable slots' do
      before do
        create(:availability_slot,
               vendor_profile: vendor_profile,
               date: date,
               start_time: '09:00',
               end_time: '17:00',
               is_available: false)
      end

      it 'returns false' do
        service = described_class.new(
          vendor_profile: vendor_profile,
          date: date,
          start_time: '10:00',
          end_time: '12:00'
        )

        expect(service.available?).to be false
      end
    end

    context 'with invalid parameters' do
      it 'returns false when vendor_profile is missing' do
        service = described_class.new(
          vendor_profile: nil,
          date: date,
          start_time: '10:00',
          end_time: '12:00'
        )

        expect(service.available?).to be false
      end

      it 'returns false when date is missing' do
        service = described_class.new(
          vendor_profile: vendor_profile,
          date: nil,
          start_time: '10:00',
          end_time: '12:00'
        )

        expect(service.available?).to be false
      end
    end
  end

  describe '#availability_slots' do
    let!(:available_slot) do
      create(:availability_slot,
             vendor_profile: vendor_profile,
             date: date,
             start_time: '09:00',
             end_time: '17:00',
             is_available: true)
    end

    let!(:unavailable_slot) do
      create(:availability_slot,
             vendor_profile: vendor_profile,
             date: date,
             start_time: '18:00',
             end_time: '20:00',
             is_available: false)
    end

    let!(:different_date_slot) do
      create(:availability_slot,
             vendor_profile: vendor_profile,
             date: date + 1.day,
             start_time: '09:00',
             end_time: '17:00',
             is_available: true)
    end

    it 'returns only available slots for the specified date' do
      service = described_class.new(
        vendor_profile: vendor_profile,
        date: date,
        start_time: '10:00',
        end_time: '12:00'
      )

      slots = service.availability_slots
      expect(slots).to include(available_slot)
      expect(slots).not_to include(unavailable_slot)
      expect(slots).not_to include(different_date_slot)
    end
  end

  describe '#suggested_times' do
    let(:morning_slot) do
      create(:availability_slot,
             vendor_profile: vendor_profile,
             date: date,
             start_time: '09:00',
             end_time: '12:00',
             is_available: true)
    end

    let(:afternoon_slot) do
      create(:availability_slot,
             vendor_profile: vendor_profile,
             date: date,
             start_time: '14:00',
             end_time: '18:00',
             is_available: true)
    end

    before do
      morning_slot
      afternoon_slot
    end

    it 'returns suggested time slots' do
      service = described_class.new(
        vendor_profile: vendor_profile,
        date: date,
        start_time: '10:00',
        end_time: '12:00'
      )

      suggestions = service.suggested_times
      expect(suggestions.length).to eq(2)

      expect(suggestions[0]).to include(
        start_time: '09:00',
        end_time: '12:00',
        duration_hours: 3.0
      )

      expect(suggestions[1]).to include(
        start_time: '14:00',
        end_time: '18:00',
        duration_hours: 4.0
      )
    end

    it 'returns empty array when no availability slots exist' do
      service = described_class.new(
        vendor_profile: vendor_profile,
        date: date + 2.days,
        start_time: '10:00',
        end_time: '12:00'
      )

      expect(service.suggested_times).to eq([])
    end
  end
end
