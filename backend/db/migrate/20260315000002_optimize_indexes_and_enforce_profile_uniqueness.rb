# frozen_string_literal: true

class OptimizeIndexesAndEnforceProfileUniqueness < ActiveRecord::Migration[8.0]
  def change
    # 1. Enforce unique user_id on vendor_profiles
    remove_index :vendor_profiles, :user_id, if_exists: true
    add_index :vendor_profiles, :user_id, unique: true, name: 'index_vendor_profiles_on_user_id',
                                          comment: 'Ensures each user has at most one vendor profile'

    # 2. Enforce unique user_id on customer_profiles
    remove_index :customer_profiles, :user_id, if_exists: true
    add_index :customer_profiles, :user_id, unique: true, name: 'index_customer_profiles_on_user_id',
                                            comment: 'Ensures each user has at most one customer profile'

    # 3. Remove duplicate composite index on in_app_notifications
    remove_index :in_app_notifications, name: 'idx_on_user_id_is_read_created_at_8313b98c79', if_exists: true
  end
end
