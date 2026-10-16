# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Services::UpdateService do
  subject(:service_updater) { described_class.new(service: service, params: params) }

  let(:service) { create(:service) }
  let(:old_category) { create(:category) }
  let(:new_category) { create(:category) }

  before do
    service.categories << old_category
  end

  describe '#call' do
    context 'with valid parameters' do
      let(:params) do
        {
          service: {
            name: 'Updated Luxury Catering',
            base_price: 3500,
            category_id: new_category.id
          }
        }
      end

      it 'updates service attributes and syncs category' do
        result = service_updater.call
        expect(result[:success]).to be true
        expect(service.reload.name).to eq('Updated Luxury Catering')
        expect(service.base_price).to eq(3500)
        expect(service.categories).to contain_exactly(new_category)
      end
    end

    context 'with invalid parameters' do
      let(:params) do
        {
          service: {
            name: 'X'
          }
        }
      end

      it 'returns failure with validation errors' do
        result = service_updater.call
        expect(result[:success]).to be false
        expect(result[:errors]).to include(/is too short/)
      end
    end
  end
end
