# frozen_string_literal: true

ActiveAdmin.register InAppNotification do
  menu priority: 12, label: 'Notifications'

  permit_params :user_id, :title, :message, :notification_type, :is_read

  includes :user

  scope :all, default: true
  scope('Unread', &:unread)
  scope('Read', &:read)
  scope('Announcements') { |scope| scope.where(notification_type: 'system_announcement') }

  index do
    selectable_column
    id_column
    column :user do |n|
      link_to n.user.full_name, admin_user_path(n.user) if n.user
    end
    column 'Recipient Email' do |n|
      n.user&.email
    end
    column :title
    column :notification_type do |n|
      status_tag n.notification_type
    end
    column :message do |n|
      truncate(n.message, length: 60)
    end
    column :is_read do |n|
      status_tag(n.is_read? ? 'Read' : 'Unread', class: n.is_read? ? :ok : :warn)
    end
    column :created_at
    actions defaults: true
  end

  filter :user, collection: -> { User.order(:first_name, :last_name).map { |u| [u.full_name, u.id] } }
  filter :title
  filter :notification_type, as: :select, collection: -> { InAppNotification::NOTIFICATION_TYPES }
  filter :is_read
  filter :created_at

  show do
    attributes_table do
      row :id
      row :user do |n|
        link_to n.user.full_name, admin_user_path(n.user) if n.user
      end
      row 'User Role' do |n|
        status_tag n.user&.role
      end
      row :title
      row :notification_type do |n|
        status_tag n.notification_type
      end
      row :message do |n|
        simple_format(n.message)
      end
      row :is_read do |n|
        status_tag(n.is_read? ? 'Read' : 'Unread', class: n.is_read? ? :ok : :warn)
      end
      row :related_type
      row :related_id
      row :created_at
      row :updated_at
    end
  end

  form do |f|
    f.inputs 'Notification Details' do
      f.input :user, collection: User.order(:first_name, :last_name).map { |u| [u.full_name, u.id] }
      f.input :title
      f.input :message, as: :text, input_html: { rows: 4 }
      f.input :notification_type, as: :select, collection: InAppNotification::NOTIFICATION_TYPES
      f.input :is_read, as: :boolean if f.object.persisted?
    end
    f.actions
  end

  member_action :toggle_read, method: :put do
    if resource.is_read?
      resource.mark_as_unread!
      redirect_to resource_path, notice: I18n.t('admin.in_app_notifications.marked_as_unread')
    else
      resource.mark_as_read!
      redirect_to resource_path, notice: I18n.t('admin.in_app_notifications.marked_as_read')
    end
  end

  action_item :toggle_read, only: :show do
    label = in_app_notification.is_read? ? 'Mark as Unread' : 'Mark as Read'
    link_to label, toggle_read_admin_in_app_notification_path(in_app_notification), method: :put
  end

  batch_action :mark_as_read do |ids|
    batch_action_collection.find(ids).each(&:mark_as_read!)
    redirect_to collection_path, notice: I18n.t('admin.in_app_notifications.marked_as_read')
  end

  batch_action :mark_as_unread do |ids|
    batch_action_collection.find(ids).each(&:mark_as_unread!)
    redirect_to collection_path, notice: I18n.t('admin.in_app_notifications.marked_as_unread')
  end
end
