# frozen_string_literal: true

ActiveAdmin.register User do
  menu priority: 2
  permit_params :email, :password, :password_confirmation, :first_name, :last_name, :role,
                :confirmed_at, :phone, :location, :company_name, :budget_range

  # Use local methods to keep the block length under control
  controller do
    def index_columns(table)
      table.selectable_column
      table.id_column
      table.column :email
      table.column :first_name
      table.column :last_name
      table.column :role do |user|
        table.status_tag user.role
      end
      table.column :phone
      table.column :location
      table.column :confirmed_at
      table.column :created_at
      table.actions defaults: true do |user|
        table.item 'Confirm', confirm_admin_user_path(user), method: :put unless user.confirmed?
      end
    end
  end

  index do
    controller.index_columns(self)
  end

  filter :email
  filter :first_name
  filter :last_name
  filter :role, as: :select, collection: User.roles
  filter :phone
  filter :location
  filter :company_name
  filter :confirmed_at
  filter :created_at

  form do |f|
    f.inputs do
      f.input :email
      f.input :first_name
      f.input :last_name
      f.input :role, as: :select, collection: User.roles.keys
      f.input :phone
      f.input :location
      f.input :company_name
      f.input :budget_range, as: :select, collection: User.budget_ranges.keys
      if f.object.new_record?
        f.input :password
        f.input :password_confirmation
      end
    end
    f.actions
  end

  show do
    attributes_table do
      row :id
      row :email
      row :first_name
      row :last_name
      row :role do |user|
        status_tag user.role
      end
      row :phone
      row :location
      row :company_name
      row :budget_range
      row :total_bookings
      row :confirmed_at
      row :created_at
      row :updated_at
    end

    panel 'Profile Details' do
      if user.vendor? && user.vendor
        attributes_table_for user.vendor do
          row :business_name
          row :verification_status do |v|
            status_tag v.verification_status
          end
        end
      else
        'Standard User Account'
      end
    end
  end

  member_action :confirm, method: :put do
    resource.confirm
    redirect_to admin_user_path(resource), notice: I18n.t('admin.users.confirmed')
  end

  action_item :confirm, only: :show do
    unless user.confirmed?
      link_to 'Confirm User', confirm_admin_user_path(user),
              method: :put,
              data: { confirm: I18n.t('admin.users.confirm_question') }
    end
  end

  batch_action :set_as_customer do |ids|
    batch_action_collection.find(ids).each do |user|
      user.update(role: :customer)
    end
    redirect_to collection_path, alert: I18n.t('admin.users.batch_customer')
  end

  batch_action :set_as_vendor do |ids|
    batch_action_collection.find(ids).each do |user|
      user.update(role: :vendor)
    end
    redirect_to collection_path, alert: I18n.t('admin.users.batch_vendor')
  end
end
