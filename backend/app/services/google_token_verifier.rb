# frozen_string_literal: true

require 'googleauth'
require 'googleauth/id_tokens'
require 'digest'

class GoogleTokenVerifier
  class VerificationError < StandardError; end

  VALID_ISSUERS = ['https://accounts.google.com', 'accounts.google.com'].freeze
  DOTENV_FILES = ['.env.local', '.env'].freeze

  def self.expected_client_id
    client_id_from_env ||
      Rails.application.credentials.dig(:google, :client_id).presence ||
      default_client_id
  end

  def self.client_id_from_env
    return ENV['GOOGLE_CLIENT_ID'] if ENV['GOOGLE_CLIENT_ID'].present?

    client_id_from_files
  end

  def self.client_id_from_files
    DOTENV_FILES.each do |file|
      path = Rails.root.join(file)
      next unless File.exist?(path)

      id = extract_client_id_from_file(path)
      return id if id.present?
    end
    nil
  end

  def self.extract_client_id_from_file(path)
    File.readlines(path).each do |line|
      match = line.strip.match(/\AGOOGLE_CLIENT_ID=(.*)\z/)
      return match[1].strip.delete(%q('")) if match
    end
    nil
  end

  def self.default_client_id
    if Rails.env.test?
      'test-google-client-id.apps.googleusercontent.com'
    else
      'ayoj-marketplace-client-id.apps.googleusercontent.com'
    end
  end

  def self.verify(id_token, client_id: nil)
    raise VerificationError, 'Google ID token is required' if id_token.blank?

    expected_aud = client_id.presence || expected_client_id
    raise VerificationError, 'Google Client ID is not configured' if expected_aud.blank?

    return mock_verifier.call(id_token, expected_aud) if respond_to?(:mock_verifier) && mock_verifier.present?
    return parse_dev_token(id_token, expected_aud) if dev_token?(id_token)

    decode_and_verify(id_token, expected_aud)
  end

  def self.dev_token?(id_token)
    Rails.env.development? && id_token.start_with?('dev-google-token:')
  end

  def self.decode_and_verify(id_token, expected_aud)
    payload = begin
      ::Google::Auth::IDTokens.verify_oidc(id_token, aud: expected_aud)
    rescue StandardError => e
      raise VerificationError, "Invalid Google ID token: #{e.message}"
    end

    verify_payload!(payload, expected_aud)
    payload
  end

  def self.parse_dev_token(id_token, expected_aud)
    data = JSON.parse(id_token.delete_prefix('dev-google-token:'))
    email = data['email'] || 'akv1087@gmail.com'
    display_name = data['name'] || email.split('@').first.tr('.', ' ').titleize
    build_dev_payload(data, email, display_name, expected_aud)
  rescue StandardError => e
    raise VerificationError, "Invalid dev token: #{e.message}"
  end

  def self.build_dev_payload(data, email, display_name, expected_aud)
    {
      'sub' => data['sub'] || Digest::SHA256.hexdigest(email)[0, 21],
      'email' => email,
      'email_verified' => true,
      'name' => display_name,
      'given_name' => data['given_name'] || display_name,
      'family_name' => data['family_name'] || 'User',
      'picture' => data['picture'] || 'https://lh3.googleusercontent.com/a/default-user',
      'aud' => expected_aud,
      'iss' => 'https://accounts.google.com',
      'exp' => 1.hour.from_now.to_i
    }
  end

  def self.verify_payload!(payload, expected_aud)
    raise VerificationError, 'Token payload is empty' if payload.blank?
    raise VerificationError, 'Missing subject (sub) claim' if payload['sub'].blank?
    raise VerificationError, 'Missing email claim' if payload['email'].blank?

    verify_claims!(payload, expected_aud)
  end

  def self.verify_claims!(payload, expected_aud)
    aud = payload['aud']
    raise VerificationError, "Token audience mismatch: expected #{expected_aud}, got #{aud}" if aud != expected_aud

    iss = payload['iss']
    raise VerificationError, "Invalid token issuer: #{iss}" unless VALID_ISSUERS.include?(iss)

    exp = payload['exp'].to_i
    raise VerificationError, 'Google ID token has expired' if exp <= Time.current.to_i
  end

  class << self
    attr_accessor :mock_verifier
  end
end
