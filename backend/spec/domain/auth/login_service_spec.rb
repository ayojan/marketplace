# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Auth::LoginService do
  let(:password) { 'ValidPass123!' }
  let(:user) { create(:user, password: password, password_confirmation: password, confirmed_at: Time.current) }

  describe '.call' do
    context 'when email or password is missing' do
      it 'returns bad_request if email is blank' do
        result = described_class.call(email: '', password: password)

        expect(result.success?).to be false
        expect(result.status).to eq(:bad_request)
        expect(result.payload[:error]).to eq('Email and password are required')
      end

      it 'returns bad_request if password is blank' do
        result = described_class.call(email: user.email, password: '')

        expect(result.success?).to be false
        expect(result.status).to eq(:bad_request)
      end
    end

    context 'with invalid credentials' do
      it 'returns unauthorized when password does not match' do
        result = described_class.call(email: user.email, password: 'wrong-password')

        expect(result.success?).to be false
        expect(result.status).to eq(:unauthorized)
        expect(result.payload[:error]).to eq('Invalid credentials')
      end

      it 'returns unauthorized when user does not exist' do
        result = described_class.call(email: 'nobody@example.com', password: password)

        expect(result.success?).to be false
        expect(result.status).to eq(:unauthorized)
      end
    end

    context 'with valid credentials' do
      it 'returns success with token and user payload' do
        result = described_class.call(email: user.email, password: password)

        expect(result.success?).to be true
        expect(result.status).to eq(:ok)
        expect(result.payload[:message]).to eq('Login successful')
        expect(result.payload[:token]).to be_present
        expect(result.payload[:user][:email]).to eq(user.email)
      end

      it 'auto-confirms unconfirmed user on login' do
        unconfirmed = create(:user, password: password, password_confirmation: password, confirmed_at: nil)
        result = described_class.call(email: unconfirmed.email, password: password)

        expect(result.success?).to be true
        expect(unconfirmed.reload.confirmed?).to be true
      end
    end
  end
end
