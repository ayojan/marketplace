# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Vendor::Geolocation do
  subject(:vendor) { build(:vendor, latitude: nil, longitude: nil) }

  describe 'included validations' do
    it 'rejects latitude out of range' do
      vendor.latitude = 91
      vendor.valid?
      expect(vendor.errors[:latitude]).to be_present
    end

    it 'rejects longitude out of range' do
      vendor.longitude = -181
      vendor.valid?
      expect(vendor.errors[:longitude]).to be_present
    end

    it 'allows nil latitude and longitude' do
      vendor.latitude  = nil
      vendor.longitude = nil
      vendor.valid?
      expect(vendor.errors[:latitude]).to be_empty
      expect(vendor.errors[:longitude]).to be_empty
    end

    it 'accepts boundary values' do
      vendor.latitude  = 90
      vendor.longitude = -180
      vendor.valid?
      expect(vendor.errors[:latitude]).to be_empty
      expect(vendor.errors[:longitude]).to be_empty
    end
  end

  describe '#coordinates?' do
    it 'returns false when both are nil' do
      expect(vendor.coordinates?).to be false
    end

    it 'returns false when only latitude is set' do
      vendor.latitude = 28.6
      expect(vendor.coordinates?).to be false
    end

    it 'returns false when only longitude is set' do
      vendor.longitude = 77.2
      expect(vendor.coordinates?).to be false
    end

    it 'returns true when both are set' do
      vendor.latitude  = 28.6
      vendor.longitude = 77.2
      expect(vendor.coordinates?).to be true
    end

    it 'is aliased as has_coordinates?' do
      expect(vendor.method(:has_coordinates?)).to eq(vendor.method(:coordinates?))
    end
  end

  describe '#coordinates' do
    it 'returns nil when coordinates are not set' do
      expect(vendor.coordinates).to be_nil
    end

    it 'returns [lat, lng] as floats when set' do
      vendor.latitude  = 28.613939
      vendor.longitude = 77.209023
      expect(vendor.coordinates).to eq([28.613939, 77.209023])
    end
  end

  describe '#distance_to' do
    let(:delhi_lat) { 28.6139 }
    let(:delhi_lng) { 77.2090 }
    let(:mumbai_lat) { 19.0760 }
    let(:mumbai_lng) { 72.8777 }

    context 'when vendor has coordinates' do
      before do
        vendor.latitude  = delhi_lat
        vendor.longitude = delhi_lng
      end

      it 'returns a numeric distance' do
        allow(GeographicLocation).to receive(:new).and_call_original
        result = vendor.distance_to(mumbai_lat, mumbai_lng)
        expect(result).to be_a(Numeric)
      end

      it 'returns nil on ArgumentError from GeographicLocation' do
        allow(GeographicLocation).to receive(:new).and_raise(ArgumentError)
        expect(vendor.distance_to(mumbai_lat, mumbai_lng)).to be_nil
      end
    end

    context 'when vendor has no coordinates' do
      it 'returns nil without calling GeographicLocation' do
        allow(GeographicLocation).to receive(:new)
        expect(vendor.distance_to(mumbai_lat, mumbai_lng)).to be_nil
        expect(GeographicLocation).not_to have_received(:new)
      end
    end
  end

  describe 'scopes' do
    let!(:vendor_with_coords) do
      create(:vendor, latitude: 28.6, longitude: 77.2)
    end
    let!(:vendor_without_coords) do
      create(:vendor, latitude: nil, longitude: nil)
    end

    describe '.with_coordinates' do
      it 'returns vendors that have lat and lng set' do
        expect(Vendor.with_coordinates).to include(vendor_with_coords)
        expect(Vendor.with_coordinates).not_to include(vendor_without_coords)
      end
    end

    describe '.within_radius' do
      it 'composes with with_coordinates (no NULL rows in result)' do
        # Even if the haversine predicate passes, vendors without coordinates
        # must be excluded because within_radius calls with_coordinates first.
        allow(Vendor).to receive(:haversine_distance_sql).and_return('1 = 1')
        results = Vendor.within_radius(28.6, 77.2, 500)
        expect(results).not_to include(vendor_without_coords)
      end
    end
  end
end
