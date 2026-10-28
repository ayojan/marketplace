# frozen_string_literal: true

# == Schema Information
#
# Table name: reviews
#
#  id                   :bigint           not null, primary key
#  comment              :text
#  communication_rating :integer
#  helpful_votes        :integer          default(0), not null
#  punctuality_rating   :integer
#  quality_rating       :integer
#  rating               :integer          not null
#  status               :string           default("published")
#  value_rating         :integer
#  vendor_responded_at  :datetime
#  vendor_response      :text
#  created_at           :datetime         not null
#  updated_at           :datetime         not null
#  booking_id           :bigint           not null
#  customer_id          :bigint           not null
#  service_id           :bigint           not null
#  vendor_id            :bigint           not null
#
# Indexes
#
#  index_reviews_helpful_by_vendor_and_status          (vendor_id,status,helpful_votes DESC)
#  index_reviews_on_booking_id                         (booking_id) UNIQUE
#  index_reviews_on_customer_id                        (customer_id)
#  index_reviews_on_rating                             (rating)
#  index_reviews_on_service_id                         (service_id)
#  index_reviews_on_service_id_and_status              (service_id,status)
#  index_reviews_on_status                             (status)
#  index_reviews_on_vendor_id                          (vendor_id)
#  index_reviews_on_vendor_id_and_helpful_votes        (vendor_id,helpful_votes DESC)
#  index_reviews_on_vendor_id_and_status               (vendor_id,status)
#  index_reviews_on_vendor_id_and_vendor_responded_at  (vendor_id,vendor_responded_at)
#
# Foreign Keys
#
#  fk_rails_...  (booking_id => bookings.id)
#  fk_rails_...  (customer_id => users.id)
#  fk_rails_...  (service_id => services.id)
#  fk_rails_...  (vendor_id => vendors.id)
#
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
