'use client';

import React from 'react';
import { Search, Sparkles, X, IndianRupee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CITIES } from '@/components/Header';
import { TextLoop } from '@/components/motion';
import { TRADE_CATEGORIES, QUICK_BUDGET_PRESETS } from './presets';
import { MARKETPLACE_HERO_COPY } from './copy';
import { useLocation } from '@/lib/contexts/LocationContext';

interface MarketplaceHeroProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedLocation: string;
  setSelectedLocation: (location: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  minPrice: string;
  setMinPrice: (min: string) => void;
  maxPrice: string;
  setMaxPrice: (max: string) => void;
  getCategoryCount: (slug: string) => number;
}

export function MarketplaceHero({
  searchQuery,
  setSearchQuery,
  selectedLocation,
  setSelectedLocation,
  selectedCategory,
  setSelectedCategory,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  getCategoryCount,
}: MarketplaceHeroProps) {
  const { setSelectedCity } = useLocation();

  return (
    <section className="py-10 border-b border-[#E8E2D9] bg-[#FAF7F2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center space-y-3">
          
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3EADF] border border-[#E8E2D9] text-xs font-semibold tracking-wider text-[#9E5338] uppercase">
            <Sparkles className="size-3.5 text-[#9E5338]" />
            <span>{MARKETPLACE_HERO_COPY.badge}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-[2.6rem] font-serif font-normal tracking-tight text-[#221F1C] flex flex-wrap items-center justify-center gap-x-2.5">
            <span>{MARKETPLACE_HERO_COPY.titlePrefix}</span>
            <TextLoop
              interval={2.8}
              className="text-[#9E5338] italic font-serif"
            >
              {MARKETPLACE_HERO_COPY.loopWords.map((word) => (
                <span key={word}>{word}</span>
              ))}
            </TextLoop>
          </h1>
          <p className="text-xs sm:text-sm text-[#6B6560] font-normal max-w-lg mx-auto">
            {MARKETPLACE_HERO_COPY.subtitle}
          </p>
          
          {/* Search Input Bar with Integrated City Selector */}
          <div className="pt-2 max-w-xl mx-auto">
            <div className="bg-white border border-[#E8E2D9] rounded-2xl sm:rounded-full p-2 shadow-sm flex flex-col sm:flex-row items-center gap-2">
              
              {/* Location Selector Inside Search */}
              <div className="relative w-full sm:w-auto">
                <select
                  value={selectedLocation}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedLocation(val);
                    if (val !== 'all') setSelectedCity(val, { silentToast: true });
                  }}
                  aria-label="Filter by city"
                  className="w-full sm:w-auto bg-transparent text-xs font-medium text-[#221F1C] px-3 py-1.5 border-b sm:border-b-0 sm:border-r border-[#E8E2D9] focus:outline-none cursor-pointer"
                >
                  <option value="all">{MARKETPLACE_HERO_COPY.allCitiesOption}</option>
                  {CITIES.map((city) => (
                    <option key={city} value={city}>
                      📍 {city}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search Text Input */}
              <div className="flex items-center gap-2 px-3 py-1.5 flex-1 w-full min-h-[40px] sm:min-h-0">
                <label htmlFor="marketplace-search" className="sr-only">
                  Search creative partners
                </label>
                <Search className="size-4 text-[#9E5338] shrink-0" />
                <input
                  id="marketplace-search"
                  type="text"
                  placeholder={MARKETPLACE_HERO_COPY.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search by pro name, trade, or service"
                  className="w-full bg-transparent text-xs text-[#221F1C] placeholder:text-[#6B6560] focus:outline-none"
                >
                </input>
                {searchQuery && (
                  <button 
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="size-5 rounded-full bg-[#E8E2D9]/60 flex items-center justify-center text-[#6B6560] hover:bg-[#9E5338] hover:text-white transition-colors cursor-pointer"
                    aria-label="Clear search query"
                  >
                    <X className="size-3" />
                  </button>
                )}
              </div>

              {/* Clear query button if typed */}
              {searchQuery && (
                <Button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  variant="ghost"
                  className="h-8 text-xs text-[#9E5338] hover:bg-[#F3EADF] rounded-full px-3"
                >
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Quick-Scroll Category Pills with Live Count Badges */}
          <div className="pt-3 flex items-center gap-2 overflow-x-auto no-scrollbar snap-x snap-mandatory py-1 max-w-2xl mx-auto -mx-4 px-4 sm:mx-auto sm:px-0">
            {TRADE_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.slug;
              const count = getCategoryCount(cat.slug);
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`snap-start shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors duration-150 cursor-pointer border ${
                    isSelected
                      ? 'bg-[#9E5338] text-white border-[#9E5338] shadow-xs'
                      : 'bg-white text-[#221F1C] border-[#E8E2D9] hover:border-[#9E5338]/40 hover:bg-[#FAF7F2]'
                  }`}
                >
                  <Icon className="size-3.5" />
                  <span>{cat.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected ? 'bg-white/25 text-white' : 'bg-[#FAF7F2] text-[#6B6560]'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Budget Preset Pills Bar */}
          <div className="pt-2 flex items-center justify-center gap-1.5 overflow-x-auto no-scrollbar py-1 max-w-2xl mx-auto -mx-4 px-4 sm:mx-auto sm:px-0">
            <span className="text-[10px] font-bold text-[#6B6560] uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
              <IndianRupee className="size-3 text-[#9E5338]" /> Budget:
            </span>
            {QUICK_BUDGET_PRESETS.map((preset) => {
              const isActive = (preset.id === 'all' && !minPrice && !maxPrice) ||
                (preset.min === minPrice && preset.max === maxPrice);
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    setMinPrice(preset.min);
                    setMaxPrice(preset.max);
                  }}
                  className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors duration-150 cursor-pointer border ${
                    isActive
                      ? 'bg-[#9E5338] text-white border-[#9E5338] shadow-2xs'
                      : 'bg-white/90 text-[#4A4540] border-[#E8E2D9] hover:border-[#9E5338]/40 hover:bg-white hover:text-[#221F1C]'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
