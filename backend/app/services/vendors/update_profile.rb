# frozen_string_literal: true

module Vendors
  class UpdateProfile
    include Callable
    extend Dry::Initializer

    PERMITTED_ATTRIBUTES = %i[
      business_name description location phone website
      years_experience cancellation_policy instagram_handle
      business_license service_categories_list
    ].freeze

    option :vendor, type: Types.Instance(Vendor)
    option :params, default: proc { {} }

    def call
      vendor.assign_attributes(permitted_attributes)
      apply_metadata

      if vendor.save
        { success: true, vendor: vendor }
      else
        { success: false, errors: vendor.errors.full_messages }
      end
    rescue StandardError => e
      Rails.logger.error("Failed to update vendor profile: #{e.message}")
      { success: false, errors: [e.message] }
    end

    private

    def payload
      raw = params.respond_to?(:to_unsafe_h) ? params.to_unsafe_h : params
      (raw[:vendor] || raw['vendor'] || raw).with_indifferent_access
    rescue StandardError
      {}.with_indifferent_access
    end

    def permitted_attributes
      data = payload
      PERMITTED_ATTRIBUTES.each_with_object({}) do |attr, hash|
        hash[attr] = data[attr] if data.key?(attr)
      end
    end

    def apply_metadata
      meta_raw = payload[:metadata]
      return if meta_raw.blank?

      parsed = parse_metadata(meta_raw)
      vendor.metadata = (vendor.metadata || {}).merge(parsed.stringify_keys)
    rescue StandardError => e
      Rails.logger.warn("Metadata extraction error: #{e.message}")
    end

    def parse_metadata(raw)
      return raw.to_unsafe_h if raw.respond_to?(:to_unsafe_h)
      return raw if raw.is_a?(Hash)
      return JSON.parse(raw) if raw.is_a?(String)

      {}
    rescue JSON::ParserError
      {}
    end
  end
end
