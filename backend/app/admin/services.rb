# frozen_string_literal: true

ActiveAdmin.register Service do
  menu priority: 6, label: 'Services'

  permit_params :name, :description, :vendor_profile_id, :base_price, :pricing_type, :status, category_ids: []

  includes :vendor_profile, :categories

  scope :all, default: true
  scope :active
  scope :draft
  scope :inactive
  scope :archived

  index do
    selectable_column
    id_column
    column :name
    column :vendor_profile do |s|
      link_to s.vendor_profile.business_name, admin_vendor_profile_path(s.vendor_profile) if s.vendor_profile
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
    column :created_at
    actions
  end

  filter :name
  filter :vendor_profile, collection: -> { VendorProfile.order(:business_name).map { |vp| [vp.business_name, vp.id] } }
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
      row :vendor_profile do |s|
        link_to s.vendor_profile.business_name, admin_vendor_profile_path(s.vendor_profile) if s.vendor_profile
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
      f.input :vendor_profile, collection: VendorProfile.order(:business_name).map { |vp| [vp.business_name, vp.id] }
      f.input :name
      f.input :categories, as: :check_boxes, collection: Category.active
      f.input :pricing_type, as: :select, collection: Service.pricing_types.keys
      f.input :base_price
      f.input :status, as: :select, collection: Service.statuses.keys
      f.input :description, as: :text, input_html: { rows: 5 }
    end
    f.actions
  end

  member_action :activate, method: :put do
    resource.update(status: :active)
    redirect_to resource_path, notice: 'Service activated successfully'
  end

  member_action :deactivate, method: :put do
    resource.update(status: :inactive)
    redirect_to resource_path, alert: 'Service deactivated'
  end

  action_item :activate, only: :show do
    link_to 'Activate Service', activate_admin_service_path(service), method: :put if service.status != 'active'
  end

  action_item :deactivate, only: :show do
    link_to 'Deactivate Service', deactivate_admin_service_path(service), method: :put if service.status == 'active'
  end
end
