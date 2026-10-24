'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { POPULAR_LOCATIONS, COMMON_REQUIREMENTS } from './presets';

interface BookingStep1DetailsProps {
  location: string;
  setLocation: (val: string) => void;
  requirements: string;
  setRequirements: React.Dispatch<React.SetStateAction<string>>;
  onAddRequirement: (req: string) => void;
  onContinue: () => void;
}

export default function BookingStep1Details({
  location,
  setLocation,
  requirements,
  setRequirements,
  onAddRequirement,
  onContinue
}: BookingStep1DetailsProps) {
  return (
    <motion.div
      key="step1"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-white border border-[#E8E2D9] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6"
    >
      <div>
        <h3 className="text-xl font-serif font-normal text-[#221F1C]">
          Event Particulars & Location
        </h3>
        <p className="text-xs text-[#6B6560] mt-1">
          Specify where your celebration is taking place and any special preferences.
        </p>
      </div>

      <div className="space-y-5">
        {/* Location Input */}
        <div className="space-y-2">
          <label htmlFor="booking-location" className="text-xs font-bold text-[#221F1C] block">
            Event Location / Venue Address <span className="text-[#9E5338]">*</span>
          </label>
          <div className="relative">
            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#6B6560]" />
            <input
              id="booking-location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-[#FBF8F4] border border-[#E8E2D9] rounded-xl h-11 pl-10 pr-4 text-xs text-[#221F1C] placeholder:text-[#6B6560] focus:outline-none focus:border-[#9E5338] transition-colors"
              placeholder="e.g. Taj Palace, Chanakyapuri, New Delhi"
            />
          </div>

          {/* Popular Quick Location Pills */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] text-[#6B6560]">Quick select:</span>
            {POPULAR_LOCATIONS.map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => setLocation(loc)}
                className={`text-[11px] px-2.5 py-0.5 rounded-full border transition-all cursor-pointer ${
                  location === loc
                    ? 'bg-[#9E5338] text-white border-[#9E5338]'
                    : 'bg-[#FBF8F4] text-[#221F1C] border-[#E8E2D9] hover:border-[#9E5338]/40'
                }`}
              >
                {loc}
              </button>
            ))}
          </div>
        </div>

        {/* Requirements Textarea */}
        <div className="space-y-2">
          <label htmlFor="booking-requirements" className="text-xs font-bold text-[#221F1C] block">
            Special Requirements & Vision
          </label>
          <textarea
            id="booking-requirements"
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            className="w-full bg-[#FBF8F4] border border-[#E8E2D9] rounded-xl p-3.5 text-xs text-[#221F1C] placeholder:text-[#6B6560] focus:outline-none focus:border-[#9E5338] min-h-[120px] resize-none transition-colors"
            placeholder="Detail any specific shot lists, color themes, schedule highlights, or custom requests you have for the professional..."
          />

          {/* Quick Suggestion Pills */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] text-[#6B6560] block">Click to add common requests:</span>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_REQUIREMENTS.map((req) => (
                <button
                  key={req}
                  type="button"
                  onClick={() => onAddRequirement(req)}
                  className="text-[10px] px-2.5 py-1 rounded-lg bg-[#FAF7F2] text-[#221F1C] border border-[#E8E2D9] hover:bg-[#F3EADF] hover:border-[#9E5338]/40 transition-colors cursor-pointer text-left"
                >
                  + {req}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Button
        onClick={onContinue}
        disabled={!location.trim()}
        className="w-full h-11 rounded-full font-medium text-xs bg-[#9E5338] hover:bg-[#86442B] text-white shadow-xs transition-colors cursor-pointer"
      >
        Continue to Schedule
        <ChevronRight className="size-4 ml-1" />
      </Button>
    </motion.div>
  );
}
