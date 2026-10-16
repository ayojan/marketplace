# frozen_string_literal: true

# rubocop:disable Metrics/ClassLength
class AuthController < ApplicationController
  skip_before_action :authenticate_request, only: %i[login register logout google]
  before_action :validate_auth_params, only: %i[login register]

  rate_limit to: 30, within: 1.minute, only: :google,
             unless: -> { Rails.env.test? },
             with: lambda {
               render json: { error: 'Too many requests. Please try again later.' }, status: :too_many_requests
             }

  def login
    return render_missing_params_error unless auth_params[:email].present? && auth_params[:password].present?

    user = User.find_by(email: auth_params[:email])

    if user&.valid_password?(auth_params[:password])
      user.confirm unless user.confirmed?

      token = generate_jwt_token(user)
      render json: {
        message: 'Login successful',
        token: token,
        user: user_response(user)
      }, status: :ok
    else
      render json: { error: 'Invalid credentials' }, status: :unauthorized
    end
  end

  def register
    user = User.new(auth_params)
    user.skip_confirmation!

    if user.save
      attach_initial_vendor_category(user.vendor) if user.vendor? && user.vendor.present?
      token = generate_jwt_token(user)
      render json: {
        message: 'Registration successful',
        token: token,
        user: user_response(user)
      }, status: :created
    else
      render json: {
        error: 'Registration failed',
        details: user.errors.full_messages
      }, status: :unprocessable_content
    end
  end

  def google
    id_token = extract_google_token
    return render json: { error: 'Google ID token is required' }, status: :bad_request if id_token.blank?

    payload = verify_google_id_token(id_token)
    return if performed?

    process_google_sign_in(payload)
  end

  def logout
    # JWT tokens are stateless, so logout is handled client-side
    render json: { message: 'Logout successful' }, status: :ok
  end

  private

  def extract_google_token
    params[:id_token] || params[:credential] ||
      params.dig(:auth, :id_token) || params.dig(:auth, :credential)
  end

  def verify_google_id_token(id_token)
    Users::GoogleTokenVerifier.verify(id_token)
  rescue Users::GoogleTokenVerifier::VerificationError => e
    render json: { error: e.message }, status: :unauthorized
    nil
  end

  def process_google_sign_in(payload)
    google_uid = payload['sub'].to_s
    identity = AuthIdentity.find_google_identity(google_uid)
    return handle_existing_google_identity(identity) if identity

    email = payload['email'].to_s.downcase.strip
    existing_user = User.find_by(email: email)
    return handle_google_account_collision(existing_user, google_uid, email, payload) if existing_user

    create_google_user(email, google_uid, payload)
  end

  def handle_existing_google_identity(identity)
    user = identity.user
    user.confirm unless user.confirmed?

    render json: {
      message: 'Google sign-in successful',
      token: generate_jwt_token(user),
      user: user_response(user),
      needs_mobile_onboarding: user.needs_mobile_onboarding?
    }, status: :ok
  end

  def handle_google_account_collision(existing_user, google_uid, email, payload)
    return render_google_conflict if existing_user.auth_identities.exists?(provider: 'google')

    password = extract_link_password
    if password.present? && existing_user.valid_password?(password)
      link_and_sign_in_google(existing_user, google_uid, email, payload)
    else
      render_account_collision_prompt(email)
    end
  end

  def extract_link_password
    params[:link_account_password] || params[:password] ||
      params.dig(:auth, :link_account_password) || params.dig(:auth, :password)
  end

  def render_google_conflict
    render json: {
      error: 'An account with this email is already linked to a different Google account.'
    }, status: :conflict
  end

  def link_and_sign_in_google(user, google_uid, email, payload)
    user.auth_identities.create!(
      provider: 'google',
      uid: google_uid,
      email: email,
      metadata: { name: payload['name'], picture: payload['picture'] }
    )
    user.confirm unless user.confirmed?

    render json: {
      message: 'Google account linked and login successful',
      token: generate_jwt_token(user),
      user: user_response(user),
      needs_mobile_onboarding: user.needs_mobile_onboarding?
    }, status: :ok
  end

  def render_account_collision_prompt(email)
    render json: {
      error: 'An account with this email already exists. Please verify your password to link your Google account.',
      code: 'account_collision',
      email: email
    }, status: :conflict
  end

  def create_google_user(email, google_uid, payload)
    user = build_google_user(email, payload)
    if user.save
      finalize_google_registration(user, google_uid, payload)
    else
      render json: { error: 'Registration failed', details: user.errors.full_messages },
             status: :unprocessable_content
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

    render json: {
      message: 'Google registration successful',
      token: generate_jwt_token(user),
      user: user_response(user),
      needs_mobile_onboarding: true
    }, status: :created
  end

  def update_vendor_attributes(user)
    attrs = params.dig(:auth, :vendor_attributes) || params[:vendor_attributes]
    return unless attrs.is_a?(ActionController::Parameters) || attrs.is_a?(Hash)

    user.vendor.update(
      business_name: attrs[:business_name].presence || "#{user.full_name}'s Business",
      location: attrs[:location].presence || 'Delhi NCR'
    )
  end

  def validate_auth_params
    return if params[:auth].present?

    render json: { error: 'Authentication parameters are required' }, status: :bad_request
  end

  def render_missing_params_error
    render json: { error: 'Email and password are required' }, status: :bad_request
  end

  def auth_params
    permitted = params.expect(
      auth: [:email, :password, :password_confirmation, :first_name, :last_name, :role,
             { vendor_attributes: %i[business_name location description phone website
                                     category category_id service_category],
               customer_attributes: %i[phone location preferences event_types budget_range company_name] }]
    )
    permitted[:role] = 'customer' unless %w[customer vendor].include?(permitted[:role].to_s)
    clean_vendor_attributes(permitted)
    permitted
  end

  def clean_vendor_attributes(permitted)
    attributes = permitted[:vendor_attributes]
    return unless attributes.respond_to?(:key?)

    attributes.delete(:category)
    attributes.delete(:category_id)
    attributes.delete(:service_category)
    normalize_vendor_description(permitted, attributes)
  end

  def normalize_vendor_description(permitted, attributes)
    desc = attributes[:description].to_s.strip
    return if desc.blank? || desc.length >= 50

    business = attributes[:business_name].presence || "#{permitted[:first_name]} #{permitted[:last_name]}"
    location = attributes[:location].presence || 'Delhi NCR'
    attributes[:description] = default_vendor_bio(desc, business, location)
  end

  def attach_initial_vendor_category(vendor)
    cat_param = params.dig(:auth, :vendor_attributes, :category) ||
                params.dig(:auth, :vendor_attributes, :category_id) ||
                params.dig(:auth, :vendor_attributes, :service_category) ||
                params.dig(:auth, :category)
    return if cat_param.blank?

    category = find_matching_category(cat_param)
    create_starter_service(vendor, category) if category
  rescue StandardError => e
    Rails.logger.warn("Failed to attach initial category to vendor #{vendor.id}: #{e.message}")
  end

  def create_starter_service(vendor, category)
    service = vendor.services.create(
      name: "#{vendor.business_name} - #{category.name}",
      description: "Professional #{category.name} services by #{vendor.business_name} in " \
                   "#{vendor.location}. Dedicated to providing exceptional experiences.",
      base_price: 15_000,
      pricing_type: :package,
      status: :active
    )
    service.categories << category if service.persisted?
  end

  def find_matching_category(identifier)
    return Category.find_by(id: identifier) if identifier.to_s.match?(/\A\d+\z/)

    exact = Category.find_by('name ILIKE ?', identifier.to_s.strip)
    return exact if exact

    words = identifier.to_s.split(/[^\w]+/).compact_blank
    words.each do |word|
      match = Category.where('name ILIKE ?', "%#{word}%").first
      return match if match
    end

    Category.first
  end

  def default_vendor_bio(desc, business, location)
    "Professional #{desc} by #{business} based in #{location}. " \
      'Dedicated to delivering exceptional service and memorable experiences.'
  end

  def user_response(user)
    res = base_user_response(user)
    res.merge!(vendor_data(user)) if user.vendor? && user.vendor
    res.merge!(customer_data(user)) if user.customer? && user.customer
    res
  end

  def base_user_response(user)
    {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      confirmed: user.confirmed?,
      phone: user.phone,
      needs_mobile_onboarding: user.needs_mobile_onboarding?,
      has_google_identity: user.auth_identities.exists?(provider: 'google'),
      created_at: user.created_at
    }
  end

  def vendor_data(user)
    vendor = user.vendor
    {
      vendor_id: vendor.id,
      vendor: {
        id: vendor.id,
        slug: vendor.slug,
        business_name: vendor.business_name
      }
    }
  end

  def customer_data(user)
    customer = user.customer
    {
      customer_id: customer.id,
      customer: {
        id: customer.id,
        phone: customer.phone,
        location: customer.location
      }
    }
  end

  def generate_jwt_token(user)
    Users::JwtService.encode(user_id: user.id, email: user.email, role: user.role)
  end
end
# rubocop:enable Metrics/ClassLength
