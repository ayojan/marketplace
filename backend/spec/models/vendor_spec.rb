# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Vendor do
  let(:vendor_user) { create(:user, :vendor) }
  let(:vendor) { vendor_user.vendor }

  describe 'associations' do
    it { is_expected.to belong_to(:user) }
    it { is_expected.to have_many(:vendor_services).dependent(:destroy) }
    it { is_expected.to have_many(:services).dependent(:destroy) }
    it { is_expected.to have_many(:categories).through(:services) }
    it { is_expected.to have_many(:bookings).dependent(:destroy) }
  end

  describe 'validations' do
    subject(:vendor) { vendor_user.vendor }

    it { is_expected.to validate_uniqueness_of(:user_id) }
    it { is_expected.to validate_presence_of(:business_name) }
    it { is_expected.to validate_length_of(:business_name).is_at_least(2).is_at_most(100) }
    it { is_expected.to validate_length_of(:description).is_at_least(50).is_at_most(2000) }
    it { is_expected.to validate_presence_of(:location) }
    it { is_expected.to validate_length_of(:location).is_at_most(255) }
    it { is_expected.to validate_numericality_of(:years_experience).is_greater_than_or_equal_to(0).is_less_than(100) }

    it {
      expect(vendor).to validate_numericality_of(:average_rating)
        .is_greater_than_or_equal_to(0.0).is_less_than_or_equal_to(5.0)
    }

    it { is_expected.to validate_numericality_of(:total_reviews).is_greater_than_or_equal_to(0) }

    describe 'phone validation' do
      it 'accepts valid phone numbers' do
        valid_phones = ['+1-555-123-4567', '555-123-4567', '(555) 123-4567', '+44 20 7946 0958']
        valid_phones.each do |phone|
          vendor.phone = phone
          expect(vendor).to be_valid, "#{phone} should be valid"
        end
      end

      it 'rejects invalid phone numbers' do
        invalid_phones = %w[123 abc-def-ghij 555-12-34567890123456]
        invalid_phones.each do |phone|
          vendor.phone = phone
          expect(vendor).not_to be_valid, "#{phone} should be invalid"
        end
      end

      it 'allows blank phone numbers' do
        vendor.phone = ''
        expect(vendor).to be_valid
      end
    end

    describe 'website validation' do
      it 'accepts valid URLs' do
        valid_urls = ['https://example.com', 'http://test.org', 'https://www.business.co.uk']
        valid_urls.each do |url|
          vendor.website = url
          expect(vendor).to be_valid, "#{url} should be valid"
        end
      end

      it 'rejects invalid URLs' do
        invalid_urls = ['not-a-url', 'ftp://example.com']
        invalid_urls.each do |url|
          vendor.website = url
          expect(vendor).not_to be_valid, "#{url} should be invalid"
        end
      end

      it 'allows blank websites' do
        vendor.website = ''
        expect(vendor).to be_valid
      end
    end
  end

  describe 'scopes' do
    describe '.verified' do
      let!(:verified_vendor) do
        create(:user, :vendor).vendor.tap do |vp|
          vp.update!(verification_status: :verified)
        end
      end
      let!(:unverified_vendor) do
        create(:user, :vendor).vendor.tap do |vp|
          vp.update!(verification_status: :unverified)
        end
      end

      it 'returns only verified vendors' do
        expect(described_class.verified).to include(verified_vendor)
        expect(described_class.verified).not_to include(unverified_vendor)
      end
    end

    describe '.not_verified' do
      let!(:verified_vendor) do
        create(:user, :vendor).vendor.tap { |vp| vp.update!(verification_status: :verified) }
      end
      let!(:pending_vendor) do
        create(:user, :vendor).vendor.tap { |vp| vp.update!(verification_status: :pending_verification) }
      end
      let!(:rejected_vendor) do
        create(:user, :vendor).vendor.tap { |vp| vp.update!(verification_status: :rejected) }
      end
      let!(:unverified_vendor) do
        create(:user, :vendor).vendor.tap { |vp| vp.update!(verification_status: :unverified) }
      end

      it 'includes unverified, pending and rejected vendors' do
        result = described_class.not_verified
        expect(result).to include(unverified_vendor, pending_vendor, rejected_vendor)
      end

      it 'excludes verified vendors' do
        expect(described_class.not_verified).not_to include(verified_vendor)
      end

      it 'is also accessible via the deprecated :unverified alias' do
        expect(described_class.unverified).to match_array(described_class.not_verified)
      end
    end

    describe '.by_location' do
      let!(:ny_vendor) { create(:user, :vendor).vendor.tap { |vp| vp.update!(location: 'New York, NY') } }
      let!(:la_vendor) { create(:user, :vendor).vendor.tap { |vp| vp.update!(location: 'Los Angeles, CA') } }

      it 'finds vendors by partial location match' do
        expect(described_class.by_location('New York')).to include(ny_vendor)
        expect(described_class.by_location('New York')).not_to include(la_vendor)
      end

      it 'is case-insensitive' do
        expect(described_class.by_location('new york')).to include(ny_vendor)
      end

      it 'is safe against LIKE metacharacter injection' do
        # '%' without escaping would match everything — it should match nothing here
        expect(described_class.by_location('%')).not_to include(ny_vendor, la_vendor)
        expect(described_class.by_location('_ew York')).not_to include(ny_vendor)
      end
    end

    describe '.with_rating_above' do
      let!(:high_rated_vendor) do
        create(:user, :vendor).vendor.tap do |vp|
          vp.update!(average_rating: 4.5, total_reviews: 10)
        end
      end

      it 'returns vendors with rating above threshold' do
        expect(described_class.with_rating_above(4.0)).to include(high_rated_vendor)
      end
    end

    describe '.by_experience' do
      let!(:experienced_vendor) { create(:user, :vendor).vendor.tap { |vp| vp.update!(years_experience: 15) } }

      it 'returns vendors with minimum years of experience' do
        expect(described_class.by_experience(10)).to include(experienced_vendor)
        expect(described_class.by_experience(20)).not_to include(experienced_vendor)
      end
    end
  end

  describe 'instance methods' do
    let(:complete_vendor) do
      create(:user, :vendor).vendor.tap do |vp|
        vp.update!(
          description: 'A' * 60,
          phone: '+1-555-123-4567',
          website: 'https://example.com',
          service_categories: 'Photography, Event Planning, Videography'
        )
      end
    end

    describe '#verified?' do
      it 'returns true for verified vendors' do
        complete_vendor.update(verification_status: :verified)
        expect(complete_vendor.verified?).to be true
      end

      it 'returns false for unverified vendors' do
        complete_vendor.update(verification_status: :unverified)
        expect(complete_vendor.verified?).to be false
      end
    end

    describe '#has_description?' do
      it 'returns true when description is present and long enough' do
        complete_vendor.update(description: 'A' * 60)
        expect(complete_vendor.has_description?).to be true
      end

      it 'returns false when description is too short' do
        complete_vendor.update(description: 'Short')
        expect(complete_vendor.has_description?).to be false
      end

      it 'returns false when description is blank' do
        complete_vendor.update(description: '')
        expect(complete_vendor.has_description?).to be false
      end
    end

    describe '#service_categories_list' do
      it 'returns array of categories' do
        complete_vendor.update(service_categories: 'Photography, Videography, Event Planning')
        expect(complete_vendor.service_categories_list).to eq(['Photography', 'Videography', 'Event Planning'])
      end

      it 'returns empty array when no categories' do
        complete_vendor.update(service_categories: '')
        expect(complete_vendor.service_categories_list).to eq([])
      end
    end

    describe '#service_categories_list=' do
      it 'sets categories from array' do
        complete_vendor.service_categories_list = %w[Photography Videography]
        expect(complete_vendor.service_categories).to eq('Photography, Videography')
      end

      it 'sets categories from string' do
        complete_vendor.service_categories_list = 'Photography, Videography'
        expect(complete_vendor.service_categories).to eq('Photography, Videography')
      end
    end

    describe '#profile_complete?' do
      it 'returns true when all required fields are present' do
        expect(complete_vendor.profile_complete?).to be true
      end

      it 'returns false when business_name is missing' do
        complete_vendor.update(business_name: '')
        expect(complete_vendor.profile_complete?).to be false
      end

      it 'returns false when location is blank' do
        complete_vendor.location = ''
        expect(complete_vendor.profile_complete?).to be false
      end

      it 'returns false when description is too short' do
        complete_vendor.update(description: 'Short')
        expect(complete_vendor.profile_complete?).to be false
      end

      it 'returns false when description is blank' do
        complete_vendor.update(description: '')
        expect(complete_vendor.profile_complete?).to be false
      end
    end

    describe '#portfolio?' do
      it 'returns false when vendor has no portfolio items' do
        expect(vendor.portfolio?).to be false
      end

      it 'returns true when vendor has at least one portfolio item' do
        create(:portfolio_item, vendor: complete_vendor)
        expect(complete_vendor.portfolio?).to be true
      end

      it 'is aliased as has_portfolio?' do
        expect(complete_vendor.method(:has_portfolio?)).to eq(complete_vendor.method(:portfolio?))
      end
    end

    describe '#display_name' do
      it 'returns business_name when present' do
        expect(complete_vendor.display_name).to eq(complete_vendor.business_name)
      end

      it 'returns user full_name when business_name is blank' do
        complete_vendor.update(business_name: '')
        expect(complete_vendor.display_name).to eq(complete_vendor.user.full_name)
      end
    end

    describe '#request_verification!' do
      before do
        allow(Vendors::HandleVerification).to receive(:call)
      end

      it 'delegates to Vendors::HandleVerification' do
        complete_vendor.request_verification!
        expect(Vendors::HandleVerification).to have_received(:call)
          .with(vendor: complete_vendor, action: :request)
      end
    end

    describe '#approve_verification!' do
      before do
        allow(Vendors::HandleVerification).to receive(:call)
      end

      it 'delegates to Vendors::HandleVerification' do
        complete_vendor.approve_verification!
        expect(Vendors::HandleVerification).to have_received(:call)
          .with(vendor: complete_vendor, action: :approve)
      end
    end

    describe '#reject_verification!' do
      let(:reason) { 'Invalid data' }

      before do
        allow(Vendors::HandleVerification).to receive(:call)
      end

      it 'delegates to Vendors::HandleVerification' do
        complete_vendor.reject_verification!(reason)
        expect(Vendors::HandleVerification).to have_received(:call)
          .with(vendor: complete_vendor, action: :reject, reason: reason)
      end
    end

    describe '#update_rating_stats!' do
      before do
        allow(Vendors::UpdateRatingStats).to receive(:call)
      end

      it 'delegates to Vendors::UpdateRatingStats' do
        complete_vendor.update_rating_stats!
        expect(Vendors::UpdateRatingStats).to have_received(:call)
          .with(vendor: complete_vendor)
      end
    end

    describe '#rating_display' do
      it 'returns formatted rating with reviews count' do
        complete_vendor.update(average_rating: 4.3, total_reviews: 15)
        expect(complete_vendor.rating_display).to eq('4.3 (15 reviews)')
      end

      it 'returns singular review for one review' do
        complete_vendor.update(average_rating: 5.0, total_reviews: 1)
        expect(complete_vendor.rating_display).to eq('5.0 (1 review)')
      end

      it 'returns no ratings message when no reviews' do
        complete_vendor.update(total_reviews: 0)
        expect(complete_vendor.rating_display).to eq('No ratings yet')
      end
    end
  end

  describe 'scopes (search)' do
    describe '.search_by_name_or_location' do
      let!(:amazing_photography) do
        create(:user, :vendor).vendor.tap do |vp|
          vp.update!(business_name: 'Amazing Photography', location: 'New York')
        end
      end
      let!(:best_events) do
        create(:user, :vendor).vendor.tap do |vp|
          vp.update!(business_name: 'Best Events', location: 'Los Angeles')
        end
      end
      let!(:creative_studio) do
        create(:user, :vendor).vendor.tap do |vp|
          vp.update!(business_name: 'Creative Studio',
                     description: 'Wedding photography specialists in the city providing amazing services ' \
                                  'for all your special events and occasions')
        end
      end

      it 'finds vendors by business name' do
        results = described_class.search_by_name_or_location('Amazing')
        expect(results).to include(amazing_photography)
        expect(results).not_to include(best_events)
      end

      it 'finds vendors by location' do
        results = described_class.search_by_name_or_location('Los Angeles')
        expect(results).to include(best_events)
        expect(results).not_to include(amazing_photography)
      end

      it 'finds vendors by description' do
        results = described_class.search_by_name_or_location('Wedding')
        expect(results).to include(creative_studio)
      end

      it 'returns all vendors when query is blank' do
        results = described_class.search_by_name_or_location('')
        expect(results).to include(amazing_photography, best_events, creative_studio)
      end

      it 'is safe against LIKE metacharacter injection' do
        results = described_class.search_by_name_or_location('%')
        expect(results).not_to include(amazing_photography, best_events, creative_studio)
      end

      it 'returns a chainable ActiveRecord::Relation' do
        expect(described_class.search_by_name_or_location('Amazing').verified).to be_a(ActiveRecord::Relation)
      end
    end
  end

  describe 'callbacks' do
    describe 'normalize_website' do
      it 'adds https:// to website without protocol' do
        test_vendor = create(:user, :vendor).vendor
        test_vendor.website = 'example.com'
        test_vendor.save
        expect(test_vendor.website).to eq('https://example.com')
      end

      it 'does not modify website with protocol' do
        test_vendor = create(:user, :vendor).vendor
        test_vendor.website = 'https://example.com'
        test_vendor.save
        expect(test_vendor.website).to eq('https://example.com')
      end

      it 'does not modify blank website' do
        test_vendor = create(:user, :vendor).vendor
        test_vendor.website = ''
        test_vendor.save
        expect(test_vendor.website).to eq('')
      end
    end
  end

  describe 'slug functionality' do
    describe 'auto-generating slug' do
      it 'generates a parameterized slug from business_name' do
        record = create(:user, :vendor, first_name: 'Jane', last_name: 'Doe').vendor
        record.update!(business_name: 'Creative Studio Delhi', slug: nil)
        expect(record.slug).to eq('creative-studio-delhi')
      end

      it 'handles special characters and extra spaces' do
        v = build(:vendor, business_name: 'Sharma & Sons @ Photographers!!!', slug: nil)
        v.save!
        expect(v.slug).to eq('sharma-sons-photographers')
      end

      it 'falls back to "vendor" if business_name produces an empty slug' do
        v = build(:vendor, business_name: '***', slug: nil)
        v.save!
        expect(v.slug).to eq('vendor')
      end

      it 'does not overwrite custom slug if already present' do
        v = build(:vendor, business_name: 'Custom Name', slug: 'my-custom-slug')
        v.save!
        expect(v.slug).to eq('my-custom-slug')
      end
    end

    describe 'collision resolution without registration errors' do
      it 'appends incrementing suffixes when duplicate business names are registered' do
        first_user = create(:user, role: :vendor)
        first_record = first_user.vendor
        first_record.update!(business_name: 'Royal Weddings', slug: nil)
        expect(first_record.slug).to eq('royal-weddings')

        second_user = create(:user, role: :vendor)
        second_record = second_user.vendor
        second_record.update!(business_name: 'Royal Weddings', slug: nil)
        expect(second_record.slug).to eq('royal-weddings-2')

        third_user = create(:user, role: :vendor)
        third_record = third_user.vendor
        third_record.update!(business_name: 'Royal Weddings', slug: nil)
        expect(third_record.slug).to eq('royal-weddings-3')
      end

      it 'correctly determines the next available number even with existing suffixed slugs' do
        u1 = create(:user, role: :vendor)
        u1.vendor.update!(business_name: 'Unique Shoot', slug: 'unique-shoot')

        u2 = create(:user, role: :vendor)
        u2.vendor.update!(business_name: 'Unique Shoot', slug: 'unique-shoot-5')

        u3 = create(:user, role: :vendor)
        u3.vendor.update!(business_name: 'Unique Shoot', slug: nil)
        expect(u3.vendor.slug).to eq('unique-shoot-6')
      end
    end

    describe 'lookup methods' do
      let!(:vendor_record) do
        user = create(:user, role: :vendor)
        user.vendor.tap do |vp|
          vp.update!(business_name: 'Star Capture Studio', slug: nil)
        end
      end

      describe '.find_by_id_or_slug' do
        it 'finds vendor by exact slug' do
          expect(described_class.find_by_id_or_slug(vendor_record.slug)).to eq(vendor_record)
        end

        it 'finds vendor by case-insensitive slug' do
          expect(described_class.find_by_id_or_slug(vendor_record.slug.upcase)).to eq(vendor_record)
        end

        it 'finds vendor by numeric ID' do
          expect(described_class.find_by_id_or_slug(vendor_record.id)).to eq(vendor_record)
          expect(described_class.find_by_id_or_slug(vendor_record.id.to_s)).to eq(vendor_record)
        end

        it 'returns nil when vendor is not found' do
          expect(described_class.find_by_id_or_slug('non-existent-vendor')).to be_nil
          expect(described_class.find_by_id_or_slug(999_999)).to be_nil
        end
      end

      describe '.find_by_id_or_slug!' do
        it 'finds vendor by slug' do
          expect(described_class.find_by_id_or_slug!(vendor_record.slug)).to eq(vendor_record)
        end

        it 'finds vendor by numeric ID' do
          expect(described_class.find_by_id_or_slug!(vendor_record.id)).to eq(vendor_record)
        end

        it 'raises ActiveRecord::RecordNotFound when not found' do
          expect { described_class.find_by_id_or_slug!('unknown-slug') }
            .to raise_error(ActiveRecord::RecordNotFound)
        end
      end

      describe '#to_param' do
        it 'returns slug instead of id' do
          expect(vendor_record.to_param).to eq(vendor_record.slug)
        end
      end
    end
  end
end
