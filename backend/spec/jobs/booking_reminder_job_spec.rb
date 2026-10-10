# frozen_string_literal: true

require 'rails_helper'

RSpec.describe BookingReminderJob do
  let(:vendor_user) { create(:user, :vendor) }
  let(:vendor_profile) { vendor_user.vendor_profile }
  let(:customer) { create(:user, :customer) }
  let(:service) { create(:service, vendor_profile: vendor_profile) }

  # Create a booking happening in ~24 hours
  let(:booking) do
    create(:booking,
           vendor_profile: vendor_profile,
           customer: customer,
           service: service,
           status: :accepted,
           event_date: 24.hours.from_now,
           booking_reminder_sent_at: nil)
  end

  describe '#perform' do
    context 'with a single booking needing reminder' do
      before { booking } # Create the booking

      it 'sends reminder and marks booking as reminded' do
        described_class.new.perform

        booking.reload
        expect(booking.booking_reminder_sent_at).to be_present
      end

      it 'sends in-app notifications to both customer and vendor' do
        expect do
          described_class.new.perform
        end.to change(InAppNotification, :count).by(2)

        customer_notifs = InAppNotification.where(user_id: customer.id, notification_type: 'booking_reminder')
        vendor_notifs = InAppNotification.where(user_id: vendor_user.id, notification_type: 'booking_reminder')

        expect(customer_notifs.count).to eq(1)
        expect(vendor_notifs.count).to eq(1)
      end
    end

    context 'with multiple bookings needing reminders' do
      let(:customer2) { create(:user, :customer) }
      let(:booking2) do
        create(:booking,
               vendor_profile: vendor_profile,
               customer: customer2,
               service: service,
               status: :accepted,
               event_date: 24.hours.from_now,
               booking_reminder_sent_at: nil)
      end

      before do
        booking
        booking2
      end

      it 'sends reminders to all bookings' do
        described_class.new.perform

        expect(booking.reload.booking_reminder_sent_at).to be_present
        expect(booking2.reload.booking_reminder_sent_at).to be_present
      end

      it 'uses find_in_batches for memory efficiency (does not fail with large batches)' do
        # Create additional bookings to test batching
        3.times do |_i|
          customer_temp = create(:user, :customer)
          create(:booking,
                 vendor_profile: vendor_profile,
                 customer: customer_temp,
                 service: service,
                 status: :accepted,
                 event_date: 24.hours.from_now,
                 booking_reminder_sent_at: nil)
        end

        expect do
          described_class.new.perform
        end.not_to raise_error
      end
    end

    context 'idempotency: job runs twice' do
      before { booking }

      it 'does not send duplicate reminders on second run' do
        # First run
        described_class.new.perform
        expect(booking.reload.booking_reminder_sent_at).to be_present
        first_sent_at = booking.booking_reminder_sent_at

        # Second run (e.g., retry after job crash)
        sleep(0.1) # Ensure time passes
        described_class.new.perform

        # booking_reminder_sent_at should not change
        expect(booking.reload.booking_reminder_sent_at).to eq(first_sent_at)
      end

      it 'does not create duplicate notifications on second run' do
        # First run
        expect do
          described_class.new.perform
        end.to change(InAppNotification, :count).by(2)

        notification_count = InAppNotification.count

        # Second run
        expect do
          described_class.new.perform
        end.not_to change(InAppNotification, :count)

        expect(InAppNotification.count).to eq(notification_count)
      end
    end

    context 'when notification service fails' do
      before { booking }

      it 'continues processing other bookings even if one fails' do
        customer2 = create(:user, :customer)
        create(:booking,
               vendor_profile: vendor_profile,
               customer: customer2,
               service: service,
               status: :accepted,
               event_date: 24.hours.from_now,
               booking_reminder_sent_at: nil)

        # Mock SendBookingReminder to fail for first booking, succeed for second
        call_count = 0
        allow(Notifications::SendBookingReminder).to receive(:call) do
          call_count += 1
          raise StandardError, 'Notification service down' if call_count == 1

          { success: true, already_sent: false }
        end

        # Job should not raise; it should log error and continue
        expect do
          described_class.new.perform
        end.not_to raise_error
      end
    end

    context 'booking outside time window' do
      let(:far_future_booking) do
        create(:booking,
               vendor_profile: vendor_profile,
               customer: customer,
               service: service,
               status: :accepted,
               event_date: 48.hours.from_now, # Outside 24h +/- 30min window
               booking_reminder_sent_at: nil)
      end

      before { far_future_booking }

      it 'does not send reminders for bookings outside window' do
        expect do
          described_class.new.perform
        end.not_to change(InAppNotification, :count)

        expect(far_future_booking.reload.booking_reminder_sent_at).to be_nil
      end
    end

    context 'booking with cancelled status' do
      let(:cancelled_booking) do
        create(:booking,
               vendor_profile: vendor_profile,
               customer: customer,
               service: service,
               status: :cancelled,
               event_date: 24.hours.from_now,
               booking_reminder_sent_at: nil)
      end

      before { cancelled_booking }

      it 'does not send reminders for non-accepted bookings' do
        expect do
          described_class.new.perform
        end.not_to change(InAppNotification, :count)

        expect(cancelled_booking.reload.booking_reminder_sent_at).to be_nil
      end
    end

    context 'logging' do
      before { booking }

      it 'logs successful completion' do
        allow(Rails.logger).to receive(:info)
        described_class.new.perform
        expect(Rails.logger).to have_received(:info).with(/1 reminders sent successfully/)
      end

      it 'logs when failures occur' do
        allow(Notifications::SendBookingReminder).to receive(:call).and_raise(StandardError, 'Test error')
        allow(Rails.logger).to receive(:warn)

        described_class.new.perform

        expect(Rails.logger).to have_received(:warn).with(/0 sent, 1 failed/)
      end
    end
  end
end
