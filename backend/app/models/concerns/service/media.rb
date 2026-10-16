# frozen_string_literal: true

module Service::Media
  extend ActiveSupport::Concern

  included do
    has_many :service_images, dependent: :destroy
    has_many_attached :images

    delegate :count, to: :service_images, prefix: true
  end

  def images?
    images.attached? || service_images.any?
  end

  def primary_image
    service_images.primary.first&.image || images.first
  end

  def primary_service_image
    service_images.primary.first
  end

  def ordered_service_images
    service_images.ordered
  end
end
