# frozen_string_literal: true

# == Schema Information
#
# Table name: email_notification_preferences
#
#  id                :bigint           not null, primary key
#  booking_accepted  :boolean          default(TRUE), not null
#  booking_cancelled :boolean          default(TRUE), not null
#  booking_created   :boolean          default(TRUE), not null
#  booking_rejected  :boolean          default(TRUE), not null
#  booking_reminder  :boolean          default(TRUE), not null
#  new_message       :boolean          default(TRUE), not null
#  review_received   :boolean          default(TRUE), not null
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#  user_id           :bigint           not null
#
# Indexes
#
#  index_email_notification_preferences_on_user_id  (user_id) UNIQUE
#
# Foreign Keys
#
#  fk_rails_...  (user_id => users.id)
#
require 'rails_helper'

RSpec.describe EmailNotificationPreference do
  describe 'associations' do
    it { is_expected.to belong_to(:user) }
  end

  describe 'validations' do
    it 'validates user presence' do
      preference = described_class.new(user_id: nil)
      expect(preference).not_to be_valid
      expect(preference.errors[:user]).to be_present
    end

    it 'validates user_id uniqueness' do
      user = create(:user)
      # User already has a preference created by after_create callback
      existing = user.email_notification_preference
      expect(existing).to be_persisted

      duplicate = described_class.new(user_id: user.id)
      expect(duplicate).not_to be_valid
      expect(duplicate.errors[:user_id]).to be_present
    end
  end

  describe '.create_for_user' do
    let(:user) { create(:user) }

    it 'creates preferences with all notifications enabled by default' do
      preference = described_class.create_for_user(user)

      expect(preference).to be_persisted
      expect(preference.booking_created).to be(true)
      expect(preference.booking_accepted).to be(true)
      expect(preference.booking_rejected).to be(true)
      expect(preference.booking_cancelled).to be(true)
      expect(preference.booking_reminder).to be(true)
      expect(preference.new_message).to be(true)
      expect(preference.review_received).to be(true)
    end
  end

  describe '.for_user' do
    let(:user) { create(:user) }

    it 'returns preferences for the specified user' do
      preference = user.email_notification_preference
      expect(described_class.for_user(user.id)).to include(preference)
    end
  end

  describe 'default values' do
    it 'has all notification types enabled by default' do
      user = create(:user)
      preference = user.email_notification_preference

      expect(preference.booking_created).to be(true)
      expect(preference.booking_accepted).to be(true)
      expect(preference.booking_rejected).to be(true)
      expect(preference.booking_cancelled).to be(true)
      expect(preference.booking_reminder).to be(true)
      expect(preference.new_message).to be(true)
      expect(preference.review_received).to be(true)
    end
  end
end
