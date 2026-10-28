# frozen_string_literal: true

module Vendor::CategoryManagement
  extend ActiveSupport::Concern

  # Derived from services → categories association with virtual attribute support.
  # @service_categories acts as a virtual backing store for form round-trips.
  def service_categories
    if @service_categories.present?
      @service_categories
    else
      list = service_categories_list
      list.present? ? list.join(', ') : ''
    end
  end

  def service_categories=(val)
    @service_categories = val.is_a?(Array) ? val.join(', ') : val.to_s
  end

  def service_categories_list
    return @service_categories.split(',').map(&:strip).compact_blank if @service_categories.present?

    vendor_category_names.presence || fallback_service_category_names
  end

  def service_categories_list=(val)
    self.service_categories = val
  end

  def primary_category_name
    primary_category&.name || categories.first&.name || services.joins(:categories).pick('categories.name')
  end

  def sync_categories(ids, primary_id: nil)
    ids = Array(ids).map(&:to_i).reject(&:zero?).uniq.first(3)
    return if ids.empty?

    primary_id = primary_id.to_i if primary_id.present?
    primary_id = ids.first unless ids.include?(primary_id)

    transaction do
      vendor_categories.where.not(category_id: ids).destroy_all
      ids.each do |cat_id|
        vc = vendor_categories.find_or_initialize_by(category_id: cat_id)
        vc.is_primary = (cat_id == primary_id)
        vc.save!
      end
    end
  end

  private

  def vendor_category_names
    if vendor_categories.loaded?
      vendor_categories.sort_by { |vc| vc.is_primary? ? 0 : 1 }.map { |vc| vc.category.name }
    else
      vendor_categories.joins(:category).order(is_primary: :desc).pluck('categories.name')
    end
  end

  def fallback_service_category_names
    if loaded_categories?
      services.flat_map(&:categories).map(&:name).uniq
    else
      services.joins(:categories).distinct.pluck('categories.name')
    end
  end

  def loaded_categories?
    services.loaded? && services.all? { |s| s.association(:categories).loaded? }
  end
end
