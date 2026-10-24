# frozen_string_literal: true

module Bookings
  class SendMessage
    include Callable
    extend Dry::Initializer

    option :booking, type: Types.Instance(Booking)
    option :sender, type: Types.Instance(User)
    option :message, type: Types::String

    def call
      msg = booking.booking_messages.build(sender: sender, message: message, sent_at: Time.current)
      { success: msg.save, message: msg, errors: msg.errors.full_messages }
    end
  end
end
