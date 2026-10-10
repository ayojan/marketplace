# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ServiceSearchService, type: :service do
  let!(:vendor_user) { create(:user, :with_vendor_profile) }
  let!(:vendor_profile) do
    vendor_user.vendor_profile.tap do |vp|
      vp.update!(business_name: 'Test Photography', location: 'New York, NY')
    end
  end
  let(:photography_category) { create(:category, :photography) }
  let(:videography_category) { create(:category, :videography) }

  let(:wedding_service) do
    create(:service,
           name: 'Wedding Photography',
           description: 'Professional wedding photography services capturing your special ' \
                        'moments with artistic flair and attention to detail',
           base_price: 1000,
           pricing_type: 'package',
           status: 'active',
           vendor_profile: vendor_profile,
           service_category: photography_category)
  end

  let(:portrait_service) do
    create(:service,
           name: 'Portrait Photography',
           description: 'Studio portrait photography sessions with professional lighting ' \
                        'and editing for stunning results',
           base_price: 200,
           pricing_type: 'hourly',
           status: 'active',
           vendor_profile: vendor_profile,
           service_category: photography_category)
  end

  let(:video_service) do
    create(:service,
           name: 'Event Videography',
           description: 'Professional event video recording with multi-camera setup ' \
                        'and post-production editing services',
           base_price: 1500,
           pricing_type: 'package',
           status: 'active',
           vendor_profile: vendor_profile,
           service_category: videography_category)
  end

  let(:inactive_service) do
    create(:service,
           name: 'Inactive Service',
           description: 'This service is currently inactive and not available for booking ' \
                        'at this time',
           base_price: 500,
           pricing_type: 'hourly',
           status: 'inactive',
           vendor_profile: vendor_profile,
           service_category: photography_category)
  end

  before do
    wedding_service
    portrait_service
    video_service
    inactive_service
  end

  describe '#call' do
    context 'without any filters' do
      it 'returns all active services' do
        result = described_class.new.call

        expect(result[:services].count).to eq(3)
        expect(result[:total_count]).to eq(3)
        expect(result[:pagination][:current_page]).to eq(1)
        expect(result[:pagination][:total_pages]).to eq(1)
        expect(result[:filters]).to be_empty
      end
    end

    context 'with text search' do
      it 'searches by service name' do
        result = described_class.new(query: 'Wedding').call

        expect(result[:services].count).to eq(1)
        expect(result[:services].first.name).to eq('Wedding Photography')
        expect(result[:filters][:query]).to eq('Wedding')
      end

      it 'searches by service description' do
        result = described_class.new(query: 'Studio').call

        expect(result[:services].count).to eq(1)
        expect(result[:services].first.name).to eq('Portrait Photography')
      end

      it 'searches by vendor business name' do
        result = described_class.new(query: 'Test Photography').call

        expect(result[:services].count).to eq(3)
      end

      it 'is case insensitive' do
        result = described_class.new(query: 'wedding').call

        expect(result[:services].count).to eq(1)
        expect(result[:services].first.name).to eq('Wedding Photography')
      end
    end

    context 'with category filter' do
      it 'filters by category' do
        result = described_class.new(category_id: photography_category.id).call

        expect(result[:services].count).to eq(2)
        expect(result[:services].map(&:name)).not_to include('Event Videography')
        expect(result[:filters][:category_id]).to eq(photography_category.id)
      end
    end

    context 'with location filter' do
      it 'filters by location' do
        result = described_class.new(location: 'New York').call

        expect(result[:services].count).to eq(3)
        expect(result[:filters][:location]).to eq('New York')
      end

      it 'returns no results for non-matching location' do
        result = described_class.new(location: 'Los Angeles').call

        expect(result[:services].count).to eq(0)
      end
    end

    context 'with price range filters' do
      it 'filters by minimum price' do
        result = described_class.new(min_price: 500).call

        expect(result[:services].count).to eq(2)
        expect(result[:services].map(&:base_price)).to all(be >= 500)
        expect(result[:filters][:min_price]).to eq(500)
      end

      it 'filters by maximum price' do
        result = described_class.new(max_price: 1000).call

        expect(result[:services].count).to eq(2)
        expect(result[:services].map(&:base_price)).to all(be <= 1000)
        expect(result[:filters][:max_price]).to eq(1000)
      end

      it 'filters by price range' do
        result = described_class.new(min_price: 200, max_price: 1000).call

        expect(result[:services].count).to eq(2)
        expect(result[:services].map(&:base_price)).to all(be_between(200, 1000))
      end
    end

    context 'with pricing type filter' do
      it 'filters by pricing type' do
        result = described_class.new(pricing_type: 'hourly').call

        expect(result[:services].count).to eq(1)
        expect(result[:services].first.pricing_type).to eq('hourly')
        expect(result[:filters][:pricing_type]).to eq('hourly')
      end
    end

    context 'with vendor filter' do
      it 'filters by vendor' do
        result = described_class.new(vendor_id: vendor_profile.id).call

        expect(result[:services].count).to eq(3)
        expect(result[:services].all? { |s| s.vendor_profile == vendor_profile }).to be true
        expect(result[:filters][:vendor_id]).to eq(vendor_profile.id)
      end
    end

    context 'with sorting' do
      it 'sorts by name ascending' do
        result = described_class.new(sort_by: 'name', sort_direction: 'asc').call

        names = result[:services].map(&:name)
        expect(names).to eq(['Event Videography', 'Portrait Photography', 'Wedding Photography'])
      end

      it 'sorts by price descending' do
        result = described_class.new(sort_by: 'base_price', sort_direction: 'desc').call

        prices = result[:services].map(&:base_price)
        expect(prices).to eq([1500, 1000, 200])
      end

      it 'defaults to created_at desc when invalid sort field' do
        result = described_class.new(sort_by: 'invalid_field').call

        # Should not raise error and use default sorting
        expect(result[:services].count).to eq(3)
      end
    end

    context 'with pagination' do
      it 'paginates results' do
        result = described_class.new(per_page: 2, page: 1).call

        expect(result[:services].count).to eq(2)
        expect(result[:pagination][:current_page]).to eq(1)
        expect(result[:pagination][:per_page]).to eq(2)
        expect(result[:pagination][:total_pages]).to eq(2)
        expect(result[:pagination][:has_next_page]).to be true
        expect(result[:pagination][:has_prev_page]).to be false
      end

      it 'handles second page' do
        result = described_class.new(per_page: 2, page: 2).call

        expect(result[:services].count).to eq(1)
        expect(result[:pagination][:current_page]).to eq(2)
        expect(result[:pagination][:has_next_page]).to be false
        expect(result[:pagination][:has_prev_page]).to be true
      end

      it 'limits per_page to maximum allowed' do
        result = described_class.new(per_page: 200).call

        expect(result[:pagination][:per_page]).to eq(100) # MAX_PER_PAGE
      end

      it 'ensures minimum page is 1' do
        result = described_class.new(page: 0).call

        expect(result[:pagination][:current_page]).to eq(1)
      end
    end

    context 'with combined filters' do
      it 'applies multiple filters correctly' do
        result = described_class.new(
          query: 'Photography',
          category_id: photography_category.id,
          min_price: 100,
          max_price: 500
        ).call

        expect(result[:services].count).to eq(1)
        expect(result[:services].first.name).to eq('Portrait Photography')
        expect(result[:filters].keys).to include(:query, :category_id, :min_price, :max_price)
      end
    end

    context 'when no services match filters' do
      it 'returns empty results' do
        result = described_class.new(query: 'NonExistentService').call

        expect(result[:services]).to be_empty
        expect(result[:total_count]).to eq(0)
        expect(result[:pagination][:total_pages]).to eq(0)
      end
    end
  end

  describe 'parameter normalization' do
    it 'strips whitespace from string parameters' do
      service = described_class.new(query: '  Wedding  ', location: '  New York  ')

      expect(service.query).to eq('Wedding')
      expect(service.location).to eq('New York')
    end

    it 'validates sort direction' do
      service = described_class.new(sort_direction: 'invalid')

      expect(service.sort_direction).to eq('desc')
    end

    it 'validates sort field' do
      service = described_class.new(sort_by: 'invalid_field')

      expect(service.sort_by).to eq('created_at')
    end
  end
end
