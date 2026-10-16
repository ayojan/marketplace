# frozen_string_literal: true

# == Schema Information
#
# Table name: services
#
#  id             :bigint           not null, primary key
#  average_rating :decimal(3, 2)    default(0.0)
#  base_price     :decimal(10, 2)
#  description    :text
#  name           :string
#  pricing_type   :integer          default("hourly")
#  status         :integer          default("draft")
#  total_reviews  :integer          default(0)
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#  vendor_id      :bigint           not null
#
# Indexes
#
#  index_services_on_average_rating        (average_rating)
#  index_services_on_status                (status)
#  index_services_on_vendor_id             (vendor_id)
#  index_services_on_vendor_id_and_status  (vendor_id,status)
#
# Foreign Keys
#
#  fk_rails_...  (vendor_id => vendors.id)
#
require 'rails_helper'

RSpec.describe Service do
  describe 'associations' do
    it { is_expected.to belong_to(:vendor) }
    it { is_expected.to have_many(:vendor_services).dependent(:destroy) }
    it { is_expected.to have_many(:vendors).through(:vendor_services) }
    it { is_expected.to have_many(:service_categories).dependent(:destroy) }
    it { is_expected.to have_many(:categories).through(:service_categories) }
  end

  describe 'enums' do
    it { is_expected.to define_enum_for(:pricing_type).with_values(hourly: 0, package: 1, custom: 2) }
    it { is_expected.to define_enum_for(:status).with_values(draft: 0, active: 1, inactive: 2, archived: 3) }
  end

  describe 'validations' do
    subject { build(:service) }

    it { is_expected.to validate_presence_of(:name) }
    it { is_expected.to validate_length_of(:name).is_at_least(3).is_at_most(100) }

    it { is_expected.to validate_presence_of(:description) }
    it { is_expected.to validate_length_of(:description).is_at_least(50).is_at_most(2000) }

    # Base price validation is handled by custom validation for non-custom pricing
    it { is_expected.to validate_numericality_of(:base_price).is_greater_than(0).is_less_than(1_000_000) }

    it { is_expected.to validate_presence_of(:pricing_type) }
    it { is_expected.to validate_presence_of(:status) }

    describe 'custom validations' do
      describe 'base_price_required_for_non_custom_pricing' do
        it 'allows nil base_price for custom pricing' do
          service = build(:service, pricing_type: :custom, base_price: nil)
          expect(service).to be_valid
        end

        it 'requires base_price for hourly pricing' do
          service = build(:service, pricing_type: :hourly, base_price: nil)
          expect(service).not_to be_valid
          expect(service.errors[:base_price]).to include('must be present and greater than 0 for non-custom pricing')
        end

        it 'requires base_price for package pricing' do
          service = build(:service, pricing_type: :package, base_price: 0)
          expect(service).not_to be_valid
          expect(service.errors[:base_price]).to include('must be present and greater than 0 for non-custom pricing')
        end
      end
    end
  end

  describe 'scopes' do
    let(:category) { create(:category) }
    let!(:active_service) do
      create(:service, status: :active)
    end
    let!(:draft_service) do
      create(:service, status: :draft)
    end
    let!(:inactive_service) do
      create(:service, status: :inactive)
    end

    describe '.active' do
      it 'returns only active services' do
        expect(described_class.active).to include(active_service)
        expect(described_class.active).not_to include(draft_service, inactive_service)
      end
    end

    describe '.draft' do
      it 'returns only draft services' do
        expect(described_class.draft).to include(draft_service)
        expect(described_class.draft).not_to include(active_service, inactive_service)
      end
    end

    describe '.by_category' do
      let(:other_category) { create(:category) }
      let!(:photo_service) { create(:service) }
      let!(:video_service) { create(:service) }

      before do
        create(:service_category, service: photo_service, category: category)
        create(:service_category, service: video_service, category: other_category)
      end

      it 'returns services for specific category' do
        expect(described_class.by_category(category)).to include(photo_service)
        expect(described_class.by_category(category)).not_to include(video_service)
      end
    end

    describe '.price_range' do
      let!(:cheap_service) do
        create(:service, base_price: 50)
      end
      let!(:expensive_service) do
        create(:service, base_price: 500)
      end

      it 'returns services within price range' do
        result = described_class.price_range(40, 100)
        expect(result).to include(cheap_service)
        expect(result).not_to include(expensive_service)
      end
    end

    describe '.search_by_name' do
      let!(:photo_service) do
        create(:service, name: 'Wedding Photography')
      end
      let!(:video_service) do
        create(:service, name: 'Event Videography')
      end

      it 'returns services matching name search' do
        result = described_class.search_by_name('photo')
        expect(result).to include(photo_service)
        expect(result).not_to include(video_service)
      end
    end
  end

  describe 'instance methods' do
    let(:service) { create(:service) }

    describe 'status methods' do
      it 'returns correct status booleans' do
        service.status = :active
        expect(service.active?).to be true
        expect(service.draft?).to be false

        service.status = :draft
        expect(service.draft?).to be true
        expect(service.active?).to be false
      end
    end

    describe 'pricing type methods' do
      it 'returns correct pricing type booleans' do
        service.pricing_type = :hourly
        expect(service.hourly_pricing?).to be true
        expect(service.package_pricing?).to be false

        service.pricing_type = :custom
        expect(service.custom_pricing?).to be true
        expect(service.hourly_pricing?).to be false
      end
    end

    describe '#formatted_base_price' do
      it 'returns custom quote for custom pricing' do
        service.pricing_type = :custom
        expect(service.formatted_base_price).to eq('Custom Quote')
      end

      it 'returns hourly rate for hourly pricing' do
        service.pricing_type = :hourly
        service.base_price = 100
        expect(service.formatted_base_price).to eq('100.0/hour')
      end

      it 'returns base price for package pricing' do
        service.pricing_type = :package
        service.base_price = 500
        expect(service.formatted_base_price).to eq('500.0')
      end
    end

    describe '#can_be_booked?' do
      it 'returns true for active service with vendors' do
        active_service = create(:service, status: :active)
        vendor = create(:vendor)
        create(:vendor_service, service: active_service, vendor: vendor)

        expect(active_service.can_be_booked?).to be true
      end

      it 'returns false for inactive service' do
        inactive_service = create(:service, status: :inactive)
        vendor = create(:vendor)
        create(:vendor_service, service: inactive_service, vendor: vendor)

        expect(inactive_service.can_be_booked?).to be false
      end

      it 'returns false for active service without vendors' do
        active_service_no_vendors = build(:service, status: :active, vendor: nil)
        expect(active_service_no_vendors.can_be_booked?).to be false
      end
    end

    describe '#short_description' do
      it 'returns full description if under limit' do
        service.description = 'Short description'
        expect(service.short_description(50)).to eq('Short description')
      end

      it 'truncates long description' do
        service.description = 'A' * 150
        result = service.short_description(100)
        expect(result.length).to be <= 103 # 100 + '...'
        expect(result).to end_with('...')
      end
    end
  end

  describe 'class methods' do
    describe '.featured' do
      let!(:featured_service) do
        create(:service, status: :active, average_rating: 4.5)
      end
      let!(:unfeatured_service) do
        create(:service, status: :active, average_rating: 2.0)
      end

      it 'returns services from verified vendors only' do
        # Associate featured_service with verified vendor
        verified_vendor = create(:vendor, verification_status: :verified, average_rating: 4.5)
        featured_service.update!(vendor: verified_vendor)

        # Associate unfeatured_service with unverified vendor
        unverified_vendor = create(:vendor, verification_status: :unverified)
        unfeatured_service.update!(vendor: unverified_vendor)

        result = described_class.featured
        expect(result).to include(featured_service)
        expect(result).not_to include(unfeatured_service)
      end

      it 'limits results to specified number' do
        # Create additional verified vendors and services
        5.times do |_i|
          vendor = create(:vendor, verification_status: :verified, average_rating: 4.0)
          create(:service, status: :active, average_rating: 4.0, vendor: vendor)
        end
        expect(described_class.featured(3).size).to eq(3)
      end
    end

    describe '.search' do
      let!(:photo_service) do
        create(:service, name: 'Photography',
                         description: 'Wedding photos and more details to meet minimum length requirement')
      end
      let!(:video_service) do
        create(:service, name: 'Videography',
                         description: 'Event videos and more details to meet minimum length requirement')
      end

      it 'searches by name and description' do
        result = described_class.search('photo')
        expect(result).to include(photo_service)
        expect(result).not_to include(video_service)

        result = described_class.search('wedding')
        expect(result).to include(photo_service)
      end

      it 'returns all services for blank query' do
        expect(described_class.search('')).to include(photo_service, video_service)
      end
    end

    describe '.available_pricing_types' do
      it 'returns humanized pricing types' do
        result = described_class.available_pricing_types
        expect(result).to include(%w[Hourly hourly], %w[Package package], %w[Custom custom])
      end
    end
  end
end
