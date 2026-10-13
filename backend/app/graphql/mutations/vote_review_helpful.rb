# frozen_string_literal: true

module Mutations
  class VoteReviewHelpful < Mutations::BaseMutation
    description 'Mark a review as helpful or toggle vote'

    argument :review_id, ID, required: true, description: 'ID of the review to vote on'

    field :errors, [String], null: false, description: 'List of errors if operation failed'
    field :helpful_votes, Integer, null: false, description: 'Updated count of helpful votes'

    def resolve(review_id:)
      user = context[:current_user]
      return { helpful_votes: 0, errors: ['Authentication required'] } unless user

      review = Review.find_by(id: review_id)
      return { helpful_votes: 0, errors: ['Review not found'] } unless review

      format_vote_result(::Reviews::VoteHelpful.call(review: review, voter: user))
    rescue StandardError => e
      { helpful_votes: 0, errors: ["Failed to vote on review: #{e.message}"] }
    end

    private

    def format_vote_result(result)
      if result[:success]
        { helpful_votes: result[:helpful_votes], errors: [] }
      else
        { helpful_votes: 0, errors: Array(result[:error]) }
      end
    end
  end
end
