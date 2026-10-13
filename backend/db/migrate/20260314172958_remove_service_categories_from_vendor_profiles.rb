# frozen_string_literal: true

class RemoveServiceCategoriesFromVendorProfiles < ActiveRecord::Migration[8.0]
  def change
    # Remove redundant comma-separated text field
    # service_categories_list functionality now derives from services.categories association
    remove_column :vendor_profiles, :service_categories, :text
  end
end
