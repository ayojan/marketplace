# frozen_string_literal: true

ActiveAdmin.register Review do
  menu priority: 8, label: 'Reviews'

  permit_params :status, :vendor_response, :vendor_responded_at

  includes :customer, :vendor, :service, :booking

  scope :all, default: true
  scope('Published') { |scope| scope.where(status: :published) }
  scope('Hidden') { |scope| scope.where(status: :hidden) }
  scope('5 Stars') { |scope| scope.where(rating: 5) }
  scope('Low Ratings (≤2)') { |scope| scope.where('rating <= 2') }

  index do
    selectable_column
    id_column
    column :rating do |r|
      status_classes = {
        5 => :ok,
        4 => :ok,
        3 => :warn,
        2 => :warning,
        1 => :error
      }
      status_tag "#{r.rating} ★", class: status_classes[r.rating]
    end
    column :customer do |r|
      link_to r.customer.full_name, admin_user_path(r.customer) if r.customer
    end
    column :vendor do |r|
      link_to r.vendor.business_name, admin_vendor_path(r.vendor) if r.vendor
    end
    column :service do |r|
      link_to r.service.name, admin_service_path(r.service) if r.service
    end
    column :comment do |r|
      truncate(r.comment, length: 60)
    end
    column :status do |r|
      status_tag r.status, class: r.status == 'published' ? :ok : :error
    end
    column :helpful_votes
    column :created_at
    actions defaults: true do |r|
      if r.status == 'published'
        item 'Hide', hide_admin_review_path(r), method: :put, class: 'member_link'
      else
        item 'Publish', publish_admin_review_path(r), method: :put, class: 'member_link'
      end
    end
  end

  filter :customer, collection: -> { User.customers.map { |u| [u.full_name, u.id] } }
  filter :vendor, collection: -> { Vendor.order(:business_name).map { |v| [v.business_name, v.id] } }
  filter :service
  filter :rating, as: :select, collection: [5, 4, 3, 2, 1]
  filter :status, as: :select, collection: Review.statuses
  filter :helpful_votes
  filter :created_at

  show do
    attributes_table do
      row :id
      row :rating do |r|
        "#{r.rating} / 5"
      end
      row :quality_rating
      row :communication_rating
      row :value_rating
      row :punctuality_rating
      row :customer do |r|
        link_to r.customer.full_name, admin_user_path(r.customer) if r.customer
      end
      row :vendor do |r|
        link_to r.vendor.business_name, admin_vendor_path(r.vendor) if r.vendor
      end
      row :service do |r|
        link_to r.service.name, admin_service_path(r.service) if r.service
      end
      row :booking do |r|
        link_to "Booking ##{r.booking_id}", admin_booking_path(r.booking) if r.booking
      end
      row :comment
      row :status do |r|
        status_tag r.status
      end
      row :helpful_votes
      row :vendor_response
      row :vendor_responded_at
      row :created_at
      row :updated_at
    end
  end

  form do |f|
    f.inputs 'Moderation & Response' do
      f.input :status, as: :select, collection: Review.statuses.keys
      f.input :vendor_response, as: :text, input_html: { rows: 4 }
    end
    f.actions
  end

  member_action :hide, method: :put do
    resource.update(status: :hidden)
    redirect_to resource_path, alert: I18n.t('admin.reviews.hidden')
  end

  member_action :publish, method: :put do
    resource.update(status: :published)
    redirect_to resource_path, notice: I18n.t('admin.reviews.published')
  end

  action_item :toggle_status, only: :show do
    if review.status == 'published'
      link_to 'Hide Review', hide_admin_review_path(review), method: :put,
                                                             data: { confirm: 'Hide this review from public view?' }
    else
      link_to 'Publish Review', publish_admin_review_path(review), method: :put
    end
  end
end
