# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Auth::RegistrationService do
  let!(:category) { create(:category, name: 'Catering', slug: 'catering') }

  describe '.call' do
    context 'with valid customer params' do
      let(:auth_params) do
        {
          email: 'neha.patel@example.com',
          password: 'Password123!',
          password_confirmation: 'Password123!',
          first_name: 'Neha',
          last_name: 'Patel',
          role: 'customer'
        }
      end

      it 'creates a new customer and returns token' do
        expect do
          result = described_class.call(auth_params: auth_params)
          expect(result.success?).to be true
          expect(result.status).to eq(:created)
          expect(result.payload[:token]).to be_present
          expect(result.payload[:user][:email]).to eq('neha.patel@example.com')
        end.to change(User, :count).by(1)
      end

      it 'defaults unknown roles to customer' do
        auth_params[:role] = 'superuser'
        result = described_class.call(auth_params: auth_params)

        expect(result.success?).to be true
        expect(result.payload[:user][:role]).to eq('customer')
      end
    end

    context 'with valid vendor params' do
      let(:auth_params) do
        {
          email: 'chef.vikram@example.com',
          password: 'Password123!',
          password_confirmation: 'Password123!',
          first_name: 'Vikram',
          last_name: 'Khanna',
          role: 'vendor',
          vendor_attributes: {
            business_name: 'Vikram Catering Co',
            location: 'Delhi NCR',
            category: 'Catering',
            description: 'Luxury gourmet catering services for weddings and large family celebrations.'
          }
        }
      end

      it 'creates a vendor user and sets up categories' do
        expect do
          result = described_class.call(auth_params: auth_params)
          expect(result.success?).to be true
          expect(result.payload[:user][:role]).to eq('vendor')
        end.to change(User, :count).by(1)

        user = User.find_by(email: 'chef.vikram@example.com')
        expect(user.vendor).to be_present
        expect(user.vendor.categories).to include(category)
      end
    end

    context 'with invalid user params' do
      let(:invalid_params) do
        {
          email: '',
          password: '123'
        }
      end

      it 'returns unprocessable_content status and error details' do
        expect do
          result = described_class.call(auth_params: invalid_params)
          expect(result.success?).to be false
          expect(result.status).to eq(:unprocessable_content)
          expect(result.payload[:error]).to eq('Registration failed')
          expect(result.payload[:details]).to be_present
        end.not_to change(User, :count)
      end
    end
  end
end
