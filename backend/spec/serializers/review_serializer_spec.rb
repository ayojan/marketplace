# frozen_string_literal: true

require 'rails_helper'

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
RSpec.describe ReviewSerializer do
  let(:customer_user) { create(:user, :customer, first_name: 'Ananya', last_name: 'Roy') }
  let(:vendor_user) { create(:user, :with_vendor) }
  let(:vendor) { vendor_user.vendor }
  let(:service) { create(:service, vendor: vendor) }
  let(:booking) { create(:booking, :completed, customer: customer_user, vendor: vendor, service: service) }
  let(:review) do
    create(
      :review,
      customer: customer_user,
      vendor: vendor,
      service: service,
      booking: booking,
      rating: 5,
      quality_rating: 5,
      communication_rating: 4,
      value_rating: 5,
      punctuality_rating: 5,
      comment: 'Outstanding photography coverage!'
    )
  end

  describe 'default view' do
    it 'renders review with detailed ratings, customer, service, and vendor' do
      result = described_class.render_as_hash(review)

      expect(result[:id]).to eq(review.id)
      expect(result[:rating]).to eq(5)
      expect(result[:comment]).to eq('Outstanding photography coverage!')
      expect(result[:ratings][:quality]).to eq(5)
      expect(result[:ratings][:communication]).to eq(4)
      expect(result[:customer][:name]).to eq(customer_user.full_name)
      expect(result[:service][:name]).to eq(service.name)
      expect(result[:vendor][:business_name]).to eq(vendor.business_name)
    end
  end

  describe 'vendor_review view' do
    it 'renders review formatted for vendor public profile' do
      result = described_class.render_as_hash(review, view: :vendor_review)

      expect(result[:id]).to eq(review.id)
      expect(result[:rating]).to eq(5)
      expect(result[:comment]).to eq('Outstanding photography coverage!')
      expect(result[:customer][:name]).to eq(customer_user.full_name)
      expect(result[:service_name]).to eq(service.name)
      expect(result).not_to have_key(:ratings)
    end
  end
end
