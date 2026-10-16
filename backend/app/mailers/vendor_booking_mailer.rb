# frozen_string_literal: true

class VendorBookingMailer < ApplicationMailer
  def new_booking_notification(booking)
    assign_booking_details(booking)
    mail(
      to: @vendor_email,
      from: bookings_sender,
      reply_to: support_sender,
      subject: "New Booking Request - #{@service.name}"
    ) do |format|
      format.text
      format.html
    end
  end

  def booking_cancelled_notification(booking)
    assign_booking_details(booking)
    mail(
      to: @vendor_email,
      from: bookings_sender,
      reply_to: support_sender,
      subject: "Booking Cancelled - #{@service.name}"
    ) do |format|
      format.text
      format.html
    end
  end

  def booking_modified_notification(booking)
    assign_booking_details(booking)
    mail(
      to: @vendor_email,
      from: bookings_sender,
      reply_to: support_sender,
      subject: "Booking Modified - #{@service.name}"
    ) do |format|
      format.text
      format.html
    end
  end

  private

  def assign_booking_details(booking)
    @booking = booking
    @vendor = booking.vendor
    @vendor_user = @vendor.respond_to?(:user) ? @vendor.user : @vendor
    @vendor_email = @vendor_user.email
    @customer = booking.customer&.customer || booking.customer
    if @customer.is_a?(User) && !@customer.respond_to?(:user)
      def @customer.user
        self
      end
    end
    @customer_user = booking.customer
    @service = booking.service
    @view_booking_url = frontend_url("/vendor/bookings/#{booking.id}")
  end
end
