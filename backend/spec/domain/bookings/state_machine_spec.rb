# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Bookings::StateMachine do
  let(:customer) { create(:user, :customer) }
  let(:vendor_user) { create(:user, :vendor) }
  let(:vendor) { vendor_user.vendor }
  let(:service) { create(:service, vendor: vendor) }
  let(:booking) do
    create(:booking,
           customer: customer,
           vendor: vendor,
           service: service,
           event_date: 2.days.from_now,
           status: :pending)
  end

  describe '.valid_transition?' do
    it 'allows pending -> accepted' do
      expect(described_class.valid_transition?(:pending, :accepted)).to be true
    end

    it 'allows pending -> declined' do
      expect(described_class.valid_transition?(:pending, :declined)).to be true
    end

    it 'allows pending -> cancelled' do
      expect(described_class.valid_transition?(:pending, :cancelled)).to be true
    end

    it 'allows accepted -> completed' do
      expect(described_class.valid_transition?(:accepted, :completed)).to be true
    end

    it 'allows accepted -> cancelled' do
      expect(described_class.valid_transition?(:accepted, :cancelled)).to be true
    end

    it 'does not allow pending -> completed' do
      expect(described_class.valid_transition?(:pending, :completed)).to be false
    end

    it 'does not allow declined -> anything' do
      expect(described_class.valid_transition?(:declined, :accepted)).to be false
    end

    it 'does not allow completed -> anything' do
      expect(described_class.valid_transition?(:completed, :cancelled)).to be false
    end
  end

  describe '.can_transition?' do
    context 'with valid transition and conditions' do
      it 'allows cancellation when > 24 hours away' do
        expect(described_class.can_transition?(booking, :cancelled)).to be true
      end

      it 'allows other transitions' do
        expect(described_class.can_transition?(booking, :accepted)).to be true
      end
    end

    context 'with invalid conditions' do
      it 'prevents cancellation when < 24 hours away' do
        booking.update(event_date: 12.hours.from_now)
        expect(described_class.can_transition?(booking, :cancelled)).to be false
      end

      it 'prevents completion of pending booking without acceptance' do
        expect(described_class.can_transition?(booking, :completed)).to be false # pending can complete
      end
    end

    context 'with invalid transition' do
      it 'prevents declined -> accepted' do
        booking.update(status: :declined)
        expect(described_class.can_transition?(booking, :accepted)).to be false
      end

      it 'prevents completed -> any' do
        booking.update(status: :completed)
        expect(described_class.can_transition?(booking, :cancelled)).to be false
      end
    end
  end

  describe '.available_transitions_for' do
    it 'returns allowed transitions for pending' do
      transitions = described_class.available_transitions_for(:pending)
      expect(transitions).to include(:accepted, :declined, :counter_offered, :cancelled)
    end

    it 'returns allowed transitions for accepted' do
      transitions = described_class.available_transitions_for(:accepted)
      expect(transitions).to include(:completed, :cancelled)
      expect(transitions).not_to include(:declined)
    end

    it 'returns no transitions for declined' do
      transitions = described_class.available_transitions_for(:declined)
      expect(transitions).to be_empty
    end

    it 'returns no transitions for completed' do
      transitions = described_class.available_transitions_for(:completed)
      expect(transitions).to be_empty
    end
  end
end
