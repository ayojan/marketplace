# frozen_string_literal: true

ActiveAdmin.register CustomerProfile do
  menu priority: 3, label: 'Customer Profiles'

  permit_params :user_id, :phone, :location, :company_name, :budget_range, :preferences, :event_types

  includes :user

  # Index
  index do
    selectable_column
    id_column
    column :user do |profile|
      link_to profile.user.full_name, admin_user_path(profile.user) if profile.user
    end
    column 'Email' do |profile|
      profile.user&.email
    end
    column :phone
    column :location
    column :company_name
    column :budget_range
    column :total_bookings
    column :created_at
    actions
  end

  # Filters
  filter :user, collection: -> { User.customers.map { |u| [u.full_name, u.id] } }
  filter :phone
  filter :location
  filter :company_name
  filter :budget_range, as: :select, collection: CustomerProfile.budget_ranges.keys
  filter :total_bookings
  filter :created_at

  # Show
  show do
    attributes_table do
      row :id
      row :user do |profile|
        link_to profile.user.full_name, admin_user_path(profile.user) if profile.user
      end
      row 'User Email' do |profile|
        profile.user&.email
      end
      row :phone
      row :location
      row :company_name
      row :budget_range
      row :total_bookings
      row :event_types
      row :preferences
      row :created_at
      row :updated_at
    end
  end

  # Form
  form do |f|
    f.inputs 'Customer Profile Details' do
      f.input :user, collection: User.customers.map { |u| [u.full_name, u.id] }
      f.input :phone
      f.input :location
      f.input :company_name
      f.input :budget_range, as: :select, collection: CustomerProfile.budget_ranges.keys
      f.input :event_types, as: :text, input_html: { rows: 3 }
      f.input :preferences, as: :text, input_html: { rows: 3 }
    end
    f.actions
  end
end
