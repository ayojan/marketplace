# frozen_string_literal: true

class VendorBookingMailer < ApplicationMailer
  def new_booking_notification(booking)
    assign_booking_details(booking)
    mail(to: @vendor_email, subject: "New Booking Request - #{@service.name}") do |format|
      format.text
      format.html
    end
  end

  def booking_cancelled_notification(booking)
    assign_booking_details(booking)
    mail(to: @vendor_email, subject: "Booking Cancelled - #{@service.name}") do |format|
      format.text
      format.html
    end
  end

  def booking_modified_notification(booking)
    assign_booking_details(booking)
    mail(to: @vendor_email, subject: "Booking Modified - #{@service.name}") do |format|
      format.text
      format.html
    end
  end

  private

  def assign_booking_details(booking)
    @booking = booking
    @vendor = booking.vendor_profile
    @vendor_user = booking.vendor
    @vendor_email = @vendor_user.email
    @customer = booking.customer_profile || booking.customer
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
