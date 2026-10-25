# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Auth::GoogleAuthService do
  let(:valid_aud) { 'test-client-id.apps.googleusercontent.com' }
  let(:google_sub) { 'google-uid-12345' }
  let(:google_email) { 'ananya.sharma@example.com' }
  let(:google_payload) do
    {
      'sub' => google_sub,
      'email' => google_email,
      'email_verified' => true,
      'name' => 'Ananya Sharma',
      'given_name' => 'Ananya',
      'family_name' => 'Sharma',
      'picture' => 'https://example.com/avatar.jpg',
      'aud' => valid_aud,
      'iss' => 'https://accounts.google.com',
      'exp' => 1.hour.from_now.to_i
    }
  end

  before do
    allow(Auth::GoogleTokenVerifier).to receive(:expected_client_id).and_return(valid_aud)
    Auth::GoogleTokenVerifier.mock_verifier = ->(_token, _aud) { google_payload }
  end

  after do
    Auth::GoogleTokenVerifier.mock_verifier = nil
  end

  describe '.call' do
    context 'when google id_token is missing' do
      it 'returns bad_request' do
        result = described_class.call(params: {})

        expect(result.success?).to be false
        expect(result.status).to eq(:bad_request)
        expect(result.payload[:error]).to eq('Google ID token is required')
      end
    end

    context 'when google token verification fails' do
      it 'returns unauthorized' do
        allow(Auth::GoogleTokenVerifier).to receive(:verify)
          .and_raise(Auth::GoogleTokenVerifier::VerificationError, 'Invalid Google ID token')

        result = described_class.call(params: { id_token: 'invalid-token' })

        expect(result.success?).to be false
        expect(result.status).to eq(:unauthorized)
        expect(result.payload[:error]).to eq('Invalid Google ID token')
      end
    end

    context 'with existing auth identity' do
      let(:user) { create(:user, email: google_email) }

      before do
        create(:auth_identity, user: user, provider: 'google', uid: google_sub, email: google_email)
      end

      it 'signs in existing user successfully' do
        result = described_class.call(params: { id_token: 'valid-token' })

        expect(result.success?).to be true
        expect(result.status).to eq(:ok)
        expect(result.payload[:message]).to eq('Google sign-in successful')
        expect(result.payload[:token]).to be_present
        expect(result.payload[:user][:email]).to eq(google_email)
      end
    end

    context 'when email collision occurs without existing Google identity' do
      let!(:existing_user) do
        create(:user, email: google_email, password: 'MyPassword123!', password_confirmation: 'MyPassword123!')
      end

      it 'prompts for password when linking password is not provided' do
        result = described_class.call(params: { id_token: 'valid-token' })

        expect(result.success?).to be false
        expect(result.status).to eq(:conflict)
        expect(result.payload[:code]).to eq('account_collision')
        expect(result.payload[:email]).to eq(google_email)
      end

      it 'links account and signs in when valid password is provided' do
        expect do
          result = described_class.call(
            params: {
              id_token: 'valid-token',
              link_account_password: 'MyPassword123!'
            }
          )
          expect(result.success?).to be true
          expect(result.status).to eq(:ok)
          expect(result.payload[:message]).to eq('Google account linked and login successful')
        end.to change(existing_user.auth_identities, :count).by(1)
      end
    end

    context 'when creating a new user' do
      it 'registers a new customer user' do
        expect do
          result = described_class.call(params: { id_token: 'valid-token', role: 'customer' })

          expect(result.success?).to be true
          expect(result.status).to eq(:created)
          expect(result.payload[:message]).to eq('Google registration successful')
          expect(result.payload[:token]).to be_present
          expect(result.payload[:user][:email]).to eq(google_email)
        end.to change(User, :count).by(1).and change(AuthIdentity, :count).by(1)
      end
    end
  end
end
