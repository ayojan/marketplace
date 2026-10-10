# frozen_string_literal: true

# == Schema Information
#
# Table name: in_app_notifications
#
#  id                :bigint           not null, primary key
#  is_read           :boolean          default(FALSE), not null
#  message           :text             not null
#  notification_type :string(50)       not null
#  related_type      :string(50)
#  title             :string(255)      not null
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#  related_id        :bigint
#  user_id           :bigint           not null
#
# Indexes
#
#  idx_notifications_user_read_date                 (user_id,is_read,created_at)
#  index_in_app_notifications_on_is_read            (is_read)
#  index_in_app_notifications_on_notification_type  (notification_type)
#  index_in_app_notifications_on_user_id            (user_id)
#  index_notifications_on_polymorphic               (related_type,related_id)
#
# Foreign Keys
#
#  fk_rails_...  (user_id => users.id)
#
require 'rails_helper'

RSpec.describe InAppNotification do
  describe 'associations' do
    it { is_expected.to belong_to(:user) }
  end

  describe 'validations' do
    let(:user) { create(:user) }

    it 'validates required fields' do
      notification = described_class.new
      expect(notification).not_to be_valid
      expect(notification.errors[:user_id]).to be_present
      expect(notification.errors[:title]).to be_present
      expect(notification.errors[:message]).to be_present
      expect(notification.errors[:notification_type]).to be_present
    end

    describe 'notification_type inclusion' do
      it 'accepts valid notification types' do
        %w[booking_created booking_accepted booking_rejected booking_cancelled booking_reminder new_message
           review_received].each do |type|
          notification = build(:in_app_notification, user: user, notification_type: type)
          expect(notification).to be_valid
        end
      end

      it 'rejects invalid notification types' do
        notification = build(:in_app_notification, user: user, notification_type: 'invalid_type')
        expect(notification).not_to be_valid
        expect(notification.errors[:notification_type]).to be_present
      end
    end
  end

  describe 'scopes' do
    let(:user) { create(:user) }

    before do
      create(:in_app_notification, user: user, is_read: false)
      create(:in_app_notification, user: user, is_read: false)
      create(:in_app_notification, user: user, is_read: true)
    end

    describe '.unread' do
      it 'returns only unread notifications' do
        expect(described_class.unread.count).to eq(2)
      end
    end

    describe '.read' do
      it 'returns only read notifications' do
        expect(described_class.read.count).to eq(1)
      end
    end

    describe '.for_user' do
      let(:other_user) { create(:user) }

      before { create(:in_app_notification, user: other_user) }

      it 'returns notifications for the specified user' do
        expect(described_class.for_user(user.id).count).to eq(3)
        expect(described_class.for_user(other_user.id).count).to eq(1)
      end
    end

    describe '.recent_first' do
      it 'returns notifications ordered by created_at descending' do
        notifications = described_class.recent_first
        expect(notifications.first.created_at).to be >= notifications.last.created_at
      end
    end

    describe '.by_type' do
      let(:booking_notification) { create(:in_app_notification, user: user, notification_type: 'booking_created') }
      let(:review_notification) { create(:in_app_notification, user: user, notification_type: 'review_received') }

      it 'returns notifications of the specified type' do
        booking_notifications = described_class.by_type('booking_created')
        expect(booking_notifications).to include(booking_notification)
        expect(booking_notifications).not_to include(review_notification)
      end
    end
  end

  describe '#mark_as_read!' do
    let(:notification) { create(:in_app_notification, is_read: false) }

    it 'marks the notification as read' do
      expect(notification.is_read).to be(false)
      notification.mark_as_read!
      expect(notification.is_read).to be(true)
    end
  end

  describe '#mark_as_unread!' do
    let(:notification) { create(:in_app_notification, is_read: true) }

    it 'marks the notification as unread' do
      expect(notification.is_read).to be(true)
      notification.mark_as_unread!
      expect(notification.is_read).to be(false)
    end
  end

  describe '.create_notification' do
    let(:user) { create(:user) }

    it 'creates a notification with the specified attributes' do
      notification = described_class.create_notification(
        user_id: user.id,
        title: 'Test Title',
        message: 'Test Message',
        notification_type: 'booking_created',
        related_type: 'Booking',
        related_id: 123
      )

      expect(notification).to be_persisted
      expect(notification.title).to eq('Test Title')
      expect(notification.message).to eq('Test Message')
      expect(notification.notification_type).to eq('booking_created')
      expect(notification.related_type).to eq('Booking')
      expect(notification.related_id).to eq(123)
    end
  end
end
