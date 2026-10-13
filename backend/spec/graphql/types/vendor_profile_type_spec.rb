# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Types::VendorProfileType, type: :graphql do
  let(:schema) { MarketplaceSchema }
  let(:context) { {} }

  let(:user) { create(:user, email: 'vendor@example.com', role: :vendor) }
  let(:vendor) do
    user.vendor_profile.tap do |vp|
      vp.update!(
        business_name: 'Test Vendor',
        location: 'New York, NY',
        latitude: 40.7128,
        longitude: -74.0060,
        average_rating: 4.5,
        total_reviews: 10,
        verification_status: :verified
      )
    end
  end

  let(:query) do
    <<~GQL
      query GetVendorProfile($id: ID!) {
        vendorProfile(id: $id) {
          id
          businessName
          description
          location
          latitude
          longitude
          phone
          website
          yearsExperience
          averageRating
          totalReviews
          isVerified
          serviceCategories
          verified
          hasDescription
          profileComplete
          displayName
          ratingDisplay
          serviceCategoriesList
          hasPortfolio
          hasCoordinates
          coordinates
          distanceTo(latitude: 34.0522, longitude: -118.2437)
          services {
            id
            name
          }
          portfolioItems {
            id
            title
          }
        }
      }
    GQL
  end

  it 'returns vendor profile data correctly' do
    variables = { id: vendor.id }
    result = schema.execute(query, variables: variables, context: context)

    vendor_data = result.dig('data', 'vendorProfile')

    expect(vendor_data['id']).to eq(vendor.id.to_s)
    expect(vendor_data['businessName']).to eq('Test Vendor')
    expect(vendor_data['location']).to eq('New York, NY')
    expect(vendor_data['latitude']).to eq(40.7128)
    expect(vendor_data['longitude']).to eq(-74.0060)
    expect(vendor_data['averageRating']).to eq(4.5)
    expect(vendor_data['totalReviews']).to eq(10)
    expect(vendor_data['isVerified']).to be true
  end

  it 'returns computed fields correctly' do
    variables = { id: vendor.id }
    result = schema.execute(query, variables: variables, context: context)

    vendor_data = result.dig('data', 'vendorProfile')

    expect(vendor_data['verified']).to be true
    expect(vendor_data['displayName']).to eq('Test Vendor')
    expect(vendor_data['ratingDisplay']).to eq('4.5 (10 reviews)')
    expect(vendor_data['hasCoordinates']).to be true
    expect(vendor_data['coordinates']).to eq([40.7128, -74.0060])
  end

  it 'calculates distance correctly' do
    variables = { id: vendor.id }
    result = schema.execute(query, variables: variables, context: context)

    vendor_data = result.dig('data', 'vendorProfile')
    distance = vendor_data['distanceTo']

    # Distance from New York to Los Angeles should be around 3,944,000 meters
    expect(distance).to be_a(Float)
    expect(distance).to be > 3_900_000
    expect(distance).to be < 4_000_000
  end

  it 'handles vendor without coordinates' do
    vendor.update!(latitude: nil, longitude: nil)

    variables = { id: vendor.id }
    result = schema.execute(query, variables: variables, context: context)

    vendor_data = result.dig('data', 'vendorProfile')

    expect(vendor_data['hasCoordinates']).to be false
    expect(vendor_data['coordinates']).to be_nil
    expect(vendor_data['distanceTo']).to be_nil
  end

  it 'returns service categories list correctly' do
    ['Photography', 'Videography', 'Event Planning'].each do |cat_name|
      cat = create(:category, name: cat_name)
      create(:service, vendor_profile: vendor, service_category: cat, name: "#{cat_name} Service")
    end

    variables = { id: vendor.id }
    result = schema.execute(query, variables: variables, context: context)

    vendor_data = result.dig('data', 'vendorProfile')
    categories = vendor_data['serviceCategoriesList']

    expect(categories).to contain_exactly('Photography', 'Videography', 'Event Planning')
  end

  it 'returns associated services and portfolio items' do
    category = create(:category)
    create(:service, vendor_profile: vendor, service_category: category, name: 'Test Service')
    create(:portfolio_item, vendor_profile: vendor, title: 'Test Portfolio')

    variables = { id: vendor.id }
    result = schema.execute(query, variables: variables, context: context)

    vendor_data = result.dig('data', 'vendorProfile')

    expect(vendor_data['services'].size).to eq(1)
    expect(vendor_data['services'].first['name']).to eq('Test Service')

    expect(vendor_data['portfolioItems'].size).to eq(1)
    expect(vendor_data['portfolioItems'].first['title']).to eq('Test Portfolio')

    expect(vendor_data['hasPortfolio']).to be true
  end

  it 'returns null for non-existent vendor profile' do
    variables = { id: 'non-existent-id' }
    result = schema.execute(query, variables: variables, context: context)

    expect(result.dig('data', 'vendorProfile')).to be_nil
  end
end
