# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Services::CreateService do
  subject(:service_creator) { described_class.new(user: user, params: params) }

  let(:user) { create(:user, :vendor) }
  let(:category) { create(:category) }
  let(:valid_params) do
    {
      service: {
        name: 'Grand Wedding Photography',
        description: 'Comprehensive wedding photography coverage with edited high resolution photos',
        base_price: 2500,
        pricing_type: 'package',
        status: 'active',
        category_id: category.id
      }
    }
  end

  describe '#call' do
    context 'with valid parameters' do
      let(:params) { valid_params }

      it 'creates the service, links VendorService, and associates category' do
        expect do
          result = service_creator.call
          expect(result[:success]).to be true
          expect(result[:service]).to be_persisted
          expect(result[:service].categories).to include(category)
          expect(user.vendor.services).to include(result[:service])
          expect(VendorService.exists?(vendor: user.vendor, service: result[:service])).to be true
        end.to change(Service, :count).by(1)
      end
    end

    context 'when user has no vendor record' do
      before { user.vendor.destroy }

      let(:params) { valid_params }

      it 'auto-creates vendor and creates the service' do
        expect(user.reload.vendor).to be_nil
        result = service_creator.call
        expect(result[:success]).to be true
        expect(user.reload.vendor).to be_present
        expect(user.vendor.services).to include(result[:service])
      end
    end

    context 'with invalid parameters' do
      let(:params) do
        {
          service: {
            name: 'AB',
            description: 'Too short',
            pricing_type: 'hourly'
          }
        }
      end

      it 'returns failure with validation errors' do
        result = service_creator.call
        expect(result[:success]).to be false
        expect(result[:errors]).to be_an(Array)
        expect(result[:errors]).to include(/is too short/)
      end
    end
  end
end
