# frozen_string_literal: true

module Auth
  class JwtService
    ALGORITHM = 'HS256'
    REVOCATION_PREFIX = 'jwt:revoked:'

    def self.secret_key
      Rails.application.secret_key_base.presence ||
        Rails.application.credentials.secret_key_base.presence ||
        (Rails.env.local? ? 'marketplace-dev-secret-key-at-least-32-chars' : nil) ||
        raise('SECRET_KEY_BASE is missing')
    end

    def self.encode(payload, exp = 24.hours.from_now)
      payload = payload.dup
      payload[:exp] = exp.to_i
      payload[:jti] ||= SecureRandom.uuid
      JWT.encode(payload, secret_key, ALGORITHM)
    end

    def self.decode(token)
      decoded = JWT.decode(token, secret_key, true, { algorithm: ALGORITHM })[0]
      payload = ActiveSupport::HashWithIndifferentAccess.new(decoded)

      raise ExceptionHandler::InvalidToken, 'Token has been revoked' if revoked?(payload[:jti])

      payload
    rescue JWT::DecodeError => e
      raise ExceptionHandler::InvalidToken, e.message
    end

    def self.revoke(jti, expires_in = 24.hours)
      return if jti.blank?

      Rails.cache.write(revocation_key(jti), true, expires_in: expires_in)
    end

    def self.revoked?(jti)
      return false if jti.blank?

      Rails.cache.exist?(revocation_key(jti))
    end

    def self.revocation_key(jti)
      "#{REVOCATION_PREFIX}#{jti}"
    end
  end
end
