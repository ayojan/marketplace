# frozen_string_literal: true

ActiveAdmin.register BookingMessage do
  menu priority: 11, label: 'Messages'

  actions :index, :show, :destroy

  includes :sender, booking: %i[customer vendor]

  scope :all, default: true
  scope('Recent (Last 7 Days)') { |scope| scope.where(sent_at: 7.days.ago..) }

  index do
    selectable_column
    id_column
    column :booking do |msg|
      link_to "Booking ##{msg.booking_id}", admin_booking_path(msg.booking) if msg.booking
    end
    column :sender do |msg|
      link_to msg.sender_name, admin_user_path(msg.sender) if msg.sender
    end
    column 'Sender Role' do |msg|
      status_tag msg.sender&.role
    end
    column :message do |msg|
      truncate(msg.message, length: 80)
    end
    column :sent_at
    actions defaults: true
  end

  filter :booking_id, as: :numeric
  filter :sender, collection: -> { User.order(:first_name, :last_name).map { |u| [u.full_name, u.id] } }
  filter :message
  filter :sent_at

  show do
    attributes_table do
      row :id
      row :booking do |msg|
        link_to "Booking ##{msg.booking_id}", admin_booking_path(msg.booking) if msg.booking
      end
      row :sender do |msg|
        link_to msg.sender_name, admin_user_path(msg.sender) if msg.sender
      end
      row 'Sender Role' do |msg|
        status_tag msg.sender&.role
      end
      row :message do |msg|
        simple_format(msg.message)
      end
      row :sent_at
      row :created_at
      row :updated_at
    end

    if booking_message.booking
      panel "Booking Context (##{booking_message.booking_id})" do
        attributes_table_for booking_message.booking do
          row :customer do |b|
            link_to b.customer.full_name, admin_user_path(b.customer) if b.customer
          end
          row :vendor do |b|
            link_to b.vendor.business_name, admin_vendor_path(b.vendor) if b.vendor
          end
          row :status do |b|
            status_tag b.status
          end
          row :event_date
          row :total_amount do |b|
            number_to_currency(b.total_amount, unit: '₹')
          end
        end
      end

      thread_messages = booking_message.booking.booking_messages.order(:sent_at)
      panel "Conversation Thread (#{thread_messages.count} messages)" do
        table_for thread_messages do
          column :id
          column :sender do |m|
            is_current = m.id == booking_message.id
            name = m.sender_name
            is_current ? strong("#{name} (Viewing)") : name
          end
          column 'Role' do |m|
            status_tag m.sender&.role
          end
          column :message
          column :sent_at
        end
      end
    end
  end
end
