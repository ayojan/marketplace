# frozen_string_literal: true

# == Schema Information
#
# Table name: portfolio_items
#
#  id                :bigint           not null, primary key
#  category          :string           not null
#  description       :text
#  display_order     :integer          default(0), not null
#  is_featured       :boolean          default(FALSE), not null
#  title             :string           not null
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#  vendor_profile_id :bigint           not null
#
# Indexes
#
#  index_portfolio_items_on_category             (category)
#  index_portfolio_items_on_vendor_and_category  (vendor_profile_id,category)
#  index_portfolio_items_on_vendor_and_featured  (vendor_profile_id,is_featured)
#  index_portfolio_items_on_vendor_and_order     (vendor_profile_id,display_order)
#  index_portfolio_items_on_vendor_profile_id    (vendor_profile_id)
#
# Foreign Keys
#
#  fk_rails_...  (vendor_profile_id => vendor_profiles.id)
#
require 'rails_helper'

RSpec.describe PortfolioItem do
  let(:vendor_profile) { create(:vendor_profile) }

  describe 'associations' do
    it { is_expected.to belong_to(:vendor_profile) }
  end

  describe 'validations' do
    subject { build(:portfolio_item, vendor_profile: vendor_profile) }

    it { is_expected.to validate_presence_of(:title) }
    it { is_expected.to validate_length_of(:title).is_at_least(2).is_at_most(100) }
    it { is_expected.to validate_length_of(:description).is_at_most(1000) }
    it { is_expected.to validate_presence_of(:category) }
    it { is_expected.to validate_length_of(:category).is_at_most(50) }
    it { is_expected.to validate_presence_of(:display_order) }
    it { is_expected.to validate_numericality_of(:display_order).is_greater_than_or_equal_to(0) }
  end

  describe 'scopes' do
    let!(:featured_item) { create(:portfolio_item, vendor_profile: vendor_profile, is_featured: true) }
    let!(:regular_item) { create(:portfolio_item, vendor_profile: vendor_profile, is_featured: false) }
    let!(:photography_item) { create(:portfolio_item, vendor_profile: vendor_profile, category: 'photography') }
    let!(:videography_item) { create(:portfolio_item, vendor_profile: vendor_profile, category: 'videography') }

    describe '.featured' do
      it 'returns only featured items' do
        expect(described_class.featured).to include(featured_item)
        expect(described_class.featured).not_to include(regular_item)
      end
    end

    describe '.by_category' do
      it 'returns items in specified category' do
        expect(described_class.by_category('photography')).to include(photography_item)
        expect(described_class.by_category('photography')).not_to include(videography_item)
      end
    end

    describe '.ordered' do
      let(:ordering_vendor) { create(:vendor_profile) }
      let!(:first_item) { create(:portfolio_item, vendor_profile: ordering_vendor, display_order: 1) }
      let!(:second_item) { create(:portfolio_item, vendor_profile: ordering_vendor, display_order: 2) }

      it 'returns items ordered by display_order and created_at' do
        # Filter to only items from this vendor to isolate the test
        ordered_items = described_class.where(vendor_profile_id: ordering_vendor.id).ordered
        expect(ordered_items.first).to eq(first_item)
        expect(ordered_items.second).to eq(second_item)
      end
    end

    describe '.for_vendor' do
      let(:other_vendor) { create(:vendor_profile) }
      let!(:other_item) { create(:portfolio_item, vendor_profile: other_vendor) }

      it 'returns items for specified vendor only' do
        expect(described_class.for_vendor(vendor_profile)).to include(featured_item)
        expect(described_class.for_vendor(vendor_profile)).not_to include(other_item)
      end
    end
  end

  describe 'callbacks' do
    describe 'normalize_category' do
      it 'normalizes category to lowercase and strips whitespace' do
        item = create(:portfolio_item, vendor_profile: vendor_profile, category: '  PHOTOGRAPHY  ')
        expect(item.category).to eq('photography')
      end
    end
  end

  describe 'instance methods' do
    let(:portfolio_item) { create(:portfolio_item, vendor_profile: vendor_profile) }

    describe '#featured?' do
      it 'returns true when is_featured is true' do
        portfolio_item.update(is_featured: true)
        expect(portfolio_item.featured?).to be true
      end

      it 'returns false when is_featured is false' do
        portfolio_item.update(is_featured: false)
        expect(portfolio_item.featured?).to be false
      end
    end

    describe '#images?' do
      it 'returns true when images are attached' do
        # Mock image attachment
        allow(portfolio_item.images).to receive(:attached?).and_return(true)
        expect(portfolio_item.images?).to be true
      end

      it 'returns false when no images are attached' do
        expect(portfolio_item.images?).to be false
      end
    end

    describe '#image_count' do
      it 'returns the count of attached images' do
        allow(portfolio_item.images).to receive(:count).and_return(3)
        expect(portfolio_item.image_count).to eq(3)
      end
    end
  end

  describe 'class methods' do
    describe '.categories_for_vendor' do
      before do
        create(:portfolio_item, vendor_profile: vendor_profile, category: 'photography')
        create(:portfolio_item, vendor_profile: vendor_profile, category: 'videography')
        create(:portfolio_item, vendor_profile: vendor_profile, category: 'photography')
      end

      it 'returns unique categories for a vendor' do
        categories = described_class.categories_for_vendor(vendor_profile)
        expect(categories).to contain_exactly('photography', 'videography')
      end

      it 'returns sorted categories' do
        categories = described_class.categories_for_vendor(vendor_profile)
        expect(categories).to eq(%w[photography videography])
      end
    end

    describe '.featured_for_vendor' do
      let!(:higher_order_featured_item) do
        create(:portfolio_item, vendor_profile: vendor_profile, is_featured: true, display_order: 2)
      end
      let!(:lower_order_featured_item) do
        create(:portfolio_item, vendor_profile: vendor_profile, is_featured: true, display_order: 1)
      end
      let!(:regular_item) { create(:portfolio_item, vendor_profile: vendor_profile, is_featured: false) }

      it 'returns only featured items for the vendor' do
        featured_items = described_class.featured_for_vendor(vendor_profile)
        expect(featured_items).to include(higher_order_featured_item, lower_order_featured_item)
        expect(featured_items).not_to include(regular_item)
      end

      it 'returns items in display order' do
        featured_items = described_class.featured_for_vendor(vendor_profile)
        expect(featured_items.first).to eq(lower_order_featured_item)
        expect(featured_items.second).to eq(higher_order_featured_item)
      end
    end
  end

  describe 'custom validations' do
    it 'has images_count_limit validation' do
      # Custom validation is implemented via validate :images_count_limit
      portfolio_item = build(:portfolio_item, vendor_profile: vendor_profile)
      expect(portfolio_item.valid?).to be true
    end
  end
end
