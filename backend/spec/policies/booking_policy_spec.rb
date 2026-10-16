# frozen_string_literal: true

require 'rails_helper'

RSpec.describe BookingPolicy do
  subject { described_class.new(user, booking) }

  let(:vendor_user) { create(:user, :vendor) }
  let(:vendor) { vendor_user.vendor }
  let(:customer) { create(:user, :customer) }
  let(:other_customer) { create(:user, :customer) }
  let(:service) { create(:service, vendor: vendor) }
  let(:booking) do
    create(:booking,
           vendor: vendor,
           customer: customer,
           service: service,
           status: :pending,
           event_date: 48.hours.from_now)
  end

  describe '#show?' do
    context 'when user is the customer' do
      let(:user) { customer }

      it { is_expected.to permit(:show) }
    end

    context 'when user is the vendor' do
      let(:user) { vendor_user }

      it { is_expected.not_to permit(:show) }
    end

    context 'when user is another customer' do
      let(:user) { other_customer }

      it { is_expected.not_to permit(:show) }
    end
  end

  describe '#vendor_view?' do
    context 'when user is the vendor' do
      let(:user) { vendor_user }

      it { is_expected.to permit(:vendor_view) }
    end

    context 'when user is the customer' do
      let(:user) { customer }

      it { is_expected.not_to permit(:vendor_view) }
    end

    context 'when user is another vendor' do
      let(:other_vendor) { create(:user, :vendor) }
      let(:user) { other_vendor }

      it { is_expected.not_to permit(:vendor_view) }
    end
  end

  describe '#update?' do
    context 'when booking can be modified' do
      let(:user) { customer }

      it { is_expected.to permit(:update) }
    end

    context 'when event is within 24 hours' do
      let(:user) { customer }
      let(:booking) do
        create(:booking,
               vendor: vendor,
               customer: customer,
               service: service,
               status: :pending,
               event_date: 12.hours.from_now)
      end

      it { is_expected.not_to permit(:update) }
    end

    context 'when user is not the customer' do
      let(:user) { vendor_user }

      it { is_expected.not_to permit(:update) }
    end
  end

  describe '#cancel?' do
    context 'when booking can be cancelled' do
      let(:user) { customer }

      it { is_expected.to permit(:cancel) }
    end

    context 'when event is within 24 hours' do
      let(:user) { customer }
      let(:booking) do
        create(:booking,
               vendor: vendor,
               customer: customer,
               service: service,
               status: :pending,
               event_date: 12.hours.from_now)
      end

      it { is_expected.not_to permit(:cancel) }
    end

    context 'when user is not the customer' do
      let(:user) { vendor_user }

      it { is_expected.not_to permit(:cancel) }
    end
  end

  describe '#accept?' do
    context 'when booking is pending' do
      let(:user) { vendor_user }

      it { is_expected.to permit(:accept) }
    end

    context 'when booking is not pending' do
      let(:user) { vendor_user }
      let(:booking) do
        create(:booking, vendor: vendor, customer: customer, service: service, status: :completed)
      end

      it { is_expected.not_to permit(:accept) }
    end

    context 'when user is not the vendor' do
      let(:user) { customer }

      it { is_expected.not_to permit(:accept) }
    end
  end

  describe '#send_message?' do
    context 'when user is the customer' do
      let(:user) { customer }

      it { is_expected.to permit(:send_message) }
    end

    context 'when user is the vendor' do
      let(:user) { vendor_user }

      it { is_expected.to permit(:send_message) }
    end

    context 'when user is another customer' do
      let(:user) { other_customer }

      it { is_expected.not_to permit(:send_message) }
    end
  end
end
