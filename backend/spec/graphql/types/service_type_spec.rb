# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Types::ServiceType, type: :graphql do
  let(:schema) { MarketplaceSchema }
  let(:context) { {} }

  let(:category) { create(:category, name: 'Photography') }
  let(:user) { create(:user, email: 'type-test-vendor@example.com', role: :vendor) }
  let(:vendor) { user.vendor_profile.tap { |v| v.update!(business_name: 'Test Vendor', average_rating: 4.5) } }
  let(:service) do
    create(:service, name: 'Wedding Photography', vendor_profile: vendor, service_category: category, base_price: 1500)
  end
  let!(:vendor_service) { create(:vendor_service, service: service, vendor_profile: vendor) }

  let(:query) do
    <<~GQL
      query GetService($id: ID!) {
        service(id: $id) {
          id
          name
          description
          basePrice
          pricingType
          status
          formattedBasePrice
          canBeBooked
          hasImages
          bookingsCount
          shortDescription(limit: 50)
          vendorLocation
          vendorBusinessName
          vendorAverageRating
          vendorTotalReviews
          vendorProfile {
            id
            businessName
            location
          }
          serviceCategory {
            id
            name
            slug
          }
          serviceImages {
            id
            caption
          }
        }
      }
    GQL
  end

  it 'returns service data correctly' do
    variables = { id: service.id }
    result = schema.execute(query, variables: variables, context: context)

    service_data = result.dig('data', 'service')

    expect(service_data['id']).to eq(service.id.to_s)
    expect(service_data['name']).to eq('Wedding Photography')
    expect(service_data['basePrice']).to eq(1500.0)
    expect(service_data['pricingType']).to eq('hourly')
    expect(service_data['status']).to eq('active')
  end

  it 'returns computed fields correctly' do
    variables = { id: service.id }
    result = schema.execute(query, variables: variables, context: context)

    service_data = result.dig('data', 'service')

    expect(service_data['formattedBasePrice']).to eq('1500.0/hour')
    expect(service_data['canBeBooked']).to be true
    expect(service_data['hasImages']).to be false
    expect(service_data['bookingsCount']).to eq(0)
  end

  it 'returns vendor information correctly' do
    variables = { id: service.id }
    result = schema.execute(query, variables: variables, context: context)

    service_data = result.dig('data', 'service')

    expect(service_data['vendorBusinessName']).to eq('Test Vendor')
    expect(service_data['vendorAverageRating']).to eq(4.5)
    expect(service_data['vendorTotalReviews']).to eq(0)
  end

  it 'returns associated data correctly' do
    variables = { id: service.id }
    result = schema.execute(query, variables: variables, context: context)

    service_data = result.dig('data', 'service')

    expect(service_data.dig('vendorProfile', 'businessName')).to eq('Test Vendor')
    expect(service_data.dig('serviceCategory', 'name')).to eq('Photography')
  end

  it 'handles short description with custom limit' do
    long_description = 'A' * 200
    service.update!(description: long_description)

    variables = { id: service.id }
    result = schema.execute(query, variables: variables, context: context)

    service_data = result.dig('data', 'service')
    short_desc = service_data['shortDescription']

    expect(short_desc.length).to be <= 53 # 50 + '...'
    expect(short_desc).to end_with('...')
  end

  it 'returns null for non-existent service' do
    variables = { id: 'non-existent-id' }
    result = schema.execute(query, variables: variables, context: context)

    expect(result.dig('data', 'service')).to be_nil
  end
end
