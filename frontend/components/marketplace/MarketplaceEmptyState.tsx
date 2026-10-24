'use client';

import React from 'react';
import { SlidersHorizontal, Building2, Sparkles } from 'lucide-react';
import { VendorCard } from './card';
import { MARKETPLACE_EMPTY_STATE_COPY } from './copy';

export interface MarketplaceEmptyStateProps {
  city: string;
  hasActiveFilters: boolean;
  minPrice: string;
  maxPrice: string;
  selectedLocation: string;
  selectedCategory: string;
  setMinPrice: (min: string) => void;
  setMaxPrice: (max: string) => void;
  setSelectedLocation: (loc: string) => void;
  setSelectedCategory: (cat: string) => void;
  resetAllFilters: () => void;
  onOpenRequestModal: (service?: string) => void;
  recommendedVendors?: any[];
}

export function MarketplaceEmptyState({
  city,
  hasActiveFilters,
  minPrice,
  maxPrice,
  selectedLocation,
  selectedCategory,
  setMinPrice,
  setMaxPrice,
  setSelectedLocation,
  setSelectedCategory,
  resetAllFilters,
  onOpenRequestModal,
  recommendedVendors = [],
}: MarketplaceEmptyStateProps) {
  const { filterRecovery, networkBuilding, recommendations } = MARKETPLACE_EMPTY_STATE_COPY;

  return (
    <div className="space-y-8 mt-4">
      {/* Smart Filter Relaxer - Helps users recover with 1 click */}
      {hasActiveFilters && (
        <div className="bg-white border border-[#E8E2D9] rounded-2xl p-5 sm:p-6 shadow-xs space-y-3.5 text-center max-w-xl mx-auto">
          <div className="size-10 rounded-full bg-[#F3EADF] text-[#9E5338] flex items-center justify-center mx-auto shadow-2xs">
            <SlidersHorizontal className="size-4" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-serif font-bold text-[#221F1C]">
              {filterRecovery.title}
            </h3>
            <p className="text-xs text-[#6B6560]">
              {filterRecovery.description}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            {(minPrice || maxPrice) && (
              <button
                type="button"
                onClick={() => {
                  setMinPrice('');
                  setMaxPrice('');
                }}
                className="px-3 py-1.5 rounded-full bg-[#FAF7F2] border border-[#E8E2D9] text-xs font-medium text-[#221F1C] hover:text-[#9E5338] hover:border-[#9E5338] transition-colors cursor-pointer"
              >
                {filterRecovery.clearBudget}
              </button>
            )}
            {selectedLocation !== 'all' && (
              <button
                type="button"
                onClick={() => setSelectedLocation('all')}
                className="px-3 py-1.5 rounded-full bg-[#FAF7F2] border border-[#E8E2D9] text-xs font-medium text-[#221F1C] hover:text-[#9E5338] hover:border-[#9E5338] transition-colors cursor-pointer"
              >
                {filterRecovery.showAllLocations}
              </button>
            )}
            {selectedCategory !== 'all' && (
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className="px-3 py-1.5 rounded-full bg-[#FAF7F2] border border-[#E8E2D9] text-xs font-medium text-[#221F1C] hover:text-[#9E5338] hover:border-[#9E5338] transition-colors cursor-pointer"
              >
                {filterRecovery.showAllCategories}
              </button>
            )}
            <button
              type="button"
              onClick={resetAllFilters}
              className="px-3.5 py-1.5 rounded-full bg-[#9E5338] text-xs font-semibold text-white hover:bg-[#86442B] transition-colors cursor-pointer"
            >
              {filterRecovery.resetFilters}
            </button>
          </div>
        </div>
      )}

      {/* Transparent Ayoj City Network Building Box */}
      <div className="text-center py-10 px-6 sm:px-12 border border-[#E8E2D9] rounded-3xl space-y-5 bg-[#FAF7F2] shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-44 h-44 bg-[#F3EADF] rounded-full blur-2xl pointer-events-none opacity-60" />
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-44 h-44 bg-[#9E5338]/5 rounded-full blur-2xl pointer-events-none" />

        {/* Icon Badge */}
        <div className="size-12 rounded-2xl bg-[#F3EADF] border border-[#E8DACB] flex items-center justify-center mx-auto text-[#9E5338] shadow-2xs">
          <Building2 className="size-5 text-[#9E5338]" />
        </div>

        {/* Headline & Subtitle */}
        <div className="space-y-1.5 max-w-xl mx-auto">
          <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#221F1C] tracking-tight">
            {networkBuilding.titleTemplate(city)}
          </h3>
          <p className="text-xs sm:text-sm text-[#6B6560] leading-relaxed max-w-lg mx-auto">
            {networkBuilding.description}
          </p>
        </div>

        {/* Services Prompt & Interactive Chips */}
        <div className="space-y-2.5 pt-1 max-w-lg mx-auto">
          <p className="text-xs font-bold uppercase tracking-wider text-[#9E5338]">
            {networkBuilding.servicesPrompt}
          </p>
          <div className="flex items-center justify-center flex-wrap gap-2 text-xs text-[#221F1C]">
            {networkBuilding.servicesList.map((service, index, arr) => (
              <div key={service} className="inline-flex items-center">
                <button
                  type="button"
                  onClick={() => onOpenRequestModal(service)}
                  className="px-3.5 py-1.5 rounded-full border border-[#E8E2D9] bg-white hover:border-[#9E5338] hover:bg-[#F3EADF] text-[#221F1C] hover:text-[#86442B] font-medium transition-all cursor-pointer shadow-2xs active:scale-95"
                >
                  {service}
                </button>
                {index < arr.length - 1 && (
                  <span className="text-[#9E5338] mx-1.5 font-bold select-none">·</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Primary CTA Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => onOpenRequestModal()}
            className="inline-flex items-center justify-center gap-2 px-7 py-2.5 rounded-full bg-[#9E5338] hover:bg-[#86442B] text-white text-xs font-semibold shadow-sm hover:shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <Sparkles className="size-3.5" />
            <span>{networkBuilding.ctaButton}</span>
          </button>
        </div>

        {/* Honest Transparency Disclaimer */}
        <p className="text-xs text-[#8A847E] italic pt-1 max-w-md mx-auto">
          {networkBuilding.disclaimer}
        </p>
      </div>

      {/* Recommended Top Verified Partners Section */}
      {recommendedVendors.length > 0 && (
        <div className="space-y-4 pt-2">
          <div className="border-b border-[#E8E2D9] pb-2 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-serif font-bold text-[#221F1C]">
                {recommendations.title}
              </h4>
              <p className="text-xs text-[#6B6560]">
                {recommendations.subtitle}
              </p>
            </div>
            <button
              type="button"
              onClick={resetAllFilters}
              className="text-xs text-[#9E5338] font-semibold hover:underline cursor-pointer"
            >
              {recommendations.viewAllAction}
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {recommendedVendors.slice(0, 3).map((vendor) => (
              <VendorCard 
                key={`rec-${vendor.id}`}
                photographer={vendor} 
                onQuickInquire={(v) => onOpenRequestModal(v.name || v.business_name)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
