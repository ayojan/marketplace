# frozen_string_literal: true

module Vendors
  class PortfolioSummaryService
    include Callable

    def initialize(vendor)
      @vendor = vendor
    end

    def call
      items = @vendor.portfolio_items

      {
        total_items: items.count,
        featured_items: items.featured.count,
        categories: items.group(:category).count,
        total_images: total_images_count(items),
        recent_items: format_recent_items(items)
      }
    end

    private

    def total_images_count(items)
      ActiveStorage::Attachment.where(
        record_type: 'PortfolioItem',
        record_id: items.select(:id),
        name: 'images'
      ).count
    end

    def format_recent_items(items)
      items.with_attached_images.order(created_at: :desc).limit(5).map do |item|
        {
          id: item.id,
          title: item.title,
          category: item.category,
          image_count: item.image_count,
          is_featured: item.is_featured,
          created_at: item.created_at
        }
      end
    end
  end
end
