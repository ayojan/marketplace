# frozen_string_literal: true

# == Schema Information
#
# Table name: vendor_services
#
#  id         :bigint           not null, primary key
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  service_id :bigint           not null
#  vendor_id  :bigint           not null
#
# Indexes
#
#  index_vendor_services_on_service_id                (service_id)
#  index_vendor_services_on_vendor_id                 (vendor_id)
#  index_vendor_services_on_vendor_id_and_service_id  (vendor_id,service_id) UNIQUE
#
# Foreign Keys
#
#  fk_rails_...  (service_id => services.id)
#  fk_rails_...  (vendor_id => vendors.id)
#
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
