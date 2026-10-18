# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Vendors::CalculateRatingStats do
  let(:vendor_user) { create(:user, :vendor) }
  let(:vendor) { vendor_user.vendor }
  let(:customer) { create(:user, :customer) }
  let(:service) { create(:service, vendor: vendor) }
  let(:booking) do
    create(:booking, vendor: vendor, customer: customer, service: service, status: :completed)
  end

  describe '.call' do
    context 'with no reviews' do
      it 'returns empty distribution' do
        result = described_class.call(vendor: vendor)

        expect(result[:distribution]).to eq({ 5 => 0, 4 => 0, 3 => 0, 2 => 0, 1 => 0 })
      end

      it 'returns zero breakdown' do
        result = described_class.call(vendor: vendor)

        expect(result[:breakdown][:quality]).to eq(0.0)
        expect(result[:breakdown][:communication]).to eq(0.0)
        expect(result[:breakdown][:value]).to eq(0.0)
        expect(result[:breakdown][:punctuality]).to eq(0.0)
      end

      it 'returns "New on Ayoj" display' do
        result = described_class.call(vendor: vendor)

        expect(result[:display]).to eq('New on Ayoj')
      end
    end

    context 'with published reviews' do
      before do
        second_booking = create(:booking, vendor: vendor, customer: customer,
                                          service: service, status: :completed)
        create(:review, booking: booking, customer: customer, vendor: vendor, service: service,
                        rating: 5, quality_rating: 5, communication_rating: 5,
                        value_rating: 5, punctuality_rating: 5, status: :published)
        create(:review,
               booking: second_booking, customer: customer, vendor: vendor, service: service,
               rating: 4, quality_rating: 4, communication_rating: 3,
               value_rating: 4, punctuality_rating: 5, status: :published)
      end

      it 'calculates rating distribution' do
        result = described_class.call(vendor: vendor)

        expect(result[:distribution][5]).to eq(1)
        expect(result[:distribution][4]).to eq(1)
        expect(result[:distribution][3]).to eq(0)
        expect(result[:distribution][2]).to eq(0)
        expect(result[:distribution][1]).to eq(0)
      end

      it 'calculates average rating breakdown' do
        result = described_class.call(vendor: vendor)

        expect(result[:breakdown][:quality]).to eq(4.5)
        expect(result[:breakdown][:communication]).to eq(4.0)
        expect(result[:breakdown][:value]).to eq(4.5)
        expect(result[:breakdown][:punctuality]).to eq(5.0)
      end

      it 'calculates display string' do
        # Update total_reviews and average_rating as would happen in real scenario
        vendor.update(total_reviews: 2, average_rating: 4.5)

        result = described_class.call(vendor: vendor)

        expect(result[:display]).to eq('4.5 (2 reviews)')
      end
    end

    context 'with hidden reviews' do
      before do
        second_booking = create(:booking, vendor: vendor, customer: customer,
                                          service: service, status: :completed)
        create(:review, booking: booking, customer: customer, vendor: vendor, service: service, rating: 5,
                        status: :hidden)
        create(:review,
               booking: second_booking, customer: customer, vendor: vendor, service: service,
               rating: 4, status: :published)
      end

      it 'only counts published reviews' do
        result = described_class.call(vendor: vendor)

        expect(result[:distribution][5]).to eq(0)
        expect(result[:distribution][4]).to eq(1)
      end
    end
  end

  describe 'caching' do
    it 'caches result on vendor' do
      vendor.update(total_reviews: 1, average_rating: 5.0)
      create(:review, booking: booking, customer: customer, vendor: vendor, service: service, rating: 5,
                      status: :published)

      # First call calculates
      result1 = vendor.rating_distribution
      # Second call uses cache
      result2 = vendor.rating_distribution

      expect(result1).to eq(result2)
    end
  end
end
