# frozen_string_literal: true

require 'rails_helper'

RSpec.describe VendorPolicy do
  subject { described_class.new(user, vendor) }

  let(:vendor_user) { build_stubbed(:user, :vendor) }
  let(:vendor) { build_stubbed(:vendor, user: vendor_user) }
  let(:other_vendor) { build_stubbed(:user, :vendor) }
  let(:admin_user) { build_stubbed(:user, :admin) }
  let(:customer) { build_stubbed(:user, :customer) }

  describe '#show?' do
    context 'when user is authenticated' do
      let(:user) { customer }

      it { is_expected.to permit(:show) }
    end

    context 'when user is not authenticated' do
      let(:user) { nil }

      it { is_expected.to permit(:show) }
    end
  end

  describe '#update?' do
    context 'when vendor updates own profile' do
      let(:user) { vendor_user }

      it { is_expected.to permit(:update) }
    end

    context 'when vendor updates another vendor profile' do
      let(:user) { other_vendor }

      it { is_expected.not_to permit(:update) }
    end

    context 'when customer attempts to update' do
      let(:user) { customer }

      it { is_expected.not_to permit(:update) }
    end

    context 'when admin attempts to update' do
      let(:user) { admin_user }

      it { is_expected.not_to permit(:update) }
    end
  end

  describe '#request_verification?' do
    context 'when vendor requests own verification' do
      let(:user) { vendor_user }

      it { is_expected.to permit(:request_verification) }
    end

    context 'when vendor requests another vendor verification' do
      let(:user) { other_vendor }

      it { is_expected.not_to permit(:request_verification) }
    end

    context 'when customer attempts to request' do
      let(:user) { customer }

      it { is_expected.not_to permit(:request_verification) }
    end
  end

  describe '#approve_verification?' do
    context 'when admin approves' do
      let(:user) { admin_user }

      it { is_expected.to permit(:approve_verification) }
    end

    context 'when vendor attempts to approve' do
      let(:user) { vendor_user }

      it { is_expected.not_to permit(:approve_verification) }
    end

    context 'when customer attempts to approve' do
      let(:user) { customer }

      it { is_expected.not_to permit(:approve_verification) }
    end
  end

  describe '#reject_verification?' do
    context 'when admin rejects' do
      let(:user) { admin_user }

      it { is_expected.to permit(:reject_verification) }
    end

    context 'when vendor attempts to reject' do
      let(:user) { vendor_user }

      it { is_expected.not_to permit(:reject_verification) }
    end
  end

  describe '#view_analytics?' do
    context 'when vendor views own analytics' do
      let(:user) { vendor_user }

      it { is_expected.to permit(:view_analytics) }
    end

    context 'when vendor views another vendor analytics' do
      let(:user) { other_vendor }

      it { is_expected.not_to permit(:view_analytics) }
    end

    context 'when customer views any analytics' do
      let(:user) { customer }

      it { is_expected.not_to permit(:view_analytics) }
    end
  end

  describe '#toggle_favorite?' do
    context 'when customer toggles favorite on vendor' do
      let(:user) { customer }

      it { is_expected.to permit(:toggle_favorite) }
    end

    context 'when vendor toggles favorite on another vendor' do
      let(:user) { other_vendor }

      it { is_expected.to permit(:toggle_favorite) }
    end

    context 'when vendor toggles favorite on own profile' do
      let(:user) { vendor_user }

      it { is_expected.not_to permit(:toggle_favorite) }
    end
  end
end
