# frozen_string_literal: true

# == Schema Information
#
# Table name: services
#
#  id             :bigint           not null, primary key
#  average_rating :decimal(3, 2)    default(0.0)
#  base_price     :decimal(10, 2)
#  description    :text
#  name           :string
#  pricing_type   :string           default("hourly")
#  search_vector  :tsvector
#  status         :string           default("draft")
#  total_reviews  :integer          default(0)
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#  vendor_id      :bigint           not null
#
# Indexes
#
#  index_services_on_average_rating        (average_rating)
#  index_services_on_search_vector         (search_vector) USING gin
#  index_services_on_status                (status)
#  index_services_on_vendor_id             (vendor_id)
#  index_services_on_vendor_id_and_status  (vendor_id,status)
#
# Foreign Keys
#
#  fk_rails_...  (vendor_id => vendors.id)
#
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
      images = service.service_images.loaded? ? service.service_images.first(5) : service.service_images.limit(5)
      ImageSerializer.render_as_hash(images)
    elsif service.respond_to?(:images) && service.images.attached?
      images = if service.images.attachments.loaded?
                 service.images.attachments.first(5)
               else
                 service.images.attachments
                        .limit(5)
               end
      ImageSerializer.render_as_hash(images)
    else
      []
    end
  end
end
