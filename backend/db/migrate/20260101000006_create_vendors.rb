# frozen_string_literal: true

class CreateVendors < ActiveRecord::Migration[8.0]
  def change
    create_table :vendors do |t|
      t.references :user, null: false, foreign_key: true, index: { unique: true }
      t.string :business_name, null: false
      t.text :description
      t.string :location
      t.string :phone
      t.string :website
      t.string :business_license
      t.integer :years_experience, default: 0
      t.decimal :average_rating, precision: 3, scale: 2, default: 0.0
      t.integer :total_reviews, default: 0
      t.decimal :latitude, precision: 10, scale: 6
      t.decimal :longitude, precision: 10, scale: 6
      t.integer :verification_status, default: 0
      t.datetime :verified_at
      t.text :rejection_reason
      t.integer :favorites_count, default: 0, null: false
      t.string :instagram_handle
      t.string :facebook_url
      t.text :cancellation_policy
      t.decimal :response_time_hours, precision: 5, scale: 2
      t.decimal :completion_rate, precision: 5, scale: 4
      t.string :slug, null: false
      t.jsonb :metadata, default: {}

      t.timestamps
    end

    add_index :vendors, :business_name
    add_index :vendors, :favorites_count
    add_index :vendors, %i[latitude longitude], name: 'index_vendors_on_coordinates'
    add_index :vendors, :location
    add_index :vendors, :slug, unique: true
    add_index :vendors, :verification_status

    add_check_constraint :vendors,
                         'completion_rate IS NULL OR (completion_rate >= 0::numeric AND completion_rate <= 1.0)',
                         name: 'check_completion_rate_valid'
    add_check_constraint :vendors,
                         'response_time_hours IS NULL OR response_time_hours >= 0::numeric',
                         name: 'check_response_time_non_negative'
  end
end
