# frozen_string_literal: true

FactoryBot.define do
  factory :booking_message do
    booking
    sender factory: %i[user]

    message { Faker::Lorem.sentence(word_count: rand(5..50)) }
    sent_at { Time.current }

    trait :from_customer do
      sender factory: %i[user customer]
    end

    trait :from_vendor do
      sender factory: %i[user vendor]
    end

    trait :recent do
      sent_at { rand(1..60).minutes.ago }
    end

    trait :old do
      sent_at { rand(1..7).days.ago }
    end

    trait :long_message do
      message { Faker::Lorem.paragraph(sentence_count: rand(5..10)) }
    end

    trait :short_message do
      message { Faker::Lorem.sentence(word_count: rand(3..8)) }
    end

    trait :question do
      message { "#{Faker::Lorem.sentence.chomp('.')}?" }
    end

    trait :urgent do
      message { "URGENT: #{Faker::Lorem.sentence}" }
    end
  end
end
