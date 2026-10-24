'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, ArrowLeftRight, Check, MessageSquare } from 'lucide-react';
import { Vendor } from './types';
import { CARD_COPY } from './copy';

interface VendorCardActionsProps {
  vendor: Vendor;
  slugOrId: string | number;
  isCompared?: boolean;
  onToggleCompare?: (vendor: Vendor) => void;
  onQuickInquire?: (vendor: Vendor) => void;
  onRecordView?: () => void;
}

export default function VendorCardActions({
  vendor,
  slugOrId,
  isCompared = false,
  onToggleCompare,
  onQuickInquire,
  onRecordView
}: VendorCardActionsProps) {
  return (
    <div className="pt-2 flex items-center gap-2">
      <Link
        href={`/vendors/${slugOrId}`}
        onClick={onRecordView}
        className="flex-1 block"
      >
        <span className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-[#9E5338] bg-[#FAF7F2] border border-[#E8E2D9] hover:bg-[#9E5338] hover:text-white hover:border-[#9E5338] transition-all duration-300 cursor-pointer group/btn">
          <span>{CARD_COPY.viewProfile}</span>
          <ChevronRight className="size-3.5 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
        </span>
      </Link>

      {onToggleCompare && (
        <button
          type="button"
          onClick={() => onToggleCompare(vendor)}
          title={
            isCompared
              ? CARD_COPY.removeComparison
              : CARD_COPY.addComparison
          }
          className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            isCompared
              ? 'bg-[#9E5338] text-white border-[#9E5338] shadow-2xs'
              : 'bg-white text-[#6B6560] border-[#E8E2D9] hover:text-[#9E5338] hover:border-[#9E5338]/40 hover:bg-[#FAF7F2]'
          }`}
        >
          {isCompared ? (
            <Check className="size-3.5 stroke-[2.5]" />
          ) : (
            <ArrowLeftRight className="size-3.5" />
          )}
          <span className="hidden sm:inline">{isCompared ? CARD_COPY.inBasket : CARD_COPY.compareInquire}</span>
        </button>
      )}

      {onQuickInquire && !onToggleCompare && (
        <button
          type="button"
          onClick={() => onQuickInquire(vendor)}
          title={CARD_COPY.inquire}
          className="px-3 py-2 rounded-xl text-xs font-semibold border border-[#E8E2D9] bg-white text-[#221F1C] hover:bg-[#FAF7F2] hover:text-[#9E5338] transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
        >
          <MessageSquare className="size-3.5 text-[#9E5338]" />
          <span className="hidden sm:inline">{CARD_COPY.inquire}</span>
        </button>
      )}
    </div>
  );
}
