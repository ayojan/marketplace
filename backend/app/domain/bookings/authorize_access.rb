# frozen_string_literal: true

module Bookings
  class AuthorizeAccess
    extend Dry::Initializer

    option :booking, type: Types.Instance(Booking)
    option :user, type: Types.Instance(User)

    def self.call(booking:, user:, action:)
      new(booking: booking, user: user).call(action)
    end

    def call(action)
      case action
      when :access then can_access?
      when :modify then can_modify?
      when :vendor_respond then can_vendor_respond?
      else
        raise ArgumentError, "Unknown action: #{action}"
      end
    end

    private

    def can_access?
      customer_owner? || vendor_owner?
    end

    def can_modify?
      customer_owner? && booking.can_be_modified?
    end

    def can_vendor_respond?
      vendor_owner? && booking.pending?
    end

    def customer_owner?
      booking.customer_id == user.id
    end

    def vendor_owner?
      booking.vendor&.user_id == user.id
    end
  end
end
