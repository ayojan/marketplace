# frozen_string_literal: true

require 'rails_helper'

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
