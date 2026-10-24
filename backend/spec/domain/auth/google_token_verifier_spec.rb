# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Auth::GoogleTokenVerifier do
  let(:valid_aud) { 'test-google-client-id.apps.googleusercontent.com' }
  let(:valid_payload) do
    {
      'sub' => '10987654321',
      'email' => 'rajesh.sharma@example.com',
      'email_verified' => true,
      'name' => 'Rajesh Sharma',
      'given_name' => 'Rajesh',
      'family_name' => 'Sharma',
      'picture' => 'https://example.com/pic.jpg',
      'aud' => valid_aud,
      'iss' => 'https://accounts.google.com',
      'exp' => 1.hour.from_now.to_i
    }
  end

  before do
    allow(described_class).to receive(:expected_client_id).and_return(valid_aud)
  end

  after do
    described_class.mock_verifier = nil
  end

  describe '.verify' do
    context 'when token is missing' do
      it 'raises VerificationError' do
        expect do
          described_class.verify(nil)
        end.to raise_error(described_class::VerificationError, /ID token is required/)
      end
    end

    context 'when token is valid using mock_verifier' do
      it 'returns the verified payload' do
        described_class.mock_verifier = ->(_token, _aud) { valid_payload }

        result = described_class.verify('valid-jwt-token')
        expect(result['sub']).to eq('10987654321')
        expect(result['email']).to eq('rajesh.sharma@example.com')
      end
    end

    context 'when Google verification fails' do
      it 'raises VerificationError' do
        allow(Google::Auth::IDTokens).to receive(:verify_oidc)
          .and_raise(StandardError.new('Signature verification failed'))

        expect do
          described_class.verify('bad-token')
        end.to raise_error(described_class::VerificationError, /Invalid Google ID token/)
      end
    end
  end

  describe '.verify_payload!' do
    it 'raises error when sub claim is missing' do
      invalid = valid_payload.merge('sub' => nil)
      expect do
        described_class.verify_payload!(invalid, valid_aud)
      end.to raise_error(described_class::VerificationError, /Missing subject/)
    end

    it 'raises error when email claim is missing' do
      invalid = valid_payload.merge('email' => nil)
      expect do
        described_class.verify_payload!(invalid, valid_aud)
      end.to raise_error(described_class::VerificationError, /Missing email/)
    end

    it 'raises error when audience does not match' do
      invalid = valid_payload.merge('aud' => 'wrong-client-id')
      expect do
        described_class.verify_payload!(invalid, valid_aud)
      end.to raise_error(described_class::VerificationError, /Token audience mismatch/)
    end

    it 'raises error when issuer is untrusted' do
      invalid = valid_payload.merge('iss' => 'https://evil-issuer.com')
      expect do
        described_class.verify_payload!(invalid, valid_aud)
      end.to raise_error(described_class::VerificationError, /Invalid token issuer/)
    end

    it 'raises error when token is expired' do
      invalid = valid_payload.merge('exp' => 10.minutes.ago.to_i)
      expect do
        described_class.verify_payload!(invalid, valid_aud)
      end.to raise_error(described_class::VerificationError, /Google ID token has expired/)
    end
  end
end
