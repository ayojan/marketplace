# frozen_string_literal: true

class CreatePortfolioItems < ActiveRecord::Migration[8.0]
  def change
    create_table :portfolio_items do |t|
      t.references :vendor, null: false, foreign_key: true
      t.string :title, null: false
      t.text :description
      t.string :category, null: false
      t.integer :display_order, default: 0, null: false
      t.boolean :is_featured, default: false, null: false

      t.timestamps
    end

    add_index :portfolio_items, :category
    add_index :portfolio_items, %i[vendor_id category]
    add_index :portfolio_items, %i[vendor_id display_order]
    add_index :portfolio_items, %i[vendor_id is_featured]
  end
end
