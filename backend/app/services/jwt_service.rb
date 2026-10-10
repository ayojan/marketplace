# frozen_string_literal: true

class JwtService
  ALGORITHM = 'HS256'

  def self.secret_key
    Rails.application.secret_key_base.presence ||
      Rails.application.credentials.secret_key_base.presence ||
      (Rails.env.local? ? 'marketplace-dev-secret-key-at-least-32-chars' : nil) ||
      raise('SECRET_KEY_BASE is missing')
  end

  def self.encode(payload, exp = 24.hours.from_now)
    payload[:exp] = exp.to_i
    JWT.encode(payload, secret_key, ALGORITHM)
  end

  def self.decode(token)
    decoded = JWT.decode(token, secret_key, true, { algorithm: ALGORITHM })[0]
    ActiveSupport::HashWithIndifferentAccess.new(decoded)
  rescue JWT::DecodeError => e
    raise ExceptionHandler::InvalidToken, e.message
  end
end
