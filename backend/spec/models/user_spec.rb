# frozen_string_literal: true

# == Schema Information
#
# Table name: users
#
#  id                     :bigint           not null, primary key
#  confirmation_sent_at   :datetime
#  confirmation_token     :string
#  confirmed_at           :datetime
#  email                  :string           default(""), not null
#  encrypted_password     :string           default(""), not null
#  first_name             :string
#  last_name              :string
#  remember_created_at    :datetime
#  reset_password_sent_at :datetime
#  reset_password_token   :string
#  role                   :integer          default("customer"), not null
#  unconfirmed_email      :string
#  created_at             :datetime         not null
#  updated_at             :datetime         not null
#
# Indexes
#
#  index_users_on_confirmation_token    (confirmation_token) UNIQUE
#  index_users_on_email                 (email) UNIQUE
#  index_users_on_reset_password_token  (reset_password_token) UNIQUE
#
require 'rails_helper'

RSpec.describe User do
  let(:user) { create(:user) }

  describe 'validations' do
    it { is_expected.to validate_presence_of(:email) }
    it { is_expected.to validate_presence_of(:role) }
    it { is_expected.to validate_presence_of(:first_name) }
    it { is_expected.to validate_presence_of(:last_name) }

    describe 'email uniqueness' do
      subject { build(:user) }

      it { is_expected.to validate_uniqueness_of(:email).case_insensitive }
    end

    context 'when validating password' do
      it 'is invalid if shorter than 8 characters' do
        user.password = '1234567'
        expect(user).not_to be_valid
      end

      it 'is valid if 8 characters or more' do
        user.password = '12345678'
        user.password_confirmation = '12345678'
        expect(user).to be_valid
      end
    end
  end

  describe 'enums' do
    it { is_expected.to define_enum_for(:role).with_values(customer: 0, vendor: 1, admin: 2).with_suffix }
  end

  describe 'associations' do
    subject(:user_model) { create(:user) }

    it { is_expected.to have_one(:vendor_profile).dependent(:destroy) }
    it { is_expected.to have_one(:customer_profile).dependent(:destroy) }

    it 'has many customer bookings' do
      expect(user_model).to have_many(:customer_bookings)
        .class_name('Booking').with_foreign_key('customer_id').dependent(:destroy)
    end

    it { is_expected.to have_many(:vendor_bookings).through(:vendor_profile).source(:bookings) }
    it { is_expected.to have_many(:booking_messages).with_foreign_key('sender_id').dependent(:destroy) }
    it { is_expected.to have_many(:reviews).with_foreign_key('customer_id').dependent(:destroy) }
  end

  describe 'callbacks' do
    describe '#create_profile' do
      context 'when role is vendor' do
        let(:vendor_user) { build(:user, :vendor) }

        it 'creates a vendor profile' do
          expect { vendor_user.save }.to change(VendorProfile, :count).by(1)
        end

        it 'sets default business name' do
          vendor_user.save
          expect(vendor_user.vendor_profile.business_name).to eq("#{vendor_user.full_name}'s Business")
        end
      end

      context 'when role is customer' do
        let(:customer_user) { build(:user, :customer) }

        it 'creates a customer profile' do
          expect { customer_user.save }.to change(CustomerProfile, :count).by(1)
        end
      end

      context 'when role is admin' do
        let(:admin_user) { build(:user, :admin) }

        it 'does not create any profile' do
          expect { admin_user.save }.not_to(change { [VendorProfile.count, CustomerProfile.count] })
        end
      end
    end

    describe '#auto_confirm_user' do
      it 'does not auto-confirm user on creation to require proper confirmation flow' do
        new_user = build(:user, confirmed_at: nil)
        new_user.save
        expect(new_user.confirmed?).to be false
      end
    end

    describe '#downcase_email' do
      it 'downcases email before validation' do
        mixed_case_email = 'MixedCase@Example.Com'
        user = build(:user, email: mixed_case_email)
        user.validate
        expect(user.email).to eq(mixed_case_email.downcase)
      end
    end
  end

  describe 'instance methods' do
    describe '#full_name' do
      it 'returns first and last name combined' do
        user = build(:user, first_name: 'John', last_name: 'Doe')
        expect(user.full_name).to eq('John Doe')
      end
    end

    describe '#display_name' do
      it 'returns full name if present' do
        user = build(:user, first_name: 'John', last_name: 'Doe')
        expect(user.display_name).to eq('John Doe')
      end

      it 'returns email if full name is blank' do
        user = build(:user, first_name: '', last_name: '', email: 'test@example.com')
        expect(user.display_name).to eq('test@example.com')
      end
    end

    describe '#customer?' do
      it 'returns true if role is customer' do
        expect(build(:user, :customer).customer?).to be true
      end

      it 'returns false if role is vendor' do
        expect(build(:user, :vendor).customer?).to be false
      end
    end

    describe '#vendor?' do
      it 'returns true if role is vendor' do
        expect(build(:user, :vendor).vendor?).to be true
      end

      it 'returns false if role is customer' do
        expect(build(:user, :customer).vendor?).to be false
      end
    end

    describe '#admin?' do
      it 'returns true if role is admin' do
        expect(build(:user, :admin).admin?).to be true
      end

      it 'returns false if role is customer' do
        expect(build(:user, :customer).admin?).to be false
      end
    end

    describe '#confirmed?' do
      it 'returns true if confirmed_at is present' do
        expect(create(:user, confirmed_at: Time.current).confirmed?).to be true
      end

      it 'returns false if confirmed_at is nil' do
        user = build(:user, confirmed_at: nil)
        user.save(validate: false)
        expect(user.confirmed?).to be false
      end
    end
  end

  describe 'scopes' do
    let!(:customer) { create(:user, :customer) }
    let!(:vendor) { create(:user, :vendor) }
    let!(:admin) { create(:user, :admin) }

    describe '.customers' do
      it 'returns only customers' do
        expect(described_class.customers).to include(customer)
        expect(described_class.customers).not_to include(vendor, admin)
      end
    end

    describe '.vendors' do
      it 'returns only vendors' do
        expect(described_class.vendors).to include(vendor)
        expect(described_class.vendors).not_to include(customer, admin)
      end
    end

    describe '.admins' do
      it 'returns only admins' do
        expect(described_class.admins).to include(admin)
        expect(described_class.admins).not_to include(customer, vendor)
      end
    end

    describe '.confirmed' do
      it 'returns only confirmed users' do
        confirmed_user = create(:user, confirmed_at: Time.current)
        expect(described_class.confirmed).to include(confirmed_user)
      end
    end

    describe '.unconfirmed' do
      it 'returns only unconfirmed users' do
        unconfirmed_user = build(:user, confirmed_at: nil)
        unconfirmed_user.save(validate: false)
        expect(described_class.unconfirmed).to include(unconfirmed_user)
      end
    end
  end

  describe 'ransackable attributes' do
    it 'allows searching by specific attributes' do
      expect(described_class.ransackable_attributes).to contain_exactly(
        'id', 'email', 'first_name', 'last_name', 'role', 'confirmed_at', 'created_at', 'updated_at'
      )
    end
  end

  describe 'ransackable associations' do
    it 'allows searching by specific associations' do
      associations = %w[vendor_profile customer_profile customer_bookings vendor_bookings booking_messages]
      expect(described_class.ransackable_associations).to match_array(associations)
    end
  end

  describe 'error handling in profile creation' do
    before do
      allow(Rails.logger).to receive(:error)
    end

    it 'logs error when profile creation fails' do
      user = build(:user, :vendor)

      # Mock the vendor_profile creation to fail
      allow(user).to receive(:create_vendor_profile!).and_raise(ActiveRecord::RecordInvalid.new(user))

      user.save!
      expect(Rails.logger).to have_received(:error).with(/Failed to create profile/)
    end
  end
end
