'use client';

import React from 'react';
import Link from 'next/link';
import { Star, MapPin, Sparkles } from 'lucide-react';
import { CARD_COPY } from './copy';

interface VendorCardBadgesProps {
  name: string;
  slugOrId: string | number;
  rating: number | null;
  totalReviews: number;
  primaryCategoryName: string | null;
  additionalCategoriesCount: number;
  additionalCategoriesNames: string;
  location: string;
  onRecordView?: () => void;
}

export default function VendorCardBadges({
  name,
  slugOrId,
  rating,
  totalReviews,
  primaryCategoryName,
  additionalCategoriesCount,
  additionalCategoriesNames,
  location,
  onRecordView
}: VendorCardBadgesProps) {
  return (
    <div className="space-y-2">
      {/* Top row: Name + Rating */}
      <div className="flex items-start justify-between gap-2">
        <Link
          href={`/vendors/${slugOrId}`}
          onClick={onRecordView}
          className="block min-w-0 flex-1"
        >
          <h3 className="text-[15px] font-serif font-bold text-[#221F1C] truncate tracking-tight group-hover:text-[#9E5338] transition-colors cursor-pointer leading-snug">
            {name}
          </h3>
        </Link>

        {/* Compact rating */}
        {rating && rating > 0 && totalReviews > 0 ? (
          <div className="flex items-center gap-1 shrink-0 px-1.5 py-0.5 rounded-md bg-[#FEF9EE] border border-amber-100">
            <Star className="size-3 fill-[#D97706] text-[#D97706]" />
            <span className="text-xs font-bold text-[#221F1C]">{rating.toFixed(1)}</span>
            <span className="text-[10px] text-[#6B6560]">({totalReviews})</span>
          </div>
        ) : (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[#FAF7F2] text-[10px] font-medium text-[#9E5338] border border-[#E8E2D9] shrink-0">
            <Sparkles className="size-2.5" />
            {CARD_COPY.newOnAyoj}
          </span>
        )}
      </div>

      {/* Category + Location row */}
      <div className="flex items-center gap-1.5 text-xs text-[#6B6560] flex-wrap">
        {primaryCategoryName && (
          <span className="inline-flex items-center text-[11px] font-semibold text-[#9E5338] bg-[#F3EADF] px-2 py-0.5 rounded-md border border-[#E8E2D9]">
            {primaryCategoryName}
          </span>
        )}
        {additionalCategoriesCount > 0 && (
          <span
            title={CARD_COPY.alsoOperatesIn(additionalCategoriesNames)}
            className="inline-flex items-center text-[10px] font-medium text-[#6B6560] bg-[#FAF7F2] px-1.5 py-0.5 rounded-md border border-[#E8E2D9] cursor-help"
          >
            {CARD_COPY.moreCategories(additionalCategoriesCount)}
          </span>
        )}
        {location && (
          <>
            <span className="text-[#D5CFC8]">·</span>
            <span className="inline-flex items-center gap-1 truncate">
              <MapPin className="size-3 text-[#9E5338] shrink-0" />
              <span className="truncate">{location}</span>
            </span>
          </>
        )}
      </div>
    </div>
  );
}
