# frozen_string_literal: true

# Preview all emails at http://localhost:3001/rails/mailers/vendor_booking_mailer
class VendorBookingMailerPreview < ActionMailer::Preview
  def new_booking_notification
    VendorBookingMailer.new_booking_notification(sample_booking)
  end

  def booking_cancelled_notification
    VendorBookingMailer.booking_cancelled_notification(sample_booking)
  end

  def booking_modified_notification
    VendorBookingMailer.booking_modified_notification(sample_booking)
  end

  private

  def sample_booking
    Booking.first || build_mock_booking
  end

  # rubocop:disable Metrics/MethodLength
  def build_mock_booking
    customer_user = User.new(first_name: 'Priya', last_name: 'Sharma', email: 'priya@example.com', role: :customer)
    customer_profile = CustomerProfile.new(user: customer_user, phone: '+91 98765 43210')
    customer_user.customer_profile = customer_profile

    vendor_user = User.new(first_name: 'Rahul', last_name: 'Kapoor', email: 'rahul@example.com', role: :vendor)
    vendor_profile = VendorProfile.new(
      user: vendor_user,
      business_name: 'Elite Weddings & Events',
      slug: 'elite-weddings',
      phone: '+91 91234 56789'
    )
    service = Service.new(name: 'Full Wedding Photography & Cinematography', vendor_profile: vendor_profile)

    Booking.new(
      id: 101,
      customer: customer_user,
      vendor_profile: vendor_profile,
      service: service,
      event_date: 3.days.from_now.change(hour: 16, min: 0),
      event_end_date: 3.days.from_now.change(hour: 22, min: 0),
      event_location: 'The Oberoi Grand Ballroom, Mumbai',
      total_amount: 85_000.00,
      requirements: 'Traditional ceremonies + drone footage',
      special_instructions: 'Arrive 30 mins early for setup',
      status: :pending
    )
  end
  # rubocop:enable Metrics/MethodLength
end
