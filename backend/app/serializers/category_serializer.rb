# frozen_string_literal: true

# == Schema Information
#
# Table name: categories
#
#  id          :bigint           not null, primary key
#  active      :boolean          default(TRUE)
#  description :text
#  icon        :string
#  metadata    :jsonb
#  name        :string
#  slug        :string
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#
# Indexes
#
#  index_categories_on_name_tsvector  (to_tsvector('english'::regconfig, (COALESCE(name, ''::character varying))::text)) USING gin
#  index_categories_on_slug           (slug) UNIQUE
#
class CategorySerializer < Blueprinter::Base
  identifier :id
  fields :name, :slug

  view :vendor_category do
    field :is_primary do |category, options|
      if options[:vendor_categories]
        vc = options[:vendor_categories].find { |item| item.category_id == category.id }
        vc&.is_primary? || false
      elsif category.respond_to?(:is_primary)
        category.is_primary
      else
        false
      end
    end
  end
end
