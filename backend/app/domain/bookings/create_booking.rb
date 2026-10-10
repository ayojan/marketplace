# frozen_string_literal: true

module Bookings
  class CreateBooking
    extend Dry::Initializer

    option :customer, type: Types.Instance(User).optional, optional: true
    option :service, type: Types.Instance(Service).optional, optional: true
    option :vendor_profile, type: Types.Instance(VendorProfile).optional, optional: true
    option :event_date, type: Types::Time.optional, optional: true
    option :event_location, type: Types::String.optional, optional: true
    option :event_end_date, type: Types::Time.optional, optional: true
    option :event_duration, type: Types::String.optional, optional: true
    option :total_amount, type: Types::Coercible::Decimal.optional, optional: true
    option :requirements, type: Types::String.optional, optional: true
    option :special_instructions, type: Types::String.optional, optional: true
    option :status, type: Types::String, default: proc { 'pending' }
    option :skip_notifications, type: Types::Bool, default: proc { false }

    def self.call(**kwargs)
      new(**kwargs).call
    rescue Dry::Types::ConstraintError, Dry::Types::CoercionError, ArgumentError => e
      { success: false, error: e.message }
    end

    def call
      # 1. Create the booking record
      booking = build_booking_record
      saved = booking.save

      return { success: false, error: booking.errors.full_messages.join(', ') } unless saved

      # 2. Send confirmation notification to customer and vendor
      send_confirmation_notification(booking) unless skip_notifications

      { success: true, booking: booking }
    rescue StandardError => e
      Rails.logger.error("Failed to create booking: #{e.class} #{e.message}")
      { success: false, error: e.message }
    end

    private

    def build_booking_record
      Booking.new(
        customer: customer,
        service: service,
        vendor_profile: vendor_profile,
        event_date: event_date,
        event_location: event_location,
        event_end_date: event_end_date,
        event_duration: event_duration,
        total_amount: total_amount,
        requirements: requirements,
        special_instructions: special_instructions,
        status: status
      )
    end

    def send_confirmation_notification(booking)
      Notifications::SendBookingConfirmation.call(booking: booking)
    rescue StandardError => e
      Rails.logger.error("Failed to send booking confirmation notification for booking #{booking.id}: #{e.message}")
      # Don't re-raise; booking is already created
    end
  end
end
