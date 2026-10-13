# frozen_string_literal: true

class CustomerBookingMailer < ApplicationMailer
  def booking_approved_notification(booking)
    @booking = booking
    @customer = booking.customer_profile
    @vendor = booking.vendor_profile
    @service = booking.service

    mail(to: @customer.user.email, subject: "Booking Confirmed - #{@service.name}") do |format|
      format.text do
        render plain: "Hello #{@customer.user.name},\n\n" \
                      "Your booking with #{@vendor.business_name} for #{@service.name} has been confirmed."
      end
      format.html { render 'booking_approved_notification' }
    end
  end

  def booking_rejected_notification(booking)
    @booking = booking
    @customer = booking.customer_profile
    @vendor = booking.vendor_profile
    @service = booking.service

    body = "Hello #{@customer.user.name},\n\n" \
           "Your booking with #{@vendor.business_name} for #{@service.name} has been declined."

    mail(to: @customer.user.email, subject: "Booking Declined - #{@service.name}") do |format|
      format.text { render plain: body }
      format.html { render plain: body }
    end
  end

  def booking_cancelled_notification(booking)
    @booking = booking
    @customer = booking.customer_profile
    @vendor = booking.vendor_profile
    @service = booking.service

    body = "Hello #{@customer.user.name},\n\n" \
           "Your booking with #{@vendor.business_name} for #{@service.name} has been cancelled."

    mail(to: @customer.user.email, subject: "Booking Cancelled - #{@service.name}") do |format|
      format.text { render plain: body }
      format.html { render plain: body }
    end
  end

  def booking_reminder(booking)
    @booking = booking
    @customer = booking.customer_profile
    @vendor = booking.vendor_profile
    @service = booking.service

    body = "Hello #{@customer.user.name},\n\n" \
           "Reminder: Your booking with #{@vendor.business_name} for #{@service.name} is scheduled for tomorrow."

    mail(to: @customer.user.email, subject: "Booking Reminder - #{@service.name} Tomorrow") do |format|
      format.text { render plain: body }
      format.html { render plain: body }
    end
  end

  def booking_confirmation(booking)
    @booking = booking
    @customer = booking.customer_profile
    @vendor = booking.vendor_profile
    @service = booking.service

    body = "Hello #{@customer.user.name},\n\n" \
           "Your booking with #{@vendor.business_name} for #{@service.name} is confirmed."

    mail(to: @customer.user.email, subject: "Booking Confirmation - #{@service.name}") do |format|
      format.text { render plain: body }
      format.html { render plain: body }
    end
  end
end
