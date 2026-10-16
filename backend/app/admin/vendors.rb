# frozen_string_literal: true

ActiveAdmin.register Vendor do
  menu priority: 4, label: 'Vendors'

  permit_params :user_id, :business_name, :description, :location, :phone,
                :website, :instagram_handle, :facebook_url, :years_experience,
                :verification_status, :rejection_reason

  includes :user

  # Scopes
  scope :all, default: true
  scope('Verified', &:verification_verified)
  scope('Pending Verification', &:verification_pending_verification)
  scope('Unverified', &:verification_unverified)
  scope('Rejected', &:verification_rejected)

  # Index
  index do
    selectable_column
    id_column
    column :business_name
    column :user do |vendor|
      link_to vendor.user.full_name, admin_user_path(vendor.user) if vendor.user
    end
    column 'Email' do |vendor|
      vendor.user&.email
    end
    column :phone
    column :location
    column :verification_status do |vendor|
      status_classes = {
        'verified' => :ok,
        'pending_verification' => :warning,
        'unverified' => :warn,
        'rejected' => :error
      }
      status_tag vendor.verification_status, class: status_classes[vendor.verification_status]
    end
    column :average_rating
    column :total_reviews
    column :years_experience
    actions defaults: true do |vendor|
      if vendor.verification_pending_verification? || vendor.verification_unverified?
        item 'Verify', verify_admin_vendor_path(vendor), method: :put, class: 'member_link'
      end
    end
  end

  # Filters
  filter :business_name
  filter :user, collection: -> { User.vendors.map { |u| [u.full_name, u.id] } }
  filter :phone
  filter :location
  filter :verification_status, as: :select, collection: Vendor.verification_statuses
  filter :average_rating
  filter :years_experience
  filter :created_at

  # Show
  show do
    attributes_table do
      row :id
      row :business_name
      row :slug
      row :user do |vendor|
        link_to vendor.user.full_name, admin_user_path(vendor.user) if vendor.user
      end
      row 'User Email' do |vendor|
        vendor.user&.email
      end
      row :verification_status do |vendor|
        status_tag vendor.verification_status
      end
      row :verified_at
      row :rejection_reason if vendor.verification_rejected?
      row :phone
      row :location
      row :description
      row :years_experience
      row :average_rating
      row :total_reviews
      row :favorites_count
      row :website do |vendor|
        link_to vendor.website, vendor.website, target: '_blank', rel: 'noopener' if vendor.website.present?
      end
      row :instagram_handle
      row :facebook_url
      row :created_at
      row :updated_at
    end

    panel "Services (#{vendor.services.count})" do
      table_for vendor.services do
        column :id
        column :name do |s|
          link_to s.name, admin_service_path(s)
        end
        column :pricing_type
        column :base_price do |s|
          number_to_currency(s.base_price, unit: '₹')
        end
        column :status do |s|
          status_tag s.status
        end
      end
    end
  end

  # Form
  form do |f|
    f.inputs 'Vendor Details' do
      f.input :user, collection: User.vendors.map { |u| [u.full_name, u.id] }
      f.input :business_name
      f.input :description, as: :text, input_html: { rows: 4 }
      f.input :location
      f.input :phone
      f.input :website
      f.input :instagram_handle
      f.input :facebook_url
      f.input :years_experience
      f.input :verification_status, as: :select, collection: Vendor.verification_statuses.keys
      f.input :rejection_reason, as: :text, input_html: { rows: 3 }
    end
    f.actions
  end

  # Member Actions
  member_action :verify, method: :put do
    resource.update(verification_status: :verified, verified_at: Time.current, rejection_reason: nil)
    redirect_to resource_path, notice: "Vendor '#{resource.business_name}' has been verified!"
  end

  member_action :reject, method: :put do
    resource.update(verification_status: :rejected, rejection_reason: params[:reason] || 'Did not meet requirements')
    redirect_to resource_path, alert: "Vendor '#{resource.business_name}' has been marked as rejected."
  end

  action_item :verify, only: :show do
    unless vendor.verification_verified?
      link_to 'Verify Vendor', verify_admin_vendor_path(vendor),
              method: :put,
              data: { confirm: 'Are you sure you want to verify this vendor?' }
    end
  end

  action_item :reject, only: :show do
    unless vendor.verification_rejected?
      link_to 'Reject Vendor', reject_admin_vendor_path(vendor),
              method: :put,
              data: { confirm: 'Are you sure you want to reject this vendor?' }
    end
  end
end
