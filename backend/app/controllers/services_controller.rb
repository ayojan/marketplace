# frozen_string_literal: true

class ServicesController < ApiController
  before_action :authenticate_user!, except: %i[index show search]
  before_action :set_service, only: %i[update destroy]
  before_action :ensure_vendor, only: %i[create update destroy]
  before_action :ensure_service_owner, only: %i[update destroy]

  def index
    result = Services::SearchService.call(index_search_params)

    render json: {
      services: result[:services].map { |service| present_service(service) },
      pagination: result[:pagination],
      filters: result[:filters]
    }
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
      render json: {
        message: 'Service created successfully',
        service: present_service(result[:service], include_details: true)
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
      render json: {
        message: 'Service updated successfully',
        service: present_service(result[:service], include_details: true)
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

  def set_service
    @service = Service.find(params[:id])
  end

  def ensure_service_owner
    return if @service.vendor.user == current_user

    render json: { error: 'You can only manage your own services' }, status: :forbidden
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
