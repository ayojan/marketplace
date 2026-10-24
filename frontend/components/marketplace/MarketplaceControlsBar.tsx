'use client';

import React from 'react';
import { SlidersHorizontal, ArrowUpDown, X, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { SORT_OPTIONS } from './presets';

export interface MarketplaceControlsBarProps {
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  selectedOccasion: string;
  setSelectedOccasion: (occ: string) => void;
  selectedLocation: string;
  setSelectedLocation: (loc: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  minPrice: string;
  setMinPrice: (min: string) => void;
  maxPrice: string;
  setMaxPrice: (max: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  showDesktopFilters: boolean;
  setShowDesktopFilters: (show: boolean) => void;
  openMobileFilter: () => void;
  resetAllFilters: () => void;
  activeFiltersCount: number;
  hasActiveFilters: boolean;
  totalResults: number;
  activeCategoryName?: string;
  activeOccasionName?: string;
}

export function MarketplaceControlsBar({
  selectedCategory,
  setSelectedCategory,
  selectedOccasion,
  setSelectedOccasion,
  selectedLocation,
  setSelectedLocation,
  searchQuery,
  setSearchQuery,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  sortBy,
  setSortBy,
  showDesktopFilters,
  setShowDesktopFilters,
  openMobileFilter,
  resetAllFilters,
  activeFiltersCount,
  hasActiveFilters,
  totalResults,
  activeCategoryName,
  activeOccasionName,
}: MarketplaceControlsBarProps) {
  return (
    <div className="space-y-4">
      {/* Top Bar with Filter Toggle, Results Count, and Sort Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8E2D9]">
        <div className="flex items-center gap-3">
          {/* Mobile Trigger Button */}
          <Button
            onClick={openMobileFilter}
            className="lg:hidden h-9 px-3.5 rounded-xl bg-white border border-[#E8E2D9] text-[#221F1C] text-xs font-semibold gap-1.5 cursor-pointer shadow-xs active:scale-95"
          >
            <SlidersHorizontal className="size-3.5 text-[#9E5338]" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="size-4 rounded-full bg-[#9E5338] text-white text-[10px] font-bold flex items-center justify-center ml-0.5">
                {activeFiltersCount}
              </span>
            )}
          </Button>

          {/* Desktop Toggle Sidebar Button */}
          <Button
            onClick={() => setShowDesktopFilters(!showDesktopFilters)}
            variant="ghost"
            className="hidden lg:flex h-9 px-3 rounded-xl border border-[#E8E2D9] text-xs font-medium text-[#6B6560] hover:text-[#221F1C] bg-white gap-2 cursor-pointer shadow-xs active:scale-95"
          >
            <SlidersHorizontal className="size-3.5 text-[#9E5338]" />
            <span>{showDesktopFilters ? 'Hide Filters' : 'Show Filters'}</span>
            {activeFiltersCount > 0 && (
              <span className="size-4 rounded-full bg-[#9E5338] text-white text-[10px] font-bold flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </Button>

          <div>
            <h2 className="text-base font-serif font-bold text-[#221F1C]">
              {selectedCategory !== 'all' ? (activeCategoryName || 'Creative Partners') : 'Creative Partners'}
              {selectedLocation !== 'all' ? ` in ${selectedLocation}` : ''}
            </h2>
            <p className="text-xs text-[#6B6560]">
              Showing {totalResults} matching {totalResults === 1 ? 'expert' : 'experts'}
              {selectedOccasion !== 'all' ? ` for ${activeOccasionName || 'Occasion'}` : ''}
            </p>
          </div>
        </div>

        {/* Actions: Sort Dropdown */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#6B6560] flex items-center gap-1 font-medium">
              <ArrowUpDown className="size-3.5 text-[#9E5338]" />
              Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort marketplace listings"
              className="bg-white border border-[#E8E2D9] text-[#221F1C] text-xs font-semibold rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#9E5338] cursor-pointer shadow-xs hover:border-[#9E5338]/40 transition-colors"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Active Filter Chips */}
      <AnimatePresence initial={false}>
        {hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-2 flex-wrap py-1">
              <span className="text-[11px] font-bold text-[#6B6560] uppercase tracking-wider">Active:</span>

              <AnimatePresence mode="popLayout">
                {selectedCategory !== 'all' && (
                  <motion.span
                    layout
                    key="active-cat"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.15 }}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F3EADF] border border-[#E8E2D9] text-xs font-medium text-[#86442B]"
                  >
                    <span>Category: {activeCategoryName}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedCategory('all')}
                      aria-label="Remove category filter"
                      className="hover:text-black cursor-pointer p-0.5 rounded-full hover:bg-black/5 transition-colors"
                    >
                      <X className="size-3" />
                    </button>
                  </motion.span>
                )}

                {selectedOccasion !== 'all' && (
                  <motion.span
                    layout
                    key="active-occ"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.15 }}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F3EADF] border border-[#E8E2D9] text-xs font-medium text-[#86442B]"
                  >
                    <span>Occasion: {activeOccasionName}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedOccasion('all')}
                      aria-label="Remove occasion filter"
                      className="hover:text-black cursor-pointer p-0.5 rounded-full hover:bg-black/5 transition-colors"
                    >
                      <X className="size-3" />
                    </button>
                  </motion.span>
                )}

                {selectedLocation !== 'all' && (
                  <motion.span
                    layout
                    key="active-loc"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.15 }}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F3EADF] border border-[#E8E2D9] text-xs font-medium text-[#86442B]"
                  >
                    <span>City: {selectedLocation}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedLocation('all')}
                      aria-label="Remove city filter"
                      className="hover:text-black cursor-pointer p-0.5 rounded-full hover:bg-black/5 transition-colors"
                    >
                      <X className="size-3" />
                    </button>
                  </motion.span>
                )}

                {searchQuery && (
                  <motion.span
                    layout
                    key="active-query"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.15 }}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F3EADF] border border-[#E8E2D9] text-xs font-medium text-[#86442B]"
                  >
                    <span>Query: &ldquo;{searchQuery}&rdquo;</span>
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      aria-label="Remove query filter"
                      className="hover:text-black cursor-pointer p-0.5 rounded-full hover:bg-black/5 transition-colors"
                    >
                      <X className="size-3" />
                    </button>
                  </motion.span>
                )}

                {minPrice && (
                  <motion.span
                    layout
                    key="active-min"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.15 }}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F3EADF] border border-[#E8E2D9] text-xs font-medium text-[#86442B]"
                  >
                    <span>Min: ₹{Number(minPrice).toLocaleString()}</span>
                    <button
                      type="button"
                      onClick={() => setMinPrice('')}
                      aria-label="Remove minimum price filter"
                      className="hover:text-black cursor-pointer p-0.5 rounded-full hover:bg-black/5 transition-colors"
                    >
                      <X className="size-3" />
                    </button>
                  </motion.span>
                )}

                {maxPrice && (
                  <motion.span
                    layout
                    key="active-max"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.15 }}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F3EADF] border border-[#E8E2D9] text-xs font-medium text-[#86442B]"
                  >
                    <span>Max: ₹{Number(maxPrice).toLocaleString()}</span>
                    <button
                      type="button"
                      onClick={() => setMaxPrice('')}
                      aria-label="Remove maximum price filter"
                      className="hover:text-black cursor-pointer p-0.5 rounded-full hover:bg-black/5 transition-colors"
                    >
                      <X className="size-3" />
                    </button>
                  </motion.span>
                )}
              </AnimatePresence>

              <button
                type="button"
                onClick={resetAllFilters}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#9E5338] hover:underline cursor-pointer ml-1"
              >
                <RotateCcw className="size-3" />
                <span>Clear all</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
