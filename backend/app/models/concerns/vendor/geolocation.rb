# frozen_string_literal: true

module Vendor::Geolocation
  extend ActiveSupport::Concern

  included do
    validates :latitude,  numericality: { greater_than_or_equal_to: -90,  less_than_or_equal_to: 90  }, allow_nil: true
    validates :longitude, numericality: { greater_than_or_equal_to: -180, less_than_or_equal_to: 180 }, allow_nil: true

    scope :with_coordinates, -> { where('latitude IS NOT NULL AND longitude IS NOT NULL') }
    scope :within_radius, lambda { |lat, lng, radius_km|
      with_coordinates.where(haversine_distance_sql, lat, lng, lat, radius_km)
    }
  end

  # Returns true when both latitude and longitude are set
  def coordinates?
    latitude.present? && longitude.present?
  end

  alias has_coordinates? coordinates?

  # Returns [latitude, longitude] as floats, or nil if not set
  def coordinates
    return nil unless coordinates?

    [latitude.to_f, longitude.to_f]
  end

  # Calculates distance from this vendor to given latitude/longitude.
  # +unit+ can be :meters (default), :km, or :miles (delegated to GeographicLocation).
  def distance_to(lat, lng, unit: :meters)
    return nil unless coordinates?

    origin      = GeographicLocation.new(latitude, longitude)
    destination = GeographicLocation.new(lat, lng)
    origin.distance_to(destination, unit: unit)
  rescue ArgumentError
    nil
  end

  class_methods do
    # SQL fragment for the Haversine distance formula used in +within_radius+
    def haversine_distance_sql
      GeographicLocation.sql_distance_predicate
    end
  end
end
