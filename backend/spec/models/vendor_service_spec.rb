# frozen_string_literal: true

require 'rails_helper'

RSpec.describe VendorService do
  describe 'associations' do
    it { is_expected.to belong_to(:vendor) }
    it { is_expected.to belong_to(:service) }
  end

  describe 'validations' do
    subject { build(:vendor_service, vendor: vendor, service: service) }

    let(:vendor) { create(:vendor) }
    let(:service) { create(:service) }

    it { is_expected.to be_valid }

    describe 'vendor_id uniqueness' do
      before { create(:vendor_service, vendor: vendor, service: service) }

      it 'validates uniqueness scoped to service_id' do
        duplicate = build(:vendor_service, vendor: vendor, service: service)
        expect(duplicate).not_to be_valid
        expect(duplicate.errors[:vendor_id]).to include('has already been taken')
      end

      it 'allows same vendor with different service' do
        other_service = create(:service)
        another = build(:vendor_service, vendor: vendor, service: other_service)
        expect(another).to be_valid
      end
    end
  end
end
