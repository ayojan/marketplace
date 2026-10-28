# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Vendor::Sluggable do
  # Sluggable is included in Vendor — test behaviour through the real model
  subject(:vendor) { build(:vendor, slug: nil) }

  describe 'included validations' do
    it do
      expect(build(:vendor, slug: 'valid-vendor-slug'))
        .to validate_uniqueness_of(:slug).case_insensitive
    end

    it 'declares presence validator on slug' do
      expect(Vendor.validators_on(:slug).map(&:class))
        .to include(ActiveRecord::Validations::PresenceValidator)
    end
  end

  describe 'slug auto-generation (before_validation callback)' do
    it 'generates a slug from business_name on create' do
      vendor.save!
      expect(vendor.slug).to eq(vendor.business_name.parameterize)
    end

    it 'falls back to "vendor" when business_name produces an empty parameterized string' do
      vendor.business_name = '***'
      vendor.save!
      expect(vendor.slug).to eq('vendor')
    end

    it 'does not overwrite an already-present slug' do
      vendor.slug = 'my-custom-slug'
      vendor.save!
      expect(vendor.slug).to eq('my-custom-slug')
    end
  end

  describe '#to_param' do
    it 'returns the slug' do
      vendor.save!
      expect(vendor.to_param).to eq(vendor.slug)
    end

    it 'falls back to id.to_s when slug is blank' do
      vendor.save!
      vendor.slug = ''
      expect(vendor.to_param).to eq(vendor.id.to_s)
    end
  end

  describe '.find_by_id_or_slug' do
    let!(:persisted) { create(:vendor) }

    it 'finds by exact slug' do
      expect(Vendor.find_by_id_or_slug(persisted.slug)).to eq(persisted)
    end

    it 'finds by slug case-insensitively' do
      expect(Vendor.find_by_id_or_slug(persisted.slug.upcase)).to eq(persisted)
    end

    it 'finds by numeric id (integer)' do
      expect(Vendor.find_by_id_or_slug(persisted.id)).to eq(persisted)
    end

    it 'finds by numeric id (string)' do
      expect(Vendor.find_by_id_or_slug(persisted.id.to_s)).to eq(persisted)
    end

    it 'returns nil for a non-existent slug' do
      expect(Vendor.find_by_id_or_slug('no-such-vendor')).to be_nil
    end

    it 'returns nil for a non-existent id' do
      expect(Vendor.find_by_id_or_slug(999_999)).to be_nil
    end

    it 'returns nil for blank input' do
      expect(Vendor.find_by_id_or_slug('')).to be_nil
      expect(Vendor.find_by_id_or_slug(nil)).to be_nil
    end
  end

  describe '.find_by_id_or_slug!' do
    let!(:persisted) { create(:vendor) }

    it 'returns the record when found' do
      expect(Vendor.find_by_id_or_slug!(persisted.slug)).to eq(persisted)
    end

    it 'raises ActiveRecord::RecordNotFound when not found' do
      expect { Vendor.find_by_id_or_slug!('ghost-slug') }
        .to raise_error(ActiveRecord::RecordNotFound, /ghost-slug/)
    end
  end

  describe '.next_available_slug' do
    let!(:base_vendor) { create(:vendor, slug: 'royal-weddings') }

    it 'returns the base slug when no collision exists' do
      expect(Vendor.next_available_slug('Totally New Name')).to eq('totally-new-name')
    end

    it 'returns base-2 on first collision' do
      expect(Vendor.next_available_slug('Royal Weddings')).to eq('royal-weddings-2')
    end

    it 'increments past existing suffixed slugs' do
      create(:vendor, slug: 'royal-weddings-2')
      create(:vendor, slug: 'royal-weddings-5')
      # highest is 5, next is 6
      expect(Vendor.next_available_slug('Royal Weddings')).to eq('royal-weddings-6')
    end

    it 'excludes the current record when current_id is supplied (update scenario)' do
      # The vendor with slug "royal-weddings" should not count as a collision against itself
      expect(Vendor.next_available_slug('Royal Weddings', current_id: base_vendor.id))
        .to eq('royal-weddings')
    end
  end
end
