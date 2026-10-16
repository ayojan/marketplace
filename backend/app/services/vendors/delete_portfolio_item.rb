# frozen_string_literal: true

module Vendors
  class DeletePortfolioItem
    include Callable

    def initialize(portfolio_item)
      @portfolio_item = portfolio_item
      @vendor = portfolio_item.vendor
    end

    def call
      category = @portfolio_item.category

      if @portfolio_item.destroy
        reorder_items_in_category(category)
        { success: true }
      else
        { success: false, errors: @portfolio_item.errors.full_messages }
      end
    end

    private

    def reorder_items_in_category(category)
      items = @vendor.portfolio_items.where(category: category).order(:display_order, :created_at)

      items.each_with_index do |item, index|
        # rubocop:disable Rails/SkipsModelValidations
        item.update_column(:display_order, index + 1) if item.display_order != (index + 1)
        # rubocop:enable Rails/SkipsModelValidations
      end
    end
  end
end
