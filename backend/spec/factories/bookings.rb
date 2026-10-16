# frozen_string_literal: true

FactoryBot.define do
  factory :booking do
    customer factory: %i[user customer]
    vendor factory: %i[vendor]
    service { association :service, vendor: vendor }

    event_date { 1.week.from_now }
    event_location { Faker::Address.full_address }
    total_amount { Faker::Number.decimal(l_digits: 3, r_digits: 2) }
    status { :pending }
    requirements { Faker::Lorem.paragraph }
    special_instructions { Faker::Lorem.sentence }
    event_duration { "#{rand(2..8)} hours" }

    transient do
      vendor_user { nil }
    end

    after(:build) do |booking, evaluator|
      booking.vendor = evaluator.vendor_user.vendor if evaluator.vendor_user.present?
    end

    trait :with_end_date do
      event_end_date { event_date + rand(2..8).hours }
    end

    trait :pending do
      status { :pending }
    end

    trait :accepted do
      status { :accepted }
    end

    trait :declined do
      status { :declined }
    end

    trait :completed do
      status { :completed }
    end

    trait :cancelled do
      status { :cancelled }
    end

    trait :counter_offered do
      status { :counter_offered }
    end

    trait :upcoming do
      event_date { rand(1..30).days.from_now }
    end

    trait :past do
      event_date { rand(1..30).days.ago }
    end

    trait :today do
      event_date { Time.current.beginning_of_day + rand(8..18).hours }
    end

    trait :with_messages do
      after(:create) do |booking|
        create_list(:booking_message, 3, booking: booking, sender: booking.customer)
        create_list(:booking_message, 2, booking: booking, sender: booking.vendor.user)
      end
    end
  end
end
