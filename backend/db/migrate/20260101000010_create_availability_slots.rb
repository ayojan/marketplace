# frozen_string_literal: true

class CreateAvailabilitySlots < ActiveRecord::Migration[8.0]
  def change
    create_table :availability_slots do |t|
      t.references :vendor, null: false, foreign_key: true
      t.date :date, null: false
      t.time :start_time, null: false
      t.time :end_time, null: false
      t.boolean :is_available, default: true, null: false

      t.timestamps
    end

    add_index :availability_slots, %i[date is_available]
    add_index :availability_slots, %i[vendor_id date]
  end
end
