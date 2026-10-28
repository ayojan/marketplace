# frozen_string_literal: true

module Vendor::Sluggable
  extend ActiveSupport::Concern

  included do
    before_validation :generate_slug, if: -> { slug.blank? }
    validates :slug, presence: true, uniqueness: { case_sensitive: false }
  end

  # Use slug as the URL parameter, falling back to id
  def to_param
    slug.presence || id.to_s
  end

  class_methods do
    # Raises ActiveRecord::RecordNotFound if no match exists
    def find_by_id_or_slug!(id_or_slug)
      find_by_id_or_slug(id_or_slug) ||
        raise(ActiveRecord::RecordNotFound, "Couldn't find Vendor with '#{id_or_slug}'")
    end

    # Returns nil if id_or_slug is blank or nothing matches
    def find_by_id_or_slug(id_or_slug)
      return nil if id_or_slug.blank?

      if id_or_slug.to_s.match?(/\A\d+\z/)
        find_by(id: id_or_slug) || find_by(slug: id_or_slug.to_s.downcase)
      else
        find_by(slug: id_or_slug.to_s.downcase)
      end
    end

    # Returns a unique slug derived from +base+, excluding the record with
    # +current_id+ (used during updates to ignore self).
    def next_available_slug(base, current_id: nil)
      base_slug = base.to_s.parameterize.presence || 'vendor'
      scope = current_id ? where.not(id: current_id) : all
      existing_slugs = scope.where('slug = ? OR slug LIKE ?', base_slug, "#{base_slug}-%").pluck(:slug)

      return base_slug unless existing_slugs.include?(base_slug)

      next_number = max_slug_suffix(existing_slugs, base_slug) + 1
      "#{base_slug}-#{next_number}"
    end

    private

    # Returns the highest numeric suffix in use for a given base slug.
    # The base slug itself counts as "1" so the next candidate is base-2,
    # avoiding a gap (e.g. "acme", "acme-2", "acme-3" rather than "acme-1").
    def max_slug_suffix(slugs, base_slug)
      pattern = /\A#{Regexp.escape(base_slug)}-(\d+)\z/
      slugs.filter_map { |s| s == base_slug ? 1 : s[pattern, 1]&.to_i }.max || 1
    end
  end

  private

  def generate_slug
    base = business_name.presence || 'vendor'
    self.slug = self.class.next_available_slug(base, current_id: id)
  end
end
