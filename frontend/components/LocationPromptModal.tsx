'use client';

import React, { useEffect, useRef } from 'react';
import { useLocation } from '@/lib/contexts/LocationContext';
import { 
  MapPin, 
  Navigation, 
  Loader2, 
  Check, 
  X, 
  Sparkles, 
  AlertCircle,
  Building,
  Palmtree,
  Crown,
  Compass,
  ArrowRight
} from 'lucide-react';

const CITY_ICONS: Record<string, React.ElementType> = {
  'Delhi NCR': Building,
  'Mumbai': Compass,
  'Bengaluru': Sparkles,
  'Jaipur': Crown,
  'Goa': Palmtree,
  'Chandigarh': Building,
};

export default function LocationPromptModal() {
  const {
    selectedCity,
    setSelectedCity,
    isPromptOpen,
    closeLocationPrompt,
    detectLocation,
    isDetecting,
    detectionError,
    supportedCities,
  } = useLocation();

  const modalRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    if (!isPromptOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeLocationPrompt();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPromptOpen, closeLocationPrompt]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isPromptOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isPromptOpen]);

  if (!isPromptOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="location-modal-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-[#221F1C]/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          closeLocationPrompt();
        }
      }}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-lg bg-[#FAF7F2] border border-[#E8E2D9] rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-7 animate-in zoom-in-95 duration-200"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={closeLocationPrompt}
          aria-label="Close location selector"
          className="absolute top-5 right-5 p-2 rounded-full text-[#6B6560] hover:text-[#221F1C] hover:bg-[#F3EADF] transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#9E5338]/30"
        >
          <X className="size-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-3.5 mb-5">
          <div className="p-2.5 rounded-2xl bg-[#F3EADF] border border-[#9E5338]/20 text-[#9E5338] shadow-xs shrink-0">
            <MapPin className="size-6 text-[#9E5338]" />
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-widest text-[#9E5338] uppercase">
              Celebration Hub
            </span>
            <h2
              id="location-modal-title"
              className="text-xl sm:text-2xl font-serif font-bold text-[#221F1C] mt-0.5 tracking-tight"
            >
              Where are you celebrating?
            </h2>
            <p className="text-xs sm:text-sm text-[#6B6560] mt-1 leading-relaxed">
              Set your city to discover verified photographers, venues, and celebration artists near you.
            </p>
          </div>
        </div>

        {/* Auto Detect Location Card */}
        <div className="mb-5">
          <button
            type="button"
            disabled={isDetecting}
            onClick={() => detectLocation()}
            className={`w-full group relative flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer text-left ${
              isDetecting
                ? 'bg-[#F3EADF]/60 border-[#9E5338] opacity-90 cursor-wait'
                : 'bg-white hover:bg-[#FAF7F2] border-[#E8E2D9] hover:border-[#9E5338]/60 shadow-xs hover:shadow-md'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div
                className={`size-11 rounded-xl flex items-center justify-center transition-colors ${
                  isDetecting
                    ? 'bg-[#9E5338] text-white animate-pulse'
                    : 'bg-[#F3EADF] text-[#9E5338] group-hover:bg-[#9E5338] group-hover:text-white'
                }`}
              >
                {isDetecting ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : (
                  <Navigation className="size-5 transition-transform group-hover:rotate-45 duration-200" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[#221F1C]">
                    {isDetecting ? 'Detecting your location...' : 'Use Current Location'}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#F3EADF] text-[#9E5338] uppercase tracking-wider">
                    GPS Auto
                  </span>
                </div>
                <p className="text-xs text-[#6B6560] mt-0.5">
                  {isDetecting
                    ? 'Matching coordinates to the closest celebration hub...'
                    : 'Auto-detect your city for instant local recommendations'}
                </p>
              </div>
            </div>

            <ArrowRight className="size-4 text-[#6B6560] group-hover:text-[#9E5338] group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
          </button>

          {/* Inline Detection Error feedback if permission denied or unavailable */}
          {detectionError && (
            <div className="mt-2.5 flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs animate-in fade-in">
              <AlertCircle className="size-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold">Notice:</span> {detectionError}
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center my-4">
          <div className="border-t border-[#E8E2D9] w-full" />
          <span className="bg-[#FAF7F2] px-3 text-[11px] font-semibold uppercase tracking-wider text-[#8C847A] shrink-0">
            or pick your city
          </span>
          <div className="border-t border-[#E8E2D9] w-full" />
        </div>

        {/* Supported Cities Grid */}
        <div className="grid grid-cols-2 gap-2.5 max-h-[260px] overflow-y-auto pr-1">
          {supportedCities.map((city) => {
            const isSelected = selectedCity === city.name;
            const IconComponent = CITY_ICONS[city.name] || MapPin;

            return (
              <button
                key={city.name}
                type="button"
                onClick={() => setSelectedCity(city.name)}
                className={`flex items-start gap-2.5 p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#F3EADF] border-[#9E5338] text-[#9E5338] shadow-xs ring-1 ring-[#9E5338]'
                    : 'bg-white hover:bg-[#FAF7F2] border-[#E8E2D9] hover:border-[#9E5338]/50 text-[#221F1C]'
                }`}
              >
                <div
                  className={`p-1.5 rounded-lg shrink-0 ${
                    isSelected
                      ? 'bg-[#9E5338] text-white'
                      : 'bg-[#FAF7F2] text-[#6B6560]'
                  }`}
                >
                  <IconComponent className="size-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold truncate">
                      {city.name}
                    </span>
                    {isSelected && (
                      <Check className="size-3.5 text-[#9E5338] shrink-0 font-bold" />
                    )}
                  </div>
                  <p className="text-[10px] text-[#6B6560] line-clamp-1 mt-0.5">
                    {city.tagline}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer info & dismiss */}
        <div className="mt-5 pt-4 border-t border-[#E8E2D9] flex items-center justify-between">
          <p className="text-[11px] text-[#6B6560]">
            Currently active: <span className="font-semibold text-[#221F1C]">{selectedCity}</span>
          </p>
          <button
            type="button"
            onClick={closeLocationPrompt}
            className="text-xs font-medium text-[#9E5338] hover:text-[#86442B] underline-offset-4 hover:underline cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
