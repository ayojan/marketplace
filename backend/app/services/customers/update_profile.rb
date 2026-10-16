# frozen_string_literal: true

module Customers
  class UpdateProfile
    include Callable
    extend Dry::Initializer

    ALLOWED_KEYS = %i[
      first_name last_name phone location preferences
      event_types company_name budget_range
    ].freeze

    option :user, type: Types.Instance(User)
    option :params, default: proc { {} }

    def call
      attrs = extract_attributes
      if user.update(attrs)
        { success: true, user: user, customer: user }
      else
        { success: false, errors: user.errors.full_messages }
      end
    rescue StandardError => e
      Rails.logger.error("Failed to update customer profile: #{e.message}")
      { success: false, errors: [e.message] }
    end

    private

    def payload
      raw = params.respond_to?(:to_unsafe_h) ? params.to_unsafe_h : params
      (raw[:customer] || raw['customer'] || raw).with_indifferent_access
    rescue StandardError
      {}.with_indifferent_access
    end

    def extract_attributes
      data = payload
      ALLOWED_KEYS.each_with_object({}) do |key, attrs|
        val = data[key]
        val ||= params[key] if params.respond_to?(:[])
        attrs[key] = val if val.present?
      end
    end
  end
end
