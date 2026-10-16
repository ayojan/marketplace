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
require 'rails_helper'

RSpec.describe ReviewVote do
  let(:vendor_user) { create(:user, :vendor) }
  let(:customer) { create(:user, :customer) }
  let(:other_customer) { create(:user, :customer) }
  let(:service) { create(:service, vendor: vendor_user.vendor) }
  let(:booking) do
    create(:booking, vendor: vendor_user.vendor, customer: customer, service: service,
                     status: :completed)
  end
  let(:review) { create(:review, booking: booking, customer: customer) }

  describe 'associations' do
    it { is_expected.to belong_to(:review) }
    it { is_expected.to belong_to(:voter).class_name('User') }
  end

  describe 'validations' do
    subject { build(:review_vote, review: review, voter: other_customer) }

    it { is_expected.to belong_to(:review) }
    it { is_expected.to belong_to(:voter).class_name('User') }

    it 'validates voter cannot be review author' do
      vote = build(:review_vote, review: review, voter: review.customer)
      expect(vote).not_to be_valid
      expect(vote.errors[:voter]).to include('cannot vote on their own review')
    end

    it 'validates voter must be a customer' do
      vote = build(:review_vote, review: review, voter: vendor_user)
      expect(vote).not_to be_valid
      expect(vote.errors[:voter]).to include('must be a customer to vote')
    end

    it 'enforces uniqueness of voter per review' do
      create(:review_vote, review: review, voter: other_customer)
      vote = build(:review_vote, review: review, voter: other_customer)
      expect(vote).not_to be_valid
      expect(vote.errors[:review_id]).to include('You have already voted on this review')
    end
  end
end
