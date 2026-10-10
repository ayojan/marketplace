# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ReviewPolicy do
  subject { described_class.new(user, review) }

  let(:vendor_user) { create(:user, :vendor) }
  let(:vendor_profile) { vendor_user.vendor_profile }
  let(:customer) { create(:user, :customer) }
  let(:other_user) { create(:user, :customer) }
  let(:service) { create(:service, vendor_profile: vendor_profile) }
  let(:booking) do
    create(:booking, vendor_profile: vendor_profile, customer: customer, service: service, status: :completed)
  end
  let(:review) do
    create(:review, booking: booking, vendor_profile: vendor_profile, customer: customer, service: service)
  end

  describe '#respond?' do
    context 'when vendor owns the service' do
      let(:user) { vendor_user }

      it { is_expected.to permit(:respond) }
    end

    context 'when vendor does not own the service' do
      let(:other_vendor) { create(:user, :vendor) }
      let(:user) { other_vendor }

      it { is_expected.not_to permit(:respond) }
    end

    context 'when user is a customer' do
      let(:user) { customer }

      it { is_expected.not_to permit(:respond) }
    end

    context 'when user is not authenticated' do
      let(:user) { nil }

      it { is_expected.not_to permit(:respond) }
    end
  end

  describe '#vote_helpful?' do
    context 'when user is the reviewer' do
      let(:user) { customer }

      it { is_expected.not_to permit(:vote_helpful) }
    end

    context 'when user is not the reviewer' do
      let(:user) { other_user }

      it { is_expected.to permit(:vote_helpful) }
    end

    context 'when user is the vendor' do
      let(:user) { vendor_user }

      it { is_expected.not_to permit(:vote_helpful) }
    end

    context 'when user is not authenticated' do
      let(:user) { nil }

      it { is_expected.not_to permit(:vote_helpful) }
    end
  end

  describe '#view?' do
    context 'when user is the reviewer' do
      let(:user) { customer }

      it { is_expected.to permit(:view) }
    end

    context 'when user is the vendor' do
      let(:user) { vendor_user }

      it { is_expected.to permit(:view) }
    end

    context 'when user is an unrelated user' do
      let(:user) { other_user }

      it { is_expected.not_to permit(:view) }
    end
  end
end
