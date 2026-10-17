# frozen_string_literal: true

FactoryBot.define do
  factory :vendor_category do
    vendor
    category
    is_primary { false }

    trait :primary do
      is_primary { true }
    end
  end
end
