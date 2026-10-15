# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AuthIdentity do
  let(:user) { create(:user) }
  let(:auth_identity) { build(:auth_identity, user: user) }

  describe 'associations' do
    it { is_expected.to belong_to(:user) }
  end

  describe 'validations' do
    subject { build(:auth_identity, user: user) }

    it { is_expected.to validate_presence_of(:provider) }
    it { is_expected.to validate_presence_of(:uid) }

    it 'enforces uniqueness of uid scoped to provider' do
      described_class.create!(user: user, provider: 'google', uid: 'google-sub-123')
      other_user = create(:user, email: 'other@example.com')
      duplicate = described_class.new(user: other_user, provider: 'google', uid: 'google-sub-123')

      expect(duplicate).not_to be_valid
      expect(duplicate.errors[:uid]).to include('has already been linked to an account')
    end

    it 'allows same uid for different providers' do
      described_class.create!(user: user, provider: 'google', uid: 'same-uid-123')
      other_provider = described_class.new(user: user, provider: 'github', uid: 'same-uid-123')

      expect(other_provider).to be_valid
    end
  end

  describe '.find_google_identity' do
    it 'finds an identity by google provider and uid' do
      identity = described_class.create!(user: user, provider: 'google', uid: 'google-sub-456')
      expect(described_class.find_google_identity('google-sub-456')).to eq(identity)
      expect(described_class.find_google_identity('non-existent')).to be_nil
    end
  end
end
