# frozen_string_literal: true

module Auth
  class VendorOnboardingService
    RAW_CATEGORY_KEYS = %i[category_ids categories category category_id service_category].freeze

    def self.clean_vendor_attributes(permitted)
      new.clean_vendor_attributes(permitted)
    end

    def self.extract_raw_category_param(params)
      new.extract_raw_category_param(params)
    end

    def self.attach_initial_category(vendor, raw_category_param: nil, primary_category_id: nil)
      new.attach_initial_category(
        vendor,
        raw_category_param: raw_category_param,
        primary_category_id: primary_category_id
      )
    end

    def clean_vendor_attributes(permitted)
      attributes = permitted[:vendor_attributes]
      return unless attributes.respond_to?(:key?)

      attributes.delete(:category)
      attributes.delete(:category_id)
      attributes.delete(:service_category)
      attributes.delete(:category_ids)
      attributes.delete(:categories)
      attributes.delete(:primary_category_id)
      normalize_vendor_description(permitted, attributes)
    end

    def extract_raw_category_param(params)
      v_attrs = params[:auth]&.dig(:vendor_attributes) || params[:vendor_attributes]
      if v_attrs.present?
        match = RAW_CATEGORY_KEYS.find { |k| v_attrs[k].present? }
        return v_attrs[match] if match
      end
      params.dig(:auth, :category) || params[:category]
    end

    def attach_initial_category(vendor, raw_category_param: nil, primary_category_id: nil)
      resolved = resolve_initial_categories(raw_category_param)
      return if resolved.empty?

      primary_cat = resolve_primary_category(resolved, primary_category_id)
      vendor.sync_categories(resolved.map(&:id), primary_id: primary_cat.id)
      create_starter_service(vendor, primary_cat)
    rescue StandardError => e
      Rails.logger.warn("Failed to attach initial category to vendor #{vendor.id}: #{e.message}")
    end

    private

    def normalize_vendor_description(permitted, attributes)
      desc = attributes[:description].to_s.strip
      return if desc.blank? || desc.length >= 50

      business = attributes[:business_name].presence || "#{permitted[:first_name]} #{permitted[:last_name]}"
      location = attributes[:location].presence || 'Delhi NCR'
      attributes[:description] = default_vendor_bio(desc, business, location)
    end

    def resolve_initial_categories(raw_category_param)
      cat_list = extract_raw_categories(raw_category_param)
      return [] if cat_list.empty?

      cat_list.filter_map { |ident| find_matching_category(ident) }.uniq.first(3)
    end

    def extract_raw_categories(raw_cats)
      return [] if raw_cats.blank?

      Array(raw_cats).flat_map { |item| item.to_s.split(',') }.map(&:strip).compact_blank
    end

    def resolve_primary_category(resolved, primary_id)
      if primary_id.present?
        resolved.find { |c| c.id == primary_id.to_i } || resolved.first
      else
        resolved.first
      end
    end

    def create_starter_service(vendor, category)
      service = vendor.services.create(
        name: "#{vendor.business_name} - #{category.name}",
        description: "Professional #{category.name} services by #{vendor.business_name} in " \
                     "#{vendor.location}. Dedicated to providing exceptional experiences.",
        base_price: 15_000,
        pricing_type: :package,
        status: :active
      )
      service.categories << category if service.persisted?
    end

    def find_matching_category(identifier)
      return Category.find_by(id: identifier) if identifier.to_s.match?(/\A\d+\z/)

      exact = Category.find_by('name ILIKE ?', identifier.to_s.strip)
      return exact if exact

      words = identifier.to_s.split(/[^\w]+/).compact_blank
      words.each do |word|
        match = Category.where('name ILIKE ?', "%#{word}%").first
        return match if match
      end

      Category.first
    end

    def default_vendor_bio(desc, business, location)
      "Professional #{desc} by #{business} based in #{location}. " \
        'Dedicated to delivering exceptional service and memorable experiences.'
    end
  end
end
