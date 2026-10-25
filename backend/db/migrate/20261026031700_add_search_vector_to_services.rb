# frozen_string_literal: true

class AddSearchVectorToServices < ActiveRecord::Migration[8.0]
  def up
    execute <<~SQL.squish
      ALTER TABLE services
      ADD COLUMN search_vector tsvector
      GENERATED ALWAYS AS (
        setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(description, '')), 'B')
      ) STORED;
    SQL

    add_index :services, :search_vector, using: :gin

    execute <<~SQL.squish
      CREATE INDEX index_vendors_on_business_name_tsvector
      ON vendors USING gin (to_tsvector('english', coalesce(business_name, '')));
    SQL

    execute <<~SQL.squish
      CREATE INDEX index_categories_on_name_tsvector
      ON categories USING gin (to_tsvector('english', coalesce(name, '')));
    SQL
  end

  def down
    remove_index :services, :search_vector if index_exists?(:services, :search_vector)
    remove_column :services, :search_vector if column_exists?(:services, :search_vector)

    execute <<~SQL.squish
      DROP INDEX IF EXISTS index_vendors_on_business_name_tsvector;
    SQL

    execute <<~SQL.squish
      DROP INDEX IF EXISTS index_categories_on_name_tsvector;
    SQL
  end
end
