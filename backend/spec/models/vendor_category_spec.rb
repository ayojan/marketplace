# frozen_string_literal: true

# == Schema Information
#
# Table name: vendor_categories
#
#  id          :bigint           not null, primary key
#  is_primary  :boolean          default(FALSE), not null
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#  category_id :bigint           not null
#  vendor_id   :bigint           not null
#
# Indexes
#
#  index_vendor_categories_on_category_id                (category_id)
#  index_vendor_categories_on_vendor_id                  (vendor_id)
#  index_vendor_categories_on_vendor_id_and_category_id  (vendor_id,category_id) UNIQUE
#  index_vendor_categories_on_vendor_id_and_is_primary   (vendor_id,is_primary)
#
# Foreign Keys
#
#  fk_rails_...  (category_id => categories.id)
#  fk_rails_...  (vendor_id => vendors.id)
#
require 'rails_helper'

RSpec.describe VendorCategory do
  describe 'associations' do
    it { is_expected.to belong_to(:vendor) }
    it { is_expected.to belong_to(:category) }
  end

  describe 'validations' do
    subject { build(:vendor_category, vendor: vendor, category: category) }

    let(:vendor) { create(:user, :vendor).vendor }
    let(:category) { create(:category) }

    it { is_expected.to be_valid }

    describe 'category_id uniqueness scoped to vendor_id' do
      before { create(:vendor_category, vendor: vendor, category: category) }

      it 'rejects duplicate category for the same vendor' do
        duplicate = build(:vendor_category, vendor: vendor, category: category)
        expect(duplicate).not_to be_valid
        expect(duplicate.errors[:category_id]).to include('has already been taken')
      end

      it 'allows different vendor with the same category' do
        other_vendor = create(:user, :vendor).vendor
        another = build(:vendor_category, vendor: other_vendor, category: category)
        expect(another).to be_valid
      end
    end
  end

  describe 'scopes' do
    let(:vendor) { create(:user, :vendor).vendor }
    let(:primary_category) { create(:category) }
    let(:secondary_category) { create(:category) }
    let!(:primary_vc) { create(:vendor_category, :primary, vendor: vendor, category: primary_category) }
    let!(:secondary_vc) { create(:vendor_category, vendor: vendor, category: secondary_category, is_primary: false) }

    it 'returns primary categories via .primary' do
      expect(described_class.primary).to include(primary_vc)
      expect(described_class.primary).not_to include(secondary_vc)
    end

    it 'returns secondary categories via .secondary' do
      expect(described_class.secondary).to include(secondary_vc)
      expect(described_class.secondary).not_to include(primary_vc)
    end
  end
end
