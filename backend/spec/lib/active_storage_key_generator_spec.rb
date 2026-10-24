# frozen_string_literal: true

require 'spec_helper'
require 'active_support/all'
require 'active_storage'
require_relative '../../app/lib/active_storage_key_generator'

RSpec.describe ActiveStorageKeyGenerator do
  describe '.call' do
    it 'generates a structured key with environment, domain, date, and extension for service images' do
      key = described_class.call(
        record: 'ServiceImage',
        filename: 'decor_photo.jpg',
        environment: 'production'
      )

      current_date = Time.current.strftime('%Y/%m')
      expect(key).to match(%r{\Aproduction/services/#{current_date}/[a-z0-9]{28}\.jpg\z})
    end

    it 'generates a portfolios domain key for portfolio items' do
      key = described_class.call(
        record: 'PortfolioItem',
        filename: 'wedding_showcase.PNG',
        environment: 'production'
      )

      current_date = Time.current.strftime('%Y/%m')
      expect(key).to match(%r{\Aproduction/portfolios/#{current_date}/[a-z0-9]{28}\.png\z})
    end

    it 'generates a reviews domain key for reviews' do
      key = described_class.call(
        record: 'Review',
        filename: 'candid_review.webp',
        environment: 'staging'
      )

      current_date = Time.current.strftime('%Y/%m')
      expect(key).to match(%r{\Astaging/reviews/#{current_date}/[a-z0-9]{28}\.webp\z})
    end

    it 'generates an avatars domain key for users' do
      key = described_class.call(
        record: 'User',
        filename: 'avatar.jpeg',
        environment: 'production'
      )

      current_date = Time.current.strftime('%Y/%m')
      expect(key).to match(%r{\Aproduction/avatars/#{current_date}/[a-z0-9]{28}\.jpeg\z})
    end

    it 'generates a variants domain key for variant records' do
      key = described_class.call(
        record: 'ActiveStorage::VariantRecord',
        filename: 'thumb.webp',
        environment: 'production'
      )

      current_date = Time.current.strftime('%Y/%m')
      expect(key).to match(%r{\Aproduction/variants/#{current_date}/[a-z0-9]{28}\.webp\z})
    end

    it 'respects explicit domain passed in metadata' do
      key = described_class.call(
        record: nil,
        filename: 'document.pdf',
        metadata: { 'domain' => 'contracts' },
        environment: 'production'
      )

      current_date = Time.current.strftime('%Y/%m')
      expect(key).to match(%r{\Aproduction/contracts/#{current_date}/[a-z0-9]{28}\.pdf\z})
    end

    it 'falls back to general domain when record is nil and no metadata domain is given' do
      key = described_class.call(
        record: nil,
        filename: 'temp_file.png',
        environment: 'development'
      )

      current_date = Time.current.strftime('%Y/%m')
      expect(key).to match(%r{\Adevelopment/general/#{current_date}/[a-z0-9]{28}\.png\z})
    end

    it 'handles filenames without extensions cleanly' do
      key = described_class.call(
        record: 'ServiceImage',
        filename: 'raw_binary_blob',
        environment: 'production'
      )

      current_date = Time.current.strftime('%Y/%m')
      expect(key).to match(%r{\Aproduction/services/#{current_date}/[a-z0-9]{28}\z})
    end
  end
end
