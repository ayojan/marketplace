# frozen_string_literal: true

module Vendor::PortfolioManagement
  extend ActiveSupport::Concern

  def portfolio?
    portfolio_items.exists?
  end

  alias has_portfolio? portfolio?

  def featured_portfolio_items
    if portfolio_items.loaded?
      loaded_featured_portfolio_items
    else
      items = portfolio_items.featured.ordered.limit(6)
      items.presence || portfolio_items.ordered.limit(6)
    end
  end

  def portfolio_categories
    portfolio_items.categories_for_vendor(self)
  end

  private

  def loaded_featured_portfolio_items
    items = sort_portfolio_items(portfolio_items.select(&:is_featured)).first(6)
    items.presence || sort_portfolio_items(portfolio_items).first(6)
  end

  def sort_portfolio_items(items)
    items.sort_by { |i| [i.display_order || 0, i.created_at || Time.current] }
  end
end
