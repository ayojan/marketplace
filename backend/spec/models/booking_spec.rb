# frozen_string_literal: true

# == Schema Information
#
# Table name: bookings
#
#  id                       :bigint           not null, primary key
#  booking_reminder_sent_at :datetime
#  event_date               :datetime         not null
#  event_duration           :string
#  event_end_date           :datetime
#  event_location           :string           not null
#  requirements             :text
#  special_instructions     :text
#  status                   :integer          default("pending"), not null
#  total_amount             :decimal(10, 2)   not null
#  vendor_first_response_at :datetime
#  created_at               :datetime         not null
#  updated_at               :datetime         not null
#  customer_id              :bigint           not null
#  service_id               :bigint           not null
#  vendor_profile_id        :bigint           not null
#
# Indexes
#
#  index_bookings_on_booking_reminder_sent_at  (booking_reminder_sent_at)
#  index_bookings_on_customer_id               (customer_id)
#  index_bookings_on_customer_id_and_status    (customer_id,status)
#  index_bookings_on_event_date                (event_date)
#  index_bookings_on_service_id                (service_id)
#  index_bookings_on_service_id_and_status     (service_id,status)
#  index_bookings_on_vendor_first_response_at  (vendor_first_response_at)
#  index_bookings_on_vendor_profile_id         (vendor_profile_id)
#  index_bookings_vendor_response_time         (vendor_profile_id,vendor_first_response_at,created_at)
#  index_bookings_vendor_status_date           (vendor_profile_id,status,event_date)
#
# Foreign Keys
#
#  fk_rails_...  (customer_id => users.id)
#  fk_rails_...  (service_id => services.id)
#  fk_rails_...  (vendor_profile_id => vendor_profiles.id)
#
require 'rails_helper'

RSpec.describe Booking do
  let(:customer) { create(:user, :customer) }
  let(:vendor) { create(:user, :vendor) }
  let(:service) { create(:service, vendor_profile: vendor.vendor_profile) }

  describe 'associations' do
    it { is_expected.to belong_to(:customer).class_name('User') }
    it { is_expected.to belong_to(:vendor_profile) }
    it { is_expected.to belong_to(:service) }
    it { is_expected.to have_many(:booking_messages).dependent(:destroy) }
  end

  describe 'validations' do
    subject { build(:booking, customer: customer, vendor_profile: vendor.vendor_profile, service: service) }

    it { is_expected.to validate_presence_of(:event_date) }
    it { is_expected.to validate_presence_of(:event_location) }
    it { is_expected.to validate_presence_of(:total_amount) }
    it { is_expected.to validate_numericality_of(:total_amount).is_greater_than(0) }
    it { is_expected.to validate_presence_of(:status) }

    it 'validates event_date is in the future on create' do
      booking = build(:booking, customer: customer, vendor: vendor, service: service, event_date: 1.day.ago)
      expect(booking).not_to be_valid
      expect(booking.errors[:event_date]).to include('must be in the future')
    end
  end

  describe 'enums' do
    subject(:booking) { described_class.new }

    it 'defines the status enum' do
      expect(booking).to define_enum_for(:status).with_values(
        pending: 0,
        accepted: 1,
        declined: 2,
        completed: 3,
        cancelled: 4,
        counter_offered: 5
      )
    end
  end

  describe 'scopes' do
    before do
      create(:availability_slot,
             vendor_profile: vendor.vendor_profile,
             date: 1.week.from_now.to_date,
             start_time: '09:00',
             end_time: '17:00',
             is_available: true)
    end

    let!(:upcoming_booking) do
      create(:booking, customer: customer, vendor: vendor, service: service,
                       event_date: 1.week.from_now.change(hour: 10))
    end
    let!(:past_booking) do
      booking = build(:booking, customer: customer, vendor: vendor, service: service, event_date: 1.week.ago,
                                event_location: 'Test Location', total_amount: 100)
      booking.save(validate: false)
      booking
    end
    let!(:pending_booking) do
      create(:booking, customer: customer, vendor: vendor, service: service, status: :pending,
                       event_date: 1.week.from_now.change(hour: 14))
    end
    let!(:accepted_booking) do
      create(:booking, customer: customer, vendor: vendor, service: service, status: :accepted,
                       event_date: 1.week.from_now.change(hour: 15))
    end
    let!(:cancelled_booking) do
      create(:booking, customer: customer, vendor: vendor, service: service, status: :cancelled,
                       event_date: 1.week.from_now.change(hour: 16))
    end

    describe '.upcoming' do
      it 'returns bookings with future event dates' do
        expect(described_class.upcoming).to include(upcoming_booking)
        expect(described_class.upcoming).not_to include(past_booking)
      end
    end

    describe '.for_vendor_profile' do
      it 'returns bookings for specific vendor' do
        expect(described_class.for_vendor_profile(vendor.vendor_profile)).to include(upcoming_booking, past_booking)
      end
    end

    describe '.for_customer' do
      it 'returns bookings for specific customer' do
        expect(described_class.for_customer(customer)).to include(upcoming_booking, past_booking)
      end
    end

    describe '.by_status' do
      it 'returns bookings with specific status' do
        expect(described_class.by_status(:pending)).to include(pending_booking)
        expect(described_class.by_status(:accepted)).to include(accepted_booking)
      end
    end

    describe '.cancellable' do
      it 'returns pending/accepted bookings more than 24 hours away' do
        pending_far = create(:booking, customer: customer, vendor: vendor, service: service,
                                       status: :pending, event_date: 2.days.from_now)
        accepted_far = create(:booking, customer: customer, vendor: vendor, service: service,
                                        status: :accepted, event_date: 2.days.from_now)
        pending_near = create(:booking, customer: customer, vendor: vendor, service: service,
                                        status: :pending, event_date: 12.hours.from_now)

        expect(described_class.cancellable).to include(pending_far, accepted_far)
        expect(described_class.cancellable).not_to include(pending_near, cancelled_booking)
      end
    end

    describe '.modifiable' do
      it 'returns pending bookings more than 24 hours away' do
        pending_far = create(:booking, customer: customer, vendor: vendor, service: service,
                                       status: :pending, event_date: 2.days.from_now)
        pending_near = create(:booking, customer: customer, vendor: vendor, service: service,
                                        status: :pending, event_date: 12.hours.from_now)

        expect(described_class.modifiable).to include(pending_far)
        expect(described_class.modifiable).not_to include(pending_near, accepted_booking)
      end
    end

    describe '.active' do
      it 'returns pending and accepted bookings' do
        expect(described_class.active).to include(pending_booking, accepted_booking)
        expect(described_class.active).not_to include(cancelled_booking)
      end
    end

    describe '.overlapping_period' do
      it 'returns bookings that overlap with given time period' do
        overlapping = create(:booking, customer: customer, vendor: vendor, service: service,
                                       event_date: 1.week.from_now.change(hour: 11),
                                       event_end_date: 1.week.from_now.change(hour: 13))

        start_time = 1.week.from_now.change(hour: 10)
        end_time = 1.week.from_now.change(hour: 12)

        expect(described_class.overlapping_period(start_time, end_time)).to include(overlapping)
      end
    end
  end

  describe 'instance methods' do
    before do
      create(:availability_slot,
             vendor_profile: vendor.vendor_profile,
             date: 1.week.from_now.to_date,
             start_time: '09:00',
             end_time: '17:00',
             is_available: true)
    end

    let(:booking) do
      create(:booking, customer: customer, vendor: vendor, service: service,
                       event_date: 1.week.from_now.change(hour: 10))
    end

    describe '#duration_hours' do
      context 'when event_end_date is present' do
        it 'calculates duration in hours' do
          booking.update(
            event_date: 1.day.from_now,
            event_end_date: 1.day.from_now + 4.hours
          )
          expect(booking.duration_hours).to eq(4.0)
        end
      end

      context 'when event_end_date is not present' do
        it 'returns nil' do
          expect(booking.duration_hours).to be_nil
        end
      end
    end

    describe '#can_be_modified?' do
      it 'returns true for pending bookings more than 24 hours away' do
        booking.update(status: :pending, event_date: 2.days.from_now)
        expect(booking.can_be_modified?).to be true
      end

      it 'returns false for non-pending bookings' do
        booking.update(status: :accepted, event_date: 2.days.from_now)
        expect(booking.can_be_modified?).to be false
      end

      it 'returns false for bookings less than 24 hours away' do
        booking.update(status: :pending, event_date: 12.hours.from_now)
        expect(booking.can_be_modified?).to be false
      end
    end

    describe '#can_be_cancelled?' do
      it 'returns true for pending/accepted bookings more than 24 hours away' do
        booking.update(status: :pending, event_date: 2.days.from_now)
        expect(booking.can_be_cancelled?).to be true

        booking.update(status: :accepted)
        expect(booking.can_be_cancelled?).to be true
      end

      it 'returns false for completed bookings' do
        booking.update(status: :completed, event_date: 2.days.from_now)
        expect(booking.can_be_cancelled?).to be false
      end

      it 'returns false for bookings less than 24 hours away' do
        booking.update(status: :pending, event_date: 12.hours.from_now)
        expect(booking.can_be_cancelled?).to be false
      end
    end

    describe '#vendor_profile' do
      it 'returns the vendor profile' do
        expect(booking.vendor_profile).to eq(vendor.vendor_profile)
      end
    end

    describe '#customer_profile' do
      it 'returns the customer profile' do
        expect(booking.customer_profile).to eq(customer.customer_profile)
      end
    end
  end

  # NOTE: Complex validation (vendor_availability, booking_conflicts)
  # has been moved to Bookings::Validate domain service
  # See spec/domain/bookings/validate_spec.rb for those tests

  describe 'basic validation' do
    it 'validates event_date is in the future on create' do
      booking = build(:booking, customer: customer, vendor: vendor, service: service, event_date: 1.day.ago)
      expect(booking).not_to be_valid
      expect(booking.errors[:event_date]).to include('must be in the future')
    end
  end
end
