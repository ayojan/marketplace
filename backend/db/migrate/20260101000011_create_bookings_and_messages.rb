# frozen_string_literal: true

class CreateBookingsAndMessages < ActiveRecord::Migration[8.0]
  def change
    create_table :bookings do |t|
      t.references :customer, null: false, foreign_key: { to_table: :users }
      t.references :vendor, null: false, foreign_key: true
      t.references :service, null: false, foreign_key: true
      t.datetime :event_date, null: false
      t.datetime :event_end_date
      t.string :event_duration
      t.string :event_location, null: false
      t.decimal :total_amount, precision: 10, scale: 2, null: false
      t.integer :status, default: 0, null: false
      t.text :requirements
      t.text :special_instructions
      t.datetime :booking_reminder_sent_at
      t.datetime :vendor_first_response_at

      t.timestamps
    end

    add_index :bookings, %i[customer_id status]
    add_index :bookings, :event_date
    add_index :bookings, %i[service_id status]
    add_index :bookings, :booking_reminder_sent_at
    add_index :bookings, :vendor_first_response_at
    add_index :bookings, %i[vendor_id status event_date], name: 'index_bookings_vendor_status_date'
    add_index :bookings, %i[vendor_id vendor_first_response_at created_at], name: 'index_bookings_vendor_response_time'

    add_check_constraint :bookings,
                         'vendor_first_response_at IS NULL OR vendor_first_response_at >= created_at',
                         name: 'check_vendor_response_after_creation'

    create_table :booking_messages do |t|
      t.references :booking, null: false, foreign_key: true
      t.references :sender, null: false, foreign_key: { to_table: :users }
      t.text :message, null: false
      t.datetime :sent_at, null: false

      t.timestamps
    end

    add_index :booking_messages, %i[booking_id sent_at]
  end
end
