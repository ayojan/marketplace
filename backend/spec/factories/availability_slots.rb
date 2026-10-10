# frozen_string_literal: true

FactoryBot.define do
  factory :availability_slot do
    vendor_profile

    date { rand(1..30).days.from_now.to_date }
    start_time { date == Date.current ? 1.hour.from_now.strftime('%H:%M') : '09:00' }
    end_time { date == Date.current ? 3.hours.from_now.strftime('%H:%M') : '17:00' }

    trait :today do
      date { Date.current }
      start_time { 1.hour.from_now.strftime('%H:%M') }
      end_time { 3.hours.from_now.strftime('%H:%M') }
    end

    trait :tomorrow do
      date { Date.current + 1.day }
    end

    trait :next_week do
      date { 1.week.from_now.to_date }
    end

    trait :unavailable do
      is_available { false }
    end

    trait :morning do
      start_time { '08:00' }
      end_time { '12:00' }
    end

    trait :afternoon do
      start_time { '13:00' }
      end_time { '17:00' }
    end

    trait :evening do
      start_time { '18:00' }
      end_time { '22:00' }
    end

    trait :full_day do
      start_time { '08:00' }
      end_time { '20:00' }
    end

    trait :short_slot do
      start_time { '14:00' }
      end_time { '16:00' }
    end

    trait :overnight do
      start_time { '22:00' }
      end_time { '06:00' }
    end
  end
end
