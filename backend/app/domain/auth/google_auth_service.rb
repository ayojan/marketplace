# frozen_string_literal: true

module Auth
  # Handles Google OAuth flow: token verification, existing identity sign-in,
  # collision handling with password account linking, and new user onboarding.
  # rubocop:disable-next Metrics/ClassLength
  class GoogleAuthService
    include Callable

    def initialize(params:)
      @params = params
    end

    def call
      id_token = extract_google_token
      return Result.failure(status: :bad_request, payload: { error: 'Google ID token is required' }) if id_token.blank?

      payload = verify_id_token(id_token)
      return payload if payload.is_a?(Result)

      process_google_sign_in(payload)
    end

    private

    attr_reader :params

    def extract_google_token
      params[:id_token] || params[:credential] ||
        params.dig(:auth, :id_token) || params.dig(:auth, :credential)
    end

    def verify_id_token(id_token)
      GoogleTokenVerifier.verify(id_token)
    rescue GoogleTokenVerifier::VerificationError => e
      Result.failure(status: :unauthorized, payload: { error: e.message })
    end

    def process_google_sign_in(payload)
      google_uid = payload['sub'].to_s
      identity = AuthIdentity.find_google_identity(google_uid)
      return handle_existing_identity(identity) if identity

      email = payload['email'].to_s.downcase.strip
      existing_user = User.find_by(email: email)
      return handle_account_collision(existing_user, google_uid, email, payload) if existing_user

      create_google_user(email, google_uid, payload)
    end

    def handle_existing_identity(identity)
      user = identity.user
      user.confirm unless user.confirmed?

      Result.success(
        status: :ok,
        payload: {
          message: 'Google sign-in successful',
          token: generate_jwt_token(user),
          user: UserSerializer.call(user),
          needs_mobile_onboarding: user.needs_mobile_onboarding?
        }
      )
    end

    def handle_account_collision(existing_user, google_uid, email, payload)
      if existing_user.auth_identities.exists?(provider: 'google')
        return Result.failure(
          status: :conflict,
          payload: { error: 'An account with this email is already linked to a different Google account.' }
        )
      end

      password = extract_link_password
      if password.present? && existing_user.valid_password?(password)
        link_and_sign_in_google(existing_user, google_uid, email, payload)
      else
        Result.failure(
          status: :conflict,
          payload: {
            error: 'An account with this email already exists. ' \
                   'Please verify your password to link your Google account.',
            code: 'account_collision',
            email: email
          }
        )
      end
    end

    def extract_link_password
      params[:link_account_password] || params[:password] ||
        params.dig(:auth, :link_account_password) || params.dig(:auth, :password)
    end

    def link_and_sign_in_google(user, google_uid, email, payload)
      user.auth_identities.create!(
        provider: 'google',
        uid: google_uid,
        email: email,
        metadata: { name: payload['name'], picture: payload['picture'] }
      )
      user.confirm unless user.confirmed?

      Result.success(
        status: :ok,
        payload: {
          message: 'Google account linked and login successful',
          token: generate_jwt_token(user),
          user: UserSerializer.call(user),
          needs_mobile_onboarding: user.needs_mobile_onboarding?
        }
      )
    end

    def create_google_user(email, google_uid, payload)
      user = build_google_user(email, payload)
      if user.save
        finalize_google_registration(user, google_uid, payload)
      else
        Result.failure(
          status: :unprocessable_content,
          payload: { error: 'Registration failed', details: user.errors.full_messages }
        )
      end
    end

    def build_google_user(email, payload)
      names = extract_google_names(payload)
      generated_password = Devise.friendly_token[0, 32]
      user = User.new(
        email: email,
        first_name: names[:first_name],
        last_name: names[:last_name],
        role: determine_target_role,
        password: generated_password,
        password_confirmation: generated_password
      )
      user.skip_confirmation!
      user
    end

    def extract_google_names(payload)
      first_name = payload['given_name'].presence || payload['name'].to_s.split.first.presence || 'Google'
      last_name = payload['family_name'].presence || payload['name'].to_s.split[1..]&.join(' ').presence || 'User'
      { first_name: first_name, last_name: last_name }
    end

    def determine_target_role
      role = params[:role] || params.dig(:auth, :role)
      %w[customer vendor].include?(role.to_s) ? role.to_s : 'customer'
    end

    def finalize_google_registration(user, google_uid, payload)
      user.auth_identities.create!(
        provider: 'google',
        uid: google_uid,
        email: user.email,
        metadata: { name: payload['name'], picture: payload['picture'] }
      )
      update_vendor_attributes(user) if user.vendor? && user.vendor.present?

      Result.success(
        status: :created,
        payload: {
          message: 'Google registration successful',
          token: generate_jwt_token(user),
          user: UserSerializer.call(user),
          needs_mobile_onboarding: true
        }
      )
    end

    def update_vendor_attributes(user)
      attrs = params.dig(:auth, :vendor_attributes) || params[:vendor_attributes]
      return unless attrs.is_a?(ActionController::Parameters) || attrs.is_a?(Hash)

      user.vendor.update(
        business_name: attrs[:business_name].presence || "#{user.full_name}'s Business",
        location: attrs[:location].presence || 'Delhi NCR'
      )
    end

    def generate_jwt_token(user)
      JwtService.encode(user_id: user.id, email: user.email, role: user.role)
    end
  end
end
