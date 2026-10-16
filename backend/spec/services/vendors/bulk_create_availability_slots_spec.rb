# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Vendors::BulkCreateAvailabilitySlots do
  describe '.call' do
    let(:vendor) { create(:vendor) }
    let(:future_date) { 2.weeks.from_now.to_date }

    context 'with valid parameters' do
      let(:slots_params) do
        [
          ActionController::Parameters.new(
            date: future_date,
            start_time: '09:00',
            end_time: '12:00',
            is_available: true
          ),
          ActionController::Parameters.new(
            date: future_date + 1.day,
            start_time: '13:00',
            end_time: '17:00',
            is_available: true
          )
        ]
      end

      it 'creates all availability slots successfully' do
        expect do
          result = described_class.call(vendor: vendor, slots_params: slots_params)
          expect(result[:created].size).to eq(2)
          expect(result[:errors]).to be_empty
        end.to change(AvailabilitySlot, :count).by(2)
      end

      it 'accepts plain hash parameters' do
        plain_params = [
          {
            date: future_date + 2.days,
            start_time: '10:00',
            end_time: '14:00',
            is_available: true
          }
        ]

        expect do
          result = described_class.call(vendor: vendor, slots_params: plain_params)
          expect(result[:created].size).to eq(1)
          expect(result[:errors]).to be_empty
        end.to change(AvailabilitySlot, :count).by(1)
      end
    end

    context 'with invalid parameters' do
      let(:slots_params) do
        [
          ActionController::Parameters.new(
            date: future_date,
            start_time: '09:00',
            end_time: '12:00',
            is_available: true
          ),
          ActionController::Parameters.new(
            date: nil,
            start_time: '13:00',
            end_time: '11:00',
            is_available: true
          )
        ]
      end

      it 'creates valid slots and reports errors for invalid ones' do
        expect do
          result = described_class.call(vendor: vendor, slots_params: slots_params)
          expect(result[:created].size).to eq(1)
          expect(result[:errors].size).to eq(1)
          expect(result[:errors].first[:index]).to eq(1)
          expect(result[:errors].first[:errors]).to be_an(Array)
        end.to change(AvailabilitySlot, :count).by(1)
      end
    end

    context 'with empty slots_params' do
      it 'returns empty created and errors arrays' do
        result = described_class.call(vendor: vendor, slots_params: [])
        expect(result[:created]).to eq([])
        expect(result[:errors]).to eq([])
      end
    end
  end
end
