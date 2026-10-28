# frozen_string_literal: true

# == Schema Information
#
# Table name: categories
#
#  id          :bigint           not null, primary key
#  active      :boolean          default(TRUE)
#  description :text
#  icon        :string
#  metadata    :jsonb
#  name        :string
#  slug        :string
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#
# Indexes
#
#  index_categories_on_name_tsvector  (to_tsvector('english'::regconfig, (COALESCE(name, ''::character varying))::text)) USING gin
#  index_categories_on_slug           (slug) UNIQUE
#
require 'rails_helper'

RSpec.describe Category do
  describe 'associations' do
    it { is_expected.to have_many(:service_categories).dependent(:destroy) }
    it { is_expected.to have_many(:services).through(:service_categories) }
    it { is_expected.to have_many(:vendor_categories).dependent(:destroy) }
    it { is_expected.to have_many(:vendors).through(:vendor_categories) }
  end

  describe 'validations' do
    subject { build(:category) }

    it { is_expected.to validate_presence_of(:name) }
    it { is_expected.to validate_uniqueness_of(:name) }
    it { is_expected.to validate_length_of(:name).is_at_least(2).is_at_most(50) }

    it { is_expected.to validate_uniqueness_of(:slug) }

    describe 'slug format validation' do
      it 'allows valid slugs' do
        category = build(:category, slug: 'photography', name: 'Photography')
        expect(category).to be_valid

        category = build(:category, slug: 'event-management', name: 'Event Management')
        expect(category).to be_valid

        category = build(:category, slug: 'makeup_beauty', name: 'Makeup Beauty')
        expect(category).to be_valid
      end

      it 'rejects invalid slugs' do
        category = build(:category, slug: 'Photography', name: 'Photography')
        expect(category).not_to be_valid
        expect(category.errors[:slug]).to be_present

        category = build(:category, slug: 'event management', name: 'Event Management')
        expect(category).not_to be_valid
        expect(category.errors[:slug]).to be_present

        category = build(:category, slug: 'event@management', name: 'Event Management')
        expect(category).not_to be_valid
        expect(category.errors[:slug]).to be_present
      end
    end
  end

  describe 'scopes' do
    before do
      create(:category, active: true, name: 'Photography')
      create(:category, active: false, name: 'Videography')
    end

    describe '.active' do
      it 'returns only active categories' do
        expect(described_class.active.count).to eq(1)
        expect(described_class.active.first.name).to eq('Photography')
      end
    end

    describe '.ordered' do
      it 'returns categories ordered by name' do
        categories = described_class.ordered
        expect(categories.first.name).to eq('Photography')
        expect(categories.second.name).to eq('Videography')
      end
    end
  end

  describe 'callbacks' do
    describe 'generate_slug' do
      it 'generates slug from name if blank' do
        category = create(:category, name: 'Wedding Planning')
        expect(category.slug).to eq('wedding-planning')
      end

      it 'does not overwrite existing slug' do
        category = create(:category, name: 'Photography', slug: 'photo')
        expect(category.slug).to eq('photo')
      end
    end
  end

  describe 'instance methods' do
    let(:category) { create(:category, active: true) }

    describe '#active?' do
      it 'returns true when active is true' do
        expect(category.active?).to be true
      end

      it 'returns false when active is false' do
        category.update(active: false)
        expect(category.active?).to be false
      end
    end

    describe '#to_param' do
      it 'returns the slug' do
        expect(category.to_param).to eq(category.slug)
      end
    end
  end
end
