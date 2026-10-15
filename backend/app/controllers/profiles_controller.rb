# frozen_string_literal: true

# rubocop:disable Metrics/ClassLength
class ProfilesController < ApiController
  before_action :authenticate_user!, except: [:service_categories]
  before_action :set_profile, only: %i[show update destroy]
  before_action :ensure_vendor_role, only: %i[me update_me create update destroy]
  before_action :ensure_own_profile, only: %i[update destroy]

  def show
    if @profile
      render json: profile_response(@profile)
    else
      render json: { error: 'Profile not found' }, status: :not_found
    end
  end

  def me
    if current_user.vendor_profile
      render json: profile_response(current_user.vendor_profile)
    else
      render json: { error: 'No profile found' }, status: :not_found
    end
  end

  def update_me
    @profile = current_user.vendor_profile
    return render json: { error: 'No profile found' }, status: :not_found unless @profile

    apply_metadata(@profile)

    if @profile.update(profile_params)
      render json: profile_response(@profile)
    else
      render json: {
        error: 'Profile update failed',
        details: @profile.errors.full_messages
      }, status: :unprocessable_content
    end
  end

  def create
    if current_user.vendor_profile.present?
      render json: { error: 'Profile already exists' }, status: :unprocessable_content
      return
    end

    @profile = VendorProfile.new(profile_params)
    @profile.user = current_user
    apply_metadata(@profile)

    if @profile.save
      render json: profile_response(@profile), status: :created
    else
      render json: {
        error: 'Profile creation failed',
        details: @profile.errors.full_messages
      }, status: :unprocessable_content
    end
  end

  def update
    apply_metadata(@profile)

    if @profile.update(profile_params)
      render json: profile_response(@profile)
    else
      render json: {
        error: 'Profile update failed',
        details: @profile.errors.full_messages
      }, status: :unprocessable_content
    end
  end

  def destroy
    @profile.destroy
    head :no_content
  end

  def request_verification
    @profile = current_user.vendor_profile
    if @profile.request_verification!
      render json: { message: 'Verification request submitted successfully', status: @profile.verification_status }
    else
      render json: { error: 'Failed to submit verification request' }, status: :unprocessable_content
    end
  end

  def service_categories
    categories = Category.where(active: true)
    render json: {
      service_categories: categories.map { |cat| { id: cat.id, name: cat.name, description: cat.description } }
    }
  end

  private

  def set_profile
    @profile = if params[:id]
                 VendorProfile.find_by_id_or_slug!(params[:id])
               else
                 current_user.vendor_profile
               end
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Vendor profile not found' }, status: :not_found
  end

  def ensure_vendor_role
    return if current_user.vendor?

    render json: { error: 'Access denied. Vendor role required.' }, status: :forbidden
  end

  def ensure_own_profile
    return if @profile.user == current_user

    render json: { error: 'Access denied. You can only manage your own profile.' }, status: :forbidden
  end

  def apply_metadata(profile)
    meta_raw = params.dig(:vendor_profile, :metadata)
    return if meta_raw.blank?

    parsed = parse_metadata_param(meta_raw)
    profile.metadata = (profile.metadata || {}).merge(parsed.stringify_keys)
  rescue StandardError => e
    Rails.logger.warn("Metadata extraction error: #{e.message}")
  end

  def parse_metadata_param(meta_raw)
    if meta_raw.is_a?(String)
      parse_metadata_json(meta_raw)
    elsif meta_raw.respond_to?(:to_unsafe_h)
      meta_raw.to_unsafe_h
    elsif meta_raw.is_a?(Hash)
      meta_raw
    else
      {}
    end
  end

  def parse_metadata_json(raw_str)
    JSON.parse(raw_str)
  rescue JSON::ParserError
    {}
  end

  def profile_params
    return {} if params[:vendor_profile].blank?

    params.require(:vendor_profile).except(:metadata).permit(
      :business_name, :description, :location, :phone, :website,
      :years_experience, :cancellation_policy, :instagram_handle,
      :business_license, service_categories_list: []
    )
  end

  def profile_response(profile)
    {
      id: profile.id,
      slug: profile.slug,
      user_id: profile.user_id,
      business_name: profile.business_name,
      description: profile.description,
      location: profile.location,
      phone: profile.phone,
      website: profile.website,
      instagram_handle: profile.instagram_handle,
      cancellation_policy: profile.cancellation_policy,
      business_license: profile.business_license,
      verification_status: profile.verification_status,
      years_experience: profile.years_experience,
      service_categories: profile.service_categories_list || [],
      metadata: profile.metadata || {},
      created_at: profile.created_at,
      updated_at: profile.updated_at
    }
  end
end
# rubocop:enable Metrics/ClassLength
