# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Auth::AuthorizationService do
  let(:vendor_user) { create(:user, :vendor) }
  let(:vendor) { vendor_user.vendor }
  let(:customer) { create(:user, :customer) }
  let(:other_user) { create(:user, :customer) }

  describe '.authorize!' do
    context 'when authorization succeeds' do
      it 'returns true' do
        expect(described_class.authorize!(customer, vendor, :toggle_favorite)).to be true
      end
    end

    context 'when user is not authenticated' do
      it 'raises NotAuthenticatedError' do
        expect do
          described_class.authorize!(nil, vendor, :toggle_favorite)
        end.to raise_error(Auth::AuthorizationService::NotAuthenticatedError, /not authenticated/)
      end
    end

    context 'when user is not authorized' do
      it 'raises NotAuthorizedError' do
        expect do
          described_class.authorize!(vendor_user, vendor, :toggle_favorite)
        end.to raise_error(Auth::AuthorizationService::NotAuthorizedError, /not authorized/)
      end
    end

    context 'with different policy actions' do
      it 'checks the correct action on the policy' do
        expect do
          described_class.authorize!(other_user, vendor, :update)
        end.to raise_error(Auth::AuthorizationService::NotAuthorizedError)

        expect(described_class.authorize!(vendor_user, vendor, :update)).to be true
      end
    end
  end
end
