'use client';

import React from 'react';
import { Star, Search, X } from 'lucide-react';
import { DEFAULT_CATEGORIES } from './constants';

interface PortfolioFilterBarProps {
  activeCategoryFilter: string;
  setActiveCategoryFilter: (category: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function PortfolioFilterBar({
  activeCategoryFilter,
  setActiveCategoryFilter,
  searchQuery,
  setSearchQuery
}: PortfolioFilterBarProps) {
  const allCategories = ['All', 'Featured', ...DEFAULT_CATEGORIES];

  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2">
      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
        {allCategories.map((category) => {
          const isSelected = activeCategoryFilter === category;
          return (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategoryFilter(category)}
              className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-all cursor-pointer text-xs font-medium border ${
                isSelected
                  ? 'bg-[#9E5338] text-white border-[#9E5338] shadow-xs'
                  : 'bg-white text-[#6B6560] border-[#E8E2D9] hover:border-[#9E5338]/40 hover:text-[#221F1C]'
              }`}
            >
              {category === 'Featured' ? (
                <span className="flex items-center gap-1">
                  <Star className="size-3 fill-current" />
                  Featured
                </span>
              ) : (
                category
              )}
            </button>
          );
        })}
      </div>

      {/* Search Input */}
      <div className="relative min-w-[240px]">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-3.5 text-[#6B6560]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search showcases..."
          className="w-full pl-9 pr-3 py-2 bg-white border border-[#E8E2D9] rounded-full text-xs text-[#221F1C] placeholder:text-[#6B6560] focus:outline-none focus:border-[#9E5338] transition-colors"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#6B6560] hover:text-[#221F1C]"
          >
            <X className="size-3" />
          </button>
        )}
      </div>
    </div>
  );
}
