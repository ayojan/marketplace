# frozen_string_literal: true

class CreateServicesAndAssociations < ActiveRecord::Migration[8.0]
  def change
    create_table :services do |t|
      t.references :vendor, null: false, foreign_key: true
      t.string :name
      t.text :description
      t.decimal :base_price, precision: 10, scale: 2
      t.integer :pricing_type, default: 0
      t.integer :status, default: 0
      t.decimal :average_rating, precision: 3, scale: 2, default: 0.0
      t.integer :total_reviews, default: 0

      t.timestamps
    end

    add_index :services, :status
    add_index :services, :average_rating
    add_index :services, %i[vendor_id status]

    create_table :service_categories do |t|
      t.references :service, null: false, foreign_key: true
      t.references :category, null: false, foreign_key: true

      t.timestamps
    end

    add_index :service_categories, %i[service_id category_id], unique: true

    create_table :service_images do |t|
      t.references :service, null: false, foreign_key: true
      t.string :title
      t.text :description
      t.string :alt_text
      t.integer :display_order, default: 0
      t.boolean :is_primary, default: false

      t.timestamps
    end

    add_index :service_images, %i[service_id display_order]
    add_index :service_images, %i[service_id is_primary]

    create_table :vendor_services do |t|
      t.references :vendor, null: false, foreign_key: true
      t.references :service, null: false, foreign_key: true

      t.timestamps
    end

    add_index :vendor_services, %i[vendor_id service_id], unique: true
  end
end
