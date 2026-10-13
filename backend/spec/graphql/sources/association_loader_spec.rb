# frozen_string_literal: true

require 'rails_helper'

describe Sources::AssociationLoader do
  describe '#fetch' do
    let!(:first_vendor) { create(:vendor_profile) }
    let!(:second_vendor) { create(:vendor_profile) }
    let!(:first_service) { create(:service, vendor_profile: first_vendor) }
    let!(:second_service) { create(:service, vendor_profile: second_vendor) }

    it 'loads associations with a single preloader call' do
      services = [first_service, second_service]

      allow(ActiveRecord::Associations::Preloader).to receive(:new).and_call_original

      result = described_class.new(:vendor_profile).fetch(services)

      expect(ActiveRecord::Associations::Preloader).to have_received(:new).once
      expect(result).to eq([first_vendor, second_vendor])
    end

    it 'returns associations in the same order as input records' do
      services = [first_service, second_service]
      result = described_class.new(:vendor_profile).fetch(services)

      expect(result.map(&:id)).to eq([first_vendor.id, second_vendor.id])
    end

    it 'works with has_many associations' do
      first_reviews = create_list(:review, 2, vendor_profile: first_vendor)
      second_reviews = create_list(:review, 2, vendor_profile: second_vendor)

      vendors = [first_vendor, second_vendor]
      result = described_class.new(:reviews).fetch(vendors)

      expect(result[0]).to match_array(first_reviews)
      expect(result[1]).to match_array(second_reviews)
    end
  end
end
