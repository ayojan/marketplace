# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Bookings::ConflictResolutionService, type: :service do
  let(:vendor_user) { create(:user, :vendor) }
  let(:vendor) { vendor_user.vendor }
  let(:customer_one) { create(:user, :customer) }
  let(:customer_two) { create(:user, :customer) }
  let(:service) { create(:service, vendor: vendor) }
  let(:event_date) { 1.week.from_now.change(hour: 10, min: 0) }
  let(:event_end_date) { event_date + 2.hours }

  let!(:availability_slot) do
    create(:availability_slot,
           vendor: vendor,
           date: event_date.to_date,
           start_time: '09:00',
           end_time: '17:00',
           is_available: true)
  end

  describe '#conflict?' do
    context 'when there are no existing bookings' do
      it 'returns false' do
        service_instance = described_class.new(
          vendor: vendor,
          event_date: event_date,
          event_end_date: event_end_date
        )

        expect(service_instance.conflict?).to be false
      end
    end

    context 'when there are non-conflicting bookings' do
      before do
        create(:booking,
               customer: customer_one,
               vendor: vendor,
               service: service,
               event_date: event_date - 4.hours,
               event_end_date: event_date - 2.hours,
               status: :accepted)

        create(:booking,
               customer: customer_two,
               vendor: vendor,
               service: service,
               event_date: event_end_date + 1.hour,
               event_end_date: event_end_date + 3.hours,
               status: :accepted)
      end

      it 'returns false' do
        service_instance = described_class.new(
          vendor: vendor,
          event_date: event_date,
          event_end_date: event_end_date
        )

        expect(service_instance.conflict?).to be false
      end
    end

    context 'when there are conflicting bookings' do
      let!(:overlapping_booking) do
        create(:booking,
               customer: customer_one,
               vendor: vendor,
               service: service,
               event_date: event_date + 1.hour,
               event_end_date: event_date + 3.hours,
               status: :accepted)
      end

      it 'returns true for overlapping bookings' do
        service_instance = described_class.new(
          vendor: vendor,
          event_date: event_date,
          event_end_date: event_end_date
        )

        expect(service_instance.conflict?).to be true
      end

      it 'returns false when conflicting booking is declined' do
        overlapping_booking.update!(status: :declined)

        service_instance = described_class.new(
          vendor: vendor,
          event_date: event_date,
          event_end_date: event_end_date
        )

        expect(service_instance.conflict?).to be false
      end

      it 'returns false when conflicting booking is cancelled' do
        overlapping_booking.update!(status: :cancelled)

        service_instance = described_class.new(
          vendor: vendor,
          event_date: event_date,
          event_end_date: event_end_date
        )

        expect(service_instance.conflict?).to be false
      end
    end

    context 'when excluding a specific booking' do
      let!(:existing_booking) do
        create(:booking,
               customer: customer_one,
               vendor: vendor,
               service: service,
               event_date: event_date,
               event_end_date: event_end_date,
               status: :accepted)
      end

      it 'excludes the specified booking from conflict check' do
        service_instance = described_class.new(
          vendor: vendor,
          event_date: event_date,
          event_end_date: event_end_date,
          exclude_booking_id: existing_booking.id
        )

        expect(service_instance.conflict?).to be false
      end

      it 'includes other conflicting bookings' do
        other_booking = build(:booking,
                              customer: customer_two,
                              vendor: vendor,
                              service: service,
                              event_date: event_date + 30.minutes,
                              event_end_date: event_end_date + 30.minutes,
                              status: :accepted)
        other_booking.save(validate: false)

        service_instance = described_class.new(
          vendor: vendor,
          event_date: event_date,
          event_end_date: event_end_date,
          exclude_booking_id: existing_booking.id
        )

        expect(service_instance.conflict?).to be true
      end
    end

    context 'with default event_end_date' do
      it 'uses 2 hours as default duration' do
        # Create a booking that would conflict with default 2-hour duration
        create(:booking,
               customer: customer_one,
               vendor: vendor,
               service: service,
               event_date: event_date + 1.hour,
               event_end_date: event_date + 2.hours,
               status: :accepted)

        service_instance = described_class.new(
          vendor: vendor,
          event_date: event_date
          # event_end_date not provided, should default to event_date + 2.hours
        )

        expect(service_instance.conflict?).to be true
      end
    end
  end

  describe '#conflicting_bookings' do
    let!(:conflicting_booking) do
      create(:booking,
             customer: customer_one,
             vendor: vendor,
             service: service,
             event_date: event_date + 1.hour,
             event_end_date: event_date + 3.hours,
             status: :accepted)
    end

    let!(:non_conflicting_booking) do
      create(:booking,
             customer: customer_two,
             vendor: vendor,
             service: service,
             event_date: event_date + 5.hours,
             event_end_date: event_date + 7.hours,
             status: :accepted)
    end

    it 'returns only conflicting bookings' do
      service_instance = described_class.new(
        vendor: vendor,
        event_date: event_date,
        event_end_date: event_end_date
      )

      conflicts = service_instance.conflicting_bookings
      expect(conflicts).to include(conflicting_booking)
      expect(conflicts).not_to include(non_conflicting_booking)
    end
  end

  describe '#suggest_alternative_times' do
    let!(:existing_booking) do
      create(:booking,
             customer: customer_one,
             vendor: vendor,
             service: service,
             event_date: event_date,
             event_end_date: event_date + 2.hours,
             status: :accepted)
    end

    it 'suggests alternative times when there are conflicts' do
      service_instance = described_class.new(
        vendor: vendor,
        event_date: event_date,
        event_end_date: event_end_date
      )

      alternatives = service_instance.suggest_alternative_times
      expect(alternatives).to be_an(Array)
      expect(alternatives).not_to be_empty

      # Should suggest times that don't conflict
      expect(alternatives).to all(
        have_key(:start_time)
          .and(have_key(:end_time))
          .and(have_key(:duration_hours))
      )
    end

    it 'returns empty array when no availability slots exist' do
      availability_slot.destroy

      service_instance = described_class.new(
        vendor: vendor,
        event_date: event_date,
        event_end_date: event_end_date
      )

      alternatives = service_instance.suggest_alternative_times
      expect(alternatives).to eq([])
    end

    it 'returns empty array when there are no conflicts' do
      existing_booking.destroy

      service_instance = described_class.new(
        vendor: vendor,
        event_date: event_date,
        event_end_date: event_end_date
      )

      alternatives = service_instance.suggest_alternative_times
      expect(alternatives).to eq([])
    end
  end

  describe 'validations' do
    it 'is invalid without vendor' do
      service_instance = described_class.new(
        vendor: nil,
        event_date: event_date,
        event_end_date: event_end_date
      )

      expect(service_instance.conflict?).to be false
      expect(service_instance.errors[:vendor]).to include("can't be blank")
    end

    it 'is invalid without event_date' do
      service_instance = described_class.new(
        vendor: vendor,
        event_date: nil,
        event_end_date: event_end_date
      )

      expect(service_instance.conflict?).to be false
      expect(service_instance.errors[:event_date]).to include("can't be blank")
    end
  end
end
