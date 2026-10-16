# frozen_string_literal: true

# == Schema Information
#
# Table name: customer_favorites
#
#  id         :bigint           not null, primary key
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  user_id    :bigint           not null
#  vendor_id  :bigint           not null
#
# Indexes
#
#  index_customer_favorites_on_user_id                (user_id)
#  index_customer_favorites_on_user_id_and_vendor_id  (user_id,vendor_id) UNIQUE
#  index_customer_favorites_on_vendor_id              (vendor_id)
#
# Foreign Keys
#
#  fk_rails_...  (user_id => users.id)
#  fk_rails_...  (vendor_id => vendors.id)
#
require 'rails_helper'

RSpec.describe CustomerFavorite do
  describe 'associations' do
    it { is_expected.to belong_to(:user) }
    it { is_expected.to belong_to(:vendor) }
  end

  describe 'validations' do
    describe 'uniqueness' do
      let(:user) { create(:user) }
      let(:vendor) { create(:vendor) }

      before { create(:customer_favorite, user: user, vendor: vendor) }

      it 'prevents the same user from favoriting the same vendor twice' do
        duplicate = described_class.new(user: user, vendor: vendor)
        expect(duplicate).not_to be_valid
        expect(duplicate.errors[:user_id]).to be_present
      end
    end
  end

  describe 'scopes' do
    let(:first_user) { create(:user) }
    let(:second_user) { create(:user) }
    let(:first_vendor) { create(:vendor) }
    let(:second_vendor) { create(:vendor) }

    before do
      create(:customer_favorite, user: first_user, vendor: first_vendor)
      create(:customer_favorite, user: first_user, vendor: second_vendor)
      create(:customer_favorite, user: second_user, vendor: first_vendor)
    end

    describe '.for_user' do
      it 'returns only favorites for the specified user' do
        expect(described_class.for_user(first_user.id).count).to eq(2)
        expect(described_class.for_user(second_user.id).count).to eq(1)
      end
    end

    describe '.by_vendor' do
      it 'returns only favorites for the specified vendor' do
        expect(described_class.by_vendor(first_vendor.id).count).to eq(2)
        expect(described_class.by_vendor(second_vendor.id).count).to eq(1)
      end
    end

    describe '.recent_first' do
      it 'returns favorites ordered by created_at descending' do
        favorites = described_class.recent_first
        expect(favorites.first.created_at).to be >= favorites.last.created_at
      end
    end
  end

  describe 'counter_cache' do
    let(:vendor) { create(:vendor) }

    it 'updates vendor favorites_count on create' do
      expect(vendor.favorites_count).to eq(0)
      create(:customer_favorite, vendor: vendor)
      vendor.reload
      expect(vendor.favorites_count).to eq(1)
    end

    it 'updates vendor favorites_count on destroy' do
      favorite = create(:customer_favorite, vendor: vendor)
      vendor.reload
      expect(vendor.favorites_count).to eq(1)
      favorite.destroy
      vendor.reload
      expect(vendor.favorites_count).to eq(0)
    end
  end
end
