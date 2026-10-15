# frozen_string_literal: true

# rubocop:disable Metrics/ModuleLength
module VendorSerializable
  extend ActiveSupport::Concern

  private

  def vendor_summary_json(vendor)
    featured_items = vendor.featured_portfolio_items
    primary_image = extract_primary_image(featured_items.first)

    {
      id: vendor.id,
      slug: vendor.slug,
      business_name: vendor.business_name,
      location: vendor.location,
      average_rating: vendor.average_rating,
      total_reviews: vendor.total_reviews,
      years_experience: vendor.years_experience,
      is_verified: vendor.verified?,
      service_categories: vendor.service_categories_list,
      profile_image_url: primary_image,
      image: primary_image,
      base_price: calculate_vendor_min_price(vendor),
      featured_portfolio: featured_items.first(3).map { |item| portfolio_item_json(item) }
    }
  end

  def vendor_detail_json(vendor)
    featured_items = vendor.featured_portfolio_items
    primary_image = extract_primary_image(featured_items.first)

    vendor_core_attributes(vendor, primary_image)
      .merge(vendor_operational_attributes(vendor))
      .merge(vendor_meta_attributes(vendor, featured_items))
  end

  def vendor_core_attributes(vendor, primary_image)
    {
      id: vendor.id,
      slug: vendor.slug,
      business_name: vendor.business_name,
      description: vendor.description,
      location: vendor.location,
      phone: vendor.phone,
      website: vendor.website,
      instagram_handle: vendor.instagram_handle,
      facebook_url: vendor.facebook_url,
      profile_image_url: primary_image,
      image: primary_image
    }
  end

  def vendor_operational_attributes(vendor)
    {
      cancellation_policy: vendor.cancellation_policy,
      response_time_hours: vendor.response_time_hours,
      completion_rate: vendor.completion_rate,
      business_license: vendor.business_license,
      verification_status: vendor.verification_status,
      years_experience: vendor.years_experience,
      average_rating: vendor.average_rating,
      total_reviews: vendor.total_reviews,
      is_verified: vendor.verified?,
      base_price: calculate_vendor_min_price(vendor),
      service_categories: vendor.service_categories_list
    }
  end

  def calculate_vendor_min_price(vendor)
    if vendor.services.loaded?
      vendor.services.filter_map(&:base_price).min
    else
      vendor.services.minimum(:base_price)
    end
  end

  def vendor_meta_attributes(vendor, featured_items)
    {
      coordinates: vendor.coordinates,
      portfolio_items_count: vendor.portfolio_items.size,
      featured_portfolio: featured_items.map { |item| portfolio_item_json(item) },
      user: vendor_user_json(vendor.user),
      created_at: vendor.created_at,
      updated_at: vendor.updated_at
    }
  end

  def extract_primary_image(first_featured)
    return unless first_featured&.images&.attached?

    image_summary_json(first_featured.images.first)&.dig(:url)
  end

  def vendor_user_json(user)
    {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email
    }
  end

  def service_json(service)
    {
      id: service.id,
      name: service.name,
      description: service.description,
      base_price: service.base_price,
      pricing_type: service.pricing_type,
      category: if service.service_category
                  {
                    id: service.service_category.id,
                    name: service.service_category.name,
                    slug: service.service_category.respond_to?(:slug) ? service.service_category.slug : nil
                  }
                end,
      images: service.service_images.limit(3).map { |img| image_summary_json(img) }
    }
  end

  def portfolio_item_json(item)
    image_list = item.images.attached? ? item.images.map { |image| image_summary_json(image) } : []
    first_url = image_list.first&.dig(:url)

    {
      id: item.id,
      title: item.title,
      description: item.description,
      category: item.category,
      is_featured: item.is_featured,
      image_count: image_list.size,
      primary_image_url: first_url,
      images: image_list
    }
  end

  def availability_slot_json(slot)
    {
      id: slot.id,
      date: slot.date,
      start_time: slot.start_time,
      end_time: slot.end_time,
      is_available: slot.is_available
    }
  end

  def image_summary_json(image)
    {
      id: image.id,
      url: image.is_a?(ActiveStorage::Attachment) ? url_for(image) : nil
    }
  rescue StandardError
    { id: image.id, url: nil }
  end
end
# rubocop:enable Metrics/ModuleLength
