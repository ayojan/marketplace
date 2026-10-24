# frozen_string_literal: true

ActiveAdmin.register Service do
  menu priority: 6, label: 'Services'

  permit_params :name, :description, :vendor_id, :base_price, :pricing_type, :status, category_ids: []

  includes :vendor, :categories, :service_images

  scope :all, default: true
  scope :active
  scope :draft
  scope :inactive
  scope :archived

  index do
    selectable_column
    id_column
    column :name
    column :vendor do |s|
      link_to s.vendor.business_name, admin_vendor_path(s.vendor) if s.vendor
    end
    column 'Categories' do |s|
      s.categories.map(&:name).join(', ')
    end
    column :pricing_type
    column :base_price do |s|
      number_to_currency(s.base_price, unit: '₹')
    end
    column :status do |s|
      status_classes = {
        'active' => :ok,
        'draft' => :warn,
        'inactive' => :warning,
        'archived' => :error
      }
      status_tag s.status, class: status_classes[s.status]
    end
    column :average_rating
    column :total_reviews
    column 'Images' do |s|
      s.service_images.count
    end
    column :created_at
    actions
  end

  filter :name
  filter :vendor, collection: -> { Vendor.order(:business_name).map { |v| [v.business_name, v.id] } }
  filter :categories
  filter :pricing_type, as: :select, collection: Service.pricing_types
  filter :status, as: :select, collection: Service.statuses
  filter :base_price
  filter :average_rating
  filter :created_at

  show do
    attributes_table do
      row :id
      row :name
      row :vendor do |s|
        link_to s.vendor.business_name, admin_vendor_path(s.vendor) if s.vendor
      end
      row 'Categories' do |s|
        s.categories.map(&:name).join(', ')
      end
      row :pricing_type
      row :base_price do |s|
        number_to_currency(s.base_price, unit: '₹')
      end
      row :status do |s|
        status_tag s.status
      end
      row :average_rating
      row :total_reviews
      row :description
      row :created_at
      row :updated_at
    end

    panel "Media Gallery (#{service.service_images.count})" do
      if service.service_images.any?
        table_for service.service_images.ordered do
          column 'Preview' do |img|
            if img.image.attached?
              image_tag url_for(img.image),
                        style: 'height: 60px; width: 90px; object-fit: cover; border-radius: 4px;'
            else
              status_tag 'No image', class: :warn
            end
          end
          column :title
          column 'Primary?' do |img|
            status_tag(img.primary? ? 'Primary' : 'Secondary', class: img.primary? ? :ok : nil)
          end
          column :display_order
          column 'Dimensions' do |img|
            dims = img.image_dimensions
            dims ? "#{dims['width']}x#{dims['height']}" : '-'
          end
          column :created_at
          column 'Actions' do |img|
            link_to 'Delete Image',
                    delete_image_admin_service_path(service, image_id: img.id),
                    method: :delete,
                    data: { confirm: 'Are you sure you want to remove this service image?' },
                    class: 'member_link'
          end
        end
      else
        para 'No images uploaded for this service yet.', style: 'padding: 10px; color: #64748B;'
      end
    end

    panel "Bookings (#{service.bookings.count})" do
      table_for service.bookings.order(created_at: :desc).limit(10) do
        column :id do |b|
          link_to b.id, admin_booking_path(b)
        end
        column :customer do |b|
          b.customer&.full_name
        end
        column :event_date
        column :total_amount do |b|
          number_to_currency(b.total_amount, unit: '₹')
        end
        column :status do |b|
          status_tag b.status
        end
      end
    end
  end

  form do |f|
    f.inputs 'Service Details' do
      f.input :vendor, collection: Vendor.order(:business_name).map { |v| [v.business_name, v.id] }
      f.input :name
      f.input :categories, as: :check_boxes, collection: Category.active
      f.input :pricing_type, as: :select, collection: Service.pricing_types.keys
      f.input :base_price
      f.input :status, as: :select, collection: Service.statuses.keys
      f.input :description, as: :text, input_html: { rows: 5 }
    end
    f.actions
  end

  member_action :delete_image, method: :delete do
    image = resource.service_images.find_by(id: params[:image_id])
    if image&.destroy
      redirect_to resource_path, notice: I18n.t('admin.services.image_removed')
    else
      redirect_to resource_path, alert: I18n.t('admin.services.image_remove_failed')
    end
  end

  member_action :activate, method: :put do
    resource.update(status: :active)
    redirect_to resource_path, notice: I18n.t('admin.services.activated')
  end

  member_action :deactivate, method: :put do
    resource.update(status: :inactive)
    redirect_to resource_path, alert: I18n.t('admin.services.deactivated')
  end

  action_item :activate, only: :show do
    link_to 'Activate Service', activate_admin_service_path(service), method: :put if service.status != 'active'
  end

  action_item :deactivate, only: :show do
    link_to 'Deactivate Service', deactivate_admin_service_path(service), method: :put if service.status == 'active'
  end
end
