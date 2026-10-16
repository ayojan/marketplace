# frozen_string_literal: true

module User::Ransackable
  extend ActiveSupport::Concern

  class_methods do
    # Explicitly allowlist safe searchable fields for Ransack/ActiveAdmin
    def ransackable_attributes(_auth_object = nil)
      %w[id email first_name last_name role confirmed_at created_at updated_at]
    end

    # Explicitly allowlist safe associations for Ransack/ActiveAdmin
    def ransackable_associations(_auth_object = nil)
      %w[vendor customer customer_bookings vendor_bookings booking_messages]
    end
  end
end
