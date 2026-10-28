# frozen_string_literal: true

# == Schema Information
#
# Table name: vendors
#
#  id                  :bigint           not null, primary key
#  average_rating      :decimal(3, 2)    default(0.0)
#  business_license    :string
#  business_name       :string           not null
#  cancellation_policy :text
#  completion_rate     :decimal(5, 4)
#  description         :text
#  facebook_url        :string
#  favorites_count     :integer          default(0), not null
#  instagram_handle    :string
#  latitude            :decimal(10, 6)
#  location            :string
#  longitude           :decimal(10, 6)
#  metadata            :jsonb
#  phone               :string
#  rejection_reason    :text
#  response_time_hours :decimal(5, 2)
#  slug                :string           not null
#  total_reviews       :integer          default(0)
#  verification_status :string           default("unverified")
#  verified_at         :datetime
#  website             :string
#  years_experience    :integer          default(0)
#  created_at          :datetime         not null
#  updated_at          :datetime         not null
#  user_id             :bigint           not null
#
# Indexes
#
#  index_vendors_on_business_name           (business_name)
#  index_vendors_on_business_name_tsvector  (to_tsvector('english'::regconfig, (COALESCE(business_name, ''::character varying))::text)) USING gin
#  index_vendors_on_coordinates             (latitude,longitude)
#  index_vendors_on_favorites_count         (favorites_count)
#  index_vendors_on_location                (location)
#  index_vendors_on_slug                    (slug) UNIQUE
#  index_vendors_on_user_id                 (user_id) UNIQUE
#  index_vendors_on_verification_status     (verification_status)
#
# Foreign Keys
#
#  fk_rails_...  (user_id => users.id)
#
class VendorSerializer < Blueprinter::Base
  identifier :id

  fields :user_id, :slug, :business_name, :location

  field :profile_image_url do |vendor|
    first_featured = vendor.featured_portfolio_items.first
    if first_featured&.images&.attached?
      begin
        Rails.application.routes.url_helpers.url_for(first_featured.images.first)
      rescue StandardError
        nil
      end
    end
  end

  field :image do |vendor|
    first_featured = vendor.featured_portfolio_items.first
    if first_featured&.images&.attached?
      begin
        Rails.application.routes.url_helpers.url_for(first_featured.images.first)
      rescue StandardError
        nil
      end
    end
  end

  field :average_rating
  field :total_reviews
  field :years_experience
  field :is_verified, &:can_display_verified_badge?
  field :verification_status
  field :verification_checks

  field :primary_category do |vendor|
    cat = vendor.primary_category || vendor.categories.first
    cat ? { id: cat.id, name: cat.name, slug: cat.slug } : nil
  end

  field :categories do |vendor|
    vcs = if vendor.association(:vendor_categories).loaded?
            vendor.vendor_categories
          else
            vendor.vendor_categories.includes(:category)
          end

    vcs.sort_by { |vc| vc.is_primary? ? 0 : 1 }.map do |vc|
      cat = vc.category
      { id: vc.category_id, name: cat&.name, slug: cat&.slug, is_primary: vc.is_primary? }
    end
  end

  field :service_categories, &:service_categories_list

  field :base_price do |vendor|
    if vendor.services.loaded?
      vendor.services.filter_map(&:base_price).min || 0
    else
      vendor.services.minimum(:base_price) || 0
    end
  end

  field :metadata do |vendor|
    vendor.metadata || {}
  end

  view :summary do
    field :featured_portfolio do |vendor|
      PortfolioItemSerializer.render_as_hash(vendor.featured_portfolio_items.first(3))
    end
  end

  view :detail do
    include_view :summary

    fields :description, :phone, :website, :instagram_handle, :facebook_url,
           :cancellation_policy, :response_time_hours, :completion_rate, :business_license

    field :coordinates, &:coordinates

    field :portfolio_items_count do |vendor|
      vendor.portfolio_items.size
    end

    field :featured_portfolio do |vendor|
      PortfolioItemSerializer.render_as_hash(vendor.featured_portfolio_items)
    end

    field :user do |vendor|
      user = vendor.user
      { id: user.id, first_name: user.first_name, last_name: user.last_name, email: user.email } if user
    end

    fields :created_at, :updated_at
  end

  view :profile do
    fields :user_id, :slug, :business_name, :description, :location, :phone, :website,
           :years_experience, :cancellation_policy, :instagram_handle, :business_license,
           :verification_status, :metadata, :created_at, :updated_at

    field :service_categories do |vendor|
      vendor.service_categories_list || []
    end

    field :categories do |vendor|
      vcs = if vendor.association(:vendor_categories).loaded?
              vendor.vendor_categories
            else
              vendor.vendor_categories.includes(:category)
            end

      vcs.sort_by { |vc| vc.is_primary? ? 0 : 1 }.map do |vc|
        cat = vc.category
        { id: vc.category_id, name: cat&.name, slug: cat&.slug, is_primary: vc.is_primary? }
      end
    end

    field :primary_category do |vendor|
      cat = vendor.primary_category || vendor.categories.first
      cat ? { id: cat.id, name: cat.name, slug: cat.slug } : nil
    end
  end
end
