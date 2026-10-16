# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Services::UpdateRatingStats do
  subject(:updater) { described_class.new(service: service) }

  let(:service) { create(:service) }

  describe '#call' do
    it 'updates service average_rating and total_reviews columns' do
      create(:review, :published, service: service, rating: 5)
      create(:review, :published, service: service, rating: 3)

      result = updater.call

      expect(result[:count]).to eq(2)
      expect(result[:average]).to eq(4.0)

      service.reload
      expect(service.total_reviews).to eq(2)
      expect(service.average_rating).to eq(4.0)
    end
  end
end
