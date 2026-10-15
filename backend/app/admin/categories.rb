# frozen_string_literal: true

ActiveAdmin.register Category do
  menu priority: 5, label: 'Categories'

  permit_params :name, :slug, :active, :icon, :description

  scope :all, default: true
  scope :active
  scope :inactive

  index do
    selectable_column
    id_column
    column :name
    column :slug
    column :icon
    column :active do |c|
      status_tag(c.active? ? 'active' : 'inactive', class: c.active? ? :ok : :warn)
    end
    column 'Services Count' do |c|
      c.services.count
    end
    column :created_at
    actions
  end

  filter :name
  filter :slug
  filter :active
  filter :created_at

  show do
    attributes_table do
      row :id
      row :name
      row :slug
      row :icon
      row :active do |c|
        status_tag(c.active? ? 'active' : 'inactive')
      end
      row :description
      row 'Services Count' do |c|
        c.services.count
      end
      row :created_at
      row :updated_at
    end

    panel "Services in this category (#{category.services.count})" do
      table_for category.services do
        column :id
        column :name do |s|
          link_to s.name, admin_service_path(s)
        end
        column :vendor_profile
        column :base_price do |s|
          number_to_currency(s.base_price, unit: '₹')
        end
        column :status do |s|
          status_tag s.status
        end
      end
    end
  end

  form do |f|
    f.inputs 'Category Details' do
      f.input :name
      f.input :slug, hint: 'Leave blank to auto-generate from name'
      f.input :icon, hint: 'Lucide icon name (e.g. Camera, Video, Brush, Flower2, Sparkles)'
      f.input :active
      f.input :description, as: :text, input_html: { rows: 4 }
    end
    f.actions
  end

  batch_action :activate do |ids|
    batch_action_collection.find(ids).each { |c| c.update(active: true) }
    redirect_to collection_path, notice: 'Selected categories activated'
  end

  batch_action :deactivate do |ids|
    batch_action_collection.find(ids).each { |c| c.update(active: false) }
    redirect_to collection_path, alert: 'Selected categories deactivated'
  end
end
