# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ReviewSerializer do
  let(:customer_user) { create(:user, :customer, first_name: 'Ananya', last_name: 'Roy') }
  let(:vendor_user) { create(:user, :with_vendor) }
  let(:vendor) { vendor_user.vendor }
  let(:service) { create(:service, vendor: vendor) }
  let(:booking) { create(:booking, customer: customer_user, vendor: vendor, service: service) }
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
