# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Auth::VendorOnboardingService do
  let!(:category) { create(:category, name: 'Photography', slug: 'photography') }
  let(:vendor_user) { create(:user, :with_vendor) }
  let(:vendor) { vendor_user.vendor }

  describe '.clean_vendor_attributes' do
    it 'removes raw category parameters from vendor_attributes' do
      permitted = {
        first_name: 'Amit',
        last_name: 'Sharma',
        vendor_attributes: {
          business_name: 'Amit Visuals',
          category: 'Photography',
          category_id: 1,
          category_ids: [1, 2],
          primary_category_id: 1,
          description: 'A dedicated team of award winning photographers specializing in weddings.'
        }
      }

      described_class.clean_vendor_attributes(permitted)

      attrs = permitted[:vendor_attributes]
      expect(attrs).not_to have_key(:category)
      expect(attrs).not_to have_key(:category_id)
      expect(attrs).not_to have_key(:category_ids)
      expect(attrs).not_to have_key(:primary_category_id)
      expect(attrs[:business_name]).to eq('Amit Visuals')
    end

    it 'normalizes short vendor descriptions to default bio' do
      permitted = {
        first_name: 'Amit',
        last_name: 'Sharma',
        vendor_attributes: {
          business_name: 'Amit Visuals',
          location: 'Delhi NCR',
          description: 'Short bio'
        }
      }

      described_class.clean_vendor_attributes(permitted)

      expect(permitted[:vendor_attributes][:description]).to include('Professional Short bio by Amit Visuals')
    end
  end

  describe '.extract_raw_category_param' do
    it 'extracts category from nested vendor_attributes' do
      params = { auth: { vendor_attributes: { category_ids: [1, 2] } } }
      expect(described_class.extract_raw_category_param(params)).to eq([1, 2])
    end

    it 'extracts category from top-level category' do
      params = { auth: { category: 'Photography' } }
      expect(described_class.extract_raw_category_param(params)).to eq('Photography')
    end
  end

  describe '.attach_initial_category' do
    it 'syncs category and creates a starter service' do
      expect do
        described_class.attach_initial_category(vendor, raw_category_param: 'Photography')
      end.to change(vendor.services, :count).by(1)

      expect(vendor.reload.categories).to include(category)
      service = vendor.services.last
      expect(service.name).to include(category.name)
      expect(service.categories).to include(category)
    end

    it 'handles matching by numeric category id' do
      described_class.attach_initial_category(vendor, raw_category_param: category.id.to_s)
      expect(vendor.reload.categories).to include(category)
    end
  end
end
