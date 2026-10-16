# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Customers::UpdateProfile do
  let(:user) { create(:user, :customer, first_name: 'Alice', last_name: 'Smith') }

  describe '#call' do
    context 'with valid customer attributes' do
      let(:params) do
        {
          customer: {
            phone: '+15551234567',
            location: 'New York, NY',
            budget_range: 'between_1000_2500',
            company_name: 'Acme Events'
          }
        }
      end

      it 'updates customer profile successfully on user' do
        result = described_class.call(user: user, params: params)

        expect(result[:success]).to be true
        expect(user.reload.phone).to eq('+15551234567')
        expect(user.location).to eq('New York, NY')
        expect(user.budget_range).to eq('between_1000_2500')
        expect(user.company_name).to eq('Acme Events')
      end

      it 'updates user first and last name if provided in customer hash' do
        params_with_name = params.deep_merge(
          customer: { first_name: 'Alicia', last_name: 'Vance' }
        )

        result = described_class.call(user: user, params: params_with_name)

        expect(result[:success]).to be true
        expect(user.reload.first_name).to eq('Alicia')
        expect(user.last_name).to eq('Vance')
      end

      it 'updates user name and phone when passed at root level' do
        params_with_root_name = {
          first_name: 'Alicia',
          last_name: 'Vance',
          phone: '+15551234567'
        }

        result = described_class.call(user: user, params: params_with_root_name)

        expect(result[:success]).to be true
        expect(user.reload.first_name).to eq('Alicia')
        expect(user.last_name).to eq('Vance')
        expect(user.phone).to eq('+15551234567')
      end
    end

    context 'with invalid customer attributes' do
      it 'fails validation and returns errors' do
        invalid_params = {
          customer: {
            phone: 'INVALID_PHONE_FORMAT_XYZ!@#'
          }
        }

        result = described_class.call(user: user, params: invalid_params)

        expect(result[:success]).to be false
        expect(result[:errors]).to be_present
        expect(user.reload.phone).not_to eq('INVALID_PHONE_FORMAT_XYZ!@#')
      end
    end
  end
end
