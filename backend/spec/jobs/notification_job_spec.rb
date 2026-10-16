# frozen_string_literal: true

require 'rails_helper'

RSpec.describe NotificationJob do
  let(:vendor_user) { create(:user, :vendor) }
  let(:customer_user) { create(:user, :customer) }
  let(:vendor) { vendor_user.vendor }
  let(:customer) { customer_user.customer }
  let(:service) { create(:service, vendor: vendor) }
  let(:booking) do
    # Create availability slot for the booking date
    booking_date = 1.week.from_now
    create(:availability_slot,
           vendor: vendor,
           date: booking_date.to_date,
           is_available: true)

    create(:booking, service: service, vendor: vendor, customer: customer_user, event_date: booking_date)
  end

  describe '#perform' do
    let(:mailer_delivery) { instance_double(ActionMailer::MessageDelivery, deliver_now: true) }

    context 'when notification_type is booking_created' do
      it 'sends booking created notification to vendor' do
        allow(VendorBookingMailer).to receive(:new_booking_notification).and_return(mailer_delivery)

        described_class.perform_now('booking_created', vendor_user.id, { 'booking_id' => booking.id })

        expect(VendorBookingMailer).to have_received(:new_booking_notification).with(booking)
        expect(mailer_delivery).to have_received(:deliver_now)
      end
    end

    context 'when notification_type is booking_approved' do
      it 'sends booking approved notification to customer' do
        allow(CustomerBookingMailer).to receive(:booking_approved_notification).and_return(mailer_delivery)

        described_class.perform_now('booking_approved', customer_user.id, { 'booking_id' => booking.id })

        expect(CustomerBookingMailer).to have_received(:booking_approved_notification).with(booking)
        expect(mailer_delivery).to have_received(:deliver_now)
      end
    end

    context 'when notification_type is booking_rejected' do
      it 'sends booking rejected notification to customer' do
        allow(CustomerBookingMailer).to receive(:booking_rejected_notification).and_return(mailer_delivery)

        described_class.perform_now('booking_rejected', customer_user.id, { 'booking_id' => booking.id })

        expect(CustomerBookingMailer).to have_received(:booking_rejected_notification).with(booking)
        expect(mailer_delivery).to have_received(:deliver_now)
      end
    end

    context 'when notification_type is booking_cancelled' do
      it 'sends booking cancelled notification to vendor' do
        allow(VendorBookingMailer).to receive(:booking_cancelled_notification).and_return(mailer_delivery)

        described_class.perform_now('booking_cancelled', vendor_user.id, { 'booking_id' => booking.id })

        expect(VendorBookingMailer).to have_received(:booking_cancelled_notification).with(booking)
        expect(mailer_delivery).to have_received(:deliver_now)
      end
    end

    context 'when notification_type is booking_reminder' do
      it 'sends booking reminder notification to customer' do
        allow(CustomerBookingMailer).to receive(:booking_reminder).and_return(mailer_delivery)

        described_class.perform_now('booking_reminder', customer_user.id, { 'booking_id' => booking.id })

        expect(CustomerBookingMailer).to have_received(:booking_reminder).with(booking)
        expect(mailer_delivery).to have_received(:deliver_now)
      end
    end

    context 'when notification_type is new_message' do
      let(:booking_message) { create(:booking_message, booking: booking, sender: vendor_user, message: 'Test message') }

      it 'sends new message notification' do
        allow(MessageMailer).to receive(:new_message_notification).and_return(mailer_delivery)

        described_class.perform_now('new_message', customer_user.id, { 'message_id' => booking_message.id })

        expect(MessageMailer).to have_received(:new_message_notification).with(booking_message)
        expect(mailer_delivery).to have_received(:deliver_now)
      end
    end

    context 'when user does not exist' do
      it 'handles error gracefully' do
        expect do
          described_class.perform_now('booking_created', 999_999, { 'booking_id' => booking.id })
        end.not_to raise_error
      end
    end

    context 'when notification_type is unknown' do
      it 'handles unknown notification type' do
        expect do
          described_class.perform_now('unknown_type', customer_user.id, {})
        end.not_to raise_error
      end
    end
  end
end
