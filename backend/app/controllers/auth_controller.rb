# frozen_string_literal: true

class AuthController < ApiController
  before_action :validate_auth_params, only: %i[login register]

  apply_rate_limit to: 10, within: 1.minute, only: :login,
                   message: 'Too many login attempts. Please try again later.'
  apply_rate_limit to: 10, within: 1.minute, only: :register,
                   message: 'Too many registration attempts. Please try again later.'
  apply_rate_limit to: 30, within: 1.minute, only: :google,
                   message: 'Too many requests. Please try again later.'

  def login
    result = Auth::LoginService.call(
      email: auth_params[:email],
      password: auth_params[:password]
    )
    render json: result.payload, status: result.status
  end

  def register
    result = Auth::RegistrationService.call(
      auth_params: auth_params,
      raw_params: params
    )
    render json: result.payload, status: result.status
  end

  def google
    result = Auth::GoogleAuthService.call(params: params)
    render json: result.payload, status: result.status
  end

  def logout
    revoke_current_token
    render json: { message: 'Logout successful' }, status: :ok
  end

  private

  def revoke_current_token
    token = request.headers['Authorization']&.split&.last
    return if token.blank?

    decoded = Auth::JwtService.decode(token)
    return if decoded[:jti].blank?

    ttl = [decoded[:exp].to_i - Time.current.to_i, 1].max
    Auth::JwtService.revoke(decoded[:jti], ttl.seconds)
  rescue ExceptionHandler::InvalidToken, JWT::DecodeError
    # Token is already invalid, expired, or revoked
  end

  def validate_auth_params
    return if params[:auth].present?

    render json: { error: 'Authentication parameters are required' }, status: :bad_request
  end

  def auth_params
    params.expect(
      auth: [:email, :password, :password_confirmation, :first_name, :last_name, :role,
             { vendor_attributes: [:business_name, :location, :description, :phone, :website,
                                   :category, :category_id, :service_category, :primary_category_id,
                                   { category_ids: [], categories: [] }],
               customer_attributes: %i[phone location preferences event_types budget_range company_name] }]
    )
  end
end
