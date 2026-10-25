# frozen_string_literal: true

module RateLimitable
  extend ActiveSupport::Concern

  class_methods do
    def apply_rate_limit(to:, within: 1.minute, by: :ip, message: 'Rate limit exceeded', **options)
      config = {
        to: to,
        within: within,
        by: resolve_rate_limit_key(by),
        unless: -> { Rails.env.test? },
        with: -> { render json: { error: message }, status: :too_many_requests }
      }.merge(options)

      rate_limit(**config)
    end

    private

    def resolve_rate_limit_key(by)
      case by
      when :user_or_ip
        -> { current_user&.id || request.remote_ip }
      when :user
        -> { current_user&.id }
      else
        -> { request.remote_ip }
      end
    end
  end
end
