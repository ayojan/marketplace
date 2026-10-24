'use client';

import React from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Check, 
  MapPin, 
  Navigation, 
  Loader2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { CITIES } from '@/components/Header';
import { useLocation } from '@/lib/contexts/LocationContext';
import { TRADE_CATEGORIES, OCCASIONS } from './constants';

export interface MarketplaceSidebarFiltersProps {
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  selectedOccasion: string;
  setSelectedOccasion: (occ: string) => void;
  selectedLocation: string;
  setSelectedLocation: (loc: string) => void;
  minPrice: string;
  setMinPrice: (min: string) => void;
  maxPrice: string;
  setMaxPrice: (max: string) => void;
  openSections: {
    category: boolean;
    occasion: boolean;
    location: boolean;
    price: boolean;
  };
  toggleSection: (section: 'category' | 'occasion' | 'location' | 'price') => void;
  getCategoryCount: (slug: string) => number;
  isMobile?: boolean;
  onMobileClose?: () => void;
}

export function MarketplaceSidebarFilters({
  selectedCategory,
  setSelectedCategory,
  selectedOccasion,
  setSelectedOccasion,
  selectedLocation,
  setSelectedLocation,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  openSections,
  toggleSection,
  getCategoryCount,
  isMobile = false,
  onMobileClose,
}: MarketplaceSidebarFiltersProps) {
  const {
    setSelectedCity,
    openLocationPrompt,
    detectLocation,
    isDetecting,
  } = useLocation();

  const handleDetectLocation = async () => {
    const res = await detectLocation();
    if (res.success && res.city) {
      setSelectedLocation(res.city);
      if (isMobile && onMobileClose) onMobileClose();
    }
  };

  return (
    <div className="space-y-5">
      {/* Category Section with Accordion */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => toggleSection('category')}
          className="w-full flex items-center justify-between text-left cursor-pointer group"
          aria-expanded={openSections.category}
        >
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-[#221F1C] uppercase tracking-wider">
              Category
            </span>
            {selectedCategory !== 'all' && (
              <span className="size-2 rounded-full bg-[#9E5338]" />
            )}
          </div>
          <div className="flex items-center gap-2">
            {selectedCategory !== 'all' && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedCategory('all');
                }}
                className="text-[11px] text-[#9E5338] hover:underline font-semibold"
              >
                Reset
              </span>
            )}
            {openSections.category ? (
              <ChevronUp className="size-3.5 text-[#6B6560] group-hover:text-[#221F1C]" />
            ) : (
              <ChevronDown className="size-3.5 text-[#6B6560] group-hover:text-[#221F1C]" />
            )}
          </div>
        </button>

        <AnimatePresence initial={false}>
          {openSections.category && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden space-y-1 pt-1"
            >
              {TRADE_CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = selectedCategory === cat.slug;
                const count = getCategoryCount(cat.slug);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat.slug);
                      if (isMobile && onMobileClose) onMobileClose();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors duration-150 cursor-pointer text-left border ${
                      isSelected
                        ? 'bg-[#F3EADF] text-[#86442B] font-semibold border-[#E8E2D9]'
                        : 'border-transparent text-[#6B6560] hover:bg-[#FAF7F2] hover:text-[#221F1C]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`size-3.5 ${isSelected ? 'text-[#86442B]' : 'text-[#6B6560]'}`} />
                      <span>{cat.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        isSelected ? 'bg-white/70 text-[#86442B] font-bold' : 'text-[#6B6560]'
                      }`}>
                        {count}
                      </span>
                      {isSelected && <Check className="size-3.5 text-[#86442B]" />}
                    </div>
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="border-t border-[#E8E2D9]" />

      {/* Occasion / Event Section with Accordion */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => toggleSection('occasion')}
          className="w-full flex items-center justify-between text-left cursor-pointer group"
          aria-expanded={openSections.occasion}
        >
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-[#221F1C] uppercase tracking-wider">
              Occasion
            </span>
            {selectedOccasion !== 'all' && (
              <span className="size-2 rounded-full bg-[#9E5338]" />
            )}
          </div>
          <div className="flex items-center gap-2">
            {selectedOccasion !== 'all' && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedOccasion('all');
                }}
                className="text-[11px] text-[#9E5338] hover:underline font-semibold"
              >
                Reset
              </span>
            )}
            {openSections.occasion ? (
              <ChevronUp className="size-3.5 text-[#6B6560] group-hover:text-[#221F1C]" />
            ) : (
              <ChevronDown className="size-3.5 text-[#6B6560] group-hover:text-[#221F1C]" />
            )}
          </div>
        </button>

        <AnimatePresence initial={false}>
          {openSections.occasion && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden flex flex-wrap gap-1.5 pt-1"
            >
              {OCCASIONS.map((occ) => {
                const Icon = occ.icon;
                const isSelected = selectedOccasion === occ.id;
                return (
                  <button
                    key={occ.id}
                    type="button"
                    onClick={() => {
                      setSelectedOccasion(occ.id);
                      if (isMobile && onMobileClose) onMobileClose();
                    }}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors duration-150 cursor-pointer border ${
                      isSelected
                        ? 'bg-[#9E5338] text-white border-[#9E5338] shadow-xs font-semibold'
                        : 'bg-[#FAF7F2] text-[#6B6560] border-[#E8E2D9] hover:bg-[#F3EADF] hover:text-[#221F1C]'
                    }`}
                  >
                    <Icon className="size-3" />
                    <span>{occ.name}</span>
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="border-t border-[#E8E2D9]" />

      {/* City / Location Section with Accordion */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => toggleSection('location')}
          className="w-full flex items-center justify-between text-left cursor-pointer group"
          aria-expanded={openSections.location}
        >
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-[#221F1C] uppercase tracking-wider">
              City / Region
            </span>
            {selectedLocation !== 'all' && (
              <span className="size-2 rounded-full bg-[#9E5338]" />
            )}
          </div>
          <div className="flex items-center gap-2">
            {selectedLocation !== 'all' && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedLocation('all');
                }}
                className="text-[11px] text-[#9E5338] hover:underline font-semibold"
              >
                Reset
              </span>
            )}
            {openSections.location ? (
              <ChevronUp className="size-3.5 text-[#6B6560] group-hover:text-[#221F1C]" />
            ) : (
              <ChevronDown className="size-3.5 text-[#6B6560] group-hover:text-[#221F1C]" />
            )}
          </div>
        </button>

        <AnimatePresence initial={false}>
          {openSections.location && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden space-y-1 pt-1"
            >
              {/* Quick GPS auto-detect button */}
              <button
                type="button"
                disabled={isDetecting}
                onClick={handleDetectLocation}
                className="w-full mb-2 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-[#9E5338] bg-[#F3EADF] border border-[#9E5338]/30 hover:bg-[#9E5338] hover:text-white transition-colors cursor-pointer"
              >
                {isDetecting ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Navigation className="size-3.5" />
                )}
                <span>{isDetecting ? 'Detecting Hub...' : 'Detect My Location'}</span>
              </button>

              {['all', ...CITIES].map((city) => {
                const isAll = city === 'all';
                const displayName = isAll ? 'All Locations' : city;
                const isSelected = isAll ? selectedLocation === 'all' : selectedLocation.toLowerCase() === city.toLowerCase();
                return (
                  <button
                    key={city}
                    type="button"
                    onClick={() => {
                      setSelectedLocation(city);
                      if (!isAll) setSelectedCity(city, { silentToast: true });
                      if (isMobile && onMobileClose) onMobileClose();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs transition-colors duration-150 cursor-pointer text-left border ${
                      isSelected
                        ? 'bg-[#F3EADF] text-[#86442B] font-semibold border-[#E8E2D9]'
                        : 'border-transparent text-[#6B6560] hover:bg-[#FAF7F2] hover:text-[#221F1C]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className={`size-3.5 ${isSelected ? 'text-[#86442B]' : 'text-[#6B6560]'}`} />
                      <span>{displayName}</span>
                    </div>
                    {isSelected && <Check className="size-3 text-[#86442B]" />}
                  </button>
                );
              })}

              <div className="pt-1 mt-1 border-t border-[#E8E2D9]/80">
                <button
                  type="button"
                  onClick={() => {
                    if (isMobile && onMobileClose) onMobileClose();
                    openLocationPrompt();
                  }}
                  className="w-full px-3 py-1 text-[11px] font-medium text-[#6B6560] hover:text-[#9E5338] text-left cursor-pointer transition-colors"
                >
                  Change celebration hub...
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="border-t border-[#E8E2D9]" />

      {/* Budget Range Section with Accordion */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => toggleSection('price')}
          className="w-full flex items-center justify-between text-left cursor-pointer group"
          aria-expanded={openSections.price}
        >
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-[#221F1C] uppercase tracking-wider">
              Budget Range (₹)
            </span>
            {(minPrice || maxPrice) && (
              <span className="size-2 rounded-full bg-[#9E5338]" />
            )}
          </div>
          <div className="flex items-center gap-2">
            {(minPrice || maxPrice) && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  setMinPrice('');
                  setMaxPrice('');
                }}
                className="text-[11px] text-[#9E5338] hover:underline font-semibold"
              >
                Clear
              </span>
            )}
            {openSections.price ? (
              <ChevronUp className="size-3.5 text-[#6B6560] group-hover:text-[#221F1C]" />
            ) : (
              <ChevronDown className="size-3.5 text-[#6B6560] group-hover:text-[#221F1C]" />
            )}
          </div>
        </button>

        <AnimatePresence initial={false}>
          {openSections.price && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden space-y-3 pt-1"
            >
              {/* Min / Max Inputs */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <span className="text-[11px] text-[#6B6560]">Min (₹)</span>
                  <Input
                    type="number"
                    placeholder="0"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="bg-[#FAF7F2] border-[#E8E2D9] h-8 rounded-lg text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] text-[#6B6560]">Max (₹)</span>
                  <Input
                    type="number"
                    placeholder="1,00,000+"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="bg-[#FAF7F2] border-[#E8E2D9] h-8 rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* Quick Presets */}
              <div className="space-y-1">
                <span className="text-[11px] text-[#6B6560] block font-medium">Quick Presets:</span>
                <div className="grid grid-cols-1 gap-1">
                  {[
                    { label: 'Under ₹25,000', min: '', max: '25000' },
                    { label: '₹25,000 - ₹50,000', min: '25000', max: '50000' },
                    { label: '₹50,000 - ₹1,00,000', min: '50000', max: '100000' },
                    { label: 'Above ₹1,00,000', min: '100000', max: '' },
                  ].map((preset) => {
                    const isActive = minPrice === preset.min && maxPrice === preset.max;
                    return (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => {
                          setMinPrice(preset.min);
                          setMaxPrice(preset.max);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors duration-150 cursor-pointer text-left border ${
                          isActive
                            ? 'bg-[#F3EADF] text-[#86442B] font-semibold border-[#E8E2D9]'
                            : 'border-transparent text-[#6B6560] hover:bg-[#FAF7F2] hover:text-[#221F1C]'
                        }`}
                      >
                        <span>{preset.label}</span>
                        {isActive && <Check className="size-3 text-[#86442B]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
