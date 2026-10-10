# frozen_string_literal: true

class ImageProcessingJob < ApplicationJob
  queue_as :low

  retry_on StandardError, wait: :polynomially_longer, attempts: 3

  def perform(service_image_id)
    service_image = ServiceImage.find(service_image_id)

    return unless service_image.image.attached?

    image = service_image.image

    # Generate thumbnail variant (300x200)
    image.variant(resize_to_limit: [300, 200]).processed

    # Generate medium variant (800x600)
    image.variant(resize_to_limit: [800, 600]).processed

    # Generate large variant (1200x900)
    image.variant(resize_to_limit: [1200, 900]).processed

    Rails.logger.info "Image processing completed for ServiceImage #{service_image_id}"
  rescue ActiveRecord::RecordNotFound
    Rails.logger.warn "ServiceImage #{service_image_id} not found, skipping processing"
  rescue StandardError => e
    Rails.logger.error "Image processing failed for ServiceImage #{service_image_id}: #{e.message}"
    raise e
  end
end
