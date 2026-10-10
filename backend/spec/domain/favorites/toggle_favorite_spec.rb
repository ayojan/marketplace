# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Favorites::ToggleFavorite do
  let(:user) { create(:user, :customer) }
  let(:vendor) { create(:vendor_profile) }

  describe '#call' do
    context 'when adding a favorite' do
      it 'creates a favorite relationship' do
        expect do
          described_class.call(user: user, vendor_profile_id: vendor.id)
        end.to change(CustomerFavorite, :count).by(1)
      end

      it 'returns success response with is_favorited true' do
        result = described_class.call(user: user, vendor_profile_id: vendor.id)
        expect(result[:success]).to be(true)
        expect(result[:is_favorited]).to be(true)
        expect(result[:action]).to eq('added')
      end

      it 'increments vendor favorites_count' do
        vendor.reload
        initial_count = vendor.favorites_count
        described_class.call(user: user, vendor_profile_id: vendor.id)
        vendor.reload
        expect(vendor.favorites_count).to eq(initial_count + 1)
      end
    end

    context 'when removing a favorite' do
      before { create(:customer_favorite, user: user, vendor_profile: vendor) }

      it 'destroys the favorite relationship' do
        expect do
          described_class.call(user: user, vendor_profile_id: vendor.id)
        end.to change(CustomerFavorite, :count).by(-1)
      end

      it 'returns success response with is_favorited false' do
        result = described_class.call(user: user, vendor_profile_id: vendor.id)
        expect(result[:success]).to be(true)
        expect(result[:is_favorited]).to be(false)
        expect(result[:action]).to eq('removed')
      end

      it 'decrements vendor favorites_count' do
        vendor.reload
        initial_count = vendor.favorites_count
        described_class.call(user: user, vendor_profile_id: vendor.id)
        vendor.reload
        expect(vendor.favorites_count).to eq(initial_count - 1)
      end
    end

    context 'when vendor does not exist' do
      it 'returns failure response' do
        result = described_class.call(user: user, vendor_profile_id: -1)
        expect(result[:success]).to be(false)
        expect(result[:error]).to eq('Vendor not found')
      end
    end

    context 'when vendor tries to favorite' do
      let(:vendor_user) { create(:user, :vendor) }
      let(:vendor_profile) { vendor_user.vendor_profile }

      it 'returns authorization failure' do
        result = described_class.call(user: vendor_user, vendor_profile_id: vendor_profile.id)
        expect(result[:success]).to be(false)
        expect(result[:error]).to include('not authorized')
      end
    end

    context 'when user tries to favorite their own vendor' do
      let(:customer_user) { create(:user, :customer) }
      let(:own_vendor) { create(:vendor_profile, user: customer_user) }

      it 'returns authorization failure' do
        result = described_class.call(user: customer_user, vendor_profile_id: own_vendor.id)
        expect(result[:success]).to be(false)
        expect(result[:error]).to include('not authorized')
      end
    end
  end
end
