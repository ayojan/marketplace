# frozen_string_literal: true

# rubocop:disable-next Metrics/ClassLength
class ReviewsController < ApiController
  apply_rate_limit to: 10, within: 1.minute, only: :create, by: :user_or_ip,
                   message: 'Too many review requests. Please try again later.'

  before_action :authenticate_user!, except: %i[index service_reviews vendor_reviews]
  before_action :set_review, only: %i[update destroy]
  before_action :ensure_customer, only: [:create]
  before_action :ensure_owner, only: %i[update destroy]

  # GET /api/reviews
  def index
    @reviews = Review.published.recent.includes(:customer, :service, :vendor)
    render json: { reviews: ReviewSerializer.render_as_hash(@reviews) }
  end

  # GET /api/services/:service_id/reviews
  def service_reviews
    @reviews = Review.published.where(service_id: params[:service_id]).recent.includes(:customer)
    render json: { reviews: ReviewSerializer.render_as_hash(@reviews) }
  end

  # GET /api/vendors/:vendor_id/reviews or /vendors/:id/reviews
  def vendor_reviews
    vendor_id = params[:vendor_id] || params[:id]
    vendor = Vendor.find_by_id_or_slug(vendor_id)
    return render json: { error: 'Vendor not found' }, status: :not_found unless vendor

    @reviews = Review.published.where(vendor_id: vendor.id).recent.includes(:customer, :service)
    render json: {
      reviews: ReviewSerializer.render_as_hash(@reviews),
      average_rating: vendor.average_rating,
      total_reviews: vendor.total_reviews
    }
  end

  # POST /api/reviews
  def create
    @booking = Booking.find(review_params[:booking_id])

    unless @booking.customer == current_user
      return render json: { error: 'You can only review your own bookings' }, status: :forbidden
    end

    result = Reviews::CreateReview.call(**build_create_review_params(@booking))

    if result[:success]
      render json: {
        message: 'Review submitted successfully',
        review: ReviewSerializer.render_as_hash(result[:review])
      }, status: :created
    else
      render json: { error: 'Review submission failed', details: Array.wrap(result[:error]) },
             status: :unprocessable_content
    end
  end

  # PATCH/PUT /api/reviews/:id
  def update
    if @review.update(review_update_params)
      render json: { message: 'Review updated successfully', review: ReviewSerializer.render_as_hash(@review) }
    else
      render json: { error: 'Review update failed', details: @review.errors.full_messages },
             status: :unprocessable_content
    end
  end

  # DELETE /api/reviews/:id
  def destroy
    @review.destroy
    render json: { message: 'Review deleted successfully' }
  end

  # POST /api/reviews/:id/vote
  def vote
    @review = Review.find(params.expect(:id))
    existing_vote = ReviewVote.find_by(review_id: @review.id, voter_id: current_user.id)

    if existing_vote
      existing_vote.destroy
      # rubocop:disable-next Rails/SkipsModelValidations
      Review.where(id: @review.id).where('helpful_votes > 0').update_all('helpful_votes = helpful_votes - 1')
      @review.reload
      render json: { message: 'Vote removed', helpful_votes: @review.helpful_votes, voted: false }
    else
      result = Reviews::VoteHelpful.call(review: @review, voter: current_user)
      if result[:success]
        render json: { message: 'Review marked as helpful', helpful_votes: result[:helpful_votes], voted: true }
      else
        render json: { error: result[:error] }, status: :unprocessable_content
      end
    end
  end

  # POST /api/reviews/:id/respond
  def respond
    @review = Review.find(params.expect(:id))
    response_text = params[:vendor_response] || params.dig(:review, :vendor_response)
    return render json: { error: 'Response text is required' }, status: :bad_request if response_text.blank?

    result = Reviews::RespondToReview.call(
      review: @review,
      vendor: current_user,
      response: response_text
    )

    if result[:success]
      render json: { message: 'Response saved', review: ReviewSerializer.render_as_hash(result[:review]) }
    else
      render json: { error: 'Failed to save response', details: Array.wrap(result[:error]) },
             status: :unprocessable_content
    end
  end

  private

  def set_review
    @review = Review.find(params.expect(:id))
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Review not found' }, status: :not_found
  end

  def ensure_customer
    return if current_user.customer?

    render json: { error: 'Only customers can submit reviews' }, status: :forbidden
  end

  def ensure_owner
    return if @review.customer == current_user

    render json: { error: 'You can only manage your own reviews' }, status: :forbidden
  end

  def review_params
    params.expect(review: %i[booking_id rating quality_rating communication_rating value_rating
                             punctuality_rating comment])
  end

  def review_update_params
    params.expect(review: %i[rating quality_rating communication_rating value_rating punctuality_rating
                             comment])
  end

  def build_create_review_params(booking)
    {
      customer: current_user,
      booking: booking,
      service: booking.service,
      vendor: booking.vendor,
      rating: review_params[:rating].to_i,
      quality_rating: review_params[:quality_rating]&.to_i,
      communication_rating: review_params[:communication_rating]&.to_i,
      value_rating: review_params[:value_rating]&.to_i,
      punctuality_rating: review_params[:punctuality_rating]&.to_i,
      comment: review_params[:comment],
      photos: Array.wrap(params[:photos]).compact
    }
  end
end
