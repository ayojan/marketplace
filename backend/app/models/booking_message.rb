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
class BookingMessage < ApplicationRecord
  belongs_to :booking
  belongs_to :sender, class_name: 'User'

  validates :message, presence: true, length: { minimum: 1, maximum: 1000 }
  validates :sent_at, presence: true

  before_validation :set_sent_at, on: :create
  after_create :record_vendor_first_response

  scope :ordered, -> { order(:sent_at) }
  scope :recent, -> { order(sent_at: :desc) }

  def sender_name
    if sender.vendor?
      sender.vendor_profile&.business_name || "#{sender.first_name} #{sender.last_name}"
    else
      "#{sender.first_name} #{sender.last_name}"
    end
  end

  def sender_type
    sender.role
  end

  def formatted_sent_at
    sent_at.strftime('%m/%d/%Y at %I:%M %p')
  end

  private

  def set_sent_at
    self.sent_at ||= Time.current
  end

  def record_vendor_first_response
    return unless sender.vendor?
    return if booking.vendor_first_response_at.present?

    response_time = [sent_at, booking.created_at || Time.current].compact.max

    # Update using raw SQL to avoid triggering booking callbacks
    # This ensures the timestamp is recorded without side effects
    Booking.where(id: booking.id).update_all(vendor_first_response_at: response_time)
  rescue StandardError => e
    Rails.logger.error("Failed to record vendor first response: #{e.message}")
  end
end
