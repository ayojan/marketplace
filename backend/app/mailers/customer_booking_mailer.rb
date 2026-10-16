# frozen_string_literal: true

class CustomerBookingMailer < ApplicationMailer
  def booking_confirmation(booking)
    assign_booking_details(booking)
    mail(
      to: @customer_email,
      from: bookings_sender,
      reply_to: support_sender,
      subject: "Booking Confirmation - #{@service.name}"
    ) do |format|
      format.text
      format.html
    end
  end
  alias booking_request_confirmation booking_confirmation

  def booking_approved_notification(booking)
    assign_booking_details(booking)
    mail(
      to: @customer_email,
      from: bookings_sender,
      reply_to: support_sender,
      subject: "Booking Confirmed - #{@service.name}"
    ) do |format|
      format.text
      format.html
    end
  end
  alias booking_accepted_notification booking_approved_notification

  def booking_rejected_notification(booking)
    assign_booking_details(booking)
    mail(
      to: @customer_email,
      from: bookings_sender,
      reply_to: support_sender,
      subject: "Booking Declined - #{@service.name}"
    ) do |format|
      format.text
      format.html
    end
  end
  alias booking_declined_notification booking_rejected_notification

  def booking_cancelled_notification(booking)
    assign_booking_details(booking)
    mail(
      to: @customer_email,
      from: bookings_sender,
      reply_to: support_sender,
      subject: "Booking Cancelled - #{@service.name}"
    ) do |format|
      format.text
      format.html
    end
  end

  def booking_reminder(booking)
    assign_booking_details(booking)
    mail(
      to: @customer_email,
      from: reminders_sender,
      reply_to: bookings_sender,
      subject: "Booking Reminder - #{@service.name} Tomorrow"
    ) do |format|
      format.text
      format.html
    end
  end

  private

  def assign_booking_details(booking)
    @booking = booking
    @customer = booking.customer&.customer || booking.customer
    if @customer.is_a?(User) && !@customer.respond_to?(:user)
      def @customer.user
        self
      end
    end
    @customer_user = booking.customer
    @customer_email = @customer_user.email
    @vendor = booking.vendor
    @service = booking.service
    @view_booking_url = frontend_url("/dashboard/bookings/#{booking.id}")
  end
end
