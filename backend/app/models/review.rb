# frozen_string_literal: true

# == Schema Information
#
# Table name: reviews
#
#  id                   :bigint           not null, primary key
#  comment              :text
#  communication_rating :integer
#  helpful_votes        :integer          default(0), not null
#  punctuality_rating   :integer
#  quality_rating       :integer
#  rating               :integer          not null
#  status               :string           default("published")
#  value_rating         :integer
#  vendor_responded_at  :datetime
#  vendor_response      :text
#  created_at           :datetime         not null
#  updated_at           :datetime         not null
#  booking_id           :bigint           not null
#  customer_id          :bigint           not null
#  service_id           :bigint           not null
#  vendor_id            :bigint           not null
#
# Indexes
#
#  index_reviews_helpful_by_vendor_and_status          (vendor_id,status,helpful_votes DESC)
#  index_reviews_on_booking_id                         (booking_id) UNIQUE
#  index_reviews_on_customer_id                        (customer_id)
#  index_reviews_on_rating                             (rating)
#  index_reviews_on_service_id                         (service_id)
#  index_reviews_on_service_id_and_status              (service_id,status)
#  index_reviews_on_status                             (status)
#  index_reviews_on_vendor_id                          (vendor_id)
#  index_reviews_on_vendor_id_and_helpful_votes        (vendor_id,helpful_votes DESC)
#  index_reviews_on_vendor_id_and_status               (vendor_id,status)
#  index_reviews_on_vendor_id_and_vendor_responded_at  (vendor_id,vendor_responded_at)
#
# Foreign Keys
#
#  fk_rails_...  (booking_id => bookings.id)
#  fk_rails_...  (customer_id => users.id)
#  fk_rails_...  (service_id => services.id)
#  fk_rails_...  (vendor_id => vendors.id)
#
class Review < ApplicationRecord
  # Associations
  belongs_to :booking
  belongs_to :customer, class_name: 'User'
  belongs_to :vendor

  belongs_to :service
  has_many :votes, class_name: 'ReviewVote', dependent: :destroy
  has_many :voters, through: :votes, source: :voter

  # Active Storage for photos
  has_many_attached :photos

  # Enums
  enum :status, { published: 'published', hidden: 'hidden' }

  # Validations
  validates :rating, presence: true, inclusion: { in: 1..5 }
  validates :quality_rating, inclusion: { in: 1..5 }, allow_nil: true
  validates :communication_rating, inclusion: { in: 1..5 }, allow_nil: true
  validates :value_rating, inclusion: { in: 1..5 }, allow_nil: true
  validates :punctuality_rating, inclusion: { in: 1..5 }, allow_nil: true
  validates :comment, length: { maximum: 1000 }
  validates :booking_id, uniqueness: { message: :already_reviewed }
  validates :helpful_votes, numericality: { greater_than_or_equal_to: 0, only_integer: true }
  validates :vendor_response, length: { maximum: 1000 }, allow_nil: true
  validate :booking_must_be_completed
  validate :customer_must_own_booking
  validate :photos_content_type
  validate :photos_count_limit
  validate :vendor_response_consistency

  # NOTE: Callbacks for side effects have been moved to Reviews::CreateReview service.
  # This allows for explicit orchestration and better testability.
  # Scopes
  scope :recent, -> { order(created_at: :desc) }
  scope :by_rating, ->(rating) { where(rating: rating) }

  # Instance methods
  def verified_purchase?
    booking_id.present?
  end

  private

  def booking_must_be_completed
    return unless booking

    return if booking.completed?

    errors.add(:booking, 'must be completed before it can be reviewed')
  end

  def customer_must_own_booking
    return unless booking && customer

    return if booking.customer_id == customer_id

    errors.add(:customer, 'must be the one who made the booking')
  end

  def photos_count_limit
    return unless photos.attached?

    return unless photos.count > 5

    errors.add(:photos, 'cannot exceed 5 photos per review')
  end

  def photos_content_type
    return unless photos.attached?

    photos.each do |photo|
      unless photo.content_type.in?(['image/jpeg', 'image/jpg', 'image/png', 'image/webp'])
        errors.add(:photos, 'must be JPEG, PNG, or WebP format')
      end

      errors.add(:photos, 'must be less than 10MB each') if photo.byte_size > 10.megabytes
    end
  end

  def vendor_response_consistency
    # If vendor_response is present, vendor_responded_at must be present
    if vendor_response.present? && vendor_responded_at.blank?
      errors.add(:vendor_responded_at, 'must be set if vendor response is provided')
    end

    # If vendor_responded_at is present, vendor_response must be present
    return unless vendor_responded_at.present? && vendor_response.blank?

    errors.add(:vendor_response, 'must be provided if vendor responded at is set')
  end
end
