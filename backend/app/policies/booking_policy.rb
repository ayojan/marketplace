# frozen_string_literal: true

class BookingPolicy < ApplicationPolicy
  # Customers can view their own bookings
  def show?
    user_is_customer?
  end

  # Vendors can view bookings for their services
  def vendor_view?
    user_is_vendor?
  end

  # Customers can modify their own pending bookings (within 24 hours of event)
  def update?
    user_is_customer? && record.can_be_modified?
  end

  # Customers can cancel their own bookings (within 24 hours of event)
  def cancel?
    user_is_customer? && record.can_be_cancelled?
  end

  # Vendors can accept/decline bookings for their services
  def accept?
    user_is_vendor? && record.pending?
  end

  def decline?
    user_is_vendor? && record.pending?
  end

  # Vendors can mark bookings as completed
  def complete?
    user_is_vendor? && record.accepted?
  end

  # Both customer and vendor can send messages
  def send_message?
    user_is_customer? || user_is_vendor?
  end

  private

  def user_is_customer?
    record.customer_id == user.id
  end

  def user_is_vendor?
    record.vendor.user_id == user.id
  end
end
