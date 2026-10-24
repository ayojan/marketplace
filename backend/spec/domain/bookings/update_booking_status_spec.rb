# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Bookings::UpdateBookingStatus do
  let(:vendor_user) { create(:user, :vendor) }
  let(:vendor) { vendor_user.vendor }
  let(:customer) { create(:user, :customer) }
  let(:service) { create(:service, vendor: vendor) }
  let(:booking) do
    create(:booking,
           vendor: vendor,
           customer: customer,
           service: service,
           status: :pending,
           event_date: 48.hours.from_now)
  end

  describe '.call' do
    context 'with valid status transition' do
      it 'updates booking status' do
        result = described_class.call(booking: booking, new_status: 'accepted')
        expect(result[:success]).to be true
        expect(booking.reload.status).to eq('accepted')
      end

      it 'returns success response with updated booking' do
        result = described_class.call(booking: booking, new_status: 'accepted')
        expect(result[:success]).to be true
        expect(result[:booking].status).to eq('accepted')
      end
    end

    context 'with status change notifications' do
      it 'sends notification when status changes to accepted' do
        allow(Notifications::SendBookingStatusChange).to receive(:call)

        described_class.call(booking: booking, new_status: 'accepted')

        expect(Notifications::SendBookingStatusChange).to have_received(:call) do |kwargs|
          expect(kwargs[:booking]).to eq(booking)
          expect(kwargs[:status]).to eq('accepted')
        end
      end

      it 'sends notification when status changes to cancelled' do
        allow(Notifications::SendBookingStatusChange).to receive(:call)

        described_class.call(booking: booking, new_status: 'cancelled')

        expect(Notifications::SendBookingStatusChange).to have_received(:call)
      end

      it 'does not send notification for other status changes' do
        allow(Notifications::SendBookingStatusChange).to receive(:call)

        # Change from pending to declined (not a status that triggers notification)
        described_class.call(booking: booking, new_status: 'declined')

        expect(Notifications::SendBookingStatusChange).not_to have_received(:call)
      end

      it 'suppresses notifications when skip_notifications is true' do
        allow(Notifications::SendBookingStatusChange).to receive(:call)

        described_class.call(booking: booking, new_status: 'accepted', skip_notifications: true)

        expect(Notifications::SendBookingStatusChange).not_to have_received(:call)
      end

      it 'continues if status notification fails' do
        allow(Notifications::SendBookingStatusChange).to receive(:call).and_raise(StandardError, 'Notification error')

        expect do
          result = described_class.call(booking: booking, new_status: 'accepted')
          expect(result[:success]).to be true
        end.not_to raise_error
      end
    end

    context 'with trust stats recalculation (inline, not async)' do
      it 'calculates trust stats inline when status changes to completed' do
        allow(Vendors::CalculatePublicStats).to receive(:call)

        result = described_class.call(booking: booking, new_status: 'completed')

        expect(Vendors::CalculatePublicStats).to have_received(:call).with(vendor: vendor)
        expect(result[:success]).to be true
      end

      it 'calculates trust stats inline when status changes to declined' do
        allow(Vendors::CalculatePublicStats).to receive(:call)

        result = described_class.call(booking: booking, new_status: 'declined')

        expect(Vendors::CalculatePublicStats).to have_received(:call).with(vendor: vendor)
        expect(result[:success]).to be true
      end

      it 'calculates trust stats inline when status changes to cancelled' do
        allow(Vendors::CalculatePublicStats).to receive(:call)

        result = described_class.call(booking: booking, new_status: 'cancelled')

        expect(Vendors::CalculatePublicStats).to have_received(:call).with(vendor: vendor)
        expect(result[:success]).to be true
      end

      it 'does not calculate trust stats for non-terminal status' do
        allow(Vendors::CalculatePublicStats).to receive(:call)

        described_class.call(booking: booking, new_status: 'accepted')

        # Stats are only calculated for completed/declined/cancelled
        expect(Vendors::CalculatePublicStats).not_to have_received(:call)
      end

      it 'returns error response if stats calculation fails (explicit failure, not silent)' do
        allow(Vendors::CalculatePublicStats).to receive(:call).and_raise(StandardError, 'Stats error')

        result = described_class.call(booking: booking, new_status: 'completed')

        expect(result[:success]).to be false
        expect(result[:error]).to include('Stats error')
      end

      it 'still updates booking even if stats calculation fails' do
        allow(Vendors::CalculatePublicStats).to receive(:call).and_raise(StandardError, 'Stats error')

        result = described_class.call(booking: booking, new_status: 'completed')

        # Verify booking was updated before the error occurred
        expect(booking.reload.status).to eq('completed')
        # But the result indicates failure
        expect(result[:success]).to be false
      end

      it 'calculates stats for correct vendor' do
        allow(Vendors::CalculatePublicStats).to receive(:call)

        described_class.call(booking: booking, new_status: 'completed')

        expect(Vendors::CalculatePublicStats).to have_received(:call).with(vendor: vendor)
      end
    end

    context 'with invalid status update' do
      it 'returns failure for invalid status value' do
        allow(booking).to receive(:update).and_return(false)
        booking.errors.add(:status, 'is invalid')

        result = described_class.call(booking: booking, new_status: 'invalid_status')
        expect(result[:success]).to be false
      end
    end

    context 'with orchestration flow' do
      it 'completes all steps in sequence for terminal status with notification' do
        # Track order of operations
        operations = []

        allow(booking).to receive(:update) do |attrs|
          operations << :update
          booking.status = attrs[:status]
          true
        end

        allow(Notifications::SendBookingStatusChange).to receive(:call) { operations << :notification }
        allow(Vendors::CalculatePublicStats).to receive(:call) { operations << :stats }

        # Use 'cancelled' which is both notifiable and triggers stats calculation
        described_class.call(booking: booking, new_status: 'cancelled')

        # Verify order: update → notification → stats (inline)
        expect(operations).to eq(%i[update notification stats])
      end

      it 'skips notification for terminal status without notification (e.g., completed)' do
        # Track order of operations
        operations = []

        allow(booking).to receive(:update) do |attrs|
          operations << :update
          booking.status = attrs[:status]
          true
        end

        allow(Notifications::SendBookingStatusChange).to receive(:call) { operations << :notification }
        allow(Vendors::CalculatePublicStats).to receive(:call) { operations << :stats }

        # Use 'completed' which triggers stats but not notification
        described_class.call(booking: booking, new_status: 'completed')

        # Verify order: update → stats (no notification for completed)
        expect(operations).to eq(%i[update stats])
      end
    end
  end
end
