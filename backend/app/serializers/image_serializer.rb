# frozen_string_literal: true

class ImageSerializer < Blueprinter::Base
  identifier :id

  field :url do |image|
    if image.is_a?(ActiveStorage::Attachment)
      Rails.application.routes.url_helpers.url_for(image)
    elsif image.respond_to?(:image) && image.image.attached?
      Rails.application.routes.url_helpers.url_for(image.image)
    end
  rescue StandardError
    nil
  end

  field :is_primary do |image|
    image.respond_to?(:is_primary) ? image.is_primary : nil
  end

  field :title do |image|
    image.respond_to?(:title) ? image.title : nil
  end
end
