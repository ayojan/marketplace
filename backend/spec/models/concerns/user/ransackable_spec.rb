# frozen_string_literal: true

require 'rails_helper'

RSpec.describe User::Ransackable do
  describe '.ransackable_attributes' do
    it 'returns the allowlist of searchable attributes' do
      expect(User.ransackable_attributes).to contain_exactly(
        'id', 'email', 'first_name', 'last_name', 'role', 'confirmed_at', 'created_at', 'updated_at'
      )
    end
  end

  describe '.ransackable_associations' do
    it 'returns the allowlist of searchable associations' do
      expect(User.ransackable_associations).to contain_exactly(
        'vendor', 'customer', 'customer_bookings', 'vendor_bookings', 'booking_messages'
      )
    end
  end
end
