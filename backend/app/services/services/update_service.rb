# frozen_string_literal: true

module Services
  class UpdateService
    include Callable
    extend Dry::Initializer

    option :service, type: Types.Instance(Service)
    option :params

    def call
      if service.update(permitted_params)
        sync_category
        attach_images(service)
        service.reload
        { success: true, service: service }
      else
        { success: false, errors: service.errors.full_messages }
      end
    end

    private

    def permitted_params
      attrs = params.is_a?(ActionController::Parameters) ? params : ActionController::Parameters.new(params)
      attrs = attrs[:service] if attrs.key?(:service)
      attrs.permit(:name, :description, :base_price, :pricing_type, :status)
    end

    def sync_category
      raw_params = params.is_a?(ActionController::Parameters) ? params.to_unsafe_h : params
      nested_service = raw_params[:service] || raw_params
      cat_id = nested_service[:service_category_id] || nested_service[:category_id]
      return if cat_id.blank?

      category = Category.find_by(id: cat_id)
      return unless category && service.categories.exclude?(category)

      service.categories.clear
      service.categories << category
    end

    def attach_images(service)
      uploaded = extract_uploaded_images
      return if uploaded.blank?

      Array(uploaded).each_with_index do |img_file, idx|
        create_service_image(service, img_file, idx)
      end
    end

    def extract_uploaded_images
      raw = params.is_a?(ActionController::Parameters) ? params.to_unsafe_h : params
      (raw[:service] || raw)[:images] || raw[:images]
    end

    def create_service_image(service, img_file, idx)
      return if img_file.blank?

      service.service_images.create(
        image: img_file,
        display_order: service.service_images.count + idx,
        is_primary: service.service_images.none?(&:is_primary?)
      )
    end
  end
end
