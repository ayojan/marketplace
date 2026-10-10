# frozen_string_literal: true

# == Schema Information
#
# Table name: vendor_profiles
#
#  id                  :bigint           not null, primary key
#  average_rating      :decimal(3, 2)    default(0.0)
#  business_license    :string
#  business_name       :string           not null
#  cancellation_policy :text
#  completion_rate     :decimal(5, 4)
#  description         :text
#  facebook_url        :string
#  favorites_count     :integer          default(0), not null
#  instagram_handle    :string
#  latitude            :decimal(10, 6)
#  location            :string
#  longitude           :decimal(10, 6)
#  phone               :string
#  rejection_reason    :text
#  response_time_hours :decimal(5, 2)
#  total_reviews       :integer          default(0)
#  verification_status :integer          default("unverified")
#  verified_at         :datetime
#  website             :string
#  years_experience    :integer          default(0)
#  created_at          :datetime         not null
#  updated_at          :datetime         not null
#  user_id             :bigint           not null
#
# Indexes
#
#  index_vendor_profiles_on_business_name        (business_name)
#  index_vendor_profiles_on_coordinates          (latitude,longitude)
#  index_vendor_profiles_on_favorites_count      (favorites_count)
#  index_vendor_profiles_on_location             (location)
#  index_vendor_profiles_on_user_id              (user_id) UNIQUE
#  index_vendor_profiles_on_verification_status  (verification_status)
#
# Foreign Keys
#
#  fk_rails_...  (user_id => users.id)
#
require 'rails_helper'

RSpec.describe VendorProfile do
  let(:vendor_user) { create(:user, :vendor) }
  let(:vendor_profile) { vendor_user.vendor_profile }

  describe 'associations' do
    it { is_expected.to belong_to(:user) }
    it { is_expected.to have_many(:vendor_services).dependent(:destroy) }
    it { is_expected.to have_many(:services).dependent(:destroy) }
    it { is_expected.to have_many(:categories).through(:services) }
    it { is_expected.to have_many(:bookings).dependent(:destroy) }
  end

  describe 'validations' do
    subject(:vendor_profile) { vendor_user.vendor_profile }

    it { is_expected.to validate_uniqueness_of(:user_id) }
    it { is_expected.to validate_presence_of(:business_name) }
    it { is_expected.to validate_length_of(:business_name).is_at_least(2).is_at_most(100) }
    it { is_expected.to validate_length_of(:description).is_at_least(50).is_at_most(2000) }
    it { is_expected.to validate_presence_of(:location) }
    it { is_expected.to validate_length_of(:location).is_at_most(255) }
    it { is_expected.to validate_numericality_of(:years_experience).is_greater_than_or_equal_to(0).is_less_than(100) }

    it {
      expect(vendor_profile).to validate_numericality_of(:average_rating)
        .is_greater_than_or_equal_to(0.0).is_less_than_or_equal_to(5.0)
    }

    it { is_expected.to validate_numericality_of(:total_reviews).is_greater_than_or_equal_to(0) }

    describe 'phone validation' do
      it 'accepts valid phone numbers' do
        valid_phones = ['+1-555-123-4567', '555-123-4567', '(555) 123-4567', '+44 20 7946 0958']
        valid_phones.each do |phone|
          vendor_profile.phone = phone
          expect(vendor_profile).to be_valid, "#{phone} should be valid"
        end
      end

      it 'rejects invalid phone numbers' do
        invalid_phones = %w[123 abc-def-ghij 555-12-34567890123456]
        invalid_phones.each do |phone|
          vendor_profile.phone = phone
          expect(vendor_profile).not_to be_valid, "#{phone} should be invalid"
        end
      end

      it 'allows blank phone numbers' do
        vendor_profile.phone = ''
        expect(vendor_profile).to be_valid
      end
    end

    describe 'website validation' do
      it 'accepts valid URLs' do
        valid_urls = ['https://example.com', 'http://test.org', 'https://www.business.co.uk']
        valid_urls.each do |url|
          vendor_profile.website = url
          expect(vendor_profile).to be_valid, "#{url} should be valid"
        end
      end

      it 'rejects invalid URLs' do
        invalid_urls = ['not-a-url', 'ftp://example.com']
        invalid_urls.each do |url|
          vendor_profile.website = url
          expect(vendor_profile).not_to be_valid, "#{url} should be invalid"
        end
      end

      it 'allows blank websites' do
        vendor_profile.website = ''
        expect(vendor_profile).to be_valid
      end
    end
  end

  describe 'scopes' do
    describe '.verified' do
      let!(:verified_vendor) do
        create(:user, :vendor).vendor_profile.tap do |vp|
          vp.update!(verification_status: :verified)
        end
      end
      let!(:unverified_vendor) do
        create(:user, :vendor).vendor_profile.tap do |vp|
          vp.update!(verification_status: :unverified)
        end
      end

      it 'returns only verified vendors' do
        expect(described_class.verified).to include(verified_vendor)
        expect(described_class.verified).not_to include(unverified_vendor)
      end
    end

    describe '.unverified' do
      let!(:verified_vendor) do
        create(:user, :vendor).vendor_profile.tap do |vp|
          vp.update!(verification_status: :verified)
        end
      end
      let!(:unverified_vendor) do
        create(:user, :vendor).vendor_profile.tap do |vp|
          vp.update!(verification_status: :unverified)
        end
      end

      it 'returns only unverified vendors' do
        expect(described_class.unverified).to include(unverified_vendor)
        expect(described_class.unverified).not_to include(verified_vendor)
      end
    end

    describe '.by_location' do
      it 'finds vendors by location' do
        vendor = create(:user, :vendor).vendor_profile.tap { |vp| vp.update!(location: 'New York, NY') }
        expect(described_class.by_location('New York')).to include(vendor)
        expect(described_class.by_location('Los Angeles')).not_to include(vendor)
      end
    end

    describe '.with_rating_above' do
      let!(:high_rated_vendor) do
        create(:user, :vendor).vendor_profile.tap do |vp|
          vp.update!(average_rating: 4.5, total_reviews: 10)
        end
      end

      it 'returns vendors with rating above threshold' do
        expect(described_class.with_rating_above(4.0)).to include(high_rated_vendor)
      end
    end

    describe '.by_experience' do
      let!(:experienced_vendor) { create(:user, :vendor).vendor_profile.tap { |vp| vp.update!(years_experience: 15) } }

      it 'returns vendors with minimum years of experience' do
        expect(described_class.by_experience(10)).to include(experienced_vendor)
        expect(described_class.by_experience(20)).not_to include(experienced_vendor)
      end
    end
  end

  describe 'instance methods' do
    let(:complete_vendor_profile) do
      create(:user, :vendor).vendor_profile.tap do |vp|
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
        complete_vendor_profile.update(verification_status: :verified)
        expect(complete_vendor_profile.verified?).to be true
      end

      it 'returns false for unverified vendors' do
        complete_vendor_profile.update(verification_status: :unverified)
        expect(complete_vendor_profile.verified?).to be false
      end
    end

    describe '#has_description?' do
      it 'returns true when description is present and long enough' do
        complete_vendor_profile.update(description: 'A' * 60)
        expect(complete_vendor_profile.has_description?).to be true
      end

      it 'returns false when description is too short' do
        complete_vendor_profile.update(description: 'Short')
        expect(complete_vendor_profile.has_description?).to be false
      end

      it 'returns false when description is blank' do
        complete_vendor_profile.update(description: '')
        expect(complete_vendor_profile.has_description?).to be false
      end
    end

    describe '#service_categories_list' do
      it 'returns array of categories' do
        complete_vendor_profile.update(service_categories: 'Photography, Videography, Event Planning')
        expect(complete_vendor_profile.service_categories_list).to eq(['Photography', 'Videography', 'Event Planning'])
      end

      it 'returns empty array when no categories' do
        complete_vendor_profile.update(service_categories: '')
        expect(complete_vendor_profile.service_categories_list).to eq([])
      end
    end

    describe '#service_categories_list=' do
      it 'sets categories from array' do
        complete_vendor_profile.service_categories_list = %w[Photography Videography]
        expect(complete_vendor_profile.service_categories).to eq('Photography, Videography')
      end

      it 'sets categories from string' do
        complete_vendor_profile.service_categories_list = 'Photography, Videography'
        expect(complete_vendor_profile.service_categories).to eq('Photography, Videography')
      end
    end

    describe '#profile_complete?' do
      it 'returns true when all required fields are present' do
        expect(complete_vendor_profile.profile_complete?).to be true
      end

      it 'returns false when business_name is missing' do
        complete_vendor_profile.update(business_name: '')
        expect(complete_vendor_profile.profile_complete?).to be false
      end

      it 'returns false when description is too short' do
        complete_vendor_profile.update(description: 'Short')
        expect(complete_vendor_profile.profile_complete?).to be false
      end
    end

    describe '#display_name' do
      it 'returns business_name when present' do
        expect(complete_vendor_profile.display_name).to eq(complete_vendor_profile.business_name)
      end

      it 'returns user full_name when business_name is blank' do
        complete_vendor_profile.update(business_name: '')
        expect(complete_vendor_profile.display_name).to eq(complete_vendor_profile.user.full_name)
      end
    end

    describe '#request_verification!' do
      before do
        allow(VendorProfiles::HandleVerification).to receive(:call)
      end

      it 'delegates to VendorProfiles::HandleVerification' do
        complete_vendor_profile.request_verification!
        expect(VendorProfiles::HandleVerification).to have_received(:call)
          .with(vendor_profile: complete_vendor_profile, action: :request)
      end
    end

    describe '#approve_verification!' do
      before do
        allow(VendorProfiles::HandleVerification).to receive(:call)
      end

      it 'delegates to VendorProfiles::HandleVerification' do
        complete_vendor_profile.approve_verification!
        expect(VendorProfiles::HandleVerification).to have_received(:call)
          .with(vendor_profile: complete_vendor_profile, action: :approve)
      end
    end

    describe '#reject_verification!' do
      let(:reason) { 'Invalid data' }

      before do
        allow(VendorProfiles::HandleVerification).to receive(:call)
      end

      it 'delegates to VendorProfiles::HandleVerification' do
        complete_vendor_profile.reject_verification!(reason)
        expect(VendorProfiles::HandleVerification).to have_received(:call)
          .with(vendor_profile: complete_vendor_profile, action: :reject, reason: reason)
      end
    end

    describe '#update_rating_stats!' do
      before do
        allow(VendorProfiles::UpdateRatingStats).to receive(:call)
      end

      it 'delegates to VendorProfiles::UpdateRatingStats' do
        complete_vendor_profile.update_rating_stats!
        expect(VendorProfiles::UpdateRatingStats).to have_received(:call)
          .with(vendor_profile: complete_vendor_profile)
      end
    end

    describe '#rating_display' do
      it 'returns formatted rating with reviews count' do
        complete_vendor_profile.update(average_rating: 4.3, total_reviews: 15)
        expect(complete_vendor_profile.rating_display).to eq('4.3 (15 reviews)')
      end

      it 'returns singular review for one review' do
        complete_vendor_profile.update(average_rating: 5.0, total_reviews: 1)
        expect(complete_vendor_profile.rating_display).to eq('5.0 (1 review)')
      end

      it 'returns no ratings message when no reviews' do
        complete_vendor_profile.update(total_reviews: 0)
        expect(complete_vendor_profile.rating_display).to eq('No ratings yet')
      end
    end
  end

  describe 'class methods' do
    describe '.search_by_name_or_location' do
      let!(:amazing_photography) do
        create(:user, :vendor).vendor_profile.tap do |vp|
          vp.update!(business_name: 'Amazing Photography', location: 'New York')
        end
      end
      let!(:best_events) do
        create(:user, :vendor).vendor_profile.tap do |vp|
          vp.update!(business_name: 'Best Events', location: 'Los Angeles')
        end
      end
      let!(:creative_studio) do
        create(:user, :vendor).vendor_profile.tap do |vp|
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
        expect(results.count).to eq(3)
      end
    end
  end

  describe 'callbacks' do
    describe 'normalize_website' do
      it 'adds https:// to website without protocol' do
        test_vendor_profile = create(:user, :vendor).vendor_profile
        test_vendor_profile.website = 'example.com'
        test_vendor_profile.save
        expect(test_vendor_profile.website).to eq('https://example.com')
      end

      it 'does not modify website with protocol' do
        test_vendor_profile = create(:user, :vendor).vendor_profile
        test_vendor_profile.website = 'https://example.com'
        test_vendor_profile.save
        expect(test_vendor_profile.website).to eq('https://example.com')
      end

      it 'does not modify blank website' do
        test_vendor_profile = create(:user, :vendor).vendor_profile
        test_vendor_profile.website = ''
        test_vendor_profile.save
        expect(test_vendor_profile.website).to eq('')
      end
    end
  end
end
