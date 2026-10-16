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
      after(:create) do |user|
        create(:customer, user: user) unless user.customer
      end
    end
  end
end
