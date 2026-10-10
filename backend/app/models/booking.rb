# frozen_string_literal: true

# == Schema Information
#
# Table name: bookings
#
#  id                       :bigint           not null, primary key
#  booking_reminder_sent_at :datetime
#  event_date               :datetime         not null
#  event_duration           :string
#  event_end_date           :datetime
#  event_location           :string           not null
#  requirements             :text
#  special_instructions     :text
#  status                   :integer          default("pending"), not null
#  total_amount             :decimal(10, 2)   not null
#  vendor_first_response_at :datetime
#  created_at               :datetime         not null
#  updated_at               :datetime         not null
#  customer_id              :bigint           not null
#  service_id               :bigint           not null
#  vendor_profile_id        :bigint           not null
#
# Indexes
#
#  index_bookings_on_booking_reminder_sent_at  (booking_reminder_sent_at)
#  index_bookings_on_customer_id               (customer_id)
#  index_bookings_on_customer_id_and_status    (customer_id,status)
#  index_bookings_on_event_date                (event_date)
#  index_bookings_on_service_id                (service_id)
#  index_bookings_on_service_id_and_status     (service_id,status)
#  index_bookings_on_vendor_first_response_at  (vendor_first_response_at)
#  index_bookings_on_vendor_profile_id         (vendor_profile_id)
#  index_bookings_vendor_response_time         (vendor_profile_id,vendor_first_response_at,created_at)
#  index_bookings_vendor_status_date           (vendor_profile_id,status,event_date)
#
# Foreign Keys
#
#  fk_rails_...  (customer_id => users.id)
#  fk_rails_...  (service_id => services.id)
#  fk_rails_...  (vendor_profile_id => vendor_profiles.id)
#
class Booking < ApplicationRecord
  belongs_to :customer, class_name: 'User'
  belongs_to :vendor_profile
  belongs_to :service
  has_many :booking_messages, dependent: :destroy
  has_one :review, dependent: :destroy

  enum :status, {
    pending: 0,
    accepted: 1,
    declined: 2,
    completed: 3,
    cancelled: 4,
    counter_offered: 5
  }

  validates :event_date, presence: true
  validates :event_location, presence: true
  validates :total_amount, presence: true, numericality: { greater_than: 0 }
  validates :status, presence: true

  # NOTE: Complex validation logic (vendor_availability) moved to BookingValidationService
  validate :event_date_in_future, if: -> { new_record? || event_date_changed? }
  validate :event_end_date_after_event_date, if: -> { event_end_date.present? && (new_record? || event_date_changed? || event_end_date_changed?) }

  scope :upcoming, -> { where('event_date > ?', Time.current) }
  scope :for_vendor_profile, ->(vendor_profile) { where(vendor_profile: vendor_profile) }
  scope :for_customer, ->(customer) { where(customer: customer) }
  scope :by_status, ->(status) { where(status: status) }

  # Domain scopes for state queries
  scope :active, -> { where(status: %i[pending accepted]) }
  scope :inactive, -> { where(status: %i[declined cancelled completed]) }
  scope :cancellable, -> { where(status: %i[pending accepted]).where('event_date > ?', 24.hours.from_now) }
  scope :modifiable, -> { where(status: :pending).where('event_date > ?', 24.hours.from_now) }

  # Time-based scopes
  scope :overlapping_period, lambda { |start_date, end_date|
    where('(event_date < ? AND event_end_date > ?) OR (event_date < ? AND event_end_date > ?)',
          end_date, start_date, start_date, end_date)
  }

  # NOTE: Callbacks for side effects have been moved to Bookings::CreateBooking and
  # Bookings::UpdateBookingStatus services. This allows for explicit orchestration and better testability.

  def duration_hours
    return nil unless event_end_date && event_date

    ((event_end_date - event_date) / 1.hour).round(2)
  end

  # State predicate methods
  def can_be_modified?
    pending? && event_date > 24.hours.from_now
  end

  def can_be_cancelled?
    (pending? || accepted?) && event_date > 24.hours.from_now
  end

  def customer_profile
    customer&.customer_profile
  end

  def vendor
    vendor_profile&.user
  end

  # Convenience method for accessing vendor in concerns (already have vendor_profile.user)
  alias vendor_user vendor

  private

  def event_date_in_future
    return unless event_date

    errors.add(:event_date, 'must be in the future') if event_date <= Time.current
  end

  def event_end_date_after_event_date
    return unless event_end_date && event_date

    errors.add(:event_end_date, 'must be after event date') if event_end_date <= event_date
  end
end
