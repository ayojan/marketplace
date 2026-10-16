# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CustomerBookingMailer do
  let(:vendor_user) { create(:user, :vendor) }
  let(:customer_user) { create(:user, :customer) }
  let(:vendor) { vendor_user.vendor }
  let(:customer) { customer_user.customer }
  let(:service) { create(:service, vendor: vendor) }
  let(:booking) do
    # Create availability slot for the booking date
    booking_date = 1.week.from_now
    create(:availability_slot,
           vendor: vendor,
           date: booking_date.to_date,
           is_available: true)

    create(:booking, service: service, vendor: vendor, customer: customer_user, event_date: booking_date)
  end

  describe '#booking_approved_notification' do
    let(:mail) { described_class.booking_approved_notification(booking) }

    it 'renders the headers' do
      expect(mail.subject).to eq("Booking Confirmed - #{service.name}")
      expect(mail.to).to eq([customer_user.email])
      expect(mail.from).to eq(['noreply@marketplace.com'])
    end

    it 'renders the body' do
      expect(mail.body.encoded).to include(customer_user.full_name)
      expect(mail.body.encoded).to include(vendor.business_name)
      expect(mail.body.encoded).to include(service.name)
    end
  end

  describe '#booking_rejected_notification' do
    let(:mail) { described_class.booking_rejected_notification(booking) }

    it 'renders the headers' do
      expect(mail.subject).to eq("Booking Declined - #{service.name}")
      expect(mail.to).to eq([customer_user.email])
      expect(mail.from).to eq(['noreply@marketplace.com'])
    end

    it 'renders the body' do
      expect(mail.body.encoded).to include(customer_user.full_name)
      expect(mail.body.encoded).to include(vendor.business_name)
      expect(mail.body.encoded).to include(service.name)
    end
  end

  describe '#booking_cancelled_notification' do
    let(:mail) { described_class.booking_cancelled_notification(booking) }

    it 'renders the headers' do
      expect(mail.subject).to eq("Booking Cancelled - #{service.name}")
      expect(mail.to).to eq([customer_user.email])
      expect(mail.from).to eq(['noreply@marketplace.com'])
    end

    it 'renders the body' do
      expect(mail.body.encoded).to include(customer_user.full_name)
      expect(mail.body.encoded).to include(vendor.business_name)
      expect(mail.body.encoded).to include(service.name)
    end
  end

  describe '#booking_reminder' do
    let(:mail) { described_class.booking_reminder(booking) }

    it 'renders the headers' do
      expect(mail.subject).to eq("Booking Reminder - #{service.name} Tomorrow")
      expect(mail.to).to eq([customer_user.email])
      expect(mail.from).to eq(['noreply@marketplace.com'])
    end

    it 'renders the body' do
      expect(mail.body.encoded).to include(customer_user.full_name)
      expect(mail.body.encoded).to include(vendor.business_name)
      expect(mail.body.encoded).to include(service.name)
    end
  end

  describe '#booking_confirmation' do
    let(:mail) { described_class.booking_confirmation(booking) }

    it 'renders the headers' do
      expect(mail.subject).to eq("Booking Confirmation - #{service.name}")
      expect(mail.to).to eq([customer_user.email])
      expect(mail.from).to eq(['noreply@marketplace.com'])
    end

    it 'renders the body' do
      expect(mail.body.encoded).to include(customer_user.full_name)
      expect(mail.body.encoded).to include(vendor.business_name)
      expect(mail.body.encoded).to include(service.name)
    end
  end
end
