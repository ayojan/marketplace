# frozen_string_literal: true

class Mutations::CreateReview < Mutations::BaseMutation
  description 'Creates a new review for a booking'

  argument :review_input,
           Types::CreateReviewInput,
           required: true,
           description: 'Attributes for the review that will be created'

  field :errors, [String], null: false, description: 'Errors encountered during review creation'
  field :review, Types::ReviewType, null: true, description: 'The created review'

  def resolve(review_input:)
    user = context[:current_user]
    return { review: nil, errors: ['Authentication required'] } unless user
    return { review: nil, errors: ['Only customers can submit reviews'] } unless user.customer?

    booking = Booking.find_by(id: review_input.booking_id)
    return { review: nil, errors: ['Booking not found'] } unless booking
    return { review: nil, errors: ['You can only review your own bookings'] } unless booking.customer == user

    result = Reviews::CreateReview.call(**build_create_params(user, booking, review_input))
    format_result(result)
  end

  private

  def build_create_params(user, booking, review_input)
    {
      customer: user,
      booking: booking,
      service: booking.service,
      vendor_profile: booking.vendor_profile,
      rating: review_input.rating,
      quality_rating: review_input.quality_rating,
      communication_rating: review_input.communication_rating,
      value_rating: review_input.value_rating,
      punctuality_rating: review_input.punctuality_rating,
      comment: review_input.comment,
      status: review_input.status || 'published'
    }
  end

  def format_result(result)
    if result[:success]
      { review: result[:review], errors: [] }
    else
      { review: nil, errors: [result[:error]] }
    end
  end
end
