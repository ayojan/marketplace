# frozen_string_literal: true

# == Schema Information
#
# Table name: reviews
#
#  id                   :bigint           not null, primary key
#  comment              :text
#  communication_rating :integer
#  helpful_votes        :integer          default(0), not null
#  punctuality_rating   :integer
#  quality_rating       :integer
#  rating               :integer          not null
#  status               :string           default("published")
#  value_rating         :integer
#  vendor_responded_at  :datetime
#  vendor_response      :text
#  created_at           :datetime         not null
#  updated_at           :datetime         not null
#  booking_id           :bigint           not null
#  customer_id          :bigint           not null
#  service_id           :bigint           not null
#  vendor_id            :bigint           not null
#
# Indexes
#
#  index_reviews_helpful_by_vendor_and_status          (vendor_id,status,helpful_votes DESC)
#  index_reviews_on_booking_id                         (booking_id) UNIQUE
#  index_reviews_on_customer_id                        (customer_id)
#  index_reviews_on_rating                             (rating)
#  index_reviews_on_service_id                         (service_id)
#  index_reviews_on_service_id_and_status              (service_id,status)
#  index_reviews_on_status                             (status)
#  index_reviews_on_vendor_id                          (vendor_id)
#  index_reviews_on_vendor_id_and_helpful_votes        (vendor_id,helpful_votes DESC)
#  index_reviews_on_vendor_id_and_status               (vendor_id,status)
#  index_reviews_on_vendor_id_and_vendor_responded_at  (vendor_id,vendor_responded_at)
#
# Foreign Keys
#
#  fk_rails_...  (booking_id => bookings.id)
#  fk_rails_...  (customer_id => users.id)
#  fk_rails_...  (service_id => services.id)
#  fk_rails_...  (vendor_id => vendors.id)
#
require 'rails_helper'

RSpec.describe Review do
  let(:vendor_user) { create(:user, :vendor) }
  let(:customer) { create(:user, :customer) }
  let(:service) { create(:service, vendor: vendor_user.vendor) }
  let(:booking) do
    create(:booking, vendor: vendor_user.vendor, customer: customer, service: service,
                     status: :completed)
  end

  describe 'associations' do
    it { is_expected.to belong_to(:booking) }
    it { is_expected.to belong_to(:customer) }
    it { is_expected.to belong_to(:vendor) }
    it { is_expected.to belong_to(:service) }
    it { is_expected.to have_many(:votes).class_name('ReviewVote') }
    it { is_expected.to have_many(:voters).through(:votes).source(:voter) }
  end

  describe 'enums' do
    subject(:review) { described_class.new }

    it {
      expect(review).to define_enum_for(:status)
        .with_values(published: 'published', hidden: 'hidden')
        .backed_by_column_of_type(:string)
    }
  end

  describe 'validations' do
    subject { build(:review, booking: booking, customer: customer, vendor: vendor_user.vendor, service: service) }

    it { is_expected.to validate_presence_of(:rating) }
    it { is_expected.to validate_inclusion_of(:rating).in_range(1..5) }

    it 'validates vendor_response is max 1000 chars' do
      review = build(:review, booking: booking, customer: customer, vendor: vendor_user.vendor, service: service,
                              vendor_response: 'a' * 1001)
      expect(review).not_to be_valid
      expect(review.errors[:vendor_response]).to be_present
    end

    it 'validates vendor_response and vendor_responded_at are both present or both absent' do
      review = build(:review, booking: booking, customer: customer, vendor: vendor_user.vendor, service: service,
                              vendor_response: 'test', vendor_responded_at: nil)
      expect(review).not_to be_valid

      review = build(:review, booking: booking, customer: customer, vendor: vendor_user.vendor,
                              service: service, vendor_response: nil,
                              vendor_responded_at: Time.current)
      expect(review).not_to be_valid

      review = build(:review, booking: booking, customer: customer, vendor: vendor_user.vendor,
                              service: service, vendor_response: 'test',
                              vendor_responded_at: Time.current)
      expect(review).to be_valid
    end

    it 'validates helpful_votes is non-negative' do
      review = build(:review, booking: booking, customer: customer, vendor: vendor_user.vendor, service: service,
                              helpful_votes: -1)
      expect(review).not_to be_valid
    end
  end

  describe 'verified_purchase?' do
    it 'returns true when booking is present' do
      review = create(:review, booking: booking, customer: customer, vendor: vendor_user.vendor, service: service)
      expect(review.verified_purchase?).to be true
    end

    it 'returns false when booking is not present' do
      review = build(:review, booking: nil, customer: customer, vendor: vendor_user.vendor,
                              service: service)
      expect(review.verified_purchase?).to be false
    end
  end

  describe 'photos' do
    it 'supports attaching photos' do
      review = create(:review, booking: booking, customer: customer, vendor: vendor_user.vendor, service: service)
      expect(review.photos).to be_a(ActiveStorage::Attached::Many)
    end
  end
end
