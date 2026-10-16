# frozen_string_literal: true

module Services
  class CreateService
    include Callable
    extend Dry::Initializer

    option :user, type: Types.Instance(User)
    option :params

    def call
      vendor = ensure_vendor
      service = vendor.services.build(permitted_params)

      if service.save
        VendorService.find_or_create_by!(vendor: vendor, service: service)
        attach_category(service)
        service.reload
        { success: true, service: service }
      else
        { success: false, errors: service.errors.full_messages }
      end
    end

    private

    def ensure_vendor
      return user.vendor if user.vendor

      user.create_vendor!(
        business_name: "#{user.first_name.presence || 'Vendor'}'s Services",
        location: 'Mumbai, India'
      )
    end

    def permitted_params
      attrs = params.is_a?(ActionController::Parameters) ? params : ActionController::Parameters.new(params)
      attrs = attrs[:service] if attrs.key?(:service)
      attrs.permit(:name, :description, :base_price, :pricing_type, :status)
    end

    def attach_category(service)
      raw_params = params.is_a?(ActionController::Parameters) ? params.to_unsafe_h : params
      nested_service = raw_params[:service] || raw_params
      cat_id = nested_service[:service_category_id] || nested_service[:category_id]
      return if cat_id.blank?

      category = Category.find_by(id: cat_id)
      service.categories << category if category && service.categories.exclude?(category)
    end
  end
end
