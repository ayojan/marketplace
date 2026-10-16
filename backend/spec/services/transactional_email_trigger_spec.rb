# frozen_string_literal: true

require 'rails_helper'

# rubocop:disable RSpec/DescribeMethod, RSpec/SpecFilePathFormat
RSpec.describe Bookings::UpdateBookingStatus, 'and User transactional email triggers' do
  include ActiveJob::TestHelper

  before do
    ActiveJob::Base.queue_adapter = :test
  end

  describe 'User registration welcome email trigger' do
    it 'enqueues WelcomeNotificationJob on user commit' do
      expect do
        create(:user, :customer)
      end.to have_enqueued_job(WelcomeNotificationJob)
    end

    it 'does not enqueue WelcomeNotificationJob for admin users' do
      expect do
        create(:user, :admin)
      end.not_to have_enqueued_job(WelcomeNotificationJob)
    end
  end

  describe 'Booking status change email triggers' do
    let(:vendor_user) { create(:user, :vendor) }
    let(:customer_user) { create(:user, :customer) }
    let(:vendor) { vendor_user.vendor }
    let(:service) { create(:service, vendor: vendor) }
    let(:booking) do
      booking_date = 2.weeks.from_now
      create(:availability_slot, vendor: vendor, date: booking_date.to_date, is_available: true)
      create(:booking, service: service, vendor: vendor, customer: customer_user,
                       event_date: booking_date, status: :pending)
    end

    it 'triggers approved notification when booking status changes to accepted' do
      allow(Notifications::SendBookingStatusChange).to receive(:call).and_call_original

      described_class.call(booking: booking, new_status: 'accepted')

      expect(Notifications::SendBookingStatusChange).to have_received(:call).with(
        booking: booking,
        status: 'accepted'
      )
    end

    it 'triggers rejection notification when vendor declines booking' do
      allow(NotificationJob).to receive(:perform_later)

      BookingResponseService.call(booking, vendor_user, 'decline')

      expect(NotificationJob).to have_received(:perform_later).with(
        'booking_rejected',
        customer_user.id,
        { 'booking_id' => booking.id }
      )
    end

    it 'triggers cancellation notification when booking status changes to cancelled' do
      allow(Notifications::SendBookingStatusChange).to receive(:call).and_call_original

      described_class.call(booking: booking, new_status: 'cancelled')

      expect(Notifications::SendBookingStatusChange).to have_received(:call).with(
        booking: booking,
        status: 'cancelled'
      )
    end
  end
end
# rubocop:enable RSpec/DescribeMethod, RSpec/SpecFilePathFormat
