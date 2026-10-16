# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Service::Media do
  subject(:service) { create(:service) }

  describe 'associations' do
    it { is_expected.to have_many(:service_images).dependent(:destroy) }
  end

  describe '#images?' do
    it 'returns false when no images are attached' do
      expect(service.images?).to be false
    end

    it 'returns true when service_images exist' do
      create(:service_image, service: service)
      expect(service.images?).to be true
    end
  end

  describe '#primary_image and #primary_service_image' do
    it 'returns the primary service image if present' do
      primary = create(:service_image, :primary, service: service)
      expect(service.primary_service_image.id).to eq(primary.id)
      expect(service.primary_image.blob_id).to eq(primary.image.blob_id)
    end
  end

  describe '#ordered_service_images' do
    it 'returns service images in order' do
      img2 = create(:service_image, service: service, display_order: 2)
      img1 = create(:service_image, service: service, display_order: 1)
      expect(service.ordered_service_images).to eq([img1, img2])
    end
  end
end
