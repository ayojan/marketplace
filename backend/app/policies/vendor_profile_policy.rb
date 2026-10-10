# frozen_string_literal: true

class VendorProfilePolicy < ApplicationPolicy
  # Anyone can view vendor profiles
  def show?
    true
  end

  # Vendors can update their own profile
  def update?
    user.vendor? && record.user_id == user.id
  end

  # Vendors can request verification for their own profile
  def request_verification?
    user.vendor? && record.user_id == user.id
  end

  # Only admins can approve/reject verification
  def approve_verification?
    user.admin?
  end

  def reject_verification?
    user.admin?
  end

  # Vendors can view their own analytics
  def view_analytics?
    user.vendor? && record.user_id == user.id
  end

  # Customers can toggle favorites on other vendors
  def toggle_favorite?
    user.customer? && record.user_id != user.id
  end
end
