# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Reviews::VoteHelpful do
  let(:vendor_user) { create(:user, :vendor) }
  let(:vendor_profile) { vendor_user.vendor_profile }
  let(:customer) { create(:user, :customer) }
  let(:other_customer) { create(:user, :customer) }
  let(:service) { create(:service) }
  let(:booking) do
    create(:booking, vendor_profile: vendor_profile, customer: customer, service: service, status: :completed)
  end
  let(:review) do
    create(:review, booking: booking, vendor_profile: vendor_profile, customer: customer, service: service)
  end

  describe '.call' do
    context 'with valid voter' do
      it 'allows customer to vote review as helpful' do
        result = described_class.call(review: review, voter: other_customer)

        expect(result[:success]).to be true
        expect(result[:helpful_votes]).to eq(1)
        expect(review.reload.helpful_votes).to eq(1)
      end
    end

    context 'when voter is the review author' do
      it 'prevents review author from voting' do
        result = described_class.call(review: review, voter: customer)

        expect(result[:success]).to be false
        expect(result[:error]).to include('not authorized')
      end
    end

    context 'when voter is a vendor' do
      it 'prevents vendor from voting' do
        result = described_class.call(review: review, voter: vendor_user)

        expect(result[:success]).to be false
        expect(result[:error]).to include('not authorized')
      end
    end

    context 'with multiple votes' do
      it 'allows multiple people to vote on the same review' do
        voter1 = create(:user, :customer)
        voter2 = create(:user, :customer)

        described_class.call(review: review, voter: voter1)
        result = described_class.call(review: review, voter: voter2)

        expect(result[:helpful_votes]).to eq(2)
      end
    end
  end
end
