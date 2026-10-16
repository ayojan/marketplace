# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'JWT Authentication Integration' do
  let(:user) { create(:user, confirmed_at: Time.current) }
  let(:token) { Users::JwtService.encode(user_id: user.id) }
  let(:headers) { { 'Authorization' => "Bearer #{token}" } }

  describe 'JWT token generation and validation' do
    it 'generates a valid JWT token for a user' do
      token = Users::JwtService.encode(user_id: user.id)
      expect(token).to be_present
      expect(token).to be_a(String)
      expect(token.split('.').length).to eq(3) # JWT has 3 parts
    end

    it 'decodes a valid JWT token' do
      token = Users::JwtService.encode(user_id: user.id)
      decoded = Users::JwtService.decode(token)

      expect(decoded[:user_id]).to eq(user.id)
      expect(decoded[:exp]).to be_present
    end

    it 'raises error for invalid token' do
      expect do
        Users::JwtService.decode('invalid.token.here')
      end.to raise_error(ExceptionHandler::InvalidToken)
    end
  end

  describe 'AuthorizeApiRequest service' do
    it 'returns user for valid token' do
      result = Users::AuthorizeApiRequest.new({ 'Authorization' => "Bearer #{token}" }).call
      expect(result[:user]).to eq(user)
    end

    it 'raises error for missing token' do
      expect do
        Users::AuthorizeApiRequest.new({}).call
      end.to raise_error(ExceptionHandler::MissingToken)
    end

    it 'raises error for invalid token format' do
      expect do
        Users::AuthorizeApiRequest.new({ 'Authorization' => 'InvalidFormat' }).call
      end.to raise_error(ExceptionHandler::InvalidToken)
    end

    it 'raises error for non-existent user' do
      invalid_token = Users::JwtService.encode(user_id: 99_999)
      expect do
        Users::AuthorizeApiRequest.new({ 'Authorization' => "Bearer #{invalid_token}" }).call
      end.to raise_error(ExceptionHandler::InvalidToken)
    end
  end

  describe 'API authentication flow' do
    it 'authenticates valid requests with JWT token' do
      # This would be tested with actual API endpoints in future tasks
      # For now, we verify the authentication mechanism works
      expect(user).to be_persisted
      expect(user.confirmed?).to be true
      expect(token).to be_present

      # Verify the token can be used to find the user
      result = Users::AuthorizeApiRequest.new(headers).call
      expect(result[:user]).to eq(user)
    end
  end
end
