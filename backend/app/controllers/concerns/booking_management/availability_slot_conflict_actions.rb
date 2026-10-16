# frozen_string_literal: true

module BookingManagement::AvailabilitySlotConflictActions
  extend ActiveSupport::Concern

  def check_conflicts
    date, start_time, end_time, exclude_id = conflict_params
    unless date && start_time && end_time
      render json: { error: 'Missing required parameters' }, status: :bad_request
      return
    end

    result = AvailabilitySlots::CheckConflicts.call(
      vendor: current_user.vendor,
      date: date,
      start_time: start_time,
      end_time: end_time,
      exclude_id: exclude_id
    )

    render_conflict_response(result)
  end

  private

  def render_conflict_response(result)
    render json: {
      has_conflicts: result[:overlapping_slots].exists? || result[:booking_conflicts].exists?,
      overlapping_slots: result[:overlapping_slots].map do |slot|
        BookingManagement::AvailabilitySlotPresenter.new(slot).as_json
      end,
      booking_conflicts: result[:booking_conflicts].map do |booking|
        BookingManagement::BookingConflictPresenter.new(booking).as_json
      end
    }
  end

  def conflict_params
    [params[:date], params[:start_time], params[:end_time], params[:exclude_id]]
  end
end
