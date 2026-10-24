'use client';

import React from 'react';
import { MapPin, ChevronDown, Check, Navigation, Loader2 } from 'lucide-react';
import { CITIES } from './constants';

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
    <div className="relative hidden sm:block" ref={locationDropdownRef}>
      <button
        type="button"
        onClick={() => setIsLocationOpen(!isLocationOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#E8E2D9] bg-white text-xs font-medium text-[#221F1C] cursor-pointer hover:border-[#9E5338]/40 transition-colors"
      >
        <MapPin className="size-3.5 text-[#9E5338]" />
        <span>{selectedCity}</span>
        <ChevronDown className="size-3 text-[#6B6560]" />
      </button>

      {isLocationOpen && (
        <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-white border border-[#E8E2D9] shadow-xl py-1.5 z-50 overflow-hidden">
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
    </div>
  );
}
