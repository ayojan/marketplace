# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ImageProcessingJob do
  let(:service) { create(:service) }
  let(:service_image) { create(:service_image, service: service) }

  describe '#perform' do
    context 'with non-existent service image' do
      it 'logs warning and does not raise error' do
        allow(Rails.logger).to receive(:warn)

        described_class.new.perform(999)

        expect(Rails.logger).to have_received(:warn).with('ServiceImage 999 not found, skipping processing')
      end
    end

    context 'with service image without attached image' do
      let(:service_image_without_image) do
        # Create a service image and then detach the image
        img = create(:service_image, service: service)
        img.image.purge
        img
      end

      it 'returns early without processing' do
        expect do
          described_class.new.perform(service_image_without_image.id)
        end.not_to raise_error
      end
    end
  end

  describe 'job configuration' do
    it 'is configured to use low queue' do
      expect(described_class.queue_name).to eq('low')
    end
  end
end
