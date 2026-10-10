# frozen_string_literal: true

module Reviews
  class CreateReview
    extend Dry::Initializer

    option :customer, type: Types.Instance(User)
    option :booking, type: Types.Instance(Booking)
    option :service, type: Types.Instance(Service)
    option :vendor_profile, type: Types.Instance(VendorProfile)
    option :rating, type: Types::Coercible::Integer
    option :quality_rating, type: Types::Coercible::Integer.optional, default: proc { nil }
    option :communication_rating, type: Types::Coercible::Integer.optional, default: proc { nil }
    option :value_rating, type: Types::Coercible::Integer.optional, default: proc { nil }
    option :punctuality_rating, type: Types::Coercible::Integer.optional, default: proc { nil }
    option :comment, type: Types::String.optional, default: proc { nil }
    option :photos, type: Types::Array, default: proc { [] }
    option :status, type: Types::String, default: proc { 'published' }

    def self.call(**kwargs)
      new(**kwargs).call
    rescue Dry::Types::ConstraintError, Dry::Types::CoercionError, ArgumentError => e
      { success: false, error: e.message }
    end

    def call
      # 1. Create the review record
      review = create_review_record

      return { success: false, error: review.errors.full_messages.join(', ') } unless review.persisted?

      # 2. Attach photos if provided
      attach_photos(review)

      # 3. Update rating stats for vendor and service
      update_rating_statistics(review)

      # 4. Send notification to vendor if published
      send_notification_if_published(review)

      { success: true, review: review }
    rescue StandardError => e
      Rails.logger.error("Failed to create review: #{e.class} #{e.message}")
      { success: false, error: e.message }
    end

    private

    def create_review_record
      Review.new(
        customer: customer,
        booking: booking,
        service: service,
        vendor_profile: vendor_profile,
        rating: rating,
        quality_rating: quality_rating,
        communication_rating: communication_rating,
        value_rating: value_rating,
        punctuality_rating: punctuality_rating,
        comment: comment,
        status: status
      ).tap(&:save)
    end

    def attach_photos(review)
      return if photos.blank?

      photos.each do |photo|
        review.photos.attach(photo)
      end
    rescue StandardError => e
      Rails.logger.error("Failed to attach photos to review #{review.id}: #{e.message}")
      # Don't re-raise; review is already created
    end

    def update_rating_statistics(_review)
      # Update vendor profile rating stats
      vendor_profile.update_rating_stats!

      # Update service rating stats if service exists
      service.update_rating_stats!
    rescue StandardError => e
      Rails.logger.error("Failed to update rating stats after review: #{e.message}")
      # Don't re-raise; review is already created
    end

    def send_notification_if_published(review)
      return unless review.published?

      Notifications::SendReviewNotification.call(review: review)
    rescue StandardError => e
      Rails.logger.error("Failed to send review notification: #{e.message}")
      # Don't re-raise; review is already created
    end
  end
end
