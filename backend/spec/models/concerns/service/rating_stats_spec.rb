# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Service::RatingStats do
  subject(:service) { create(:service) }

  describe 'validations' do
    it {
      expect(service).to validate_numericality_of(:average_rating)
        .is_greater_than_or_equal_to(0.0)
        .is_less_than_or_equal_to(5.0)
    }

    it { is_expected.to validate_numericality_of(:total_reviews).is_greater_than_or_equal_to(0) }
  end

  describe '#update_rating_stats!' do
    it 'calculates and updates average rating and total reviews' do
      create(:review, :published, service: service, rating: 5)
      create(:review, :published, service: service, rating: 3)

      service.update_rating_stats!
      service.reload

      expect(service.total_reviews).to eq(2)
      expect(service.average_rating).to eq(4.0)
    end
  end

  describe '#rating_distribution' do
    it 'returns distribution of star ratings' do
      create(:review, :published, service: service, rating: 5)
      create(:review, :published, service: service, rating: 5)
      create(:review, :published, service: service, rating: 4)

      distribution = service.rating_distribution
      expect(distribution[5]).to eq(2)
      expect(distribution[4]).to eq(1)
      expect(distribution[3]).to eq(0)
    end
  end
end
