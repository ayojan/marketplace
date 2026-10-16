# frozen_string_literal: true

FactoryBot.define do
  factory :review do
    booking { association :booking, status: :completed }
    customer { booking.customer }
    vendor { booking.vendor }
    service { booking.service }

    rating { rand(1..5) }
    quality_rating { rand(1..5) }
    communication_rating { rand(1..5) }
    value_rating { rand(1..5) }
    punctuality_rating { rand(1..5) }
    comment { Faker::Lorem.paragraph }
    status { :published }
    helpful_votes { 0 }

    trait :with_vendor_response do
      vendor_response { Faker::Lorem.sentence }
      vendor_responded_at { Time.current }
    end

    trait :hidden do
      status { :hidden }
    end
  end
end
