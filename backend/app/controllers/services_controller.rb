# frozen_string_literal: true

# rubocop:disable Metrics/ClassLength
class ServicesController < ApiController
  before_action :authenticate_user!, except: %i[index show search]
  before_action :set_service, only: %i[update destroy]
  before_action :ensure_vendor, only: %i[create update destroy]
  before_action :ensure_service_owner, only: %i[update destroy]

  def index
    if vendor_scoped_index?
      render_vendor_services
    else
      result = Services::SearchService.call(index_search_params)
      render json: {
        services: result[:services].map { |service| present_service(service) },
        pagination: result[:pagination],
        filters: result[:filters]
      }
    end
  end

  def show
    @service = Service.includes(
      :categories,
      :bookings,
      service_images: { image_attachment: :blob },
      vendor: { portfolio_items: { images_attachments: :blob } }
    ).find(params[:id])

    render json: present_service(@service, include_details: true)
  end

  def search
    result = Services::SearchService.call(search_params)

    render json: {
      services: result[:services].map { |service| present_service(service) },
      pagination: result[:pagination],
      filters: result[:filters],
      total_count: result[:total_count]
    }
  end

  def create
    result = Services::CreateService.call(user: current_user, params: params)

    if result[:success]
      service = preload_service(result[:service])
      render json: {
        message: 'Service created successfully',
        service: present_service(service, include_details: true)
      }, status: :created
    else
      render json: {
        error: 'Service creation failed',
        details: result[:errors]
      }, status: :unprocessable_content
    end
  end

  def update
    result = Services::UpdateService.call(service: @service, params: params)

    if result[:success]
      service = preload_service(result[:service])
      render json: {
        message: 'Service updated successfully',
        service: present_service(service, include_details: true)
      }
    else
      render json: {
        error: 'Service update failed',
        details: result[:errors]
      }, status: :unprocessable_content
    end
  end

  def destroy
    @service.destroy
    render json: { message: 'Service deleted successfully' }
  end

  private

  def preload_service(service_or_id)
    id = service_or_id.is_a?(Service) ? service_or_id.id : service_or_id
    Service.includes(
      :categories,
      :bookings,
      service_images: { image_attachment: :blob },
      vendor: [
        :primary_vendor_category,
        :primary_category,
        :categories,
        { vendor_categories: :category },
        { portfolio_items: { images_attachments: :blob } }
      ]
    ).find_by(id: id) || service_or_id
  end

  def set_service
    @service = Service.find(params[:id])
  end

  def ensure_service_owner
    return if owner_authorized?

    render json: { error: 'You can only manage your own services' }, status: :forbidden
  end

  def owner_authorized?
    return false unless @service && current_user

    vendor = @service.vendor
    return true if vendor&.user_id == current_user.id
    return true if current_user.vendor && @service.vendor_id == current_user.vendor.id

    @service.vendors.exists?(user_id: current_user.id)
  end

  def vendor_scoped_index?
    return false unless current_user&.vendor?
    return true if params[:scope] == 'mine'

    no_filters = %i[vendor_id q query category_id].all? { |key| params[key].blank? }
    no_filters && params[:all] != 'true'
  end

  def render_vendor_services
    vendor = current_user.vendor
    services = if vendor
                 vendor.services
                       .includes(:categories, service_images: { image_attachment: :blob })
                       .order(created_at: :desc)
               else
                 Service.none
               end

    render json: {
      services: services.map { |service| present_service(service, include_details: true) },
      pagination: { current_page: 1, total_pages: 1, total_count: services.count },
      filters: {}
    }
  end

  def ensure_vendor
    return if current_user&.role == 'vendor'

    render json: { error: 'Only vendors can manage services' }, status: :forbidden
  end

  def present_service(service, include_details: false)
    Services::ServicePresenter.new(service, include_details: include_details, url_helper: self).as_json
  end

  def index_search_params
    search_params.slice(:vendor_id, :category_id, :page, :per_page, :sort_by, :sort_direction)
  end

  def search_params
    {
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
  end
end
# rubocop:enable Metrics/ClassLength
