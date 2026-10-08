# frozen_string_literal: true

require 'rails_helper'

# rubocop:disable RSpec/DescribeClass
describe 'GraphQL N+1 Query Prevention' do
  describe 'reviews query' do
    before do
      Array.new(5) do
        booking = create(:booking, status: :completed)
        create(:review, booking: booking, customer: booking.customer,
                        service: booking.service, vendor_profile: booking.vendor_profile)
      end
    end

    it 'prevents N+1 queries when fetching review associations' do
      query = <<~GRAPHQL
        {
          reviews(limit: 5) {
            id
            customer { id email }
            booking { id }
            service { id name }
            vendorProfile { id businessName }
          }
        }
      GRAPHQL

      query_count = count_queries do
        MarketplaceSchema.execute(query)
      end

      # Should be roughly:
      # 1 query for reviews
      # + 1 for customer preload
      # + 1 for booking preload
      # + 1 for service preload
      # + 1 for vendor_profile preload
      # = 5 queries (not 25 for 5 reviews × 4 associations + 1 base)
      expect(query_count).to be <= 10
    end
  end

  describe 'services query' do
    let(:vendor_profile) { create(:vendor_profile) }

    before do
      create_list(:service, 5, vendor_profile: vendor_profile)
    end

    it 'prevents N+1 queries for vendor_profile fields' do
      query = <<~GRAPHQL
        {
          services(limit: 5) {
            id
            name
            vendorLocation
            vendorBusinessName
            vendorAverageRating
            vendorTotalReviews
          }
        }
      GRAPHQL

      query_count = count_queries do
        MarketplaceSchema.execute(query)
      end

      # Should be roughly:
      # 1 query for services
      # + 1 for vendor_profile preload (shared by all 4 vendor_* fields)
      # + some overhead for schema and type checking
      # Total should be much less than 5 × 5 = 25 (N+1 problem)
      expect(query_count).to be <= 15
    end
  end

  describe 'vendor_profile query' do
    let!(:vendor) { create(:vendor_profile) }

    before do
      create_list(:portfolio_item, 3, vendor_profile: vendor)
      create_list(:review, 2, vendor_profile: vendor)
      create_list(:service, 2, vendor_profile: vendor)
    end

    it 'prevents N+1 queries for nested associations' do
      query = <<~GRAPHQL
        {
          vendorProfile(id: #{vendor.id}) {
            id
            portfolioItems { id title }
            reviews { id rating }
            services { id name }
          }
        }
      GRAPHQL

      query_count = count_queries do
        MarketplaceSchema.execute(query)
      end

      # Should be:
      # 1 query for vendor_profile
      # + 1 for portfolio_items
      # + 1 for reviews
      # + 1 for services
      # = 4 queries (not more if DataLoader is working)
      expect(query_count).to be <= 6
    end
  end
end
# rubocop:enable RSpec/DescribeClass
