# frozen_string_literal: true

require 'rails_helper'

# == Schema Information
#
# Table name: vendors
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
#  metadata            :jsonb
#  phone               :string
#  rejection_reason    :text
#  response_time_hours :decimal(5, 2)
#  slug                :string           not null
#  total_reviews       :integer          default(0)
#  verification_status :string           default("unverified")
#  verified_at         :datetime
#  website             :string
#  years_experience    :integer          default(0)
#  created_at          :datetime         not null
#  updated_at          :datetime         not null
#  user_id             :bigint           not null
#
# Indexes
#
#  index_vendors_on_business_name           (business_name)
#  index_vendors_on_business_name_tsvector  (to_tsvector('english'::regconfig, (COALESCE(business_name, ''::character varying))::text)) USING gin
#  index_vendors_on_coordinates             (latitude,longitude)
#  index_vendors_on_favorites_count         (favorites_count)
#  index_vendors_on_location                (location)
#  index_vendors_on_slug                    (slug) UNIQUE
#  index_vendors_on_user_id                 (user_id) UNIQUE
#  index_vendors_on_verification_status     (verification_status)
#
# Foreign Keys
#
#  fk_rails_...  (user_id => users.id)
#
RSpec.describe VendorSerializer do
  let(:user) { create(:user, :with_vendor, first_name: 'Pooja', last_name: 'Singh', email: 'pooja@example.com') }
  let(:vendor) { user.vendor }
  let!(:category) { create(:category, name: 'Photography', slug: 'photography') }

  before do
    vendor.categories << category
  end

  describe 'summary view' do
    it 'renders summary fields' do
      result = described_class.render_as_hash(vendor, view: :summary)

      expect(result[:id]).to eq(vendor.id)
      expect(result[:slug]).to eq(vendor.slug)
      expect(result[:business_name]).to eq(vendor.business_name)
      expect(result[:location]).to eq(vendor.location)
      expect(result[:categories]).to be_an(Array)
      expect(result[:categories].first[:name]).to eq('Photography')
      expect(result[:base_price]).to be_a(Numeric)
    end
  end

  describe 'detail view' do
    it 'renders detail fields including description, contact info and user' do
      result = described_class.render_as_hash(vendor, view: :detail)

      expect(result[:id]).to eq(vendor.id)
      expect(result[:description]).to eq(vendor.description)
      expect(result[:phone]).to eq(vendor.phone)
      expect(result[:website]).to eq(vendor.website)
      expect(result[:user][:email]).to eq('pooja@example.com')
    end
  end

  describe 'profile view' do
    it 'renders vendor profile fields for dashboard' do
      result = described_class.render_as_hash(vendor, view: :profile)

      expect(result[:id]).to eq(vendor.id)
      expect(result[:business_name]).to eq(vendor.business_name)
      expect(result[:categories]).to be_an(Array)
      expect(result[:metadata]).to be_a(Hash)
    end
  end
end
