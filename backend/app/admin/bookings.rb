# frozen_string_literal: true

ActiveAdmin.register Booking do
  menu priority: 7, label: 'Bookings'

  permit_params :customer_id, :vendor_id, :service_id, :event_date,
                :event_end_date, :event_location, :total_amount, :status,
                :requirements, :special_instructions

  includes :customer, :vendor, :service

  scope :all, default: true
  scope :upcoming
  scope('Pending') { |scope| scope.where(status: :pending) }
  scope('Accepted') { |scope| scope.where(status: :accepted) }
  scope('Completed') { |scope| scope.where(status: :completed) }
  scope('Cancelled') { |scope| scope.where(status: :cancelled) }

  index do
    selectable_column
    id_column
    column :customer do |b|
      link_to b.customer.full_name, admin_user_path(b.customer) if b.customer
    end
    column :vendor do |b|
      link_to b.vendor.business_name, admin_vendor_path(b.vendor) if b.vendor
    end
    column :service do |b|
      link_to b.service.name, admin_service_path(b.service) if b.service
    end
    column :event_date do |b|
      b.event_date&.strftime('%b %d, %Y %I:%M %p')
    end
    column :event_location
    column :total_amount do |b|
      number_to_currency(b.total_amount, unit: '₹')
    end
    column :status do |b|
      status_classes = {
        'pending' => :warning,
        'accepted' => :ok,
        'completed' => :ok,
        'declined' => :error,
        'cancelled' => :error,
        'counter_offered' => :warn
      }
      status_tag b.status, class: status_classes[b.status]
    end
    column :created_at
    actions
  end

  filter :customer, collection: -> { User.customers.map { |u| [u.full_name, u.id] } }
  filter :vendor, collection: -> { Vendor.order(:business_name).map { |v| [v.business_name, v.id] } }
  filter :service
  filter :status, as: :select, collection: Booking.statuses
  filter :event_date
  filter :total_amount
  filter :created_at

  show do
    attributes_table do
      row :id
      row :customer do |b|
        link_to "#{b.customer.full_name} (#{b.customer.email})", admin_user_path(b.customer) if b.customer
      end
      row :vendor do |b|
        link_to b.vendor.business_name, admin_vendor_path(b.vendor) if b.vendor
      end
      row :service do |b|
        link_to b.service.name, admin_service_path(b.service) if b.service
      end
      row :status do |b|
        status_tag b.status
      end
      row :total_amount do |b|
        number_to_currency(b.total_amount, unit: '₹')
      end
      row :event_date do |b|
        b.event_date&.strftime('%B %d, %Y %I:%M %p')
      end
      row :event_end_date do |b|
        b.event_end_date&.strftime('%B %d, %Y %I:%M %p')
      end
      row :duration_hours do |b|
        "#{b.duration_hours} hrs" if b.duration_hours
      end
      row :event_location
      row :requirements
      row :special_instructions
      row :booking_reminder_sent_at
      row :vendor_first_response_at
      row :created_at
      row :updated_at
    end

    if booking.booking_messages.any?
      panel "Messages (#{booking.booking_messages.count})" do
        table_for booking.booking_messages.order(:created_at) do
          column :id
          column :sender do |m|
            m.sender&.full_name
          end
          column :message
          column :created_at
        end
      end
    end

    if booking.review
      panel 'Customer Review' do
        attributes_table_for booking.review do
          row :rating do |r|
            "#{r.rating} / 5"
          end
          row :comment
          row :created_at
        end
      end
    end
  end

  form do |f|
    f.inputs 'Booking Details' do
      f.input :customer, collection: User.customers.map { |u| [u.full_name, u.id] }
      f.input :vendor, collection: Vendor.order(:business_name).map { |v| [v.business_name, v.id] }
      f.input :service, collection: Service.order(:name).map { |s| [s.name, s.id] }
      f.input :event_date, as: :datetime_picker
      f.input :event_end_date, as: :datetime_picker
      f.input :event_location
      f.input :total_amount
      f.input :status, as: :select, collection: Booking.statuses.keys
      f.input :requirements, as: :text, input_html: { rows: 3 }
      f.input :special_instructions, as: :text, input_html: { rows: 3 }
    end
    f.actions
  end

  # Status transition actions
  member_action :complete, method: :put do
    resource.update(status: :completed)
    redirect_to resource_path, notice: I18n.t('admin.bookings.completed')
  end

  member_action :cancel, method: :put do
    resource.update(status: :cancelled)
    redirect_to resource_path, alert: I18n.t('admin.bookings.cancelled')
  end

  action_item :complete, only: :show do
    link_to 'Mark as Completed', complete_admin_booking_path(booking), method: :put if booking.status == 'accepted'
  end

  action_item :cancel, only: :show do
    if %w[pending accepted].include?(booking.status)
      link_to 'Cancel Booking', cancel_admin_booking_path(booking), method: :put,
                                                                    data: { confirm: 'Cancel this booking?' }
    end
  end
end
