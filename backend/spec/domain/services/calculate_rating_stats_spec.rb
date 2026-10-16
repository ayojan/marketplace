# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Services::CalculateRatingStats do
  subject(:calculator) { described_class.new(service: service) }

  let(:service) { create(:service) }

  describe '#call' do
    context 'when service has no reviews' do
      it 'returns zeroed stats and default display' do
        result = calculator.call
        expect(result[:distribution]).to eq({ 5 => 0, 4 => 0, 3 => 0, 2 => 0, 1 => 0 })
        expect(result[:display]).to eq('No ratings yet')
      end
    end

    context 'when service has published reviews' do
      before do
        create(:review, :published,
               service: service, rating: 5, quality_rating: 5,
               communication_rating: 4, value_rating: 5, punctuality_rating: 4)
        create(:review, :published,
               service: service, rating: 4, quality_rating: 4,
               communication_rating: 4, value_rating: 4, punctuality_rating: 4)
        service.update!(average_rating: 4.5, total_reviews: 2)
      end

      it 'returns computed distribution, breakdown, and display' do
        result = calculator.call
        expect(result[:distribution][5]).to eq(1)
        expect(result[:distribution][4]).to eq(1)
        expect(result[:breakdown][:quality]).to eq(4.5)
        expect(result[:display]).to eq('4.5 (2 reviews)')
      end
    end
  end
end
