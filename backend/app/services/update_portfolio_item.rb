# frozen_string_literal: true

class UpdatePortfolioItem
  include Callable

  def initialize(portfolio_item, params)
    @portfolio_item = portfolio_item
    @params = params
    @vendor = portfolio_item.vendor
  end

  def call
    old_category = @portfolio_item.category
    old_order = @portfolio_item.display_order

    if @portfolio_item.update(@params)
      # Reorder if category or display_order changed
      if @params[:category].present? && @params[:category] != old_category
        reorder_items_in_category(old_category)
        reorder_items_in_category(@portfolio_item.category)
      elsif @params[:display_order].present? && @params[:display_order] != old_order
        reorder_items_in_category(@portfolio_item.category)
      end

      { success: true, portfolio_item: @portfolio_item }
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
