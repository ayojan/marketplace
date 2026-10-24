'use client';

import React from 'react';

interface VendorCardPricingProps {
  priceRange: string;
  hasBasePrice: boolean;
  className?: string;
}

export default function VendorCardPricing({
  priceRange,
  hasBasePrice,
  className = ''
}: VendorCardPricingProps) {
  return (
    <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold backdrop-blur-md ${
      hasBasePrice
        ? 'bg-white/90 text-[#221F1C] shadow-sm'
        : 'bg-black/40 text-white/90'
    } ${className}`}>
      <span>{priceRange}</span>
      {hasBasePrice && <span className="text-[10px] font-normal text-[#6B6560]">onwards</span>}
    </div>
  );
}
