# frozen_string_literal: true

module BookingManagement::BookingActionHelpers
  extend ActiveSupport::Concern
  include JsonResponse
  include AuthorizeAction
  include ResourceFinder
  include ParseParams
  include BookingManagement::PaginationHelper

  private

  # Get bookings scope for current user (uses domain service)
  def bookings_scope
    Bookings::ScopeForUser.call(user: current_user)
  end

  # Authorize access and render error if unauthorized
  def booking_access_authorized?
    authorize_action?(@booking, :access)
  end

  # Authorize modification and render error if unauthorized
  def booking_modification_authorized?
    authorize_action?(@booking, :modify)
  end

  # Authorize vendor response and render error if unauthorized
  def vendor_response_authorized?
    authorize_action?(@booking, :vendor_respond)
  end

  # Set booking from params[:id]
  def set_booking
    @booking = find_booking_for_user(params[:id])
  end

  # OLD HELPERS (Deprecated - kept for backwards compatibility)
  # These should be replaced with new form objects and domain services

  def build_availability_checker
    Rails.logger.warn 'build_availability_checker is deprecated, use domain services instead'
    service = Service.find(params[:service_id])
    AvailabilityCheckerService.new(
      vendor_profile: service.vendor_profile,
      date: Date.parse(params[:date]),
      start_time: params[:start_time],
      end_time: params[:end_time]
    )
  end

  def build_conflict_resolver
    Rails.logger.warn 'build_conflict_resolver is deprecated, use domain services instead'
    # Validate date format explicitly since DateTime.parse is very lenient
    Date.parse(params[:date])
    vendor_profile = if params[:vendor_profile_id]
                       VendorProfile.find(params[:vendor_profile_id])
                     elsif params[:vendor_id]
                       User.find(params[:vendor_id]).vendor_profile
                     end
    ConflictResolutionService.new(
      vendor_profile: vendor_profile,
      event_date: DateTime.parse("#{params[:date]} #{params[:start_time]}"),
      event_end_date: DateTime.parse("#{params[:date]} #{params[:end_time]}")
    )
  end

  def invalid_datetime_response
    render_bad_request('Invalid date or time format')
  end

  # Use parse_booking_create_params instead
  def booking_params
    params.expect(
      booking: %i[service_id event_date event_end_date event_location
                  total_amount requirements special_instructions event_duration start_time]
    )
  end

  # Use parse_booking_update_params instead
  def booking_update_params
    params.expect(
      booking: %i[event_date event_end_date event_location
                  requirements special_instructions event_duration]
    )
  end
end

module BookingManagement::ListingActions
  extend ActiveSupport::Concern

  included do
    before_action :set_booking, only: %i[show]
  end

  def index
    bookings = bookings_scope
               .includes(:customer, :vendor_profile, :service, :booking_messages)
               .order(created_at: :desc)
               .page(params[:page])
               .per(params[:per_page] || 20)

    render json: {
      bookings: BookingManagement::BookingPresenter.collection(bookings),
      pagination: pagination_meta(bookings)
    }
  end

  def show
    return unless booking_access_authorized?

    render json: { booking: BookingManagement::BookingPresenter.new(@booking).as_json(include_details: true) }
  end
end

module BookingManagement::ModificationActions
  extend ActiveSupport::Concern

  included do
    before_action :set_booking, only: %i[update destroy respond]
  end

  def create
    service = BookingCreationService.new(booking_params.merge(customer: current_user))
    result = service.call
    if result[:success]
      render json: {
        booking: BookingManagement::BookingPresenter.new(result[:booking]).as_json,
        message: 'Booking created successfully'
      }, status: :created
    else
      render json: {
        errors: result[:errors],
        error: 'Failed to create booking'
      }, status: :unprocessable_content
    end
  end

  def update
    return unless booking_modification_authorized?

    if @booking.update(booking_update_params)
      render json: { booking: BookingManagement::BookingPresenter.new(@booking).as_json }
    else
      render json: { errors: @booking.errors.full_messages }, status: :unprocessable_content
    end
  end

  def destroy
    return unless booking_modification_authorized?

    if @booking.can_be_cancelled?
      @booking.update!(status: :cancelled)
      render json: { message: 'Booking cancelled successfully' }
    else
      render json: { error: 'Booking cannot be cancelled' }, status: :unprocessable_content
    end
  end

  def respond
    return unless vendor_response_authorized?

    response_action = params[:response_action]
    unless BookingResponseService::RESPONSE_STATUS.key?(response_action)
      return render json: { error: 'Invalid response action' }, status: :bad_request
    end

    options = {
      counter_amount: params[:counter_amount],
      counter_message: params[:counter_message]
    }
    result = BookingResponseService.call(@booking, current_user, response_action, options)

    if result[:success]
      message = case response_action
                when 'accept'
                  'Booking accepted successfully'
                when 'decline'
                  'Booking declined'
                when 'counter_offer'
                  'Counter offer sent'
                else
                  "Booking #{response_action}ed successfully"
                end
      render json: {
        booking: BookingManagement::BookingPresenter.new(result[:booking]).as_json,
        message: message
      }
    else
      render json: { errors: result[:errors] }, status: :unprocessable_content
    end
  end
end

module BookingManagement::CommunicationActions
  extend ActiveSupport::Concern

  included do
    before_action :set_booking, only: %i[messages send_message]
  end

  def messages
    return unless booking_access_authorized?

    @messages = @booking.booking_messages
                        .includes(:sender)
                        .ordered
                        .page(params[:page])
                        .per(params[:per_page] || 50)

    render json: {
      messages: @messages.map { |message| BookingManagement::MessagePresenter.new(message).as_json },
      pagination: pagination_meta(@messages)
    }
  end

  def send_message
    return unless booking_access_authorized?

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
end

module BookingManagement::AvailabilityActions
  def check_availability
    parsed_date = Date.parse(params[:date])
    if parsed_date < Date.current
      return render json: {
        available: false,
        message: 'Cannot book a date in the past',
        errors: ['Booking date cannot be in the past']
      }
    end

    if parsed_date == Date.current && params[:start_time].present?
      requested_time = begin
        Time.zone.parse("#{parsed_date} #{params[:start_time]}")
      rescue StandardError
        nil
      end
      if requested_time && requested_time <= Time.current
        return render json: {
          available: false,
          message: 'Cannot book a time slot in the past',
          errors: ['Booking time slot has already passed']
        }
      end
    end

    availability_checker = build_availability_checker
    is_available = availability_checker.available?

    if is_available
      render json: { available: true, message: 'Time slot is available' }
    else
      render json: {
        available: false,
        message: 'Time slot is not available',
        suggested_times: availability_checker.suggested_times
      }
    end
  rescue ArgumentError
    invalid_datetime_response
  end

  def suggest_alternatives
    parsed_date = Date.parse(params[:date])
    if parsed_date < Date.current
      return render json: {
        has_conflict: true,
        message: 'Cannot suggest alternatives for a past date',
        alternative_times: []
      }
    end

    conflict_resolver = build_conflict_resolver

    render json: {
      has_conflict: conflict_resolver.conflict?,
      alternative_times: conflict_resolver.suggest_alternative_times
    }
  rescue ArgumentError
    invalid_datetime_response
  end
end

module BookingManagement::BookingActions
  extend ActiveSupport::Concern
  include BookingManagement::BookingActionHelpers
  include BookingManagement::ListingActions
  include BookingManagement::ModificationActions
  include BookingManagement::CommunicationActions
  include BookingManagement::AvailabilityActions
end
