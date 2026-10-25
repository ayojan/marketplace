# frozen_string_literal: true

class ServiceSerializer < Blueprinter::Base
  identifier :id
  fields :vendor_id, :name, :description, :status, :base_price, :pricing_type

  field :formatted_price do |service|
    service.respond_to?(:formatted_base_price) ? service.formatted_base_price : nil
  end

  field :category do |service|
    cat = service.service_category if service.respond_to?(:service_category)
    cat ||= service.categories.first if service.respond_to?(:categories) && service.categories.present?
    if cat
      slug = cat.respond_to?(:slug) ? cat.slug : nil
      { id: cat.id, name: cat.name, slug: slug }
    end
  end

  field :categories do |service|
    if service.respond_to?(:categories) && service.categories.present?
      service.categories.map do |c|
        { id: c.id, name: c.name, slug: c.respond_to?(:slug) ? c.slug : nil }
      end
    else
      []
    end
  end

  field :images do |service|
    if service.respond_to?(:service_images) && service.service_images.any?
      ImageSerializer.render_as_hash(service.service_images.limit(5))
    elsif service.respond_to?(:images) && service.images.attached?
      ImageSerializer.render_as_hash(service.images.limit(5))
    else
      []
    end
  end
end
