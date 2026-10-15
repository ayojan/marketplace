# frozen_string_literal: true

require 'rails_helper'

RSpec.describe WelcomeNotificationJob do
  let(:user) { create(:user, :customer, first_name: 'Priya', email: 'priya@example.com') }
  let(:idempotency_key) { JobIdempotencyCache.generate_key('WelcomeNotificationJob', user.id) }
  let(:memory_cache) { ActiveSupport::Cache::MemoryStore.new }

  before do
    allow(Rails).to receive(:cache).and_return(memory_cache)
    user # Ensure user is created before resetting cache
    JobIdempotencyCache.clear(idempotency_key)
  end

  describe '#perform' do
    let(:mailer_delivery) { instance_double(ActionMailer::MessageDelivery, deliver_now: true) }

    it 'delivers the welcome email and marks job as processed' do
      allow(UserMailer).to receive(:welcome_email).with(user).and_return(mailer_delivery)

      described_class.perform_now(user.id)

      expect(UserMailer).to have_received(:welcome_email).with(user)
      expect(mailer_delivery).to have_received(:deliver_now)
      expect(JobIdempotencyCache.processed?(idempotency_key)).to be true
    end

    it 'does not send duplicate email if job is retried after being processed' do
      JobIdempotencyCache.mark_processed(idempotency_key)
      allow(UserMailer).to receive(:welcome_email)

      described_class.perform_now(user.id)

      expect(UserMailer).not_to have_received(:welcome_email)
    end

    it 'discards job when user is not found' do
      expect do
        described_class.perform_now(999_999)
      end.not_to raise_error
    end
  end
end
