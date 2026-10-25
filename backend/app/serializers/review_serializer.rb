# frozen_string_literal: true

class ReviewSerializer < Blueprinter::Base
  identifier :id
  fields :rating, :comment, :status, :created_at

  field :ratings do |review|
    {
      quality: review.quality_rating,
      communication: review.communication_rating,
      value: review.value_rating,
      punctuality: review.punctuality_rating
    }
  end

  field :customer do |review|
    cust = review.customer
    cust ? { id: cust.id, name: cust.full_name } : nil
  end

  field :service do |review|
    svc = review.service
    svc ? { id: svc.id, name: svc.name } : nil
  end

  field :vendor do |review|
    vend = review.vendor
    vend ? { id: vend.id, business_name: vend.business_name } : nil
  end

  view :vendor_review do
    excludes :ratings, :service, :vendor

    field :customer do |review|
      cust = review.customer
      {
        name: cust&.full_name || 'Verified Client',
        first_name: cust&.first_name || 'Client'
      }
    end

    field :service_name do |review|
      review.service&.name
    end

    fields :vendor_response, :vendor_responded_at
  end
end
