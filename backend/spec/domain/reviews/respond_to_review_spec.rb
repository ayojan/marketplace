# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Reviews::RespondToReview do
  let(:vendor_user) { create(:user, :vendor) }
  let(:vendor) { vendor_user.vendor }
  let(:customer) { create(:user, :customer) }
  let(:service) { create(:service, vendor: vendor) }
  let(:booking) do
    create(:booking, vendor: vendor, customer: customer, service: service, status: :completed)
  end
  let(:review) do
    create(:review, booking: booking, vendor: vendor, customer: customer, service: service)
  end

  describe '.call' do
    context 'with valid authorization' do
      it 'allows vendor to respond to their own review' do
        result = described_class.call(
          review: review,
          vendor: vendor_user,
          response: 'Thank you for the review!'
        )

        expect(result[:success]).to be true
        expect(result[:review].vendor_response).to eq('Thank you for the review!')
      end
    end

    context 'with invalid authorization' do
      let(:other_vendor) { create(:user, :vendor) }

      it 'prevents other vendor from responding' do
        result = described_class.call(
          review: review,
          vendor: other_vendor,
          response: 'Thank you'
        )

        expect(result[:success]).to be false
        expect(result[:error]).to include('not authorized')
      end
    end

    context 'when vendor has already responded' do
      before { review.update(vendor_response: 'Already responded') }

      it 'prevents duplicate response' do
        result = described_class.call(
          review: review,
          vendor: vendor_user,
          response: 'New response'
        )

        expect(result[:success]).to be false
        expect(result[:error]).to include('already responded')
      end
    end

    context 'with response too long' do
      it 'rejects response over 1000 characters' do
        long_response = 'a' * 1001
        result = described_class.call(
          review: review,
          vendor: vendor_user,
          response: long_response
        )

        expect(result[:success]).to be false
        expect(result[:error]).to include('less than 1000')
      end
    end
  end
end
