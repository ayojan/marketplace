# frozen_string_literal: true

module BookingManagement::AvailabilitySlotActions
  extend ActiveSupport::Concern
  include BookingManagement::PaginationHelper

  def index
    slots = AvailabilitySlots::FilterForVendor.call(
      vendor: current_user.vendor,
      start_date: params[:start_date],
      end_date: params[:end_date],
      date: params[:date]
    ).order(:date, :start_time)
                                              .page(params[:page])
                                              .per(params[:per_page] || 50)

    render json: {
      availability_slots: slots.map { |slot| BookingManagement::AvailabilitySlotPresenter.new(slot).as_json },
      pagination: pagination_meta(slots)
    }
  end

  def show
    render json: { availability_slot: BookingManagement::AvailabilitySlotPresenter.new(@slot).as_json }
  end

  def create
    @slot = current_user.vendor.availability_slots.build(availability_slot_params)
    if @slot.save
      render json: { availability_slot: BookingManagement::AvailabilitySlotPresenter.new(@slot).as_json },
             status: :created
    else
      render json: { errors: @slot.errors.full_messages }, status: :unprocessable_content
    end
  end

  def update
    if @slot.update(availability_slot_params)
      render json: { availability_slot: BookingManagement::AvailabilitySlotPresenter.new(@slot).as_json }
    else
      render json: { errors: @slot.errors.full_messages }, status: :unprocessable_content
    end
  end

  def destroy
    if @slot.booking_conflict?
      render json: { error: 'Cannot delete availability slot with existing bookings' }, status: :unprocessable_content
    else
      @slot.destroy
      render json: { message: 'Availability slot deleted successfully' }
    end
  end

  private

  def set_availability_slot
    @slot = current_user.vendor.availability_slots.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Availability slot not found' }, status: :not_found
  end

  def availability_slot_params
    params.expect(availability_slot: %i[date start_time end_time is_available])
  end
end
