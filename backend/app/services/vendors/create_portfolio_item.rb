# frozen_string_literal: true

module Vendors
  class CreatePortfolioItem
    include Callable

    def initialize(vendor, params)
      @vendor = vendor
      @params = params
    end

    def call
      portfolio_item = @vendor.portfolio_items.build(@params)

      if portfolio_item.save
        reorder_items_in_category(portfolio_item.category) if @params[:display_order].present?
        { success: true, portfolio_item: portfolio_item }
      else
        { success: false, errors: portfolio_item.errors.full_messages }
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
