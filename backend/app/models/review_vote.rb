# frozen_string_literal: true

# == Schema Information
#
# Table name: review_votes
#
#  id         :bigint           not null, primary key
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  review_id  :bigint           not null
#  voter_id   :bigint           not null
#
# Indexes
#
#  index_review_votes_on_review_id                (review_id)
#  index_review_votes_on_review_id_and_voter_id   (review_id,voter_id) UNIQUE
#  index_review_votes_on_voter_id                 (voter_id)
#  index_review_votes_on_voter_id_and_created_at  (voter_id,created_at)
#
# Foreign Keys
#
#  fk_rails_...  (review_id => reviews.id)
#  fk_rails_...  (voter_id => users.id)
#
class ReviewVote < ApplicationRecord
  belongs_to :review
  belongs_to :voter, class_name: 'User'

  validates :review_id, uniqueness: { scope: :voter_id, message: :already_voted }

  # Prevent review author from voting
  validate :voter_cannot_be_review_author
  # Prevent vendors from voting
  validate :voter_must_be_customer

  private

  def voter_cannot_be_review_author
    return unless review && voter

    return unless review.customer_id == voter_id

    errors.add(:voter, 'cannot vote on their own review')
  end

  def voter_must_be_customer
    return unless voter

    return if voter.customer?

    errors.add(:voter, 'must be a customer to vote')
  end
end
