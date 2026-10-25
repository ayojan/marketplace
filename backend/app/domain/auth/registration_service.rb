# frozen_string_literal: true

module Auth
  class RegistrationService
    include Callable

    def initialize(auth_params:, raw_params: nil)
      raw_hash = auth_params.respond_to?(:to_unsafe_h) ? auth_params.to_unsafe_h : auth_params.to_h
      @auth_params = raw_hash.deep_dup
      @raw_params = raw_params || auth_params
    end

    def call
      prepare_params

      user = User.new(auth_params)
      user.skip_confirmation!

      return registration_failure(user) unless user.save

      handle_vendor_setup(user) if user.vendor? && user.vendor.present?
      token = JwtService.encode(user_id: user.id, email: user.email, role: user.role)
      registration_success(user, token)
    end

    private

    attr_reader :auth_params, :raw_params

    def prepare_params
      auth_params[:role] = 'customer' unless %w[customer vendor].include?(auth_params[:role].to_s)
      VendorOnboardingService.clean_vendor_attributes(auth_params)
    end

    def handle_vendor_setup(user)
      raw_cat = VendorOnboardingService.extract_raw_category_param(raw_params)
      primary_id = raw_params.dig(:auth, :vendor_attributes, :primary_category_id) ||
                   raw_params.dig(:vendor_attributes, :primary_category_id)

      VendorOnboardingService.attach_initial_category(
        user.vendor,
        raw_category_param: raw_cat,
        primary_category_id: primary_id
      )
    end

    def registration_success(user, token)
      Result.success(
        status: :created,
        payload: {
          message: 'Registration successful',
          token: token,
          user: UserSerializer.call(user)
        }
      )
    end

    def registration_failure(user)
      Result.failure(
        status: :unprocessable_content,
        payload: {
          error: 'Registration failed',
          details: user.errors.full_messages
        }
      )
    end
  end
end
