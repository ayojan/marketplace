# frozen_string_literal: true

# rubocop:disable Metrics/ModuleLength
module VendorSerializable
  extend ActiveSupport::Concern

  private

  def vendor_summary_json(vendor)
    featured_items = vendor.featured_portfolio_items
    primary_image = extract_primary_image(featured_items.first)

    vendor_core_attributes(vendor, primary_image)
      .slice(:id, :user_id, :slug, :business_name, :location, :profile_image_url, :image)
      .merge(vendor_summary_operational_attributes(vendor))
      .merge(
        base_price: calculate_vendor_min_price(vendor),
        metadata: vendor.metadata || {},
        featured_portfolio: featured_items.first(3).map { |item| portfolio_item_json(item) }
      )
  end

  def vendor_summary_operational_attributes(vendor)
    {
      average_rating: vendor.average_rating,
      total_reviews: vendor.total_reviews,
      years_experience: vendor.years_experience,
      is_verified: vendor.verified?,
      verification_status: vendor.verification_status,
      primary_category: vendor_primary_category_json(vendor),
      categories: vendor_categories_json(vendor),
      service_categories: vendor.service_categories_list
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
      user_id: vendor.user_id,
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
      primary_category: vendor_primary_category_json(vendor),
      categories: vendor_categories_json(vendor),
      service_categories: vendor.service_categories_list,
      metadata: vendor.metadata || {}
    }
  end

  def vendor_primary_category_json(vendor)
    cat = vendor.primary_category || vendor.categories.first
    return nil unless cat

    { id: cat.id, name: cat.name, slug: cat.slug }
  end

  def vendor_categories_json(vendor)
    vcs = vendor_categories_collection(vendor)
    return [] if vcs.empty?

    vcs.sort_by { |vc| vc.is_primary? ? 0 : 1 }.map { |vc| format_vendor_category(vc) }
  end

  def vendor_categories_collection(vendor)
    if vendor.association(:vendor_categories).loaded?
      vendor.vendor_categories
    else
      vendor.vendor_categories.includes(:category)
    end
  end

  def format_vendor_category(vendor_category)
    cat = vendor_category.category
    {
      id: vendor_category.category_id,
      name: cat&.name,
      slug: cat&.slug,
      is_primary: vendor_category.is_primary?
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
      vendor_id: service.vendor_id,
      name: service.name,
      description: service.description,
      status: service.status,
      base_price: service.base_price,
      pricing_type: service.pricing_type,
      formatted_price: service.respond_to?(:formatted_base_price) ? service.formatted_base_price : nil,
      category: service_primary_category_json(service),
      categories: service_categories_json(service),
      images: service_images_json(service)
    }
  end

  def service_primary_category_json(service)
    cat = service.service_category if service.respond_to?(:service_category)
    cat ||= service.categories.first if service.respond_to?(:categories) && service.categories.present?
    return nil unless cat

    { id: cat.id, name: cat.name, slug: cat.respond_to?(:slug) ? cat.slug : nil }
  end

  def service_categories_json(service)
    return [] unless service.respond_to?(:categories) && service.categories.present?

    service.categories.map do |c|
      { id: c.id, name: c.name, slug: c.respond_to?(:slug) ? c.slug : nil }
    end
  end

  def service_images_json(service)
    if service.respond_to?(:service_images) && service.service_images.any?
      service.service_images.limit(5).map { |img| image_summary_json(img) }
    elsif service.respond_to?(:images) && service.images.attached?
      service.images.limit(5).map { |img| image_summary_json(img) }
    else
      []
    end
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
    url = if image.is_a?(ActiveStorage::Attachment)
            url_for(image)
          elsif image.respond_to?(:image) && image.image.attached?
            url_for(image.image)
          end

    {
      id: image.id,
      url: url,
      is_primary: image.respond_to?(:is_primary) ? image.is_primary : nil,
      title: image.respond_to?(:title) ? image.title : nil
    }
  rescue StandardError
    { id: image.id, url: nil }
  end
end
# rubocop:enable Metrics/ModuleLength
