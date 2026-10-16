# frozen_string_literal: true

FactoryBot.define do
  factory :customer_favorite do
    user
    vendor
  end
end
