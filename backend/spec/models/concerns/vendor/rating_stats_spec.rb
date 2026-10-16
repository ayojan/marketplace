# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Vendor::RatingStats do
  subject(:vendor) { create(:user, :vendor).vendor }

  let(:stats_double) do
    {
      distribution: { 5 => 10, 4 => 2, 3 => 0, 2 => 0, 1 => 0 },
      breakdown: { quality: 4.8, communication: 5.0, value: 4.5, punctuality: 4.9 },
      display: '4.8 (12 reviews)'
    }
  end

  before do
    allow(Vendors::CalculateRatingStats).to receive(:call).with(vendor: vendor).and_return(stats_double)
  end

  describe '#rating_distribution' do
    it 'returns the distribution from Vendors::CalculateRatingStats' do
      expect(vendor.rating_distribution).to eq(stats_double[:distribution])
    end
  end

  describe '#rating_breakdown' do
    it 'returns the breakdown from Vendors::CalculateRatingStats' do
      expect(vendor.rating_breakdown).to eq(stats_double[:breakdown])
    end
  end

  describe '#rating_display' do
    it 'returns the display string from Vendors::CalculateRatingStats' do
      expect(vendor.rating_display).to eq(stats_double[:display])
    end
  end

  describe 'memoization' do
    it 'memoizes the stats and only calls the calculator service once' do
      vendor.rating_distribution
      vendor.rating_breakdown
      vendor.rating_display

      expect(Vendors::CalculateRatingStats).to have_received(:call).with(vendor: vendor).once
    end

    it 'recalculates when @cached_rating_stats is reset' do
      vendor.rating_distribution
      vendor.instance_variable_set(:@cached_rating_stats, nil)
      vendor.rating_distribution

      expect(Vendors::CalculateRatingStats).to have_received(:call).with(vendor: vendor).twice
    end
  end
end
