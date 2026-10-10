# frozen_string_literal: true

class VendorBookingMailer < ApplicationMailer
  def new_booking_notification(booking)
    @booking = booking
    @vendor = booking.vendor_profile
    @customer = booking.customer_profile
    @service = booking.service

    mail(to: @vendor.user.email, subject: "New Booking Request - #{@service.name}") do |format|
      format.text { render plain: "Hello #{@vendor.business_name},\n\nYou have a new booking request from #{@customer.user.name} for #{@service.name}." }
      format.html { render 'new_booking_notification' }
    end
  end

  def booking_cancelled_notification(booking)
    @booking = booking
    @vendor = booking.vendor_profile
    @customer = booking.customer_profile
    @service = booking.service

    mail(to: @vendor.user.email, subject: "Booking Cancelled - #{@service.name}") do |format|
      format.text { render plain: "Hello #{@vendor.business_name},\n\nThe booking with #{@customer.user.name} for #{@service.name} has been cancelled." }
      format.html { render plain: "Hello #{@vendor.business_name},\n\nThe booking with #{@customer.user.name} for #{@service.name} has been cancelled." }
    end
  end

  def booking_modified_notification(booking)
    @booking = booking
    @vendor = booking.vendor_profile
    @customer = booking.customer_profile
    @service = booking.service

    mail(to: @vendor.user.email, subject: "Booking Modified - #{@service.name}") do |format|
      format.text { render plain: "Hello #{@vendor.business_name},\n\nThe booking with #{@customer.user.name} for #{@service.name} has been modified." }
      format.html { render plain: "Hello #{@vendor.business_name},\n\nThe booking with #{@customer.user.name} for #{@service.name} has been modified." }
    end
  end
end
