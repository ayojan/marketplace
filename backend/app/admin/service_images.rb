# frozen_string_literal: true

ActiveAdmin.register ServiceImage do
  menu priority: 10, label: 'Service Images'

  actions :index, :show, :destroy

  includes service: :vendor

  scope :all, default: true
  scope('Primary', &:primary)
  scope('Secondary', &:non_primary)

  index do
    selectable_column
    id_column
    column 'Preview' do |img|
      if img.image.attached?
        image_tag url_for(img.image),
                  style: 'height: 50px; width: 75px; object-fit: cover; border-radius: 4px;'
      else
        status_tag 'No image', class: :warn
      end
    end
    column :service do |img|
      link_to img.service.name, admin_service_path(img.service) if img.service
    end
    column :vendor do |img|
      link_to img.service.vendor.business_name, admin_vendor_path(img.service.vendor) if img.service&.vendor
    end
    column :title
    column 'Primary?' do |img|
      status_tag(img.primary? ? 'Primary' : 'No', class: img.primary? ? :ok : nil)
    end
    column :display_order
    column :created_at
    actions defaults: true
  end

  filter :service
  filter :title
  filter :is_primary
  filter :created_at

  show do
    attributes_table do
      row :id
      row 'Image' do |img|
        if img.image.attached?
          image_tag url_for(img.image),
                    style: 'max-width: 480px; max-height: 320px; object-fit: contain; border-radius: 6px;'
        else
          status_tag 'No image attached', class: :warn
        end
      end
      row :service do |img|
        link_to img.service.name, admin_service_path(img.service) if img.service
      end
      row :vendor do |img|
        link_to img.service.vendor.business_name, admin_vendor_path(img.service.vendor) if img.service&.vendor
      end
      row :title
      row :description
      row :alt_text
      row :is_primary do |img|
        status_tag(img.is_primary? ? 'Yes' : 'No', class: img.is_primary? ? :ok : nil)
      end
      row :display_order
      row 'Dimensions' do |img|
        dims = img.image_dimensions
        dims ? "#{dims['width']} x #{dims['height']} px" : '-'
      end
      row 'File Size' do |img|
        number_to_human_size(img.image.blob.byte_size) if img.image.attached?
      end
      row :created_at
      row :updated_at
    end
  end
end
