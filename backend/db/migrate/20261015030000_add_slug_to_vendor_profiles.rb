# frozen_string_literal: true

class AddSlugToVendorProfiles < ActiveRecord::Migration[8.0]
  def up
    add_column :vendor_profiles, :slug, :string

    # Backfill existing vendor profiles with unique slugs
    VendorProfile.reset_column_information
    VendorProfile.order(:id).find_each do |vp|
      base_slug = vp.business_name.to_s.parameterize.presence || 'vendor'
      vp.slug = VendorProfile.next_available_slug(base_slug, current_id: vp.id)
      vp.save!(validate: false)
    end

    change_column_null :vendor_profiles, :slug, false
    add_index :vendor_profiles, :slug, unique: true
  end

  def down
    remove_index :vendor_profiles, :slug, if_exists: true
    remove_column :vendor_profiles, :slug, if_exists: true
  end
end
