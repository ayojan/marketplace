# frozen_string_literal: true

class CreateNotificationTables < ActiveRecord::Migration[8.0]
  def change
    create_table :email_notification_preferences do |t|
      t.references :user, null: false, foreign_key: true, index: { unique: true }
      t.boolean :booking_created, default: true, null: false
      t.boolean :booking_accepted, default: true, null: false
      t.boolean :booking_rejected, default: true, null: false
      t.boolean :booking_cancelled, default: true, null: false
      t.boolean :booking_reminder, default: true, null: false
      t.boolean :new_message, default: true, null: false
      t.boolean :review_received, default: true, null: false

      t.timestamps
    end

    create_table :in_app_notifications do |t|
      t.references :user, null: false, foreign_key: true
      t.string :title, limit: 255, null: false
      t.text :message, null: false
      t.string :notification_type, limit: 50, null: false
      t.string :related_type, limit: 50
      t.bigint :related_id
      t.boolean :is_read, default: false, null: false

      t.timestamps
    end

    add_index :in_app_notifications, :is_read
    add_index :in_app_notifications, :notification_type
    add_index :in_app_notifications, %i[related_type related_id], name: 'index_notifications_on_polymorphic'
    add_index :in_app_notifications, %i[user_id is_read created_at], name: 'idx_notifications_user_read_date'

    add_check_constraint :in_app_notifications,
                         "related_type IS NULL OR (related_type::text = ANY (ARRAY['Booking'::character varying, 'Review'::character varying, 'BookingMessage'::character varying]::text[]))",
                         name: 'check_notification_related_type_valid'
  end
end
