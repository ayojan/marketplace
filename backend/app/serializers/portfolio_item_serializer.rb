# frozen_string_literal: true

class PortfolioItemSerializer < Blueprinter::Base
  identifier :id
  fields :title, :description, :category, :is_featured

  field :image_count do |item|
    item.images.attached? ? item.images.size : 0
  end

  field :primary_image_url do |item|
    if item.images.attached? && item.images.first
      begin
        Rails.application.routes.url_helpers.url_for(item.images.first)
      rescue StandardError
        nil
      end
    end
  end

  field :images do |item|
    if item.images.attached?
      ImageSerializer.render_as_hash(item.images)
    else
      []
    end
  end
end
