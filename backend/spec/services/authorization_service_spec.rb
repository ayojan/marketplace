# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AuthorizationService do
  let(:vendor_user) { create(:user, :vendor) }
  let(:vendor_profile) { vendor_user.vendor_profile }
  let(:customer) { create(:user, :customer) }
  let(:other_user) { create(:user, :customer) }

  describe '.authorize!' do
    context 'when authorization succeeds' do
      it 'returns true' do
        expect(described_class.authorize!(customer, vendor_profile, :toggle_favorite)).to be true
      end
    end

    context 'when user is not authenticated' do
      it 'raises NotAuthenticatedError' do
        expect do
          described_class.authorize!(nil, vendor_profile, :toggle_favorite)
        end.to raise_error(AuthorizationService::NotAuthenticatedError, /not authenticated/)
      end
    end

    context 'when user is not authorized' do
      it 'raises NotAuthorizedError' do
        expect do
          described_class.authorize!(vendor_user, vendor_profile, :toggle_favorite)
        end.to raise_error(AuthorizationService::NotAuthorizedError, /not authorized/)
      end
    end

    context 'with different policy actions' do
      it 'checks the correct action on the policy' do
        expect do
          described_class.authorize!(other_user, vendor_profile, :update)
        end.to raise_error(AuthorizationService::NotAuthorizedError)

        expect(described_class.authorize!(vendor_user, vendor_profile, :update)).to be true
      end
    end
  end
end
