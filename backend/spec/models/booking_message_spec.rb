# frozen_string_literal: true

# == Schema Information
#
# Table name: booking_messages
#
#  id         :bigint           not null, primary key
#  message    :text             not null
#  sent_at    :datetime         not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  booking_id :bigint           not null
#  sender_id  :bigint           not null
#
# Indexes
#
#  index_booking_messages_on_booking_id              (booking_id)
#  index_booking_messages_on_booking_id_and_sent_at  (booking_id,sent_at)
#  index_booking_messages_on_sender_id               (sender_id)
#
# Foreign Keys
#
#  fk_rails_...  (booking_id => bookings.id)
#  fk_rails_...  (sender_id => users.id)
#
require 'rails_helper'

RSpec.describe BookingMessage do
  let(:customer) { create(:user, :customer) }
  let(:vendor_user) { create(:user, :vendor) }
  let(:vendor) { vendor_user.vendor }
  let(:service) { create(:service, vendor: vendor) }
  let(:booking) do
    create(:booking, customer: customer, vendor: vendor, service: service, event_date: 1.week.from_now.change(hour: 10))
  end

  before do
    create(:availability_slot,
           vendor: vendor,
           date: 1.week.from_now.to_date,
           start_time: '09:00',
           end_time: '17:00',
           is_available: true)
  end

  describe 'associations' do
    it { is_expected.to belong_to(:booking) }
    it { is_expected.to belong_to(:sender).class_name('User') }
  end

  describe 'validations' do
    subject { build(:booking_message, booking: booking, sender: customer) }

    it { is_expected.to validate_presence_of(:message) }
    it { is_expected.to validate_length_of(:message).is_at_least(1).is_at_most(1000) }
  end

  describe 'callbacks' do
    it 'sets sent_at before validation on create' do
      message = build(:booking_message, booking: booking, sender: customer, sent_at: nil)
      expect { message.valid? }.to change { message.sent_at }.from(nil)
    end

    it 'does not override existing sent_at' do
      specific_time = 1.hour.ago
      message = build(:booking_message, booking: booking, sender: customer, sent_at: specific_time)
      message.valid?
      expect(message.sent_at).to eq(specific_time)
    end
  end

  describe 'scopes' do
    let!(:first_message) { create(:booking_message, booking: booking, sender: customer, sent_at: 2.hours.ago) }
    let!(:second_message) { create(:booking_message, booking: booking, sender: vendor_user, sent_at: 1.hour.ago) }
    let!(:third_message) { create(:booking_message, booking: booking, sender: customer, sent_at: 30.minutes.ago) }

    describe '.ordered' do
      it 'returns messages in chronological order' do
        expect(described_class.ordered).to eq([first_message, second_message, third_message])
      end
    end

    describe '.recent' do
      it 'returns messages in reverse chronological order' do
        expect(described_class.recent).to eq([third_message, second_message, first_message])
      end
    end
  end

  describe 'instance methods' do
    let(:message) { create(:booking_message, booking: booking, sender: customer) }

    describe '#sender_name' do
      context 'when sender is a vendor' do
        let(:vendor_message) { create(:booking_message, booking: booking, sender: vendor_user) }

        it 'returns business name if available' do
          expect(vendor_message.sender_name).to eq(vendor.business_name)
        end

        it 'returns full name if business name is not available' do
          vendor.update(business_name: nil)
          expect(vendor_message.sender_name).to eq("#{vendor_user.first_name} #{vendor_user.last_name}")
        end
      end

      context 'when sender is a customer' do
        it 'returns full name' do
          expect(message.sender_name).to eq("#{customer.first_name} #{customer.last_name}")
        end
      end
    end

    describe '#sender_type' do
      it 'returns the sender role' do
        expect(message.sender_type).to eq('customer')

        vendor_message = create(:booking_message, booking: booking, sender: vendor_user)
        expect(vendor_message.sender_type).to eq('vendor')
      end
    end

    describe '#formatted_sent_at' do
      it 'returns formatted timestamp' do
        message.update(sent_at: Time.zone.parse('2024-03-15 14:30:00'))
        expect(message.formatted_sent_at).to eq('03/15/2024 at 02:30 PM')
      end
    end
  end
end
