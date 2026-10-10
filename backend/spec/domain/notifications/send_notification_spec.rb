# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Notifications::SendNotification do
  let(:user) { create(:user) }
  let(:preference) { user.email_notification_preference }

  let(:valid_params) do
    {
      user: user,
      title: 'Test Notification',
      message: 'This is a test notification',
      notification_type: 'booking_created'
    }
  end

  describe '#call' do
    it 'creates an in-app notification' do
      expect do
        described_class.call(**valid_params)
      end.to change(InAppNotification, :count).by(1)
    end

    it 'returns success response with notification id' do
      result = described_class.call(**valid_params)
      expect(result[:success]).to be(true)
      expect(result[:notification_id]).to be_present
    end

    context 'when email should be sent' do
      before do
        preference.update(booking_created: true)
      end

      it 'sends email notification' do
        expect(NotificationMailer).to receive(:booking_created_email).at_least(:once).and_call_original
        described_class.call(**valid_params, related_id: 123)
      end
    end

    context 'when email should not be sent' do
      before do
        preference.update(booking_created: false)
      end

      it 'does not send email notification' do
        expect(NotificationMailer).not_to receive(:booking_created_email)
        described_class.call(**valid_params)
      end
    end

    context 'when skip_email is true' do
      it 'does not send email even if preference allows' do
        preference.update(booking_created: true)
        expect(NotificationMailer).not_to receive(:booking_created_email)
        described_class.call(**valid_params, skip_email: true)
      end
    end

    context 'when user has no email preferences' do
      before do
        user.email_notification_preference.destroy
      end

      it 'does not send email' do
        expect(NotificationMailer).not_to receive(:booking_created_email)
        described_class.call(**valid_params)
      end
    end

    context 'when an error occurs' do
      it 'returns failure response' do
        allow(InAppNotification).to receive(:create_notification).and_raise(StandardError, 'Test error')
        result = described_class.call(**valid_params)
        expect(result[:success]).to be(false)
        expect(result[:error]).to include('Test error')
      end
    end
  end

  describe 'email preference checking' do
    context 'for booking_created notification' do
      let(:params) { valid_params.merge(notification_type: 'booking_created', related_id: 123) }

      it 'respects booking_created preference' do
        preference.update(booking_created: false)
        expect(NotificationMailer).not_to receive(:booking_created_email)
        described_class.call(**params)
      end
    end

    context 'for booking_accepted notification' do
      let(:params) { valid_params.merge(notification_type: 'booking_accepted', related_id: 123) }

      it 'respects booking_accepted preference' do
        preference.update(booking_accepted: false)
        expect(NotificationMailer).not_to receive(:booking_accepted_email)
        described_class.call(**params)
      end
    end

    context 'for review_received notification' do
      let(:params) { valid_params.merge(notification_type: 'review_received', related_id: 123) }

      it 'respects review_received preference' do
        preference.update(review_received: false)
        expect(NotificationMailer).not_to receive(:review_received_email)
        described_class.call(**params)
      end
    end
  end
end
