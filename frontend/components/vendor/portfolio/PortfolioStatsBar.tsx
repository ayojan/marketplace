'use client';

import React from 'react';
import { Layers, Camera, Star, CheckCircle2 } from 'lucide-react';

interface PortfolioStatsBarProps {
  totalCollections: number;
  totalPhotos: number;
  featuredCount: number;
}

export default function PortfolioStatsBar({
  totalCollections,
  totalPhotos,
  featuredCount
}: PortfolioStatsBarProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
      <div className="p-4 rounded-2xl bg-white border border-[#E8E2D9] shadow-xs">
        <div className="flex items-center justify-between text-xs text-[#6B6560] mb-1 font-medium">
          <span>Showcases</span>
          <Layers className="size-4 text-[#9E5338]" />
        </div>
        <div className="text-2xl font-bold font-serif text-[#221F1C]">
          {totalCollections}
        </div>
        <span className="text-[10px] text-[#6B6560]">Curated galleries</span>
      </div>

      <div className="p-4 rounded-2xl bg-white border border-[#E8E2D9] shadow-xs">
        <div className="flex items-center justify-between text-xs text-[#6B6560] mb-1 font-medium">
          <span>High-Res Photos</span>
          <Camera className="size-4 text-[#9E5338]" />
        </div>
        <div className="text-2xl font-bold font-serif text-[#221F1C]">
          {totalPhotos}
        </div>
        <span className="text-[10px] text-[#6B6560]">Original media items</span>
      </div>

      <div className="p-4 rounded-2xl bg-white border border-[#E8E2D9] shadow-xs">
        <div className="flex items-center justify-between text-xs text-[#6B6560] mb-1 font-medium">
          <span>Featured On Profile</span>
          <Star className="size-4 text-amber-500 fill-amber-500" />
        </div>
        <div className="text-2xl font-bold font-serif text-[#221F1C]">
          {featuredCount}
        </div>
        <span className="text-[10px] text-emerald-700 font-medium">Top hero placement</span>
      </div>

      <div className="p-4 rounded-2xl bg-white border border-[#E8E2D9] shadow-xs">
        <div className="flex items-center justify-between text-xs text-[#6B6560] mb-1 font-medium">
          <span>Marketplace Status</span>
          <CheckCircle2 className="size-4 text-emerald-600" />
        </div>
        <div className="text-base sm:text-lg font-bold text-[#221F1C] mt-1">
          Active & Verified
        </div>
        <span className="text-[10px] text-[#6B6560]">Indexed for search</span>
      </div>
    </div>
  );
}
