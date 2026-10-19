'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  Images, 
  MapPin, 
  Star, 
  Clock, 
  Sparkles, 
  Plane, 
  Instagram, 
  Globe, 
  Phone, 
  ShieldAlert,
  Camera,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import VerifiedPartnerBadge from '@/components/VerifiedPartnerBadge';

interface PhotoItem {
  id: string | number;
  url: string;
  title?: string;
  category?: string;
}

interface VendorHeroMosaicProps {
  vendor: any;
  photos: PhotoItem[];
  onOpenLightbox: (index: number) => void;
  isOwner?: boolean;
}

const CELEBRATION_PREVIEWS = [
  'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1600&q=80',
];

export default function VendorHeroMosaic({
  vendor,
  photos = [],
  onOpenLightbox,
  isOwner = false,
}: VendorHeroMosaicProps) {
  // Ensure we always have multiple celebration shots to cycle through automatically
  const displayPhotos = photos.length >= 2
    ? photos
    : photos.length === 1
      ? [
          photos[0],
          { id: 'preview-2', url: CELEBRATION_PREVIEWS[1], title: 'Celebration Ambience' },
          { id: 'preview-3', url: CELEBRATION_PREVIEWS[2], title: 'Grand Floral Stage' },
        ]
      : CELEBRATION_PREVIEWS.map((url, i) => ({
          id: `preview-${i}`,
          url: vendor?.image && i === 0 ? vendor.image : url,
          title: `${vendor?.business_name || 'Studio'} Showcase ${i + 1}`
        }));

  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Automatically advance images every 3.5 seconds
  useEffect(() => {
    if (displayPhotos.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % displayPhotos.length);
    }, 3500);

    return () => clearInterval(timer);
  }, [displayPhotos.length, isPaused]);

  const vendorName = vendor?.business_name || vendor?.name || 'Creative Partner';
  const avatarUrl = vendor?.profile_image_url || vendor?.image || displayPhotos[0]?.url;
  const rating = vendor?.average_rating || vendor?.rating;
  const totalReviews = vendor?.total_reviews ?? 0;
  const hasGenuineReviews = Boolean(rating && Number(rating) > 0 && totalReviews > 0);

  const categoriesList = vendor?.categories && Array.isArray(vendor.categories) && vendor.categories.length > 0
    ? vendor.categories
    : vendor?.service_categories && Array.isArray(vendor.service_categories)
      ? vendor.service_categories.map((name: string, i: number) => ({ id: i, name, is_primary: i === 0 }))
      : vendor?.primary_category
        ? [vendor.primary_category]
        : [];

  return (
    <div className="space-y-6">
      {/* Auto-Changing Cinematic Hero Banner */}
      <div 
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="relative rounded-3xl overflow-hidden border border-[#E8E2D9] bg-[#F3EADF] shadow-sm group"
      >
        <div className="relative h-[280px] sm:h-[400px] w-full overflow-hidden">
          {displayPhotos.map((photo, idx) => (
            <div
              key={photo.id || idx}
              onClick={() => onOpenLightbox(idx)}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out cursor-pointer ${
                idx === activeSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <Image
                src={photo.url}
                alt={photo.title || `${vendorName} showcase ${idx + 1}`}
                fill
                priority={idx === 0}
                unoptimized
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent" />
            </div>
          ))}
        </div>

        {/* Previous and Next Navigation Arrows */}
        {displayPhotos.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveSlide((prev) => (prev - 1 + displayPhotos.length) % displayPhotos.length);
              }}
              aria-label="Previous image"
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 size-10 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all cursor-pointer shadow-lg hover:scale-110 active:scale-95 opacity-80 group-hover:opacity-100"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveSlide((prev) => (prev + 1) % displayPhotos.length);
              }}
              aria-label="Next image"
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 size-10 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all cursor-pointer shadow-lg hover:scale-110 active:scale-95 opacity-80 group-hover:opacity-100"
            >
              <ChevronRight className="size-5" />
            </button>
          </>
        )}

        {/* Slide Indicator Dots at Bottom Center */}
        {displayPhotos.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20">
            {displayPhotos.map((_, dotIdx) => (
              <button
                key={dotIdx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveSlide(dotIdx);
                }}
                aria-label={`Jump to image ${dotIdx + 1}`}
                className={`transition-all rounded-full cursor-pointer ${
                  dotIdx === activeSlide
                    ? 'w-6 h-2 bg-[#9E5338] shadow-xs'
                    : 'size-2 bg-white/60 hover:bg-white'
                }`}
              />
            ))}
          </div>
        )}

        {/* Live Photo Caption Pill at Bottom Left */}
        {displayPhotos[activeSlide]?.title && (
          <div className="absolute bottom-4 left-4 z-20 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white text-xs font-medium hidden sm:flex items-center gap-2 shadow-sm">
            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold truncate max-w-[200px]">{displayPhotos[activeSlide].title}</span>
            <span className="text-white/60 font-mono text-[10px]">
              {activeSlide + 1}/{displayPhotos.length}
            </span>
          </div>
        )}

        {/* View All Photos Floating Pill at Bottom Right */}
        <button
          type="button"
          onClick={() => onOpenLightbox(activeSlide)}
          className="absolute bottom-4 right-4 z-20 px-4 py-2 rounded-full bg-white/95 hover:bg-white text-[#221F1C] text-xs font-semibold shadow-md backdrop-blur-md border border-[#E8E2D9] flex items-center gap-2 cursor-pointer transition-transform hover:scale-105 active:scale-95"
        >
          <Images className="size-4 text-[#9E5338]" />
          <span>Explore all {displayPhotos.length} photos</span>
        </button>
      </div>

      {/* Overlapping Identity & Credentials Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E8E2D9] shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row gap-6 items-start justify-between">
          
          {/* Avatar + Main Title */}
          <div className="flex items-start gap-4 sm:gap-5 min-w-0 flex-1">
            <div className="size-20 sm:size-24 rounded-2xl overflow-hidden relative border-2 border-white shadow-md bg-[#F3EADF] shrink-0">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={vendorName}
                  fill
                  unoptimized
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#F3EADF] text-[#9E5338] font-serif font-bold text-3xl">
                  {vendorName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className="space-y-2 min-w-0 flex-1">
              {/* Category Pills */}
              {categoriesList.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  {categoriesList.map((cat: any, i: number) => {
                    const cName = typeof cat === 'string' ? cat : cat.name;
                    const isPrimary = i === 0 || cat.is_primary;
                    return (
                      <span
                        key={cName + i}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                          isPrimary
                            ? 'bg-[#F3EADF] text-[#9E5338] border-[#E8E2D9]'
                            : 'bg-[#FAF7F2] text-[#6B6560] border-[#E8E2D9]'
                        }`}
                      >
                        {isPrimary && <Star className="size-2.5 fill-[#9E5338]" />}
                        <span>{cName}</span>
                      </span>
                    );
                  })}
                </div>
              )}

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-[#221F1C] tracking-tight leading-tight">
                {vendorName}
              </h1>

              {/* Verified Badge & Location */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-[#6B6560]">
                {vendor.location && (
                  <span className="flex items-center gap-1 text-[#221F1C] font-semibold">
                    <MapPin className="size-3.5 text-[#9E5338]" /> {vendor.location}
                  </span>
                )}

                {hasGenuineReviews ? (
                  <span className="flex items-center gap-1 text-[#221F1C] font-bold">
                    <Star className="size-3.5 fill-amber-400 text-amber-400" />
                    <span>{Number(rating).toFixed(1)}</span>
                    <span className="text-[#6B6560] font-normal">({totalReviews} reviews)</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#6B6560] border border-[#E8E2D9] px-2 py-0.5 rounded-full bg-[#FAF7F2]">
                    <Sparkles className="size-3 text-[#9E5338]" /> New on Ayoj
                  </span>
                )}

                {vendor.is_verified && (
                  <VerifiedPartnerBadge
                    vendorName={vendorName}
                    verificationChecks={vendor.verification_checks}
                    isVerified={vendor.is_verified}
                    size="sm"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Social Presence Quick Links */}
          <div className="flex items-center gap-2 flex-wrap sm:self-start pt-1">
            {vendor.instagram_handle && (
              <a
                href={`https://instagram.com/${vendor.instagram_handle.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#E8E2D9] text-xs font-semibold text-[#221F1C] hover:border-[#9E5338] hover:text-[#9E5338] transition-colors shadow-2xs"
              >
                <Instagram className="size-3.5 text-[#E1306C]" />
                <span>@{vendor.instagram_handle.replace('@', '')}</span>
              </a>
            )}
            {vendor.website && (
              <a
                href={vendor.website.startsWith('http') ? vendor.website : `https://${vendor.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#E8E2D9] text-xs font-semibold text-[#221F1C] hover:border-[#9E5338] hover:text-[#9E5338] transition-colors shadow-2xs"
              >
                <Globe className="size-3.5 text-[#9E5338]" />
                <span>Website</span>
              </a>
            )}
            {vendor.phone && (
              <a
                href={`tel:${vendor.phone}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#E8E2D9] text-xs font-semibold text-[#221F1C] hover:border-[#9E5338] hover:text-[#9E5338] transition-colors shadow-2xs"
              >
                <Phone className="size-3.5 text-[#9E5338]" />
                <span>Call Studio</span>
              </a>
            )}
          </div>
        </div>

        {/* Studio Metrics Highlights Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-[#E8E2D9]">
          <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D9]/80 space-y-0.5">
            <span className="text-[10px] text-[#6B6560] uppercase font-bold tracking-wider block">
              Response Speed
            </span>
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#221F1C]">
              <Clock className="size-3.5 text-[#9E5338]" />
              <span>~{Math.round(vendor.response_time_hours || 2)} Hours</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D9]/80 space-y-0.5">
            <span className="text-[10px] text-[#6B6560] uppercase font-bold tracking-wider block">
              Experience
            </span>
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#221F1C]">
              <Sparkles className="size-3.5 text-[#9E5338]" />
              <span>{vendor.years_experience || 5}+ Years in Field</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D9]/80 space-y-0.5">
            <span className="text-[10px] text-[#6B6560] uppercase font-bold tracking-wider block">
              Travel Capability
            </span>
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#221F1C]">
              <Plane className="size-3.5 text-[#9E5338]" />
              <span>Destination Events</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D9]/80 space-y-0.5">
            <span className="text-[10px] text-[#6B6560] uppercase font-bold tracking-wider block">
              Platform Fee
            </span>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
              <span className="size-2 rounded-full bg-emerald-500" />
              <span>0% Markup · Direct Chat</span>
            </div>
          </div>
        </div>

        {/* Bio paragraph */}
        <p className="text-xs sm:text-sm text-[#6B6560] leading-relaxed pt-1">
          {vendor.description || 'Professional creative specialist providing top-tier event design, authentic portfolios, and transparent milestone coordination for memorable celebrations.'}
        </p>

        {/* Owner Verification Reminder if applicable */}
        {isOwner && !vendor.is_verified && (
          <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D9] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <ShieldAlert className="size-5 text-[#9E5338] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-[#221F1C] uppercase tracking-wide">
                  Verified Partner Badge: {vendor.verification_status === 'pending_verification' ? 'Under Review' : 'Action Required'}
                </p>
                <p className="text-xs text-[#6B6560] mt-0.5">
                  Complete your registration, studio location, and published packages to earn the Ayoj Verified Partner badge.
                </p>
              </div>
            </div>
            <Button
              asChild
              size="sm"
              className="bg-[#9E5338] hover:bg-[#86442B] text-white font-medium text-xs px-4 h-9 rounded-full shrink-0"
            >
              <Link href="/dashboard/vendor/settings?tab=verification">
                {vendor.verification_status === 'pending_verification' ? 'View Status' : 'Complete Verification'}
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
