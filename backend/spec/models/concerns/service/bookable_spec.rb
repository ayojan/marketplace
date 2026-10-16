# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Service::Bookable do
  subject(:service) { build(:service) }

  describe 'enum' do
    it {
      expect(service).to define_enum_for(:status)
        .with_values(draft: 'draft', active: 'active', inactive: 'inactive', archived: 'archived')
        .backed_by_column_of_type(:string)
    }
  end

  describe 'validations' do
    it { is_expected.to validate_presence_of(:status) }
  end

  describe 'scopes' do
    let!(:active_svc) { create(:service, status: :active) }
    let!(:draft_svc) { create(:service, status: :draft) }
    let!(:inactive_svc) { create(:service, status: :inactive) }
    let!(:archived_svc) { create(:service, status: :archived) }

    it 'filters by status correctly' do
      expect(Service.active).to contain_exactly(active_svc)
      expect(Service.draft).to contain_exactly(draft_svc)
      expect(Service.inactive).to contain_exactly(inactive_svc)
      expect(Service.archived).to contain_exactly(archived_svc)
    end
  end

  describe 'predicate methods' do
    it 'returns correct boolean according to status' do
      service.status = :active
      expect(service.active?).to be true
      expect(service.draft?).to be false
      expect(service.inactive?).to be false
      expect(service.archived?).to be false

      service.status = :draft
      expect(service.draft?).to be true

      service.status = :inactive
      expect(service.inactive?).to be true

      service.status = :archived
      expect(service.archived?).to be true
    end
  end

  describe '#can_be_booked?' do
    it 'returns true when active with a vendor' do
      service.status = :active
      expect(service.can_be_booked?).to be true
    end

    it 'returns false when inactive' do
      service.status = :inactive
      expect(service.can_be_booked?).to be false
    end

    it 'returns false when active without vendor' do
      service.status = :active
      service.vendor = nil
      expect(service.can_be_booked?).to be false
    end
  end

  describe '.available_statuses' do
    it 'returns humanized status pairs' do
      expect(Service.available_statuses).to eq(
        [%w[Draft draft], %w[Active active], %w[Inactive inactive], %w[Archived archived]]
      )
    end
  end
end
