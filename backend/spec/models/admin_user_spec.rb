# frozen_string_literal: true

# == Schema Information
#
# Table name: admin_users
#
#  id                     :bigint           not null, primary key
#  email                  :string           default(""), not null
#  encrypted_password     :string           default(""), not null
#  remember_created_at    :datetime
#  reset_password_sent_at :datetime
#  reset_password_token   :string
#  created_at             :datetime         not null
#  updated_at             :datetime         not null
#
# Indexes
#
#  index_admin_users_on_email                 (email) UNIQUE
#  index_admin_users_on_reset_password_token  (reset_password_token) UNIQUE
#
require 'rails_helper'

RSpec.describe AdminUser do
  describe 'validations' do
    subject(:admin_user) { build(:admin_user) }

    it { is_expected.to validate_presence_of(:email) }
    it { is_expected.to validate_uniqueness_of(:email).case_insensitive }

    it 'requires passwords to be at least six characters long' do
      admin_user.password = 'short'
      admin_user.password_confirmation = 'short'

      expect(admin_user).not_to be_valid
      expect(admin_user.errors[:password]).to be_present
    end
  end

  describe '.ransackable_attributes' do
    it 'allows searching only the intended admin user attributes' do
      expect(described_class.ransackable_attributes).to contain_exactly(
        'id', 'email', 'created_at', 'updated_at'
      )
    end
  end
end
