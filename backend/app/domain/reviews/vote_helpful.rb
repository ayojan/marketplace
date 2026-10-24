# frozen_string_literal: true

module Reviews
  class VoteHelpful
    include Callable
    extend Dry::Initializer

    option :review, type: Types.Instance(Review)
    option :voter, type: Types.Instance(User)

    def call
      # Authorization check
      authorize_vote!

      # Idempotent voting: create or find existing vote
      vote = create_or_find_vote

      # If this is a new vote, increment helpful_votes atomically
      increment_helpful_votes_atomically if vote.persisted? && newly_created?(vote)

      review.reload
      { success: true, helpful_votes: review.helpful_votes }
    rescue Auth::AuthorizationService::NotAuthorizedError => e
      { success: false, error: e.message }
    rescue ActiveRecord::RecordNotUnique
      # Vote already exists - this is idempotent, so return success
      review.reload
      { success: true, helpful_votes: review.helpful_votes }
    rescue StandardError => e
      Rails.logger.error("Error in VoteHelpful: #{e.class} #{e.message}")
      { success: false, error: 'Failed to record vote' }
    end

    private

    def authorize_vote!
      Auth::AuthorizationService.authorize!(voter, review, :vote_helpful)
    end

    def create_or_find_vote
      # Use find_or_create to make voting idempotent
      ReviewVote.find_or_create_by!(review_id: review.id, voter_id: voter.id)
    rescue ActiveRecord::RecordNotUnique
      # This can happen with concurrent requests, which is OK
      ReviewVote.find_by!(review_id: review.id, voter_id: voter.id)
    end

    def newly_created?(vote)
      # Check if vote was just created in this request
      # by comparing timestamps (created_at should be very recent)
      vote.created_at >= 2.seconds.ago
    end

    def increment_helpful_votes_atomically
      # Use atomic SQL increment to avoid race conditions
      Review.where(id: review.id).update_all('helpful_votes = helpful_votes + 1') # rubocop:disable Rails/SkipsModelValidations
    end
  end
end
