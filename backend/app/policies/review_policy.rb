# frozen_string_literal: true

class ReviewPolicy < ApplicationPolicy
  # Allow vendors to respond to reviews on their own services
  def respond?
    return false unless user&.vendor?

    record.vendor_profile.user_id == user.id
  end

  # Allow customers to view their own reviews
  def view?
    user_is_reviewer? || user_is_vendor?
  end

  # Allow customers to edit their own unpublished reviews
  def update?
    user_is_reviewer? && record.published?
  end

  # Allow customers to delete their own reviews
  def destroy?
    user_is_reviewer?
  end

  # Allow voting on reviews (authenticated customer, except the reviewer)
  def vote_helpful?
    return false unless user&.customer?

    user.id != record.customer_id
  end

  private

  def user_is_reviewer?
    user.present? && record.customer_id == user.id
  end

  def user_is_vendor?
    user.present? && record.vendor_profile.user_id == user.id
  end
end
