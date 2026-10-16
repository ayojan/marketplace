# frozen_string_literal: true

# == Schema Information
#
# Table name: services
#
#  id             :bigint           not null, primary key
#  average_rating :decimal(3, 2)    default(0.0)
#  base_price     :decimal(10, 2)
#  description    :text
#  name           :string
#  pricing_type   :string           default("hourly")
#  status         :string           default("draft")
#  total_reviews  :integer          default(0)
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#  vendor_id      :bigint           not null
#
# Indexes
#
#  index_services_on_average_rating        (average_rating)
#  index_services_on_status                (status)
#  index_services_on_vendor_id             (vendor_id)
#  index_services_on_vendor_id_and_status  (vendor_id,status)
#
# Foreign Keys
#
#  fk_rails_...  (vendor_id => vendors.id)
#
class Service < ApplicationRecord
  # ── Concerns ──────────────────────────────────────────────────────────────────
  include Service::Pricing     # pricing_type enum, price validations, formatted price & price scopes
  include Service::Media       # service_images, active storage images, primary image helpers
  include Service::RatingStats # average_rating, total_reviews, update_rating_stats!, rating_distribution
  include Service::Bookable    # status enum, status predicates & scopes, can_be_booked?
  include Service::Searchable  # category & text search scopes, featured, filter_by_category

  # ── Associations ──────────────────────────────────────────────────────────────
  belongs_to :vendor

  has_many :vendor_services,    dependent: :destroy
  has_many :vendors,            through: :vendor_services
  has_many :service_categories, dependent: :destroy
  has_many :categories,         through: :service_categories
  has_many :bookings,           dependent: :destroy
  has_many :reviews,            dependent: :destroy

  # ── Validations ───────────────────────────────────────────────────────────────
  validates :name,        presence: true, length: { minimum: 3, maximum: 100 }
  validates :description, presence: true, length: { minimum: 50, maximum: 2000 }
end
