# frozen_string_literal: true

module Vendors
  class SetFeaturedPortfolioItems
    include Callable

    def initialize(vendor, item_ids, featured_status: true)
      @vendor = vendor
      @item_ids = item_ids
      @featured_status = featured_status
    end

    def call
      items = @vendor.portfolio_items.where(id: @item_ids)
      updated_count = 0
      errors = []

      items.each do |item|
        if item.update(is_featured: @featured_status)
          updated_count += 1
        else
          errors << "Failed to update #{item.title}: #{item.errors.full_messages.join(', ')}"
        end
      end

      {
        success: errors.empty?,
        updated_count: updated_count,
        errors: errors
      }
    end
  end
end
