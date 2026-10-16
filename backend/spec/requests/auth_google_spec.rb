# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'POST /auth/google' do
  let(:valid_client_id) { 'test-google-client-id.apps.googleusercontent.com' }
  let(:google_sub) { '112233445566778899' }
  let(:google_email) { 'priya.verma@example.com' }
  let(:google_payload) do
    {
      'sub' => google_sub,
      'email' => google_email,
      'email_verified' => true,
      'name' => 'Priya Verma',
      'given_name' => 'Priya',
      'family_name' => 'Verma',
      'picture' => 'https://example.com/avatar.jpg',
      'aud' => valid_client_id,
      'iss' => 'https://accounts.google.com',
      'exp' => 1.hour.from_now.to_i
    }
  end

  before do
    allow(GoogleTokenVerifier).to receive(:expected_client_id).and_return(valid_client_id)
    GoogleTokenVerifier.mock_verifier = ->(_token, _aud) { google_payload }
  end

  after do
    GoogleTokenVerifier.mock_verifier = nil
  end

  describe 'first-time user registration' do
    it 'creates a customer user and associated auth_identity' do
      expect do
        post '/auth/google', params: { id_token: 'valid-google-id-token', role: 'customer' }
      end.to change(User, :count).by(1).and change(AuthIdentity, :count).by(1)

      expect(response).to have_http_status(:created)
      json = response.parsed_body

      expect(json['message']).to eq('Google registration successful')
      expect(json['token']).to be_present
      expect(json['user']['email']).to eq(google_email)
      expect(json['user']['first_name']).to eq('Priya')
      expect(json['user']['role']).to eq('customer')
      expect(json['user']['confirmed']).to be(true)
      expect(json['needs_mobile_onboarding']).to be(true)
    end

    it 'attaches customer and auth identity to the new user' do
      post '/auth/google', params: { id_token: 'valid-google-id-token', role: 'customer' }
      created_user = User.find_by(email: google_email)

      expect(created_user.customer).to be_present
      expect(created_user.auth_identities.first.uid).to eq(google_sub)
    end

    it 'creates a vendor user when role is vendor' do
      vendor_payload = google_payload.merge('email' => 'vendor.studio@example.com', 'sub' => 'sub-vendor-99')
      GoogleTokenVerifier.mock_verifier = ->(_token, _aud) { vendor_payload }

      expect do
        post '/auth/google', params: {
          id_token: 'vendor-google-token',
          role: 'vendor',
          vendor_attributes: {
            business_name: 'Priya Verma Creations',
            location: 'Mumbai'
          }
        }
      end.to change(User, :count).by(1)

      expect(response).to have_http_status(:created)
      json = response.parsed_body
      expect(json['user']['role']).to eq('vendor')
      expect(json['user']['vendor']).to be_present
      expect(json['user']['vendor']['business_name']).to eq('Priya Verma Creations')

      created_user = User.find_by(email: 'vendor.studio@example.com')
      expect(created_user.vendor.location).to eq('Mumbai')
    end
  end

  describe 'returning Google user sign-in' do
    let!(:existing_user) { create(:user, email: google_email, first_name: 'Priya', last_name: 'Verma') }

    before do
      create(:auth_identity, user: existing_user, provider: 'google', uid: google_sub)
    end

    it 'signs in without creating duplicate users' do
      expect do
        post '/auth/google', params: { id_token: 'valid-google-id-token' }
      end.not_to change(User, :count)

      expect(response).to have_http_status(:ok)
      json = response.parsed_body
      expect(json['message']).to eq('Google sign-in successful')
      expect(json['token']).to be_present
      expect(json['user']['id']).to eq(existing_user.id)
      expect(json['user']['email']).to eq(google_email)
    end

    it 'does not create duplicate auth identities' do
      expect do
        post '/auth/google', params: { id_token: 'valid-google-id-token' }
      end.not_to change(AuthIdentity, :count)
    end

    it 'reports needs_mobile_onboarding as false if phone is set' do
      existing_user.customer.update!(phone: '+91 98765 43210')

      post '/auth/google', params: { id_token: 'valid-google-id-token' }

      expect(response).to have_http_status(:ok)
      json = response.parsed_body
      expect(json['needs_mobile_onboarding']).to be(false)
      expect(json['user']['phone']).to eq('+91 98765 43210')
    end
  end

  describe 'safe account collision handling' do
    let!(:password_user) do
      create(:user, email: google_email, password: 'SecurePassword123!', password_confirmation: 'SecurePassword123!')
    end

    context 'when an existing account has the same email but no Google identity' do
      it 'does not silently link accounts and returns 409 conflict when password is not provided' do
        expect do
          post '/auth/google', params: { id_token: 'valid-google-id-token' }
        end.not_to change(AuthIdentity, :count)

        expect(response).to have_http_status(:conflict)
        json = response.parsed_body
        expect(json['code']).to eq('account_collision')
        expect(json['error']).to include('An account with this email already exists')
        expect(json['email']).to eq(google_email)
      end

      it 'returns 409 conflict when invalid password is provided' do
        post '/auth/google', params: {
          id_token: 'valid-google-id-token',
          link_account_password: 'WrongPassword'
        }

        expect(response).to have_http_status(:conflict)
        json = response.parsed_body
        expect(json['code']).to eq('account_collision')
      end

      it 'safely links Google identity and signs in when valid password is provided' do
        expect do
          post '/auth/google', params: {
            id_token: 'valid-google-id-token',
            link_account_password: 'SecurePassword123!'
          }
        end.to change(AuthIdentity, :count).by(1)

        expect(response).to have_http_status(:ok)
        json = response.parsed_body
        expect(json['message']).to eq('Google account linked and login successful')
        expect(json['user']['id']).to eq(password_user.id)
        expect(password_user.auth_identities.first.uid).to eq(google_sub)
      end
    end

    context 'when an existing account is already linked to a different Google account' do
      before do
        create(:auth_identity, user: password_user, provider: 'google', uid: 'different-google-sub')
      end

      it 'rejects linking to a second Google account with conflict status' do
        post '/auth/google', params: {
          id_token: 'valid-google-id-token',
          link_account_password: 'SecurePassword123!'
        }

        expect(response).to have_http_status(:conflict)
        json = response.parsed_body
        expect(json['error']).to include('already linked to a different Google account')
      end
    end
  end

  describe 'error and edge case handling' do
    it 'returns bad request when id_token is missing' do
      post '/auth/google', params: {}

      expect(response).to have_http_status(:bad_request)
      json = response.parsed_body
      expect(json['error']).to eq('Google ID token is required')
    end

    it 'returns unauthorized when token verification fails' do
      GoogleTokenVerifier.mock_verifier = lambda { |_token, _aud|
        raise GoogleTokenVerifier::VerificationError, 'Invalid Google ID token: signature mismatch'
      }

      post '/auth/google', params: { id_token: 'bad-token' }

      expect(response).to have_http_status(:unauthorized)
      json = response.parsed_body
      expect(json['error']).to include('signature mismatch')
    end

    it 'accepts token passed as credential parameter from Google Identity Services' do
      post '/auth/google', params: { credential: 'google-gis-credential-token' }

      expect(response).to have_http_status(:created)
      json = response.parsed_body
      expect(json['user']['email']).to eq(google_email)
    end
  end
end
