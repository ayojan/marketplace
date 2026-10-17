# frozen_string_literal: true

class ApiController < ActionController::API
  include ExceptionHandler

  # API controllers can selectively require authentication
  def authenticate_user!
    @current_user = Auth::AuthorizeApiRequest.call(request.headers)[:user]
    render json: { message: 'Missing token' }, status: :unauthorized unless @current_user
  end

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
