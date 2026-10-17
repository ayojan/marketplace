# frozen_string_literal: true

class CreateVendorCategories < ActiveRecord::Migration[8.0]
  def up
    create_table :vendor_categories do |t|
      t.references :vendor, null: false, foreign_key: true
      t.references :category, null: false, foreign_key: true
      t.boolean :is_primary, default: false, null: false

      t.timestamps
    end

    add_index :vendor_categories, %i[vendor_id category_id], unique: true
    add_index :vendor_categories, %i[vendor_id is_primary]

    # Backfill vendor_categories from existing services and categories
    execute <<-SQL.squish
      INSERT INTO vendor_categories (vendor_id, category_id, is_primary, created_at, updated_at)
      SELECT
        sub.vendor_id,
        sub.category_id,
        (sub.rn = 1) AS is_primary,
        NOW(),
        NOW()
      FROM (
        SELECT
          s.vendor_id,
          sc.category_id,
          ROW_NUMBER() OVER (PARTITION BY s.vendor_id ORDER BY MIN(s.id) ASC) AS rn
        FROM services s
        INNER JOIN service_categories sc ON sc.service_id = s.id
        GROUP BY s.vendor_id, sc.category_id
      ) sub
      ON CONFLICT (vendor_id, category_id) DO NOTHING;
    SQL
  end

  def down
    drop_table :vendor_categories
  end
end
