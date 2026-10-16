# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Vendors::UpdateRatingStats do
  let(:vendor_user) { create(:user, :vendor) }
  let(:vendor) { vendor_user.vendor }
  let(:reviews_relation) { double('ActiveRecord::Relation') } # rubocop:disable RSpec/VerifiedDoubles

  describe '.call' do
    before do
      allow(vendor).to receive(:reviews).and_return(reviews_relation)
      # Mocking the pick result: [count, avg_rating, avg_quality, avg_comm, avg_value, avg_punctuality]
      allow(reviews_relation).to receive_messages(published: reviews_relation, pick: [2, 4.5, 5.0, 4.0, 4.5, 4.5])
    end

    it 'updates the vendor with average rating and total reviews' do
      result = described_class.call(vendor: vendor)

      expect(vendor.average_rating.to_f).to eq(4.5)
      expect(vendor.total_reviews).to eq(2)

      expect(result).to include(count: 2, average: 4.5, quality: 5.0)
    end
  end
end
