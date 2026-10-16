# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Reviews::CreateReview do
  let(:vendor_user) { create(:user, :vendor) }
  let(:vendor) { vendor_user.vendor }
  let(:customer) { create(:user, :customer) }
  let(:service) { create(:service, vendor: vendor) }
  let(:booking) do
    create(:booking, vendor: vendor, customer: customer, service: service, status: :completed)
  end

  let(:valid_params) do
    {
      customer: customer,
      booking: booking,
      service: service,
      vendor: vendor,
      rating: 4,
      quality_rating: 4,
      communication_rating: 5,
      value_rating: 3,
      punctuality_rating: 5,
      comment: 'Great service!',
      status: 'published'
    }
  end

  describe '.call' do
    context 'with valid review data' do
      it 'creates a review record' do
        expect do
          described_class.call(**valid_params)
        end.to change(Review, :count).by(1)
      end

      it 'returns success response with review' do
        result = described_class.call(**valid_params)
        expect(result[:success]).to be true
        expect(result[:review]).to be_a(Review)
        expect(result[:review].rating).to eq(4)
      end

      it 'creates review with correct attributes' do
        result = described_class.call(**valid_params)
        review = result[:review]

        expect(review).to have_attributes(
          customer_id: customer.id,
          booking_id: booking.id,
          service_id: service.id,
          vendor_id: vendor.id,
          rating: 4,
          quality_rating: 4,
          communication_rating: 5,
          value_rating: 3,
          punctuality_rating: 5,
          comment: 'Great service!',
          status: 'published'
        )
      end
    end

    context 'with invalid review data' do
      it 'returns failure for invalid rating' do
        result = described_class.call(**valid_params, rating: 10)
        expect(result[:success]).to be false
        expect(result[:error]).to include('Rating')
      end

      it 'returns failure for duplicate booking review' do
        # Create first review
        described_class.call(**valid_params)

        # Try to create second review for same booking
        result = described_class.call(**valid_params)
        expect(result[:success]).to be false
        expect(result[:error]).to match(/already.*reviewed/i)
      end
    end

    context 'with explicit orchestration (side effects)' do
      it 'updates vendor rating stats' do
        allow(vendor).to receive(:update_rating_stats!)

        described_class.call(**valid_params)

        expect(vendor).to have_received(:update_rating_stats!)
      end

      it 'updates service rating stats' do
        allow(service).to receive(:update_rating_stats!)

        described_class.call(**valid_params)

        expect(service).to have_received(:update_rating_stats!)
      end

      it 'sends notification when review is published' do
        allow(Notifications::SendReviewNotification).to receive(:call)

        described_class.call(**valid_params, status: 'published')

        expect(Notifications::SendReviewNotification).to have_received(:call)
      end

      it 'does not send notification when review is hidden' do
        allow(Notifications::SendReviewNotification).to receive(:call)

        described_class.call(**valid_params, status: 'hidden')

        expect(Notifications::SendReviewNotification).not_to have_received(:call)
      end

      it 'continues if rating stats update fails' do
        allow(vendor).to receive(:update_rating_stats!).and_raise(StandardError, 'Stats error')

        expect do
          result = described_class.call(**valid_params)
          expect(result[:success]).to be true
        end.not_to raise_error
      end

      it 'continues if notification fails' do
        allow(Notifications::SendReviewNotification).to receive(:call).and_raise(StandardError, 'Notification error')

        expect do
          result = described_class.call(**valid_params)
          expect(result[:success]).to be true
        end.not_to raise_error
      end
    end

    context 'with photos' do
      it 'attaches photos to review' do
        photo1 = fixture_file_upload('test_image.jpg', 'image/jpeg')
        photo2 = fixture_file_upload('test_image.jpg', 'image/jpeg')

        result = described_class.call(**valid_params, photos: [photo1, photo2])
        review = result[:review]

        expect(review.photos.count).to eq(2)
      end

      it 'continues if photo attachment fails' do
        allow_any_instance_of(ActiveStorage::Attached::Many).to receive(:attach).and_raise(StandardError, 'Photo error') # rubocop:disable RSpec/AnyInstance

        expect do
          photo = fixture_file_upload('test_image.jpg', 'image/jpeg')
          result = described_class.call(**valid_params, photos: [photo])
          expect(result[:success]).to be true
        end.not_to raise_error
      end
    end
  end
end
