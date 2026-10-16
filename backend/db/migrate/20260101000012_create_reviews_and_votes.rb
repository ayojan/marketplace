# frozen_string_literal: true

class CreateReviewsAndVotes < ActiveRecord::Migration[8.0]
  def change
    create_table :reviews do |t|
      t.references :booking, null: false, foreign_key: true, index: { unique: true }
      t.references :customer, null: false, foreign_key: { to_table: :users }
      t.references :vendor, null: false, foreign_key: true
      t.references :service, null: false, foreign_key: true
      t.integer :rating, null: false
      t.integer :quality_rating
      t.integer :communication_rating
      t.integer :value_rating
      t.integer :punctuality_rating
      t.text :comment
      t.string :status, default: 'published'
      t.text :vendor_response
      t.datetime :vendor_responded_at
      t.integer :helpful_votes, default: 0, null: false

      t.timestamps
    end

    add_index :reviews, :rating
    add_index :reviews, %i[service_id status]
    add_index :reviews, :status
    add_index :reviews, %i[vendor_id helpful_votes], order: { helpful_votes: :desc }
    add_index :reviews, %i[vendor_id status helpful_votes], name: 'index_reviews_helpful_by_vendor_and_status', order: { helpful_votes: :desc }
    add_index :reviews, %i[vendor_id status]
    add_index :reviews, %i[vendor_id vendor_responded_at]

    add_check_constraint :reviews, 'helpful_votes >= 0', name: 'check_helpful_votes_non_negative'

    create_table :review_votes do |t|
      t.references :review, null: false, foreign_key: true
      t.references :voter, null: false, foreign_key: { to_table: :users }

      t.timestamps
    end

    add_index :review_votes, %i[review_id voter_id], unique: true
    add_index :review_votes, %i[voter_id created_at]
  end
end
