# frozen_string_literal: true

# rubocop:disable Metrics/ClassLength
class ServiceImagesController < ApiController
  before_action :authenticate_user!
  before_action :ensure_vendor
  before_action :set_service
  before_action :ensure_service_owner
  before_action :set_service_image, only: %i[show update destroy set_primary]

  # GET /api/services/:service_id/images
  def index
    @service_images = @service.service_images.ordered

    render json: {
      service_images: @service_images.map { |image| service_image_response(image) }
    }
  end

  # GET /api/services/:service_id/images/:id
  def show
    render json: {
      service_image: detailed_service_image_response(@service_image)
    }
  end

  # POST /api/services/:service_id/images
  def create
    @service_image = @service.service_images.build(service_image_params)

    if @service_image.save
      # Process image in background if job exists
      if defined?(ImageProcessingJob) && @service_image.image.attached?
        ImageProcessingJob.perform_later(@service_image.id)
      end

      render json: {
        message: 'Image uploaded successfully',
        service_image: detailed_service_image_response(@service_image)
      }, status: :created
    else
      render json: {
        error: 'Image upload failed',
        details: @service_image.errors.full_messages
      }, status: :unprocessable_content
    end
  end

  # PUT/PATCH /api/services/:service_id/images/:id
  def update
    if @service_image.update(service_image_update_params)
      render json: {
        message: 'Image updated successfully',
        service_image: detailed_service_image_response(@service_image)
      }
    else
      render json: {
        error: 'Image update failed',
        details: @service_image.errors.full_messages
      }, status: :unprocessable_content
    end
  end

  # DELETE /api/services/:service_id/images/:id
  def destroy
    @service_image.destroy
    render json: {
      message: 'Image deleted successfully'
    }
  end

  # POST /api/services/:service_id/images/:id/set_primary
  def set_primary
    ServiceImage.set_primary_for_service(@service.id, @service_image.id)

    render json: {
      message: 'Primary image updated successfully',
      service_image: detailed_service_image_response(@service_image.reload)
    }
  end

  # POST /api/services/:service_id/images/reorder
  def reorder
    image_ids = params[:image_ids]

    if image_ids.blank? || !image_ids.is_a?(Array)
      render json: {
        error: 'image_ids parameter is required and must be an array'
      }, status: :bad_request
      return
    end

    # Verify all image IDs belong to this service
    service_image_ids = @service.service_images.pluck(:id)
    invalid_ids = image_ids.map(&:to_i) - service_image_ids

    if invalid_ids.any?
      render json: {
        error: 'Invalid image IDs provided',
        invalid_ids: invalid_ids
      }, status: :bad_request
      return
    end

    ServiceImage.reorder_for_service(@service.id, image_ids)

    render json: {
      message: 'Images reordered successfully'
    }
  end

  # POST /api/services/:service_id/images/bulk_upload
  # rubocop:disable Metrics/MethodLength, Metrics/AbcSize, Metrics/CyclomaticComplexity, Metrics/PerceivedComplexity
  def bulk_upload
    # rubocop:enable Metrics/MethodLength, Metrics/AbcSize, Metrics/CyclomaticComplexity, Metrics/PerceivedComplexity
    images = params[:images]

    if images.blank? || !images.is_a?(Array)
      render json: {
        error: 'images parameter is required and must be an array'
      }, status: :bad_request
      return
    end

    uploaded_images = []
    errors = []

    images.each_with_index do |image_data, index|
      service_image = @service.service_images.build(
        image: image_data[:image],
        title: image_data[:title],
        description: image_data[:description],
        alt_text: image_data[:alt_text],
        display_order: index
      )

      if service_image.save
        uploaded_images << service_image
        # Process image in background if job exists
        if defined?(ImageProcessingJob) && service_image.image.attached?
          ImageProcessingJob.perform_later(service_image.id)
        end
      else
        errors << {
          index: index,
          errors: service_image.errors.full_messages
        }
      end
    end

    if errors.any?
      render json: {
        message: "#{uploaded_images.count} images uploaded successfully, #{errors.count} failed",
        uploaded_images: uploaded_images.map { |img| service_image_response(img) },
        errors: errors
      }, status: :partial_content
    else
      render json: {
        message: "#{uploaded_images.count} images uploaded successfully",
        service_images: uploaded_images.map { |img| service_image_response(img) }
      }, status: :created
    end
  end

  private

  def set_service
    @service = Service.find(params[:service_id])
  rescue ActiveRecord::RecordNotFound
    render json: {
      error: 'Service not found'
    }, status: :not_found
  end

  def set_service_image
    @service_image = @service.service_images.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: {
      error: 'Image not found'
    }, status: :not_found
  end

  def ensure_vendor
    return if current_user&.role == 'vendor'

    render json: {
      error: 'Only vendors can manage service images'
    }, status: :forbidden
  end

  def ensure_service_owner
    return if @service&.vendor&.user == current_user

    render json: {
      error: 'You can only manage images for your own services'
    }, status: :forbidden
  end

  def service_image_params
    params.expect(service_image: %i[image title description alt_text display_order is_primary])
  end

  def service_image_update_params
    params.expect(service_image: %i[title description alt_text display_order is_primary])
  end

  def service_image_response(service_image)
    {
      id: service_image.id,
      title: service_image.title,
      description: service_image.description,
      alt_text: service_image.alt_text,
      display_order: service_image.display_order,
      is_primary: service_image.is_primary,
      thumbnail_url: service_image.thumbnail_url,
      medium_url: service_image.medium_url,
      file_size_mb: service_image.file_size_mb,
      created_at: service_image.created_at,
      updated_at: service_image.updated_at
    }
  end

  def detailed_service_image_response(service_image)
    {
      id: service_image.id,
      title: service_image.title,
      description: service_image.description,
      alt_text: service_image.alt_text,
      display_order: service_image.display_order,
      is_primary: service_image.is_primary,
      thumbnail_url: service_image.thumbnail_url,
      medium_url: service_image.medium_url,
      large_url: service_image.large_url,
      original_url: service_image.image_url,
      dimensions: service_image.image_dimensions,
      file_size_mb: service_image.file_size_mb,
      content_type: service_image.image.attached? ? service_image.image.blob.content_type : nil,
      filename: service_image.image.attached? ? service_image.image.blob.filename : nil,
      created_at: service_image.created_at,
      updated_at: service_image.updated_at
    }
  end
end
# rubocop:enable Metrics/ClassLength
