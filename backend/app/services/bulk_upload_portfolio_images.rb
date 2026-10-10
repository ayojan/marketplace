# frozen_string_literal: true

class BulkUploadPortfolioImages
  include Callable

  def initialize(portfolio_item, images)
    @portfolio_item = portfolio_item
    @images = Array.wrap(images).compact
  end

  def call
    return { success: false, errors: ['No images provided'] } if @images.blank?

    @images.each do |image|
      @portfolio_item.images.attach(image)
    end

    if @portfolio_item.save
      { success: true, portfolio_item: @portfolio_item, images_count: @images.count }
    else
      { success: false, errors: @portfolio_item.errors.full_messages }
    end
  end
end
