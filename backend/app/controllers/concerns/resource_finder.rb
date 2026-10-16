# frozen_string_literal: true

# Resource finding helper - DRY up common resource lookup patterns
module ResourceFinder
  extend ActiveSupport::Concern

  protected

  # Find a resource or render 404
  def find_resource(model_class, id, scope: nil, name: nil)
    resource_name = name || model_class.model_name.singular
    scope ||= model_class.all

    scope.find(id)
  rescue ActiveRecord::RecordNotFound
    render_not_found(resource_name.humanize)
    nil
  end

  # Find booking with authorization scope
  def find_booking_for_user(id)
    bookings = Bookings::ScopeForUser.call(user: current_user)
    booking = bookings.find_by(id: id)

    return booking if booking

    render_not_found('Booking')
    nil
  end

  def find_availability_slot(id)
    slot = current_user.vendor&.availability_slots&.find_by(id: id)

    return slot if slot

    render_not_found('Availability slot')
    nil
  end

  # Set resource from params[:id]
  def set_resource(model_class, instance_var, scope: nil)
    scope ||= model_class.all
    resource = find_resource(model_class, params[:id], scope: scope)
    instance_variable_set("@#{instance_var}", resource)
  end
end
