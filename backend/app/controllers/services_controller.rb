# frozen_string_literal: true

# rubocop:disable Metrics/ClassLength
class ServicesController < ApiController
  before_action :authenticate_user!, except: %i[index show search]
  before_action :set_service, only: %i[show update destroy]
  before_action :ensure_vendor, only: %i[create update destroy]
  before_action :ensure_service_owner, only: %i[update destroy]

  def index
    search_params = {
      vendor_id: params[:vendor_id],
      category_id: params[:category_id],
      page: params[:page] || 1,
      per_page: params[:per_page] || 20,
      sort_by: params[:sort_by] || 'created_at',
      sort_direction: params[:sort_direction] || 'desc'
    }

    result = ServiceSearchService.call(search_params)

    render json: {
      services: result[:services].map { |service| service_response(service) },
      pagination: result[:pagination],
      filters: result[:filters]
    }
  end

  def show
    render json: service_response(@service, include_details: true)
  end

  # rubocop:disable Metrics/AbcSize
  def search
    # rubocop:enable Metrics/AbcSize
    search_params = {
      query: params[:q] || params[:query],
      location: params[:location],
      category_id: params[:category_id],
      min_price: params[:min_price],
      max_price: params[:max_price],
      pricing_type: params[:pricing_type],
      vendor_id: params[:vendor_id],
      page: params[:page] || 1,
      per_page: params[:per_page] || 20,
      sort_by: params[:sort_by] || 'created_at',
      sort_direction: params[:sort_direction] || 'desc'
    }

    result = ServiceSearchService.call(search_params)

    render json: {
      services: result[:services].map { |service| service_response(service) },
      pagination: result[:pagination],
      filters: result[:filters],
      total_count: result[:total_count]
    }
  end

  def create
    unless current_user.vendor_profile
      current_user.create_vendor_profile!(
        business_name: "#{current_user.first_name.presence || 'Vendor'}'s Services",
        location: 'Mumbai, India'
      )
    end

    @service = Service.new(service_params)
    @service.vendor_profile = current_user.vendor_profile

    if @service.save
      VendorService.find_or_create_by!(vendor_profile: current_user.vendor_profile, service: @service)

      cat_id = params.dig(:service, :service_category_id) || params.dig(:service, :category_id)
      if cat_id.present?
        category = Category.find_by(id: cat_id)
        @service.categories << category if category && @service.categories.exclude?(category)
      end

      @service.reload
      render json: {
        message: 'Service created successfully',
        service: service_response(@service, include_details: true)
      }, status: :created
    else
      render json: {
        error: 'Service creation failed',
        details: @service.errors.full_messages
      }, status: :unprocessable_content
    end
  end

  def update
    if @service.update(service_params)
      cat_id = params.dig(:service, :service_category_id) || params.dig(:service, :category_id)
      if cat_id.present?
        category = Category.find_by(id: cat_id)
        if category && @service.categories.exclude?(category)
          @service.categories.clear
          @service.categories << category
        end
      end

      @service.reload
      render json: {
        message: 'Service updated successfully',
        service: service_response(@service, include_details: true)
      }
    else
      render json: {
        error: 'Service update failed',
        details: @service.errors.full_messages
      }, status: :unprocessable_content
    end
  end

  def destroy
    @service.destroy
    render json: { message: 'Service deleted successfully' }
  end

  private

  def set_service
    @service = Service.find(params[:id])
  end

  def ensure_service_owner
    return if @service.vendor_profile.user == current_user

    render json: { error: 'You can only manage your own services' }, status: :forbidden
  end

  def ensure_vendor
    return if current_user&.role == 'vendor'

    render json: { error: 'Only vendors can manage services' }, status: :forbidden
  end

  def service_params
    params.expect(service: %i[name description base_price pricing_type status])
  end

  # rubocop:disable Metrics/MethodLength, Metrics/AbcSize
  def service_response(service, include_details: false)
    # rubocop:enable Metrics/MethodLength, Metrics/AbcSize
    vendor = service.vendor_profile
    featured_item = vendor&.featured_portfolio_items&.first
    featured_img = featured_item&.images&.first if featured_item&.images&.attached?
    vendor_img_url = featured_img ? (url_for(featured_img) rescue nil) : nil

    category_info = if (cat = service.service_category)
                      { id: cat.id, name: cat.name }
                    end

    response = {
      id: service.id,
      name: service.name,
      description: service.description,
      base_price: service.base_price,
      pricing_type: service.pricing_type,
      formatted_price: service.formatted_base_price,
      status: service.status,
      vendor: {
        id: vendor&.id,
        business_name: vendor&.business_name,
        location: vendor&.location,
        average_rating: vendor&.average_rating,
        total_reviews: vendor&.total_reviews,
        image: vendor_img_url,
        profile_image_url: vendor_img_url
      },
      category: category_info,
      images: service.service_images.map do |img|
        {
          id: img.id,
          url: img.image.attached? ? url_for(img.image) : nil,
          is_primary: img.is_primary
        }
      end,
      created_at: service.created_at,
      updated_at: service.updated_at
    }

    if include_details
      response[:vendor][:description] = service.vendor_profile.description
      response[:vendor][:years_experience] = service.vendor_profile.years_experience
      response[:vendor][:website] = service.vendor_profile.website
      response[:bookings_count] = service.bookings_count
      response[:can_be_booked] = service.can_be_booked?
    end

    response
  end
end
# rubocop:enable Metrics/ClassLength
