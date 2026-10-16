# frozen_string_literal: true

class CreateCustomers < ActiveRecord::Migration[8.0]
  def change
    create_table :customers do |t|
      t.references :user, null: false, foreign_key: true, index: { unique: true }
      t.string :phone
      t.text :preferences
      t.text :event_types
      t.string :budget_range
      t.string :location
      t.string :company_name
      t.integer :total_bookings, default: 0

      t.timestamps
    end

    add_index :customers, :budget_range
    add_index :customers, :location
  end
end
