# frozen_string_literal: true

ActiveAdmin.register PortfolioItem do
  menu priority: 9, label: 'Portfolio Items'

  permit_params :vendor_id, :title, :category, :description, :is_featured, :display_order

  includes :vendor

  scope :all, default: true
  scope :featured

  index do
    selectable_column
    id_column
    column :title
    column :vendor do |p|
      link_to p.vendor.business_name, admin_vendor_path(p.vendor) if p.vendor
    end
    column :category
    column :is_featured do |p|
      status_tag(p.is_featured? ? 'featured' : 'no', class: p.is_featured? ? :ok : :warn)
    end
    column :display_order
    column 'Images' do |p|
      p.images.count
    end
    column :created_at
    actions
  end

  filter :title
  filter :vendor, collection: -> { Vendor.order(:business_name).map { |v| [v.business_name, v.id] } }
  filter :category
  filter :is_featured
  filter :created_at

  show do
    attributes_table do
      row :id
      row :title
      row :vendor do |p|
        link_to p.vendor.business_name, admin_vendor_path(p.vendor) if p.vendor
      end
      row :category
      row :is_featured do |p|
        status_tag(p.is_featured? ? 'yes' : 'no')
      end
      row :display_order
      row :description
      row 'Images Count' do |p|
        p.images.count
      end
      row :created_at
      row :updated_at
    end
  end

  form do |f|
    f.inputs 'Portfolio Item Details' do
      f.input :vendor, collection: Vendor.order(:business_name).map { |v| [v.business_name, v.id] }
      f.input :title
      f.input :category
      f.input :is_featured
      f.input :display_order
      f.input :description, as: :text, input_html: { rows: 4 }
    end
    f.actions
  end
end
