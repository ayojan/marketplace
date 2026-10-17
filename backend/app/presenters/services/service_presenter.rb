# frozen_string_literal: true

module Services
  class ServicePresenter
    include Rails.application.routes.url_helpers

    attr_reader :service, :include_details, :url_helper

    def initialize(service, include_details: false, url_helper: nil)
      @service = service
      @include_details = include_details
      @url_helper = url_helper
    end

    def as_json(*)
      response = build_base_service_response
      append_service_details(response) if include_details
      response
    end

    private

    def build_base_service_response
      {
        id: service.id,
        vendor_id: service.vendor_id,
        name: service.name,
        description: service.description,
        base_price: service.base_price,
        pricing_type: service.pricing_type,
        formatted_price: service.formatted_base_price,
        status: service.status,
        vendor: service_vendor_json(service.vendor),
        category: service_category_json(service),
        images: service_images_json(service),
        created_at: service.created_at,
        updated_at: service.updated_at
      }
    end

    def append_service_details(response)
      vendor = service.vendor
      response[:vendor][:description] = vendor&.description
      response[:vendor][:years_experience] = vendor&.years_experience
      response[:vendor][:website] = vendor&.website
      response[:bookings_count] = service.bookings_count
      response[:can_be_booked] = service.can_be_booked?
    end

    def service_images_json(service)
      service.service_images.map do |img|
        {
          id: img.id,
          url: image_url(img.image),
          is_primary: img.is_primary,
          title: img.title
        }
      end
    end

    def service_category_json(service)
      cat = service.service_category
      return unless cat

      { id: cat.id, name: cat.name }
    end

    def service_vendor_json(vendor)
      img_url = vendor_image_url(vendor)
      primary_cat = vendor&.primary_category || vendor&.categories&.first
      {
        id: vendor&.id,
        user_id: vendor&.user_id,
        slug: vendor&.slug,
        business_name: vendor&.business_name,
        location: vendor&.location,
        average_rating: vendor&.average_rating,
        total_reviews: vendor&.total_reviews,
        is_verified: vendor&.verified?,
        verification_status: vendor&.verification_status,
        primary_category: primary_cat ? { id: primary_cat.id, name: primary_cat.name, slug: primary_cat.slug } : nil,
        service_categories: vendor&.service_categories_list || [],
        image: img_url,
        profile_image_url: img_url
      }
    end

    def vendor_image_url(vendor)
      item = vendor&.featured_portfolio_items&.first
      return unless item&.images&.attached?

      image_url(item.images.first)
    end

    def image_url(attachment)
      return nil unless attachment&.attached?

      if url_helper.respond_to?(:url_for)
        url_helper.url_for(attachment)
      else
        url_for(attachment)
      end
    rescue StandardError
      nil
    end
  end
end

ServicePresenter = Services::ServicePresenter
