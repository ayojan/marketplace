# frozen_string_literal: true

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
