# frozen_string_literal: true

class CreateCustomerFavorites < ActiveRecord::Migration[8.0]
  def change
    create_table :customer_favorites do |t|
      t.references :user, null: false, foreign_key: true
      t.references :vendor, null: false, foreign_key: true

      t.timestamps
    end

    add_index :customer_favorites, %i[user_id vendor_id], unique: true
  end
end
