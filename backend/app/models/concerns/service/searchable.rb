# frozen_string_literal: true

module Service::Searchable
  extend ActiveSupport::Concern

  included do
    scope :by_category, ->(category) { joins(:categories).where(categories: { id: category }) }
    scope :by_vendor, ->(vendor) { where(vendor: vendor) }
    scope :search_by_name, ->(query) { where('name ILIKE ?', "%#{query}%") if query.present? }
    scope :search_by_description, ->(query) { where('description ILIKE ?', "%#{query}%") if query.present? }
    scope :ordered_by_name, -> { order(:name) }
    scope :ordered_by_created, -> { order(created_at: :desc) }
  end

  def service_category
    categories.first
  end

  def display_name
    name
  end

  def short_description(limit = 100)
    return description if description.length <= limit

    "#{description.truncate(limit)}..."
  end

  class_methods do
    def featured(limit = 6)
      active.joins(:vendor)
            .where(vendors: { verification_status: :verified })
            .distinct
            .order(created_at: :desc)
            .limit(limit)
    end

    def search(query)
      return all if query.blank?

      where(
        'services.name ILIKE ? OR services.description ILIKE ?',
        "%#{query}%", "%#{query}%"
      )
    end

    def filter_by_category(category_id)
      return all if category_id.blank?

      joins(:categories).where(categories: { id: category_id })
    end
  end
end
