# frozen_string_literal: true

require 'rails_helper'

RSpec.describe VendorVerificationPresenter do
  subject(:presenter) { described_class.new(vendor) }

  let(:services_relation) { instance_double(ActiveRecord::Relation, exists?: true) }
  let(:services_active_relation) { instance_double(ActiveRecord::Relation, exists?: true) }
  let(:services_association) { instance_double(ActiveRecord::Associations::HasManyAssociation, loaded?: false) }
  let(:vendor) do
    instance_double(
      Vendor,
      business_license: '07AABCT2345D1Z5',
      phone: '+91 98111 22334',
      location: 'Delhi NCR',
      profile_complete?: true,
      verification_verified?: true,
      verified_at: Time.current
    )
  end

  before do
    allow(vendor).to receive(:association).with(:services).and_return(services_association)
    allow(vendor).to receive(:services).and_return(services_relation)
    allow(services_relation).to receive(:active).and_return(services_active_relation)
  end

  describe '#to_h' do
    context 'when vendor meets all verification standards' do
      it 'returns completed status for all checks' do
        checks = presenter.to_h

        expect(checks[:business_license][:completed]).to be true
        expect(checks[:business_license][:value]).to eq('07AABCT2345D1Z5')
        expect(checks[:contact_verified][:completed]).to be true
        expect(checks[:profile_complete][:completed]).to be true
        expect(checks[:services_active][:completed]).to be true
        expect(checks[:curation_approved][:completed]).to be true
        expect(presenter.all_completed?).to be true
      end
    end

    context 'when business license is missing' do
      let(:vendor) do
        instance_double(
          Vendor,
          business_license: nil,
          phone: '+91 98111 22334',
          location: 'Delhi NCR',
          profile_complete?: true,
          verification_verified?: true,
          verified_at: Time.current
        )
      end

      it 'marks business_license check as incomplete' do
        checks = presenter.to_h

        expect(checks[:business_license][:completed]).to be false
        expect(presenter.all_completed?).to be false
      end
    end

    context 'when services association is loaded' do
      let(:services_association) { instance_double(ActiveRecord::Associations::HasManyAssociation, loaded?: true) }
      let(:active_service) { instance_double(Service, active?: true) }

      before do
        allow(vendor).to receive(:services).and_return([active_service])
      end

      it 'checks in-memory services' do
        checks = presenter.to_h
        expect(checks[:services_active][:completed]).to be true
      end
    end
  end

  describe '.call' do
    it 'returns the verification checks hash directly' do
      expect(described_class.call(vendor)).to eq(presenter.to_h)
    end
  end
end
