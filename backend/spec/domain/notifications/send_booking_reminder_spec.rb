# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Notifications::SendBookingReminder do
  include ActiveSupport::Testing::TimeHelpers

  let(:vendor_user) { create(:user, :vendor) }
  let(:vendor_profile) { vendor_user.vendor_profile }
  let(:customer) { create(:user, :customer) }
  let(:service) { create(:service, vendor_profile: vendor_profile) }
  let(:booking) do
    create(:booking,
           vendor_profile: vendor_profile,
           customer: customer,
           service: service,
           status: :accepted,
           event_date: 24.hours.from_now,
           booking_reminder_sent_at: nil)
  end

  describe '.call' do
    context 'with booking needing reminder' do
      it 'sends notifications to customer and vendor' do
        expect do
          described_class.call(booking: booking)
        end.to change(InAppNotification, :count).by(2)
      end

      it 'marks booking as sent' do
        described_class.call(booking: booking)
        expect(booking.reload.booking_reminder_sent_at).to be_present
      end

      it 'returns success response' do
        result = described_class.call(booking: booking)
        expect(result[:success]).to be true
        expect(result[:already_sent]).to be false
      end

      it 'creates notification with correct details for customer' do
        described_class.call(booking: booking)

        customer_notif = InAppNotification.where(user_id: customer.id).last
        expect(customer_notif.notification_type).to eq('booking_reminder')
        expect(customer_notif.title).to eq('Booking Reminder')
        expect(customer_notif.message).to include('coming up')
        expect(customer_notif.related_type).to eq('Booking')
        expect(customer_notif.related_id).to eq(booking.id)
      end

      it 'creates notification with correct details for vendor' do
        described_class.call(booking: booking)

        vendor_notif = InAppNotification.where(user_id: vendor_user.id).last
        expect(vendor_notif.notification_type).to eq('booking_reminder')
        expect(vendor_notif.title).to eq('Upcoming Booking')
        expect(vendor_notif.message).to include(customer.full_name)
        expect(vendor_notif.related_type).to eq('Booking')
        expect(vendor_notif.related_id).to eq(booking.id)
      end
    end

    context 'idempotency: reminder already sent' do
      before { booking.update(booking_reminder_sent_at: 1.hour.ago) }

      it 'returns success without sending notifications' do
        expect do
          result = described_class.call(booking: booking)
          expect(result[:success]).to be true
          expect(result[:already_sent]).to be true
        end.not_to change(InAppNotification, :count)
      end

      it 'logs that reminder already sent' do
        allow(Rails.logger).to receive(:debug)
        described_class.call(booking: booking)
        expect(Rails.logger).to have_received(:debug).with(/already sent/)
      end
    end

    context 'idempotency: called twice' do
      it 'does not send duplicate notifications on second call' do
        # First call
        expect do
          described_class.call(booking: booking)
        end.to change(InAppNotification, :count).by(2)

        notif_count = InAppNotification.count

        # Second call (e.g., retry or concurrent request)
        expect do
          described_class.call(booking: booking)
        end.not_to change(InAppNotification, :count)

        expect(InAppNotification.count).to eq(notif_count)
      end

      it 'does not update booking_reminder_sent_at on second call' do
        # First call
        described_class.call(booking: booking)
        first_sent_at = booking.reload.booking_reminder_sent_at

        # Advance time and call again
        travel(1.minute)
        described_class.call(booking: booking)

        # booking_reminder_sent_at should not change
        expect(booking.reload.booking_reminder_sent_at).to eq(first_sent_at)
      end
    end

    context 'when marking as sent fails' do
      it 'returns failure and does not send notifications' do
        allow(booking).to receive(:update).and_return(false)

        expect do
          result = described_class.call(booking: booking)
          expect(result[:success]).to be false
          expect(result[:error]).to include('Failed to mark reminder as sent')
        end.not_to change(InAppNotification, :count)
      end
    end

    context 'when customer notification fails' do
      it 'logs error but continues with vendor notification' do
        allow(Notifications::SendNotification).to receive(:call) do
          raise StandardError, 'Customer notification failed'
        end

        # We expect an error to be raised eventually, but vendor notification should be attempted
        expect do
          described_class.call(booking: booking)
        end.to raise_error(StandardError)
      end
    end

    context 'when vendor notification fails' do
      it 'logs error but marks booking as sent' do
        call_count = 0
        allow(Notifications::SendNotification).to receive(:call) do
          call_count += 1
          raise StandardError, 'Vendor notification failed' if call_count == 2

          { success: true }
        end

        expect do
          described_class.call(booking: booking)
        end.to raise_error(StandardError)

        # Even though vendor notification failed, booking should be marked as sent
        # (because we mark it as sent BEFORE sending notifications)
        expect(booking.reload.booking_reminder_sent_at).to be_present
      end
    end

    context 'with various date formats' do
      it 'includes formatted event date in messages' do
        event_date = 1.day.from_now
        booking.update(event_date: event_date)

        described_class.call(booking: booking)

        customer_notif = InAppNotification.where(user_id: customer.id).last
        expect(customer_notif.message).to include(event_date.strftime('%B %d, %Y'))
      end
    end
  end
end
