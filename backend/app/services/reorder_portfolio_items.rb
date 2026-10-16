# frozen_string_literal: true

class ReorderPortfolioItems
  include Callable

  def initialize(vendor, category, item_orders)
    @vendor = vendor
    @category = category
    @item_orders = item_orders
  end

  # rubocop:disable Metrics/MethodLength
  def call
    # item_orders should be an array of { id: portfolio_item_id, display_order: new_order }
    success_count = 0
    errors = []

    @item_orders.each do |item_order|
      portfolio_item = @vendor.portfolio_items.find_by(
        id: item_order[:id],
        category: @category
      )

      if portfolio_item
        if portfolio_item.update(display_order: item_order[:display_order])
          success_count += 1
        else
          errors << "Failed to update item #{portfolio_item.title}: #{portfolio_item.errors.full_messages.join(', ')}"
        end
      else
        errors << "Portfolio item with ID #{item_order[:id]} not found in category #{@category}"
      end
    end

    {
      success: errors.empty?,
      updated_count: success_count,
      errors: errors
    }
  end
end
# rubocop:enable Metrics/MethodLength
