# frozen_string_literal: true

# rubocop:disable-next Metrics/ClassLength
class BookingsController < ApiController
  include JsonResponse
  include AuthorizeAction
  include ResourceFinder
  include ParseParams
  include BookingManagement::PaginationHelper

  RESPOND_MESSAGES = {
    'accept' => 'Booking accepted successfully',
    'decline' => 'Booking declined',
    'complete' => 'Booking marked as completed',
    'counter_offer' => 'Counter offer sent'
  }.freeze

  before_action :authenticate_user!
  before_action :ensure_vendor!, only: %i[respond]
  before_action :set_booking, only: %i[show update destroy respond messages send_message]
  before_action :authorize_booking_access!, only: %i[show messages send_message]
  before_action :authorize_booking_modification!, only: %i[update destroy]
  before_action :authorize_vendor_response!, only: %i[respond]

  # GET /bookings
  def index
    bookings = bookings_scope
               .includes(
                 :customer,
                 :review,
                 :booking_messages,
                 service: :categories,
                 vendor: [:user, { portfolio_items: { images_attachments: :blob } }]
               )
               .order(created_at: :desc)
               .page(params[:page])
               .per(params[:per_page] || 20)

    render json: {
      bookings: BookingManagement::BookingPresenter.collection(bookings),
      pagination: pagination_meta(bookings)
    }
  end

  # GET /bookings/:id
  def show
    render json: {
      booking: BookingManagement::BookingPresenter.new(@booking).as_json(include_details: true)
    }
  end

  # POST /bookings
  def create
    result = Bookings::BookingCreationService.call(booking_params.merge(customer: current_user))

    if result[:success]
      render json: {
        booking: BookingManagement::BookingPresenter.new(result[:booking]).as_json,
        message: 'Booking created successfully'
      }, status: :created
    else
      render json: { errors: result[:errors], error: 'Failed to create booking' }, status: :unprocessable_content
    end
  end

  # PUT/PATCH /bookings/:id
  def update
    if @booking.update(booking_update_params)
      render json: { booking: BookingManagement::BookingPresenter.new(@booking).as_json }
    else
      render json: { errors: @booking.errors.full_messages }, status: :unprocessable_content
    end
  end

  # DELETE /bookings/:id
  def destroy
    unless @booking.can_be_cancelled?
      return render json: { error: 'Booking cannot be cancelled' }, status: :unprocessable_content
    end

    result = Bookings::UpdateBookingStatus.call(booking: @booking, new_status: 'cancelled')
    if result[:success]
      render json: { message: 'Booking cancelled successfully' }
    else
      render json: { error: result[:error] }, status: :unprocessable_content
    end
  end

  # POST /bookings/:id/respond
  def respond
    response_action = params[:response_action]
    unless Bookings::BookingResponseService::RESPONSE_STATUS.key?(response_action)
      return render json: { error: 'Invalid response action' }, status: :bad_request
    end

    result = Bookings::BookingResponseService.call(@booking, current_user, response_action, response_options)
    render_respond_result(result, response_action)
  end

  # GET /bookings/:id/messages
  def messages
    messages = @booking.booking_messages
                       .includes(:sender)
                       .ordered
                       .page(params[:page])
                       .per(params[:per_page] || 50)

    render json: {
      messages: messages.map { |message| BookingManagement::MessagePresenter.new(message).as_json },
      pagination: pagination_meta(messages)
    }
  end

  # POST /bookings/:id/send_message
  def send_message
    result = Bookings::SendMessage.call(
      booking: @booking,
      sender: current_user,
      message: params[:message]
    )

    if result[:success]
      render json: { message: BookingManagement::MessagePresenter.new(result[:message]).as_json }, status: :created
    else
      render json: { errors: result[:errors] }, status: :unprocessable_content
    end
  end

  # POST /bookings/check_availability
  def check_availability
    render json: Bookings::CheckAvailability.call(params)
  rescue ArgumentError
    render_bad_request('Invalid date or time format')
  end

  # POST /bookings/suggest_alternatives
  def suggest_alternatives
    render json: Bookings::SuggestAlternatives.call(params)
  rescue ArgumentError
    render_bad_request('Invalid date or time format')
  end

  private

  def bookings_scope
    Bookings::ScopeForUser.call(user: current_user)
  end

  def set_booking
    @booking = find_booking_for_user(params[:id])
  end

  def ensure_vendor!
    return if current_user.vendor?

    render json: { error: 'Access denied. Vendor account required.' }, status: :forbidden
  end

  def authorize_booking_access!
    return if performed? || @booking.nil?

    authorize_action?(@booking, :access)
  end

  def authorize_booking_modification!
    return if performed? || @booking.nil?

    authorize_action?(@booking, :modify)
  end

  def authorize_vendor_response!
    return if performed? || @booking.nil?

    authorize_action?(@booking, :vendor_respond)
  end

  def booking_params
    params.expect(
      booking: %i[service_id event_date event_end_date event_location
                  total_amount requirements special_instructions event_duration start_time]
    )
  end

  def booking_update_params
    params.expect(
      booking: %i[event_date event_end_date event_location
                  requirements special_instructions event_duration]
    )
  end

  def response_options
    {
      counter_amount: params[:counter_amount],
      counter_message: params[:counter_message]
    }
  end

  def render_respond_result(result, response_action)
    if result[:success]
      message = RESPOND_MESSAGES.fetch(response_action, "Booking #{response_action}ed successfully")
      render json: {
        booking: BookingManagement::BookingPresenter.new(result[:booking]).as_json,
        message: message
      }
    else
      render json: { errors: result[:errors] }, status: :unprocessable_content
    end
  end
end
