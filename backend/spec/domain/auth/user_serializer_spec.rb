# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Auth::UserSerializer do
  describe '.call' do
    context 'when user is nil' do
      it 'returns an empty hash' do
        expect(described_class.call(nil)).to eq({})
      end
    end

    context 'with a customer user' do
      let(:user) { create(:user, :customer, first_name: 'Ajeet', last_name: 'Kumar', phone: '9876543210') }

      it 'returns base user response and customer payload' do
        result = described_class.call(user)

        expect(result[:id]).to eq(user.id)
        expect(result[:email]).to eq(user.email)
        expect(result[:first_name]).to eq('Ajeet')
        expect(result[:last_name]).to eq('Kumar')
        expect(result[:role]).to eq('customer')
        expect(result[:confirmed]).to be true
        expect(result[:phone]).to eq('9876543210')
        expect(result[:has_google_identity]).to be false
        expect(result[:customer_id]).to eq(user.customer.id) if user.customer
      end
    end

    context 'with a vendor user' do
      let(:user) { create(:user, :with_vendor, first_name: 'Pooja', last_name: 'Singh') }

      it 'returns base user response and vendor payload' do
        result = described_class.call(user)

        expect(result[:id]).to eq(user.id)
        expect(result[:role]).to eq('vendor')
        expect(result[:vendor_id]).to eq(user.vendor.id)
        expect(result[:vendor][:id]).to eq(user.vendor.id)
        expect(result[:vendor][:business_name]).to eq(user.vendor.business_name)
      end
    end
  end
end
