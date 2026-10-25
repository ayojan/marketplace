'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Images, ArrowLeftRight, Check } from 'lucide-react';
import VerifiedPartnerBadge from '@/components/VerifiedPartnerBadge';
import VendorCardPricing from './VendorCardPricing';
import { Vendor } from './types';

interface VendorCardMediaProps {
  allImages: string[];
  currentImageIndex: number;
  isTransitioning: boolean;
  name: string;
  slugOrId: string | number;
  priceRange: string;
  hasBasePrice: boolean;
  isVerified: boolean;
  verificationChecks?: Record<string, any>;
  isCompared?: boolean;
  onToggleCompare?: (vendor: Vendor) => void;
  vendor: Vendor;
  isLiked: boolean;
  isLiking: boolean;
  onToggleFavorite: (e: React.MouseEvent) => void;
  onGoToImage: (index: number) => void;
  onRecordView?: () => void;
}

export default function VendorCardMedia({
  allImages,
  currentImageIndex,
  isTransitioning,
  name,
  slugOrId,
  priceRange,
  hasBasePrice,
  isVerified,
  verificationChecks,
  isCompared = false,
  onToggleCompare,
  vendor,
  isLiked,
  isLiking,
  onToggleFavorite,
  onGoToImage,
  onRecordView
}: VendorCardMediaProps) {
  const hasMultipleImages = allImages.length > 1;

  return (
    <div className="relative aspect-[4/3] overflow-hidden bg-[#F3EADF]">
      <Link
        href={`/vendors/${slugOrId}`}
        onClick={onRecordView}
        className="block w-full h-full cursor-pointer relative"
        aria-label={`View ${name} profile`}
      >
        {/* All images rendered, only active one visible via opacity */}
        {allImages.map((imgUrl, idx) => (
          <Image
            key={imgUrl + idx}
            src={imgUrl}
            alt={`${name} portfolio ${idx + 1}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={`object-cover transition-all duration-700 ease-in-out absolute inset-0 ${
              idx === currentImageIndex
                ? isTransitioning
                  ? 'opacity-0 scale-105'
                  : 'opacity-100 scale-100'
                : 'opacity-0 scale-100'
            } group-hover:scale-[1.03]`}
          />
        ))}

        {/* Bottom gradient overlay for readability */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/50 via-black/20 to-transparent z-10 pointer-events-none" />

        {/* Inline price badge - bottom left, over image */}
        <div className="absolute bottom-3 left-3 z-20">
          <VendorCardPricing priceRange={priceRange} hasBasePrice={hasBasePrice} />
        </div>
      </Link>

      {/* Dot indicators for portfolio cycling */}
      {hasMultipleImages && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
          {allImages.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onGoToImage(idx);
              }}
              className={`rounded-full transition-all duration-300 ${
                idx === currentImageIndex
                  ? 'w-4 h-1.5 bg-white shadow-sm'
                  : 'w-1.5 h-1.5 bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`Go to image ${idx + 1}`}
            />
          ))}
        </div>
      )}

      {/* Portfolio count indicator - top right area */}
      {hasMultipleImages && (
        <div className="absolute top-3 right-14 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-black/40 backdrop-blur-md text-white text-[10px] font-medium">
            <Images className="size-3" />
            {allImages.length}
          </span>
        </div>
      )}

      {/* Verified Partner Badge */}
      {isVerified && (
        <div className="absolute top-3 left-3 z-20">
          <VerifiedPartnerBadge
            vendorName={name}
            verificationChecks={verificationChecks}
            isVerified={isVerified}
            size="sm"
          />
        </div>
      )}

      {/* Compare Toggle Button */}
      {onToggleCompare && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleCompare(vendor);
          }}
          title={isCompared ? 'Remove from comparison' : 'Add to comparison'}
          className={`absolute top-3 right-13 size-9 rounded-full flex items-center justify-center transition-all cursor-pointer z-20 ${
            isCompared
              ? 'bg-[#9E5338] text-white shadow-md ring-2 ring-white/60'
              : 'bg-black/30 backdrop-blur-md text-white hover:bg-white hover:text-[#9E5338] hover:shadow-md'
          }`}
        >
          {isCompared ? (
            <Check className="size-4 stroke-[3]" />
          ) : (
            <ArrowLeftRight className="size-3.5" />
          )}
        </button>
      )}

      {/* Favorite Heart Button */}
      <button
        type="button"
        onClick={onToggleFavorite}
        disabled={isLiking}
        title={isLiked ? 'Remove from saved' : 'Save to favorites'}
        className={`absolute top-3 right-3 size-9 rounded-full flex items-center justify-center transition-all cursor-pointer z-20 ${
          isLiked
            ? 'bg-white text-rose-500 shadow-md'
            : 'bg-black/30 backdrop-blur-md text-white hover:bg-white hover:text-[#9E5338] hover:shadow-md'
        }`}
      >
        <Heart
          className={`size-4 transition-transform duration-200 ${
            isLiked ? 'fill-rose-500 scale-110' : ''
          } ${isLiking ? 'animate-pulse' : ''}`}
        />
      </button>
    </div>
  );
}
