# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Vendors::UpdateProfile do
  let(:vendor_user) { create(:user, :vendor) }
  let(:vendor) { vendor_user.vendor }

  describe '#call' do
    context 'with valid vendor attributes' do
      let(:params) do
        {
          vendor: {
            business_name: 'Starlight Photography Studio',
            description: 'Premier wedding photography studio specializing in candid moments and traditional rituals.',
            location: 'Mumbai, India',
            phone: '+91 98765 43210',
            website: 'https://starlight.example.com',
            years_experience: 7
          }
        }
      end

      it 'updates vendor profile successfully' do
        result = described_class.call(vendor: vendor, params: params)

        expect(result[:success]).to be true
        expect(vendor.reload.business_name).to eq('Starlight Photography Studio')
        expect(vendor.location).to eq('Mumbai, India')
        expect(vendor.phone).to eq('+91 98765 43210')
        expect(vendor.website).to eq('https://starlight.example.com')
        expect(vendor.years_experience).to eq(7)
      end
    end

    context 'with metadata' do
      it 'merges metadata when provided as a hash' do
        vendor.update!(metadata: { existing_key: 'preserved' })
        params = {
          vendor: {
            metadata: {
              onboarding_completed: true,
              packages: [{ title: 'Gold Package', price: 75_000 }]
            }
          }
        }

        result = described_class.call(vendor: vendor, params: params)

        expect(result[:success]).to be true
        meta = vendor.reload.metadata
        expect(meta['existing_key']).to eq('preserved')
        expect(meta['onboarding_completed']).to be true
        expect(meta['packages'].first['title']).to eq('Gold Package')
      end

      it 'merges metadata when provided as a JSON string' do
        vendor.update!(metadata: { existing_key: 'preserved' })
        params = {
          vendor: {
            metadata: '{"onboarding_step": 3}'
          }
        }

        result = described_class.call(vendor: vendor, params: params)

        expect(result[:success]).to be true
        meta = vendor.reload.metadata
        expect(meta['existing_key']).to eq('preserved')
        expect(meta['onboarding_step']).to eq(3)
      end
    end

    context 'with service categories' do
      it 'updates service categories list' do
        params = {
          vendor: {
            service_categories_list: %w[Photography Cinematography]
          }
        }

        result = described_class.call(vendor: vendor, params: params)

        expect(result[:success]).to be true
      end
    end

    context 'with invalid attributes' do
      it 'fails validation and returns errors when business name is blank' do
        params = {
          vendor: {
            business_name: ''
          }
        }

        result = described_class.call(vendor: vendor, params: params)

        expect(result[:success]).to be false
        expect(result[:errors]).to be_present
      end

      it 'fails validation when phone format is invalid' do
        params = {
          vendor: {
            phone: 'INVALID_PHONE_!@#'
          }
        }

        result = described_class.call(vendor: vendor, params: params)

        expect(result[:success]).to be false
        expect(result[:errors]).to be_present
      end
    end

    context 'when params are passed at root level' do
      it 'permits and updates attributes passed without nesting' do
        params = {
          location: 'Bangalore, India',
          years_experience: 10
        }

        result = described_class.call(vendor: vendor, params: params)

        expect(result[:success]).to be true
        expect(vendor.reload.location).to eq('Bangalore, India')
        expect(vendor.years_experience).to eq(10)
      end
    end

    context 'with category updates' do
      let(:cat_photo) { create(:category, name: 'Photo') }
      let(:cat_video) { create(:category, name: 'Video') }

      it 'syncs categories and sets primary category' do
        params = {
          vendor: {
            category_ids: [cat_photo.id, cat_video.id],
            primary_category_id: cat_video.id
          }
        }

        result = described_class.call(vendor: vendor, params: params)

        expect(result[:success]).to be true
        expect(vendor.reload.categories).to contain_exactly(cat_photo, cat_video)
        expect(vendor.primary_category).to eq(cat_video)
      end
    end
  end
end
