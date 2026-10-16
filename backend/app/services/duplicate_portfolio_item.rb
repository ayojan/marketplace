# frozen_string_literal: true

class DuplicatePortfolioItem
  include Callable

  def initialize(portfolio_item)
    @portfolio_item = portfolio_item
  end

  def call
    new_item = @portfolio_item.dup
    new_item.title = "#{@portfolio_item.title} (Copy)"
    new_item.is_featured = false
    new_item.display_order = get_next_display_order(@portfolio_item.category)

    if new_item.save
      # Copy images if they exist
      if @portfolio_item.images.attached?
        @portfolio_item.images.each do |image|
          new_item.images.attach(
            io: StringIO.new(image.download),
            filename: image.filename,
            content_type: image.content_type
          )
        end
      end

      { success: true, portfolio_item: new_item }
    else
      { success: false, errors: new_item.errors.full_messages }
    end
  end

  private

  def get_next_display_order(category)
    max_order = @portfolio_item.vendor.portfolio_items.where(category: category).maximum(:display_order) || 0
    max_order + 1
  end
end
