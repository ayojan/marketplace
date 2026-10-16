# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Customers::ToggleFavorite do
  let(:user) { create(:user, :customer) }
  let(:vendor) { create(:vendor) }

  describe '#call' do
    context 'when adding a favorite' do
      it 'creates a favorite relationship' do
        expect do
          described_class.call(user: user, vendor_id: vendor.id)
        end.to change(CustomerFavorite, :count).by(1)
      end

      it 'returns success response with is_favorited true' do
        result = described_class.call(user: user, vendor_id: vendor.id)
        expect(result[:success]).to be(true)
        expect(result[:is_favorited]).to be(true)
        expect(result[:action]).to eq('added')
      end

      it 'increments vendor favorites_count' do
        vendor.reload
        initial_count = vendor.favorites_count
        described_class.call(user: user, vendor_id: vendor.id)
        vendor.reload
        expect(vendor.favorites_count).to eq(initial_count + 1)
      end
    end

    context 'when removing a favorite' do
      before do
        create(:customer_favorite, user: user, vendor: vendor)
      end

      it 'destroys the favorite relationship' do
        expect do
          described_class.call(user: user, vendor_id: vendor.id)
        end.to change(CustomerFavorite, :count).by(-1)
      end

      it 'returns success response with is_favorited false' do
        result = described_class.call(user: user, vendor_id: vendor.id)
        expect(result[:success]).to be(true)
        expect(result[:is_favorited]).to be(false)
        expect(result[:action]).to eq('removed')
      end

      it 'decrements vendor favorites_count' do
        vendor.reload
        initial_count = vendor.favorites_count
        described_class.call(user: user, vendor_id: vendor.id)
        vendor.reload
        expect(vendor.favorites_count).to eq(initial_count - 1)
      end
    end

    context 'when vendor does not exist' do
      it 'returns failure with error message' do
        result = described_class.call(user: user, vendor_id: 999_999)
        expect(result[:success]).to be(false)
        expect(result[:error]).to eq('Vendor not found')
      end
    end

    context 'when user is not authorized to favorite vendor' do
      let(:unauthorized_user) { create(:user, :vendor) }

      before do
        allow(Auth::AuthorizationService).to receive(:authorize!)
          .and_raise(Auth::AuthorizationService::NotAuthorizedError, 'Not authorized to favorite this vendor')
      end

      it 'returns failure with authorization error message' do
        result = described_class.call(user: unauthorized_user, vendor_id: vendor.id)
        expect(result[:success]).to be(false)
        expect(result[:error]).to eq('Not authorized to favorite this vendor')
      end

      it 'does not create a favorite' do
        expect do
          described_class.call(user: unauthorized_user, vendor_id: vendor.id)
        end.not_to change(CustomerFavorite, :count)
      end
    end
  end
end
