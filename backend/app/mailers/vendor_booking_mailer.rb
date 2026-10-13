# frozen_string_literal: true

class VendorBookingMailer < ApplicationMailer
  def new_booking_notification(booking)
    @booking = booking
    @vendor = booking.vendor_profile
    @customer = booking.customer_profile
    @service = booking.service

    mail(to: @vendor.user.email, subject: "New Booking Request - #{@service.name}") do |format|
      format.text do
        render plain: "Hello #{@vendor.business_name},\n\n" \
                      "You have a new booking request from #{@customer.user.name} for #{@service.name}."
      end
      format.html { render 'new_booking_notification' }
    end
  end

  def booking_cancelled_notification(booking)
    @booking = booking
    @vendor = booking.vendor_profile
    @customer = booking.customer_profile
    @service = booking.service

    body = "Hello #{@vendor.business_name},\n\n" \
           "The booking with #{@customer.user.name} for #{@service.name} has been cancelled."

    mail(to: @vendor.user.email, subject: "Booking Cancelled - #{@service.name}") do |format|
      format.text { render plain: body }
      format.html { render plain: body }
    end
  end

  def booking_modified_notification(booking)
    @booking = booking
    @vendor = booking.vendor_profile
    @customer = booking.customer_profile
    @service = booking.service

    body = "Hello #{@vendor.business_name},\n\n" \
           "The booking with #{@customer.user.name} for #{@service.name} has been modified."

    mail(to: @vendor.user.email, subject: "Booking Modified - #{@service.name}") do |format|
      format.text { render plain: body }
      format.html { render plain: body }
    end
  end
end
