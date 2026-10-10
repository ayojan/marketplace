# frozen_string_literal: true

# == Schema Information
#
# Table name: categories
#
#  id          :bigint           not null, primary key
#  active      :boolean          default(TRUE)
#  description :text
#  icon        :string
#  metadata    :jsonb
#  name        :string
#  slug        :string
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#
# Indexes
#
#  index_categories_on_slug  (slug) UNIQUE
#
class Category < ApplicationRecord
  # Associations
  has_many :service_categories, dependent: :destroy
  has_many :services, through: :service_categories
  has_many :vendor_profiles, through: :services, source: :vendor_profile

  # Validations
  validates :name, presence: true, uniqueness: true, length: { minimum: 2, maximum: 50 }
  validates :slug, presence: true, uniqueness: true,
                   format: { with: /\A[a-z0-9\-_]+\z/,
                             message: :invalid_format }

  # Scopes
  scope :active, -> { where(active: true) }
  scope :inactive, -> { where(active: false) }
  scope :ordered, -> { order(:name) }

  # Callbacks
  before_validation :generate_slug, if: -> { name.present? && slug.blank? }

  # Instance methods
  def active?
    active
  end

  delegate :count, to: :services, prefix: true
  delegate :count, to: :vendor_profiles, prefix: true

  def to_param
    slug
  end

  private

  def generate_slug
    self.slug = name.downcase.gsub(/[^a-z0-9\s\-_]/, '').gsub(/\s+/, '-').strip
  end
end
