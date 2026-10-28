'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';

export interface SupportedCity {
  name: string;
  state: string;
  regionDescription: string;
  latitude: number;
  longitude: number;
  tagline: string;
}

export const SUPPORTED_CITIES: SupportedCity[] = [
  {
    name: 'Delhi NCR',
    state: 'Delhi, Haryana, UP',
    regionDescription: 'Delhi, Gurgaon, Noida & Faridabad',
    latitude: 28.6139,
    longitude: 77.2090,
    tagline: 'Capital Hub & Farmhouses',
  },
  {
    name: 'Mumbai',
    state: 'Maharashtra',
    regionDescription: 'Mumbai, Navi Mumbai & Thane',
    latitude: 19.0760,
    longitude: 72.8777,
    tagline: 'Coastal Glamour & Banquets',
  },
  {
    name: 'Bengaluru',
    state: 'Karnataka',
    regionDescription: 'Silicon Valley & Surrounds',
    latitude: 12.9716,
    longitude: 77.5946,
    tagline: 'Garden City & Modern Estates',
  },
  {
    name: 'Jaipur',
    state: 'Rajasthan',
    regionDescription: 'Pink City & Heritage Mansions',
    latitude: 26.9124,
    longitude: 75.7873,
    tagline: 'Royal Palaces & Forts',
  },
  {
    name: 'Goa',
    state: 'Goa',
    regionDescription: 'North & South Coastal Celebrations',
    latitude: 15.2993,
    longitude: 74.1240,
    tagline: 'Beachfront Resorts & Villas',
  },
  {
    name: 'Chandigarh',
    state: 'Punjab & Haryana',
    regionDescription: 'Chandigarh, Mohali & Panchkula',
    latitude: 30.7333,
    longitude: 76.7794,
    tagline: 'Tricity Lawns & Grand Halls',
  },
];

export const CITIES = SUPPORTED_CITIES.map((c) => c.name);

// Haversine distance in kilometers
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function findNearestCity(
  latitude: number,
  longitude: number
): { city: SupportedCity; distanceKm: number } {
  let nearest = SUPPORTED_CITIES[0];
  let minDistance = Infinity;

  for (const city of SUPPORTED_CITIES) {
    const dist = calculateHaversineDistanceKm(latitude, longitude, city.latitude, city.longitude);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = city;
    }
  }

  return {
    city: nearest,
    distanceKm: Math.round(minDistance),
  };
}

interface LocationContextType {
  selectedCity: string;
  setSelectedCity: (city: string, options?: { silentToast?: boolean }) => void;
  isPromptOpen: boolean;
  openLocationPrompt: () => void;
  closeLocationPrompt: () => void;
  detectLocation: (options?: { silentToast?: boolean }) => Promise<{
    success: boolean;
    city?: string;
    distanceKm?: number;
    error?: string;
  }>;
  isDetecting: boolean;
  detectionError: string | null;
  clearDetectionError: () => void;
  supportedCities: SupportedCity[];
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

const LOCAL_STORAGE_CITY_KEY = 'ayoj_selected_city';
const LOCAL_STORAGE_PROMPT_SEEN_KEY = 'ayoj_location_prompt_seen';

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [selectedCity, setSelectedCityState] = useState<string>('Delhi NCR');
  const [isPromptOpen, setIsPromptOpen] = useState<boolean>(false);
  const [isDetecting, setIsDetecting] = useState<boolean>(false);
  const [detectionError, setDetectionError] = useState<string | null>(null);

  // Initialize from localStorage and evaluate first-visit prompt
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const storedCity = localStorage.getItem(LOCAL_STORAGE_CITY_KEY);
      if (storedCity && CITIES.includes(storedCity)) {
        setSelectedCityState(storedCity);
      }

      // Set promptSeen to true so modal only opens upon explicit user request (e.g. clicking city pill)
      localStorage.setItem(LOCAL_STORAGE_PROMPT_SEEN_KEY, 'true');
    } catch (e) {
      console.warn('LocalStorage is not accessible:', e);
    }
  }, []);

  // Listen to cross-tab storage changes or custom broadcast events
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorage = (e: StorageEvent) => {
      if (e.key === LOCAL_STORAGE_CITY_KEY && e.newValue && CITIES.includes(e.newValue)) {
        setSelectedCityState(e.newValue);
      }
    };

    const handleCustomEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ city: string }>;
      if (customEvent.detail?.city && CITIES.includes(customEvent.detail.city)) {
        setSelectedCityState(customEvent.detail.city);
      }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('ayoj-location-changed', handleCustomEvent);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('ayoj-location-changed', handleCustomEvent);
    };
  }, []);

  const setSelectedCity = useCallback(
    (city: string, options?: { silentToast?: boolean }) => {
      if (!CITIES.includes(city)) return;

      setSelectedCityState(city);

      try {
        localStorage.setItem(LOCAL_STORAGE_CITY_KEY, city);
        localStorage.setItem(LOCAL_STORAGE_PROMPT_SEEN_KEY, 'true');
      } catch (e) {
        console.warn('Failed saving location preference:', e);
      }

      window.dispatchEvent(
        new CustomEvent('ayoj-location-changed', {
          detail: { city },
        })
      );

      if (!options?.silentToast) {
        toast.success(`Showing verified celebration vendors in ${city}`);
      }

      setIsPromptOpen(false);
      setDetectionError(null);
    },
    []
  );

  const openLocationPrompt = useCallback(() => {
    setDetectionError(null);
    setIsPromptOpen(true);
  }, []);

  const closeLocationPrompt = useCallback(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_PROMPT_SEEN_KEY, 'true');
    } catch (e) {
      console.warn('Failed saving prompt seen state:', e);
    }
    setIsPromptOpen(false);
    setDetectionError(null);
  }, []);

  const clearDetectionError = useCallback(() => {
    setDetectionError(null);
  }, []);

  const detectLocation = useCallback(
    async (options?: { silentToast?: boolean }) => {
      setIsDetecting(true);
      setDetectionError(null);

      if (typeof window === 'undefined' || !navigator.geolocation) {
        const errorMsg = 'Geolocation is not supported by your browser.';
        setDetectionError(errorMsg);
        setIsDetecting(false);
        if (!options?.silentToast) {
          toast.error(errorMsg);
        }
        return { success: false, error: errorMsg };
      }

      return new Promise<{
        success: boolean;
        city?: string;
        distanceKm?: number;
        error?: string;
      }>((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            const { city, distanceKm } = findNearestCity(latitude, longitude);

            setSelectedCity(city.name, { silentToast: true });

            const distanceDisplay =
              distanceKm <= 50
                ? `${distanceKm} km away`
                : `closest hub, ${distanceKm} km away`;

            if (!options?.silentToast) {
              toast.success(`Location detected: ${city.name} (${distanceDisplay})`, {
                description: `Showing top event professionals in ${city.regionDescription}`,
              });
            }

            setIsDetecting(false);
            setIsPromptOpen(false);
            resolve({ success: true, city: city.name, distanceKm });
          },
          (error) => {
            let errorMsg = 'Unable to retrieve your location.';
            if (error.code === error.PERMISSION_DENIED) {
              errorMsg = 'Location permission was denied. Please select your city manually below.';
            } else if (error.code === error.POSITION_UNAVAILABLE) {
              errorMsg = 'Location information is currently unavailable.';
            } else if (error.code === error.TIMEOUT) {
              errorMsg = 'Location request timed out. Please try selecting manually.';
            }

            setDetectionError(errorMsg);
            setIsDetecting(false);
            if (!options?.silentToast) {
              toast.error(errorMsg);
            }
            resolve({ success: false, error: errorMsg });
          },
          {
            enableHighAccuracy: false,
            timeout: 9000,
            maximumAge: 300000, // 5 min cached coordinates
          }
        );
      });
    },
    [setSelectedCity]
  );

  const value = useMemo(
    () => ({
      selectedCity,
      setSelectedCity,
      isPromptOpen,
      openLocationPrompt,
      closeLocationPrompt,
      detectLocation,
      isDetecting,
      detectionError,
      clearDetectionError,
      supportedCities: SUPPORTED_CITIES,
    }),
    [
      selectedCity,
      setSelectedCity,
      isPromptOpen,
      openLocationPrompt,
      closeLocationPrompt,
      detectLocation,
      isDetecting,
      detectionError,
      clearDetectionError,
    ]
  );

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}
