'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Globe, Check, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { OnboardingLocationData } from './types';
import { CITIES_PRESETS } from './presets';

interface Step4ServiceLocationsProps {
  locationData: OnboardingLocationData;
  setLocationData: React.Dispatch<React.SetStateAction<OnboardingLocationData>>;
  customCityInput: string;
  setCustomCityInput: (val: string) => void;
  handleAddCustomCity: () => void;
  handleRemoveCity: (cityToRemove: string) => void;
  handleDetectLocation: () => void;
  isDetectingLocation: boolean;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  onBack: () => void;
}

export default function Step4ServiceLocations({
  locationData,
  setLocationData,
  customCityInput,
  setCustomCityInput,
  handleAddCustomCity,
  handleRemoveCity,
  handleDetectLocation,
  isDetectingLocation,
  onSubmit,
  isSubmitting,
  onBack
}: Step4ServiceLocationsProps) {
  return (
    <motion.div
      key="step-4"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="bg-white border border-[#E8E2D9] rounded-2xl p-6 sm:p-9 shadow-sm"
    >
      <div className="mb-6">
        <Badge variant="outline" className="bg-[#F3EADF] text-[#9E5338] border-[#E8E2D9] mb-2 font-semibold text-[11px]">
          Step 4 — Required to Publish Listing
        </Badge>
        <h2 className="text-2xl sm:text-3xl font-serif font-normal text-[#221F1C]">
          Service Locations & Travel Terms
        </h2>
        <p className="text-xs sm:text-sm text-[#6B6560] mt-1">
          Ensure you are accurately matched to customers searching within your operating radius and destinations.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        {/* Base City Detection & Selection */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="baseCity" className="text-xs font-bold text-[#221F1C]">
              Base Operating City <span className="text-rose-500">*</span>
            </Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleDetectLocation}
              disabled={isDetectingLocation}
              className="text-xs text-[#9E5338] hover:bg-[#F3EADF] h-7 px-2 font-bold flex items-center gap-1"
            >
              <Navigation className="size-3" />
              {isDetectingLocation ? 'Detecting...' : 'Detect Using My Location'}
            </Button>
          </div>
          <div className="relative">
            <MapPin className="size-4 text-[#9E5338] absolute left-3 top-3" />
            <Input
              id="baseCity"
              required
              value={locationData.baseCity}
              onChange={(e) => setLocationData({ ...locationData, baseCity: e.target.value })}
              placeholder="e.g. Delhi NCR"
              className="pl-9 bg-[#FBF8F4] border-[#E8E2D9] focus:border-[#9E5338] rounded-xl text-xs sm:text-sm h-10"
            />
          </div>
        </div>

        {/* Serviceable Cities / Districts Chips */}
        <div className="space-y-2">
          <Label className="text-xs font-bold text-[#221F1C]">
            Serviceable Cities or Districts ({locationData.serviceableCities.length})
          </Label>
          <div className="flex flex-wrap gap-1.5 p-3 rounded-xl border border-[#E8E2D9] bg-[#FBF8F4] min-h-[50px] items-center">
            {locationData.serviceableCities.map((city) => (
              <span
                key={city}
                className="inline-flex items-center gap-1 bg-white border border-[#E8E2D9] px-2.5 py-1 rounded-full text-xs font-semibold text-[#221F1C] shadow-2xs"
              >
                {city}
                <button
                  type="button"
                  onClick={() => handleRemoveCity(city)}
                  className="hover:text-rose-500 transition-colors ml-0.5"
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          {/* Quick Add Preset Pills */}
          <div className="flex flex-wrap items-center gap-1 pt-1">
            <span className="text-[10px] text-[#6B6560] font-medium mr-1">Quick Add:</span>
            {CITIES_PRESETS.filter((c) => !locationData.serviceableCities.includes(c)).slice(0, 6).map((city) => (
              <button
                key={city}
                type="button"
                onClick={() =>
                  setLocationData((prev) => ({
                    ...prev,
                    serviceableCities: [...prev.serviceableCities, city]
                  }))
                }
                className="text-[10px] bg-[#F3EADF] text-[#9E5338] hover:bg-[#9E5338] hover:text-white px-2 py-0.5 rounded-md font-bold transition-all border border-[#E8E2D9]"
              >
                + {city}
              </button>
            ))}
          </div>

          {/* Add Custom City Input */}
          <div className="flex gap-2 pt-1">
            <Input
              value={customCityInput}
              onChange={(e) => setCustomCityInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddCustomCity();
                }
              }}
              placeholder="Add another district / town..."
              className="bg-white border-[#E8E2D9] rounded-xl text-xs h-9"
            />
            <Button
              type="button"
              onClick={handleAddCustomCity}
              className="bg-[#221F1C] hover:bg-[#332f2b] text-white rounded-xl text-xs h-9 px-4 font-bold"
            >
              Add
            </Button>
          </div>
        </div>

        {/* Travel Radius Slider & Nationwide Travel Toggle */}
        <div className="p-4 rounded-xl border border-[#E8E2D9] bg-[#FBF8F4] space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-[#221F1C]">Travel Radius from Base City</h4>
              <p className="text-[11px] text-[#6B6560]">Maximum road/driving distance you comfortably serve</p>
            </div>
            <span className="text-xs font-bold text-[#9E5338] bg-[#F3EADF] px-2.5 py-1 rounded-md border border-[#E8E2D9]">
              {locationData.panIndia ? 'Pan-India / Flights' : `${locationData.travelRadiusKm} km`}
            </span>
          </div>

          {!locationData.panIndia && (
            <Slider
              value={[locationData.travelRadiusKm]}
              min={10}
              max={500}
              step={10}
              onValueChange={([val]) => setLocationData({ ...locationData, travelRadiusKm: val })}
              className="py-2"
            />
          )}

          <div className="flex items-center justify-between pt-2 border-t border-[#E8E2D9]">
            <div className="flex items-center gap-2">
              <Globe className="size-4 text-[#9E5338]" />
              <span className="text-xs font-medium text-[#221F1C]">Available for Pan-India Destination Weddings</span>
            </div>
            <Switch
              checked={locationData.panIndia}
              onCheckedChange={(checked) => setLocationData({ ...locationData, panIndia: checked })}
            />
          </div>
        </div>

        {/* Travel Charges Policy */}
        <div className="space-y-2">
          <Label className="text-xs font-bold text-[#221F1C]">
            Travel Charges Policy for Outstation Events
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {[
              { id: 'included', label: 'Included in package', desc: 'No extra charge within radius' },
              { id: 'fixed', label: 'Fixed Outstation Fee', desc: 'Flat rate per trip' },
              { id: 'per_km', label: 'Per-Kilometre Rate', desc: 'Charged per km from base city' },
              { id: 'custom', label: 'Custom Quote', desc: 'Calculated upon booking discussion' }
            ].map((item) => (
              <div
                key={item.id}
                onClick={() => setLocationData({ ...locationData, travelChargesType: item.id })}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  locationData.travelChargesType === item.id
                    ? 'border-[#9E5338] bg-[#F3EADF] text-[#221F1C] font-semibold'
                    : 'border-[#E8E2D9] bg-[#FBF8F4] text-[#6B6560]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#221F1C]">{item.label}</span>
                  {locationData.travelChargesType === item.id && <Check className="size-3 text-[#9E5338]" />}
                </div>
                <p className="text-[10px] text-[#6B6560] mt-0.5">{item.desc}</p>
              </div>
            ))}
          </div>

          {(locationData.travelChargesType === 'fixed' || locationData.travelChargesType === 'per_km') && (
            <div className="mt-2 p-3 rounded-xl bg-[#FBF8F4] border border-[#E8E2D9] flex items-center gap-3">
              <Label className="text-xs font-bold text-[#221F1C] whitespace-nowrap">
                {locationData.travelChargesType === 'fixed' ? 'Fixed Travel Surcharge (₹)' : 'Rate Per KM (₹/km)'}
              </Label>
              <Input
                type="number"
                min={0}
                value={locationData.travelChargesAmount}
                onChange={(e) => setLocationData({ ...locationData, travelChargesAmount: Number(e.target.value) || 0 })}
                placeholder={locationData.travelChargesType === 'fixed' ? '2500' : '18'}
                className="bg-white border-[#E8E2D9] rounded-lg text-xs h-9 max-w-[140px]"
              />
            </div>
          )}
        </div>

        {/* Out of Area Approval Switch */}
        <div className="p-4 rounded-xl border border-[#E8E2D9] bg-[#FBF8F4] flex items-center justify-between">
          <div className="space-y-0.5 max-w-sm">
            <h4 className="text-xs font-bold text-[#221F1C]">Require Approval for Out-of-Area Inquiries</h4>
            <p className="text-[11px] text-[#6B6560]">
              Inquiries outside your primary serviceable cities will require your manual acceptance before confirmation.
            </p>
          </div>
          <Switch
            checked={locationData.outOfAreaApproval}
            onCheckedChange={(checked) => setLocationData({ ...locationData, outOfAreaApproval: checked })}
          />
        </div>

        {/* Step 4 Navigation */}
        <div className="pt-4 flex items-center justify-between border-t border-[#E8E2D9]">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="border-[#E8E2D9] text-[#6B6560] hover:text-[#221F1C] rounded-xl text-xs h-10 px-4"
          >
            <ArrowLeft className="size-3.5 mr-1.5" /> Back
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-[#9E5338] hover:bg-[#85432c] text-white rounded-xl px-7 py-5 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-[#9E5338]/15"
          >
            {isSubmitting ? (
              'Saving Locations...'
            ) : (
              <>
                <span>Save & Configure Portfolio</span>
                <ArrowRight className="size-4" />
              </>
            )}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
