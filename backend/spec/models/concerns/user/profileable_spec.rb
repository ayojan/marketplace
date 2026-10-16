# frozen_string_literal: true

require 'rails_helper'

RSpec.describe User::Profileable do
  describe 'associations' do
    subject(:user) { build(:user) }

    it { is_expected.to have_one(:vendor).dependent(:destroy) }
    it { is_expected.to have_one(:customer).dependent(:destroy) }
    it { is_expected.to accept_nested_attributes_for(:vendor) }
    it { is_expected.to accept_nested_attributes_for(:customer) }
  end

  describe '#phone and #mobile_number' do
    context 'when user is a vendor' do
      let(:user) { create(:user, :vendor) }

      it 'returns the vendor phone number' do
        user.vendor.update!(phone: '+1-555-123-4567')
        expect(user.phone).to eq('+1-555-123-4567')
        expect(user.mobile_number).to eq('+1-555-123-4567')
      end

      it 'returns nil when vendor has no phone' do
        expect(user.phone).to be_nil
      end
    end

    context 'when user is a customer' do
      let(:user) { create(:user, :customer) }

      it 'returns the customer phone number' do
        user.customer.update!(phone: '+1-555-987-6543')
        expect(user.phone).to eq('+1-555-987-6543')
        expect(user.mobile_number).to eq('+1-555-987-6543')
      end

      it 'returns nil when customer has no phone' do
        expect(user.phone).to be_nil
      end
    end

    context 'when user is an admin' do
      let(:user) { create(:user, :admin) }

      it 'returns nil' do
        expect(user.phone).to be_nil
      end
    end
  end

  describe '#needs_mobile_onboarding?' do
    let(:user) { create(:user, :customer) }

    it 'returns true when phone is blank' do
      expect(user.needs_mobile_onboarding?).to be true
    end

    it 'returns false when phone is present' do
      user.customer.update!(phone: '+1-555-987-6543')
      expect(user.needs_mobile_onboarding?).to be false
    end
  end

  describe 'profile lifecycle callbacks' do
    context 'when creating a vendor user' do
      let(:user) { build(:user, :vendor) }

      it 'creates an associated vendor profile' do
        expect { user.save! }.to change(Vendor, :count).by(1)
      end

      it 'sets default business name and location' do
        user.save!
        expect(user.vendor.business_name).to eq("#{user.full_name}'s Business")
        expect(user.vendor.location).to eq('Not specified')
      end

      it 'does not duplicate profile if vendor is already built' do
        user.build_vendor(business_name: 'Custom Studio', location: 'Delhi')
        expect { user.save! }.to change(Vendor, :count).by(1)
        expect(user.vendor.business_name).to eq('Custom Studio')
      end
    end

    context 'when creating a customer user' do
      let(:user) { build(:user, :customer) }

      it 'creates an associated customer profile' do
        expect { user.save! }.to change(Customer, :count).by(1)
      end

      it 'does not duplicate profile if customer is already built' do
        user.build_customer
        expect { user.save! }.to change(Customer, :count).by(1)
      end
    end

    context 'when creating an admin user' do
      let(:user) { build(:user, :admin) }

      it 'does not create any vendor or customer profile' do
        expect { user.save! }.not_to(change { [Vendor.count, Customer.count] })
      end
    end

    context 'when profile creation fails with RecordInvalid' do
      let(:user) { build(:user, :vendor) }

      before do
        allow(Rails.logger).to receive(:error)
        allow(user).to receive(:create_vendor!).and_raise(ActiveRecord::RecordInvalid.new(user))
      end

      it 'logs the error without raising an exception' do
        user.save!
        expect(Rails.logger).to have_received(:error).with(/Failed to create profile for user/)
      end
    end
  end
end
