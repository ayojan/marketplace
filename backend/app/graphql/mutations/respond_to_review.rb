# frozen_string_literal: true

module Mutations
  class RespondToReview < Mutations::BaseMutation
    description 'Allows a vendor to respond to a customer review'

    argument :response, String, required: true, description: 'Vendor response content'
    argument :review_id, ID, required: true, description: 'ID of the review to respond to'

    field :errors, [String], null: false, description: 'List of error messages if the operation failed'
    field :review, Types::ReviewType, null: true, description: 'The updated review with vendor response'

    def resolve(review_id:, response:)
      user = context[:current_user]
      return failure_response('Authentication required') unless user

      review = Review.find_by(id: review_id)
      return failure_response('Review not found') unless review

      handle_response_call(review: review, vendor: user, response: response)
    rescue StandardError => e
      failure_response("Failed to respond to review: #{e.message}")
    end

    private

    def handle_response_call(review:, vendor:, response:)
      result = ::Reviews::RespondToReview.call(review: review, vendor: vendor, response: response)
      if result[:success]
        { review: result[:review], errors: [] }
      else
        failure_response(result[:error])
      end
    end

    def failure_response(messages)
      { review: nil, errors: Array(messages) }
    end
  end
end
