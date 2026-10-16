# frozen_string_literal: true

# == Schema Information
#
# Table name: services
#
#  id             :bigint           not null, primary key
#  average_rating :decimal(3, 2)    default(0.0)
#  base_price     :decimal(10, 2)
#  description    :text
#  name           :string
#  pricing_type   :integer          default("hourly")
#  status         :integer          default("draft")
#  total_reviews  :integer          default(0)
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#
# Indexes
#
#  index_services_on_average_rating  (average_rating)
#  index_services_on_status          (status)
#
FactoryBot.define do
  factory :service do
    sequence(:name) { |n| "Service #{n}" }
    description do
      'This is a comprehensive description of the service that provides detailed ' \
        'information about what is offered and meets the minimum length requirement for validation.'
    end
    base_price { 150.00 }
    pricing_type { :hourly }
    status { :active }
    vendor

    # Support transient service_category parameter for creating join records
    transient do
      service_category { nil }
    end

    after(:create) do |service, evaluator|
      # service_category is a join table - create the join record if passed
      if evaluator.service_category.present? && evaluator.service_category.is_a?(Category)
        create(:service_category, service: service, category: evaluator.service_category)
      end
    end

    trait :draft do
      status { :draft }
    end

    trait :inactive do
      status { :inactive }
    end

    trait :archived do
      status { :archived }
    end

    trait :package_pricing do
      pricing_type { :package }
      base_price { 500.00 }
    end

    trait :custom_pricing do
      pricing_type { :custom }
      base_price { nil }
    end

    trait :photography do
      name { 'Wedding Photography' }
      description do
        'Professional wedding photography service capturing your special moments with artistic flair ' \
          'and attention to detail. Includes pre-wedding consultation, full day coverage, ' \
          'and edited high-resolution images.'
      end
      base_price { 1200.00 }
      pricing_type { :package }
    end

    trait :videography do
      name { 'Event Videography' }
      description do
        'Complete event videography service including multi-camera setup, professional audio recording, ' \
          'and post-production editing to create a memorable video of your special event.'
      end
      base_price { 80.00 }
      pricing_type { :hourly }
    end

    trait :expensive do
      base_price { 2000.00 }
    end

    trait :cheap do
      base_price { 50.00 }
    end
  end
end
