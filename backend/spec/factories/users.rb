# frozen_string_literal: true

FactoryBot.define do
  factory :user do
    first_name { Faker::Name.first_name }
    last_name { Faker::Name.last_name }
    email { Faker::Internet.unique.email }
    password { 'password123' }
    password_confirmation { 'password123' }
    role { :customer }
    confirmed_at { Time.current }

    trait :customer do
      role { :customer }
    end

    trait :vendor do
      role { :vendor }
    end

    trait :admin do
      role { :admin }
    end

    trait :unconfirmed do
      confirmed_at { nil }
    end

    trait :confirmed do
      confirmed_at { Time.current }
    end

    trait :with_vendor do
      role { :vendor }
      after(:create) do |user|
        create(:vendor, user: user) unless user.vendor
      end
    end

    trait :with_customer do
      role { :customer }
    end

    trait :with_company do
      company_name { Faker::Company.name }
    end

    trait :frequent_customer do
      total_bookings { rand(5..20) }
    end

    trait :high_budget do
      budget_range { 'over_5000' }
    end

    trait :complete_profile do
      phone { '+1-555-987-6543' }
      preferences { 'I prefer vendors with excellent reviews and professional portfolios.' }
      event_types { 'Wedding, Anniversary, Corporate Event' }
      location { 'New York, NY' }
    end
  end

  factory :customer, parent: :user do
    role { :customer }
  end
end
