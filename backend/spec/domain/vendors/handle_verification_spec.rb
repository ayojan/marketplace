# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Vendors::HandleVerification do
  let(:vendor_user) { create(:user, :vendor) }
  let(:vendor) { vendor_user.vendor }

  describe '.call' do
    context 'when action is request' do
      it 'updates status to pending_verification' do
        described_class.call(vendor: vendor, action: :request)
        expect(vendor.verification_status).to eq('pending_verification')
      end
    end

    context 'when action is approve' do
      it 'updates status to verified' do
        described_class.call(vendor: vendor, action: :approve)
        expect(vendor.verification_status).to eq('verified')
        expect(vendor.verified_at).not_to be_nil
      end
    end

    context 'when action is reject' do
      it 'updates status to rejected and sets rejection reason' do
        reason = 'Missing documents'
        described_class.call(vendor: vendor, action: :reject, reason: reason)
        expect(vendor.verification_status).to eq('rejected')
        expect(vendor.rejection_reason).to eq(reason)
      end
    end

    context 'with unknown action' do
      it 'raises ArgumentError' do
        expect do
          described_class.call(vendor: vendor, action: :invalid)
        end.to raise_error(ArgumentError, /Unknown verification action/)
      end
    end
  end
end
