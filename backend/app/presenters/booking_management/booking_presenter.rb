# frozen_string_literal: true

class BookingManagement::BookingPresenter
  attr_reader :booking

  def self.collection(bookings, **options)
    bookings.map { |booking| new(booking).as_json(**options) }
  end

  def initialize(booking)
    @booking = booking
  end

  def as_json(include_details: false)
    payload = base_payload
    return payload unless include_details

    payload.merge(
      messages_count: booking.booking_messages.count,
      last_message_at: booking.booking_messages.maximum(:sent_at)
    )
  end

  private

  delegate :customer, :service, :vendor, to: :booking

  def base_payload
    core_payload.merge(
      service: service_hash,
      customer: customer_hash,
      vendor: vendor_hash,
      review: review_hash
    )
  end

  # rubocop:disable Metrics/AbcSize
  def core_payload
    {
      id: booking.id,
      vendor_id: booking.vendor_id,
      customer_id: booking.customer_id,
      service_id: booking.service_id,
      status: booking.status,
      event_date: booking.event_date,
      event_end_date: booking.event_end_date,
      event_location: booking.event_location,
      total_amount: booking.total_amount,
      requirements: booking.requirements,
      special_instructions: booking.special_instructions,
      event_duration: booking.event_duration,
      duration_hours: booking.duration_hours,
      can_be_modified: booking.can_be_modified?,
      can_be_cancelled: booking.can_be_cancelled?,
      created_at: booking.created_at,
      updated_at: booking.updated_at
    }
  end
  # rubocop:enable Metrics/AbcSize

  def service_hash
    cat_names = if service.association(:categories).loaded?
                  service.categories.map(&:name)
                else
                  service.categories.pluck(:name)
                end

    {
      id: service.id,
      name: service.name,
      category: cat_names.join(', ')
    }
  end

  def customer_hash
    {
      id: customer.id,
      name: customer.full_name,
      email: customer.email
    }
  end

  def vendor_hash
    {
      id: vendor.id,
      slug: vendor.slug,
      user_id: vendor.user_id,
      name: vendor.user.full_name,
      business_name: vendor.business_name,
      location: vendor.location,
      image: vendor_primary_image,
      category: vendor.service_categories_list.first || 'Creative Partner'
    }
  end

  def review_hash
    return nil unless booking.review

    {
      id: booking.review.id,
      rating: booking.review.rating,
      quality_rating: booking.review.quality_rating,
      communication_rating: booking.review.communication_rating,
      value_rating: booking.review.value_rating,
      punctuality_rating: booking.review.punctuality_rating,
      comment: booking.review.comment,
      created_at: booking.review.created_at
    }
  end

  def vendor_primary_image
    first_featured = vendor.featured_portfolio_items.first
    return first_featured.primary_image_url if first_featured.respond_to?(:primary_image_url)
    return unless first_featured&.images&.attached?

    Rails.application.routes.url_helpers.url_for(first_featured.images.first)
  rescue StandardError
    nil
  end
end
