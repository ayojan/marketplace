# frozen_string_literal: true

require 'rails_helper'

# rubocop:disable RSpec/MultipleMemoizedHelpers, RSpec/IndexedLet
RSpec.describe Resolvers::ServiceSearchResolver, type: :graphql do
  let(:schema) { MarketplaceSchema }
  let(:context) { {} }

  # Create test data
  let!(:photography_category) { create(:category, name: 'Photography', slug: 'photography') }
  let!(:videography_category) { create(:category, name: 'Videography', slug: 'videography') }

  let!(:user1) { create(:user, email: 'vendor1@example.com', role: :vendor) }
  let!(:user2) { create(:user, email: 'vendor2@example.com', role: :vendor) }
  let!(:user3) { create(:user, email: 'vendor3@example.com', role: :vendor) }

  let!(:vendor1) do
    user1.vendor.tap do |v|
      v.update!(business_name: 'Amazing Photos', location: 'New York, NY', average_rating: 4.5,
                latitude: 40.7128, longitude: -74.0060)
    end
  end
  let!(:vendor2) do
    user2.vendor.tap do |v|
      v.update!(business_name: 'Video Masters', location: 'Los Angeles, CA', average_rating: 4.2,
                latitude: 34.0522, longitude: -118.2437)
    end
  end
  let!(:vendor3) do
    user3.vendor.tap do |v|
      v.update!(business_name: 'Event Specialists', location: 'Chicago, IL', average_rating: 3.8,
                latitude: 41.8781, longitude: -87.6298)
    end
  end

  let(:service1) do
    create(:service, name: 'Wedding Photography', vendor: vendor1, service_category: photography_category,
                     base_price: 1500, status: :active)
  end
  let(:service2) do
    create(:service, name: 'Corporate Video', vendor: vendor2, service_category: videography_category,
                     base_price: 2500, status: :active)
  end
  let(:service3) do
    create(:service, name: 'Event Photography', vendor: vendor3, service_category: photography_category,
                     base_price: 800, status: :active)
  end
  let(:service4) do
    create(:service, name: 'Portrait Session', vendor: vendor1, service_category: photography_category,
                     base_price: 300, status: :inactive)
  end

  describe '#resolve' do
    before do
      # Setup services for all tests
      service1
      service2
      service3
      service4
    end

    let(:query) do
      <<~GQL
        query SearchServices($query: String, $filters: ServiceFiltersInput, $location: LocationInput, $pagination: PaginationInput) {
          searchServices(query: $query, filters: $filters, location: $location, pagination: $pagination) {
            services {
              id
              name
              basePrice
              vendorBusinessName
              vendorLocation
              serviceCategory {
                name
                slug
              }
            }
            totalCount
            currentPage
            perPage
            totalPages
            hasNextPage
            hasPreviousPage
            facets {
              categories {
                id
                name
                slug
                count
              }
              priceRanges {
                minPrice
                maxPrice
                label
                count
              }
              locations {
                location
                count
              }
              pricingTypes {
                pricingType
                label
                count
              }
              vendorRatings {
                minRating
                maxRating
                label
                count
              }
            }
            searchTime
          }
        }
      GQL
    end

    context 'without any filters' do
      it 'returns all active services' do
        result = schema.execute(query, context: context)

        expect(result.dig('data', 'searchServices', 'totalCount')).to eq(3)
        expect(result.dig('data', 'searchServices', 'services').size).to eq(3)

        service_names = result.dig('data', 'searchServices', 'services').pluck('name')
        expect(service_names).to include('Wedding Photography', 'Corporate Video', 'Event Photography')
        expect(service_names).not_to include('Portrait Session') # inactive service
      end

      it 'includes facets in the response' do
        result = schema.execute(query, context: context)

        facets = result.dig('data', 'searchServices', 'facets')
        expect(facets).to be_present
        expect(facets['categories']).to be_present
        expect(facets['priceRanges']).to be_present
        expect(facets['locations']).to be_present
      end

      it 'includes search time' do
        result = schema.execute(query, context: context)

        search_time = result.dig('data', 'searchServices', 'searchTime')
        expect(search_time).to be_a(Float)
        expect(search_time).to be > 0
      end
    end

    context 'with text search query' do
      let(:variables) { { query: 'photography' } }

      it 'returns services matching the search query' do
        result = schema.execute(query, variables: variables, context: context)

        expect(result.dig('data', 'searchServices', 'totalCount')).to eq(2)

        service_names = result.dig('data', 'searchServices', 'services').pluck('name')
        expect(service_names).to include('Wedding Photography', 'Event Photography')
        expect(service_names).not_to include('Corporate Video')
      end
    end

    context 'with category filter' do
      let(:variables) { { filters: { categories: [photography_category.id] } } }

      it 'returns services in the specified category' do
        result = schema.execute(query, variables: variables, context: context)

        expect(result.dig('data', 'searchServices', 'totalCount')).to eq(2)

        services = result.dig('data', 'searchServices', 'services')
        services.each do |service|
          expect(service.dig('serviceCategory', 'slug')).to eq('photography')
        end
      end
    end

    context 'with price range filter' do
      let(:variables) { { filters: { priceMin: 1000, priceMax: 2000 } } }

      it 'returns services within the price range' do
        result = schema.execute(query, variables: variables, context: context)

        expect(result.dig('data', 'searchServices', 'totalCount')).to eq(1)

        service = result.dig('data', 'searchServices', 'services').first
        expect(service['name']).to eq('Wedding Photography')
        expect(service['basePrice']).to eq(1500.0)
      end
    end

    context 'with vendor rating filter' do
      let(:variables) { { filters: { vendorRating: 4.0 } } }

      it 'returns services from vendors with rating above threshold' do
        result = schema.execute(query, variables: variables, context: context)

        expect(result.dig('data', 'searchServices', 'totalCount')).to eq(2)

        service_names = result.dig('data', 'searchServices', 'services').pluck('name')
        expect(service_names).to include('Wedding Photography', 'Corporate Video')
        expect(service_names).not_to include('Event Photography') # vendor rating 3.8
      end
    end

    context 'with location filter' do
      let(:variables) { { location: { city: 'New York' } } }

      it 'returns services from vendors in the specified location' do
        result = schema.execute(query, variables: variables, context: context)

        expect(result.dig('data', 'searchServices', 'totalCount')).to eq(1)

        service = result.dig('data', 'searchServices', 'services').first
        expect(service['name']).to eq('Wedding Photography')
        expect(service['vendorLocation']).to include('New York')
      end
    end

    context 'with geospatial location filter' do
      let(:variables) do
        {
          location: {
            latitude: 40.7128, # New York coordinates
            longitude: -74.0060,
            radius: 50 # 50km radius
          }
        }
      end

      it 'returns services from vendors within the specified radius' do
        result = schema.execute(query, variables: variables, context: context)

        expect(result.dig('data', 'searchServices', 'totalCount')).to eq(1)

        service = result.dig('data', 'searchServices', 'services').first
        expect(service['name']).to eq('Wedding Photography')
        expect(service['vendorLocation']).to include('New York')
      end

      it 'validates coordinates' do
        invalid_variables = {
          location: {
            latitude: 200, # Invalid
            longitude: -74.0060,
            radius: 50
          }
        }
        result = schema.execute(query, variables: invalid_variables, context: context)
        expect(result['errors']).to be_present
        expect(result['errors'][0]['message']).to include('Invalid coordinates')
      end
    end

    context 'with pagination' do
      let(:variables) { { pagination: { page: 1, perPage: 2 } } }

      it 'returns paginated results' do
        result = schema.execute(query, variables: variables, context: context)

        expect(result.dig('data', 'searchServices', 'services').size).to eq(2)
        expect(result.dig('data', 'searchServices', 'currentPage')).to eq(1)
        expect(result.dig('data', 'searchServices', 'perPage')).to eq(2)
        expect(result.dig('data', 'searchServices', 'totalPages')).to eq(2)
        expect(result.dig('data', 'searchServices', 'hasNextPage')).to be true
        expect(result.dig('data', 'searchServices', 'hasPreviousPage')).to be false
      end
    end

    context 'with sorting' do
      let(:variables) { { pagination: { sortBy: 'price', sortOrder: 'asc' } } }

      it 'returns results sorted by price ascending' do
        result = schema.execute(query, variables: variables, context: context)

        services = result.dig('data', 'searchServices', 'services')
        prices = services.pluck('basePrice')
        expect(prices).to eq(prices.sort)
      end
    end

    context 'with complex filters combination' do
      let(:variables) do
        {
          query: 'photography',
          filters: {
            categories: [photography_category.id],
            priceMin: 500,
            vendorRating: 4.0
          },
          pagination: { page: 1, perPage: 10 }
        }
      end

      it 'applies all filters correctly' do
        result = schema.execute(query, variables: variables, context: context)

        expect(result.dig('data', 'searchServices', 'totalCount')).to eq(1)

        service = result.dig('data', 'searchServices', 'services').first
        expect(service['name']).to eq('Wedding Photography')
        expect(service.dig('serviceCategory', 'slug')).to eq('photography')
        expect(service['basePrice']).to be >= 500
      end
    end

    # rubocop:disable RSpec/ContextWording
    context 'facet generation' do
      it 'generates category facets correctly' do
        result = schema.execute(query, context: context)

        category_facets = result.dig('data', 'searchServices', 'facets', 'categories')
        expect(category_facets.size).to eq(2)

        photography_facet = category_facets.find { |f| f['slug'] == 'photography' }
        videography_facet = category_facets.find { |f| f['slug'] == 'videography' }

        expect(photography_facet['count']).to eq(2)
        expect(videography_facet['count']).to eq(1)
      end

      it 'generates category facets respecting other filters' do
        # Filter by price > 1000
        variables = { filters: { priceMin: 1000 } }
        result = schema.execute(query, variables: variables, context: context)

        category_facets = result.dig('data', 'searchServices', 'facets', 'categories')
        photography_facet = category_facets.find { |f| f['slug'] == 'photography' }

        # Should only include "Wedding Photography" (1500), excluding "Event Photography" (800)
        expect(photography_facet['count']).to eq(1)
      end

      it 'generates price range facets correctly' do
        result = schema.execute(query, context: context)

        price_facets = result.dig('data', 'searchServices', 'facets', 'priceRanges')
        expect(price_facets).to be_present

        # Should have facets for different price ranges with counts
        price_facets.each do |facet|
          expect(facet['count']).to be > 0
          expect(facet['label']).to be_present
        end
      end

      it 'generates location facets correctly' do
        result = schema.execute(query, context: context)

        location_facets = result.dig('data', 'searchServices', 'facets', 'locations')
        expect(location_facets.size).to eq(3)

        locations = location_facets.pluck('location')
        expect(locations).to include('New York, NY', 'Los Angeles, CA', 'Chicago, IL')
      end
    end

    context 'error handling' do
      it 'handles invalid pagination gracefully' do
        variables = { pagination: { page: -1, perPage: 1000 } }
        result = schema.execute(query, variables: variables, context: context)

        # Should normalize invalid values
        expect(result.dig('data', 'searchServices', 'currentPage')).to eq(1)
        expect(result.dig('data', 'searchServices', 'perPage')).to eq(100) # max limit
      end

      it 'handles empty results gracefully' do
        variables = { query: 'nonexistent service' }
        result = schema.execute(query, variables: variables, context: context)

        expect(result.dig('data', 'searchServices', 'totalCount')).to eq(0)
        expect(result.dig('data', 'searchServices', 'services')).to eq([])
        expect(result.dig('data', 'searchServices', 'facets')).to be_present
      end
    end
    # rubocop:enable RSpec/ContextWording
  end

  describe 'query complexity' do
    let(:complex_query) do
      <<~GQL
        query SearchServices {
          searchServices {
            services {
              id
              name
              vendor {
                id
                businessName
                services {
                  id
                  name
                  serviceCategory {
                    id
                    name
                  }
                }
                portfolioItems {
                  id
                  title
                }
              }
            }
            facets {
              categories {
                id
                name
                count
              }
              priceRanges {
                minPrice
                maxPrice
                label
                count
              }
            }
          }
        }
      GQL
    end

    it 'calculates query complexity correctly' do
      # This test ensures our complexity values are working
      result = schema.execute(complex_query, context: context)

      # Should execute successfully but with reasonable complexity
      expect(result['errors']).to be_nil
      expect(result.dig('data', 'searchServices')).to be_present
    end
  end
end
# rubocop:enable RSpec/MultipleMemoizedHelpers, RSpec/IndexedLet
