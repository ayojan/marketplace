# frozen_string_literal: true

module Auth
  class UserSerializer
    def self.call(user)
      new(user).as_json
    end

    def initialize(user)
      @user = user
    end

    def as_json
      return {} unless @user

      res = base_user_response
      res.merge!(vendor_data) if @user.vendor? && @user.vendor
      res.merge!(customer_data) if @user.customer? && @user.customer
      res
    end

    private

    attr_reader :user

    def base_user_response
      {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        confirmed: user.confirmed?,
        phone: user.phone,
        needs_mobile_onboarding: user.needs_mobile_onboarding?,
        has_google_identity: user.auth_identities.exists?(provider: 'google'),
        created_at: user.created_at
      }
    end

    def vendor_data
      vendor = user.vendor
      {
        vendor_id: vendor.id,
        vendor: {
          id: vendor.id,
          slug: vendor.slug,
          business_name: vendor.business_name
        }
      }
    end

    def customer_data
      customer = user.customer
      {
        customer_id: customer.id,
        customer: {
          id: customer.id,
          phone: customer.phone,
          location: customer.location
        }
      }
    end
  end
end
