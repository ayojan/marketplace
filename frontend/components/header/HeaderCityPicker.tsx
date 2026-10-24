'use client';

import React from 'react';
import { MapPin, ChevronDown, Check, Navigation, Loader2 } from 'lucide-react';
import { CITIES } from './presets';
import { MobileActionSheet } from '@/components/layout/MobileActionSheet';

interface HeaderCityPickerProps {
  selectedCity: string;
  isLocationOpen: boolean;
  setIsLocationOpen: (open: boolean) => void;
  isDetecting: boolean;
  onDetectLocation: () => void;
  onSelectCity: (city: string) => void;
  onOpenPrompt: () => void;
  locationDropdownRef: React.Ref<HTMLDivElement>;
}

export default function HeaderCityPicker({
  selectedCity,
  isLocationOpen,
  setIsLocationOpen,
  isDetecting,
  onDetectLocation,
  onSelectCity,
  onOpenPrompt,
  locationDropdownRef
}: HeaderCityPickerProps) {
  return (
    <div className="relative" ref={locationDropdownRef}>
      {/* City Trigger Pill */}
      <button
        type="button"
        onClick={() => setIsLocationOpen(!isLocationOpen)}
        className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full border border-[#E8E2D9] bg-white text-xs font-medium text-[#221F1C] cursor-pointer hover:border-[#9E5338]/40 transition-colors shadow-2xs active:scale-95"
        aria-label={`Current location: ${selectedCity}. Tap to change.`}
      >
        <MapPin className="size-3.5 text-[#9E5338]" />
        <span className="max-w-[70px] sm:max-w-none truncate">{selectedCity}</span>
        <ChevronDown className="size-3 text-[#6B6560]" />
      </button>

      {/* Desktop Floating Dropdown (>= md / 768px) */}
      {isLocationOpen && (
        <div className="hidden md:block absolute right-0 mt-2 w-52 rounded-2xl bg-white border border-[#E8E2D9] shadow-xl py-1.5 z-50 overflow-hidden">
          <button
            type="button"
            disabled={isDetecting}
            onClick={onDetectLocation}
            className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-[#9E5338] hover:bg-[#F3EADF] border-b border-[#E8E2D9] cursor-pointer transition-colors"
          >
            {isDetecting ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Navigation className="size-3.5" />
            )}
            <span>{isDetecting ? 'Detecting Hub...' : 'Detect My Location'}</span>
          </button>

          <div className="px-3.5 pt-2 pb-1 text-[10px] font-bold text-[#6B6560] uppercase tracking-wider">
            Select City
          </div>
          {CITIES.map((city) => {
            const isSelected = selectedCity === city;
            return (
              <button
                key={city}
                type="button"
                onClick={() => onSelectCity(city)}
                className={`w-full flex items-center justify-between px-3.5 py-1.5 text-xs text-left cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-[#F3EADF] text-[#9E5338] font-semibold'
                    : 'text-[#221F1C] hover:bg-[#FAF7F2]'
                }`}
              >
                <span>{city}</span>
                {isSelected && <Check className="size-3 text-[#9E5338]" />}
              </button>
            );
          })}

          <div className="pt-1 mt-1 border-t border-[#E8E2D9]/80">
            <button
              type="button"
              onClick={() => {
                setIsLocationOpen(false);
                onOpenPrompt();
              }}
              className="w-full px-3.5 py-1.5 text-[11px] font-medium text-[#6B6560] hover:text-[#9E5338] hover:bg-[#FAF7F2] text-left cursor-pointer transition-colors"
            >
              Change celebration hub...
            </button>
          </div>
        </div>
      )}

      {/* Mobile Bottom Sheet Drawer (< md / 768px) */}
      <MobileActionSheet
        isOpen={isLocationOpen}
        onClose={() => setIsLocationOpen(false)}
        title="Select Celebration Hub"
        subtitle="Find verified celebration specialists and studios in your city"
      >
        <div className="space-y-3 pt-1">
          {/* GPS Auto-detect button */}
          <button
            type="button"
            disabled={isDetecting}
            onClick={() => {
              onDetectLocation();
              setIsLocationOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-xs font-semibold text-[#9E5338] bg-[#F3EADF] border border-[#9E5338]/30 cursor-pointer active:scale-98 transition-all shadow-2xs"
          >
            {isDetecting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Navigation className="size-4" />
            )}
            <span>{isDetecting ? 'Detecting Nearest Hub...' : 'Detect My Location (GPS)'}</span>
          </button>

          {/* City options list */}
          <div>
            <span className="text-[10px] font-bold text-[#6B6560] uppercase tracking-wider block px-1 mb-2">
              Featured Cities
            </span>
            <div className="space-y-1.5">
              {CITIES.map((city) => {
                const isSelected = selectedCity === city;
                return (
                  <button
                    key={city}
                    type="button"
                    onClick={() => {
                      onSelectCity(city);
                      setIsLocationOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs text-left cursor-pointer transition-all active:scale-[0.99] border ${
                      isSelected
                        ? 'bg-[#F3EADF] text-[#9E5338] border-[#9E5338]/30 font-bold shadow-2xs'
                        : 'bg-white text-[#221F1C] border-[#E8E2D9] hover:bg-[#FAF7F2]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <MapPin className={`size-4 ${isSelected ? 'text-[#9E5338]' : 'text-[#6B6560]'}`} />
                      <span className="text-sm">{city}</span>
                    </div>
                    {isSelected && <Check className="size-4 text-[#9E5338]" strokeWidth={2.5} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Change hub modal trigger */}
          <div className="pt-2 border-t border-[#E8E2D9]/80 pb-2">
            <button
              type="button"
              onClick={() => {
                setIsLocationOpen(false);
                onOpenPrompt();
              }}
              className="w-full px-4 py-2.5 rounded-xl text-xs font-medium text-[#6B6560] hover:text-[#9E5338] hover:bg-white text-center cursor-pointer transition-colors border border-transparent hover:border-[#E8E2D9]"
            >
              Can't find your city? Search all celebration hubs →
            </button>
          </div>
        </div>
      </MobileActionSheet>
    </div>
  );
}
