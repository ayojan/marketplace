# frozen_string_literal: true

# == Schema Information
#
# Table name: availability_slots
#
#  id           :bigint           not null, primary key
#  date         :date             not null
#  end_time     :time             not null
#  is_available :boolean          default(TRUE), not null
#  start_time   :time             not null
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#  vendor_id    :bigint           not null
#
# Indexes
#
#  index_availability_slots_on_date_and_is_available  (date,is_available)
#  index_availability_slots_on_vendor_id              (vendor_id)
#  index_availability_slots_on_vendor_id_and_date     (vendor_id,date)
#
# Foreign Keys
#
#  fk_rails_...  (vendor_id => vendors.id)
#
class AvailabilitySlotSerializer < Blueprinter::Base
  identifier :id
  fields :date, :start_time, :end_time, :is_available
end
