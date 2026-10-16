# frozen_string_literal: true

require 'rails_helper'

RSpec.describe VendorAnalyticsService, type: :service do
  subject(:service_result) { described_class.call(vendor) }

  let(:vendor_user) { create(:user, :vendor) }
  let(:vendor) { vendor_user.vendor }
  let(:customer) { create(:user, :customer) }
  let(:service) { create(:service, vendor: vendor) }

  describe '#call' do
    context 'when vendor has no activity' do
      it 'returns zeroed and empty metrics' do
        expect(service_result[:overview][:total_bookings]).to eq(0)
        expect(service_result[:overview][:active_services]).to eq(0)
        expect(service_result[:revenue_stats][:total_revenue]).to eq(0.0)
        expect(service_result[:booking_stats][:pending]).to eq(0)
        expect(service_result[:booking_stats][:completed]).to eq(0)
        expect(service_result[:recent_activity]).to be_empty
      end
    end

    context 'when vendor has bookings and reviews' do
      let!(:completed_booking) do
        create(:booking,
               :completed,
               vendor: vendor,
               service: service,
               customer: customer,
               total_amount: 500,
               event_date: 2.days.from_now)
      end

      let(:pending_booking) do
        create(:booking,
               vendor: vendor,
               service: service,
               customer: customer,
               status: :pending,
               total_amount: 300,
               event_date: 1.week.from_now)
      end

      let!(:review) do
        create(:review,
               vendor: vendor,
               service: service,
               customer: customer,
               booking: completed_booking,
               rating: 5,
               status: 'published')
      end

      it 'aggregates booking and revenue metrics correctly' do
        pending_booking
        expect(service_result[:overview][:total_bookings]).to eq(2)
        expect(service_result[:revenue_stats][:total_revenue]).to eq(500.0)
        expect(service_result[:booking_stats][:completed]).to eq(1)
        expect(service_result[:booking_stats][:pending]).to eq(1)
        expect(service_result[:booking_stats][:cancelled]).to eq(0)
      end

      it 'returns recent activity with customer details' do
        activity = service_result[:recent_activity]
        expect(activity.size).to be >= 2

        booking_item = activity.find { |a| a[:type] == 'booking' && a[:id] == completed_booking.id }
        expect(booking_item[:customer]).to eq(customer.full_name)
        expect(booking_item[:amount]).to eq(500.0)

        review_item = activity.find { |a| a[:type] == 'review' && a[:id] == review.id }
        expect(review_item[:customer]).to eq(customer.full_name)
        expect(review_item[:rating]).to eq(5)
      end
    end
  end
end
