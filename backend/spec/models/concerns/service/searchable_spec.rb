# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Service::Searchable do
  let(:category) { create(:category) }
  let(:vendor) { create(:vendor, verification_status: :verified) }
  let!(:service) do
    create(:service,
           name: 'Bridal Makeup',
           description: 'Exceptional bridal makeup services for weddings and special occasions with professional touch',
           vendor: vendor)
  end

  before do
    create(:service_category, service: service, category: category)
  end

  describe 'scopes' do
    it 'filters by category' do
      other_category = create(:category)
      expect(Service.by_category(category)).to include(service)
      expect(Service.by_category(other_category)).not_to include(service)
    end

    it 'filters by vendor' do
      other_vendor = create(:vendor)
      expect(Service.by_vendor(vendor)).to include(service)
      expect(Service.by_vendor(other_vendor)).not_to include(service)
    end

    it 'searches by name' do
      expect(Service.search_by_name('makeup')).to include(service)
      expect(Service.search_by_name('catering')).not_to include(service)
    end

    it 'searches by description' do
      expect(Service.search_by_description('exceptional')).to include(service)
      expect(Service.search_by_description('nonexistent')).not_to include(service)
    end
  end

  describe 'methods' do
    it 'returns primary category via #service_category' do
      expect(service.service_category).to eq(category)
    end

    it 'returns name via #display_name' do
      expect(service.display_name).to eq('Bridal Makeup')
    end

    it 'truncates long description in #short_description' do
      result = service.short_description(20)
      expect(result.length).to be <= 23
      expect(result).to end_with('...')
    end
  end

  describe 'class methods' do
    describe '.featured' do
      it 'returns active services from verified vendors' do
        service.update!(status: :active)
        expect(Service.featured).to include(service)
      end
    end

    describe '.search' do
      it 'searches across name and description' do
        expect(Service.search('bridal')).to include(service)
        expect(Service.search('wedding')).to include(service)
        expect(Service.search('DJ')).not_to include(service)
      end
    end

    describe '.filter_by_category' do
      it 'filters services by category id' do
        expect(Service.filter_by_category(category.id)).to include(service)
      end
    end
  end
end
