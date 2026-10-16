# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Service::Pricing do
  subject(:service) { build(:service) }

  describe 'enum' do
    it {
      expect(service).to define_enum_for(:pricing_type)
        .with_values(hourly: 'hourly', package: 'package', custom: 'custom')
        .backed_by_column_of_type(:string)
    }
  end

  describe 'validations' do
    it { is_expected.to validate_presence_of(:pricing_type) }
    it { is_expected.to validate_numericality_of(:base_price).is_greater_than(0).is_less_than(1_000_000) }

    describe '#base_price_required_for_non_custom_pricing' do
      it 'allows nil base_price for custom pricing' do
        service.pricing_type = :custom
        service.base_price = nil
        expect(service).to be_valid
      end

      it 'requires base_price for hourly pricing' do
        service.pricing_type = :hourly
        service.base_price = nil
        expect(service).not_to be_valid
        expect(service.errors[:base_price]).to include('must be present and greater than 0 for non-custom pricing')
      end

      it 'requires base_price for package pricing' do
        service.pricing_type = :package
        service.base_price = 0
        expect(service).not_to be_valid
        expect(service.errors[:base_price]).to include('must be present and greater than 0 for non-custom pricing')
      end
    end
  end

  describe 'predicate methods' do
    it 'returns correct boolean for pricing type' do
      service.pricing_type = :hourly
      expect(service.hourly_pricing?).to be true
      expect(service.package_pricing?).to be false
      expect(service.custom_pricing?).to be false

      service.pricing_type = :package
      expect(service.package_pricing?).to be true

      service.pricing_type = :custom
      expect(service.custom_pricing?).to be true
    end
  end

  describe '#formatted_base_price' do
    it 'formats custom pricing' do
      service.pricing_type = :custom
      expect(service.formatted_base_price).to eq('Custom Quote')
    end

    it 'formats hourly pricing' do
      service.pricing_type = :hourly
      service.base_price = 150
      expect(service.formatted_base_price).to eq('150.0/hour')
    end

    it 'formats package pricing' do
      service.pricing_type = :package
      service.base_price = 1200
      expect(service.formatted_base_price).to eq('1200.0')
    end
  end

  describe 'class methods' do
    describe '.available_pricing_types' do
      it 'returns humanized pairs' do
        expect(Service.available_pricing_types).to eq([%w[Hourly hourly], %w[Package package], %w[Custom custom]])
      end
    end

    describe '.filter_by_price_range' do
      let!(:cheap) { create(:service, base_price: 100) }
      let!(:expensive) { create(:service, base_price: 1000) }

      it 'filters by min and max' do
        results = Service.filter_by_price_range(50, 500)
        expect(results).to include(cheap)
        expect(results).not_to include(expensive)
      end
    end
  end
end
