# frozen_string_literal: true

class ApiController < ActionController::API
  include ExceptionHandler
  include RateLimitable

  apply_rate_limit to: 60, within: 1.minute

  # Require valid JWT token, halt request with 401 if missing or invalid
  def authenticate_user!
    @current_user = Auth::AuthorizeApiRequest.call(request.headers)[:user]
    render json: { message: 'Missing token' }, status: :unauthorized unless @current_user
  end

  # Optional/memoized user lookup without halting for unauthenticated requests
  def current_user
    @current_user ||= begin
      Auth::AuthorizeApiRequest.call(request.headers)[:user]
    rescue StandardError
      nil
    end
  end

  protected

  def render_error(message, status = :unprocessable_entity)
    render json: { error: message }, status: status
  end

  def render_success(message, data = {}, status = :ok)
    render json: { message: message }.merge(data), status: status
  end
end
