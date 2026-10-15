# frozen_string_literal: true

FactoryBot.define do
  factory :auth_identity do
    user
    provider { 'google' }
    sequence(:uid) { |n| "google-sub-#{n}" }
    email { user&.email || Faker::Internet.email }
    metadata { { name: 'Google User', picture: 'https://example.com/avatar.jpg' } }
  end
end
