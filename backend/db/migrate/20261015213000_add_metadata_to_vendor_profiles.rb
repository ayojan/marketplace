# frozen_string_literal: true

class AddMetadataToVendorProfiles < ActiveRecord::Migration[8.0]
  def change
    add_column :vendor_profiles, :metadata, :jsonb, default: {}
  end
end
