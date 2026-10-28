# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Services::ServicePresenter do
  subject(:presenter) { described_class.new(service, include_details: include_details) }

  let(:service) { build_stubbed(:service) }
  let(:include_details) { false }

  describe '#as_json' do
    context 'without details' do
      it 'presents base service fields' do
        json = presenter.as_json
        expect(json[:id]).to eq(service.id)
        expect(json[:name]).to eq(service.name)
        expect(json[:base_price]).to eq(service.base_price)
        expect(json[:formatted_price]).to eq(service.formatted_base_price)
        expect(json[:vendor][:id]).to eq(service.vendor.id)
        expect(json[:vendor]).to have_key(:is_verified)
        expect(json[:vendor]).to have_key(:verification_status)
        expect(json).not_to have_key(:bookings_count)
      end
    end

    context 'with details' do
      let(:include_details) { true }
      let(:service) { create(:service) }

      it 'appends extended details' do
        json = presenter.as_json
        expect(json[:bookings_count]).to eq(0)
        expect(json[:can_be_booked]).to be true
        expect(json[:vendor]).to have_key(:description)
      end
    end
  end
end
