'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  X,
  Star,
  MapPin,
  IndianRupee,
  ShieldCheck,
  ArrowRight,
  MessageSquare
} from 'lucide-react';
import VerifiedPartnerBadge from '@/components/VerifiedPartnerBadge';
import { CompareVendor, FALLBACK_IMAGE } from './constants';

interface CompareVendorColumnProps {
  vendor: CompareVendor;
  onRemove: (vendorId: string | number) => void;
  onOpenInquire?: (vendor: CompareVendor) => void;
  onCloseModal: () => void;
}

export default function CompareVendorColumn({
  vendor,
  onRemove,
  onOpenInquire,
  onCloseModal
}: CompareVendorColumnProps) {
  const name = vendor.name || vendor.business_name || 'Vendor';
  const img = vendor.image || vendor.profile_image_url || FALLBACK_IMAGE;
  const rating = vendor.rating ?? vendor.average_rating;
  const totalReviews = vendor.total_reviews ?? 0;
  const hasBasePrice =
    vendor.base_price != null && !isNaN(Number(vendor.base_price)) && Number(vendor.base_price) > 0;
  const priceFormatted = hasBasePrice
    ? `₹${Number(vendor.base_price).toLocaleString('en-IN')}`
    : 'On request';

  const primaryCat =
    vendor.primary_category?.name ||
    (typeof vendor.primary_category === 'string' ? vendor.primary_category : null) ||
    vendor.category ||
    'Creative Partner';

  const slugOrId = vendor.slug || vendor.id;

  return (
    <div className="bg-[#FAF7F2] border border-[#E8E2D9] rounded-2xl p-4 flex flex-col justify-between space-y-4 relative">
      {/* Remove pro pill */}
      <button
        type="button"
        onClick={() => onRemove(vendor.id)}
        className="absolute top-3 right-3 z-10 size-6 rounded-full bg-white/90 border border-[#E8E2D9] text-[#6B6560] hover:text-[#9E5338] flex items-center justify-center cursor-pointer shadow-xs"
        title="Remove from comparison"
      >
        <X className="size-3" />
      </button>

      <div className="space-y-3">
        {/* Photo + Name */}
        <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-[#E8E2D9] bg-white">
          <Image
            src={img}
            alt={name}
            fill
            unoptimized
            className="object-cover"
          />
          {vendor.is_verified && (
            <div className="absolute top-2 left-2 z-10">
              <VerifiedPartnerBadge isVerified={true} size="sm" vendorName={name} />
            </div>
          )}
        </div>

        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#9E5338]">
            {primaryCat}
          </span>
          <h4 className="font-serif font-bold text-sm sm:text-base text-[#221F1C] truncate">
            {name}
          </h4>
        </div>

        {/* Attribute 1: Rating */}
        <div className="p-3 rounded-xl bg-white border border-[#E8E2D9]/80 space-y-0.5">
          <span className="text-[10px] text-[#6B6560] uppercase font-bold tracking-wider block">
            Client Rating
          </span>
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#221F1C]">
            {rating && rating > 0 ? (
              <>
                <Star className="size-3.5 fill-amber-400 text-amber-400" />
                <span>{Number(rating).toFixed(1)}</span>
                <span className="text-[11px] font-normal text-[#6B6560]">
                  ({totalReviews} reviews)
                </span>
              </>
            ) : (
              <span className="text-[#6B6560] font-normal">New partner</span>
            )}
          </div>
        </div>

        {/* Attribute 2: Starting Price */}
        <div className="p-3 rounded-xl bg-white border border-[#E8E2D9]/80 space-y-0.5">
          <span className="text-[10px] text-[#6B6560] uppercase font-bold tracking-wider block">
            Starting Package
          </span>
          <div className="flex items-center gap-1 text-xs font-bold text-[#9E5338]">
            <IndianRupee className="size-3.5" />
            <span>{priceFormatted}</span>
          </div>
        </div>

        {/* Attribute 3: Location */}
        <div className="p-3 rounded-xl bg-white border border-[#E8E2D9]/80 space-y-0.5">
          <span className="text-[10px] text-[#6B6560] uppercase font-bold tracking-wider block">
            Location Hub
          </span>
          <div className="flex items-center gap-1.5 text-xs text-[#221F1C]">
            <MapPin className="size-3.5 text-[#9E5338] shrink-0" />
            <span className="truncate">{vendor.location || 'Multiple Cities / Nationwide'}</span>
          </div>
        </div>

        {/* Attribute 4: Guarantee */}
        <div className="p-3 rounded-xl bg-white border border-[#E8E2D9]/80 space-y-0.5">
          <span className="text-[10px] text-[#6B6560] uppercase font-bold tracking-wider block">
            The Ayoj Standard
          </span>
          <div className="flex items-center gap-1.5 text-xs text-[#221F1C]">
            <ShieldCheck className="size-3.5 text-[#9E5338] shrink-0" />
            <span className="text-[11px]">0% Markup · Direct Chat</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2 pt-2 border-t border-[#E8E2D9]">
        <Link
          href={`/vendors/${slugOrId}`}
          onClick={onCloseModal}
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-white bg-[#9E5338] hover:bg-[#86442B] transition-colors shadow-xs"
        >
          <span>View Full Profile</span>
          <ArrowRight className="size-3" />
        </Link>

        {onOpenInquire && (
          <button
            type="button"
            onClick={() => {
              onCloseModal();
              onOpenInquire(vendor);
            }}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-[#221F1C] bg-white border border-[#E8E2D9] hover:bg-[#F3EADF] transition-colors cursor-pointer"
          >
            <MessageSquare className="size-3 text-[#9E5338]" />
            <span>Direct Inquiry</span>
          </button>
        )}
      </div>
    </div>
  );
}
