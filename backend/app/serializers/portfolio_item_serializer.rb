# frozen_string_literal: true

# == Schema Information
#
# Table name: portfolio_items
#
#  id            :bigint           not null, primary key
#  category      :string           not null
#  description   :text
#  display_order :integer          default(0), not null
#  is_featured   :boolean          default(FALSE), not null
#  title         :string           not null
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#  vendor_id     :bigint           not null
#
# Indexes
#
#  index_portfolio_items_on_category                     (category)
#  index_portfolio_items_on_vendor_id                    (vendor_id)
#  index_portfolio_items_on_vendor_id_and_category       (vendor_id,category)
#  index_portfolio_items_on_vendor_id_and_display_order  (vendor_id,display_order)
#  index_portfolio_items_on_vendor_id_and_is_featured    (vendor_id,is_featured)
#
# Foreign Keys
#
#  fk_rails_...  (vendor_id => vendors.id)
#
class PortfolioItemSerializer < Blueprinter::Base
  identifier :id
  fields :title, :description, :category, :is_featured

  field :image_count do |item|
    item.images.attached? ? item.images.size : 0
  end

  field :primary_image_url do |item|
    if item.images.attached? && item.images.first
      begin
        Rails.application.routes.url_helpers.url_for(item.images.first)
      rescue StandardError
        nil
      end
    end
  end

  field :images do |item|
    if item.images.attached?
      ImageSerializer.render_as_hash(item.images.attachments)
    else
      []
    end
  end
end
