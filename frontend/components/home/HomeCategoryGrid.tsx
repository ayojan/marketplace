'use client';

import React from 'react';
import { InView, Magnetic } from '@/components/motion';
import { CATEGORY_ICONS } from './presets';

interface HomeCategoryGridProps {
  onSelectCategory: (slug: string) => void;
}

export function HomeCategoryGrid({ onSelectCategory }: HomeCategoryGridProps) {
  return (
    <InView as="section" className="py-8 bg-[#FBF8F4] border-b border-[#E8E2D9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-4 text-center">
          {CATEGORY_ICONS.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.name}
                onClick={() => onSelectCategory(cat.slug || cat.name)}
                className="flex flex-col items-center gap-2 group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9E5338] rounded-2xl p-1 active:scale-95 transition-transform"
                aria-label={`Browse ${cat.name}`}
              >
                <Magnetic intensity={0.3} range={60}>
                  <div className="size-14 rounded-full bg-[#F3EADF] border border-[#E8E2D9] flex items-center justify-center text-[#221F1C] group-hover:bg-[#9E5338] group-hover:text-white group-hover:border-[#9E5338] group-hover:scale-105 group-hover:shadow-md transition-all duration-200 shadow-xs">
                    <Icon className="size-5 transition-transform duration-200 group-hover:scale-110" />
                  </div>
                </Magnetic>
                <span className="text-xs font-medium text-[#221F1C] group-hover:text-[#9E5338] transition-colors leading-tight max-w-[85px]">
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </InView>
  );
}
