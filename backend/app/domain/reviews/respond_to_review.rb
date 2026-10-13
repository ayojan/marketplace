# frozen_string_literal: true

module Reviews
  class RespondToReview
    extend Dry::Initializer

    option :review, type: Types.Instance(Review)
    option :vendor, type: Types.Instance(User)
    option :response, type: Types::Strict::String

    def self.call(review:, vendor:, response:)
      new(review: review, vendor: vendor, response: response).call
    end

    def call
      # Authorization check
      authorize_vendor!

      # Validation guards
      return { success: false, error: 'Vendor has already responded to this review' } if review.vendor_response.present?
      return { success: false, error: 'Response must be less than 1000 characters' } if response.length > 1000

      # Update review with vendor response
      unless review.update(vendor_response: response, vendor_responded_at: Time.current)
        return { success: false, error: review.errors.full_messages.join(', ') }
      end

      { success: true, review: review }
    rescue AuthorizationService::NotAuthorizedError, ActiveRecord::RecordInvalid => e
      { success: false, error: e.message }
    rescue StandardError => e
      # Unexpected error - log and return generic message
      Rails.logger.error("Unexpected error in RespondToReview: #{e.class} #{e.message}")
      { success: false, error: 'Failed to record vendor response' }
    end

    private

    def authorize_vendor!
      AuthorizationService.authorize!(vendor, review, :respond)
    end
  end
end
