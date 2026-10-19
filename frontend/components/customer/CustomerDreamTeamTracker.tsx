'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Camera, 
  Sparkles, 
  Music, 
  Palette, 
  UtensilsCrossed, 
  ClipboardCheck, 
  CheckCircle2, 
  ArrowRight, 
  Eye, 
  Clock, 
  Store,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DreamTeamSlot } from './types';

const CATEGORY_SLOTS: Array<{
  id: string;
  categoryName: string;
  categorySlug: string;
  icon: any;
  description: string;
  matchTerms: string[];
}> = [
  {
    id: 'photography',
    categoryName: 'Photography & Cinema',
    categorySlug: 'photography',
    icon: Camera,
    description: 'Lead visual storyteller for candids, traditional coverage & reels',
    matchTerms: ['photo', 'cinemat', 'camera', 'video', 'shoot']
  },
  {
    id: 'decor',
    categoryName: 'Decor, Stage & Floral',
    categorySlug: 'decoration',
    icon: Palette,
    description: 'Mandap, stage backdrops, entrance arches & ambient lighting',
    matchTerms: ['decor', 'stage', 'floral', 'flower', 'theme', 'design']
  },
  {
    id: 'makeup',
    categoryName: 'Makeup & Mehndi',
    categorySlug: 'makeup-artist',
    icon: Sparkles,
    description: 'Bridal makeover, saree draping, hairstyling & organic henna',
    matchTerms: ['makeup', 'mehendi', 'mehndi', 'hair', 'bridal', 'beauty']
  },
  {
    id: 'music',
    categoryName: 'DJ, Music & Sound',
    categorySlug: 'dj-music',
    icon: Music,
    description: 'High-energy dance floor DJ, sound rigs, dhol & live acoustic band',
    matchTerms: ['dj', 'music', 'sound', 'dhol', 'band', 'acoustic', 'audio']
  },
  {
    id: 'catering',
    categoryName: 'Catering & Celebration Cake',
    categorySlug: 'catering',
    icon: UtensilsCrossed,
    description: 'Curated regional menus, live food counters & designer tiered cake',
    matchTerms: ['cater', 'food', 'cake', 'bakery', 'buffet', 'sweet']
  },
  {
    id: 'planner',
    categoryName: 'Event Planner & Coordinator',
    categorySlug: 'planner',
    icon: ClipboardCheck,
    description: 'On-site timeline logistics, guest hospitality & vendor execution',
    matchTerms: ['plan', 'coordinator', 'management', 'hospitality']
  },
];

interface CustomerDreamTeamTrackerProps {
  bookings: any[];
}

export default function CustomerDreamTeamTracker({
  bookings,
}: CustomerDreamTeamTrackerProps) {
  // Map bookings to slots
  const mappedSlots = CATEGORY_SLOTS.map((slot) => {
    const matchingBooking = bookings.find((b) => {
      const vCat = String(b.vendor?.category || b.vendor?.primary_category?.name || b.service?.category?.name || '').toLowerCase();
      const sName = String(b.service?.name || '').toLowerCase();
      const vName = String(b.vendor?.business_name || '').toLowerCase();

      return slot.matchTerms.some((term) => vCat.includes(term) || sName.includes(term) || vName.includes(term));
    });

    return {
      ...slot,
      booking: matchingBooking,
    };
  });

  const confirmedCount = mappedSlots.filter((s) => !!s.booking).length;
  const progressPercent = Math.round((confirmedCount / CATEGORY_SLOTS.length) * 100);

  return (
    <div className="bg-white rounded-3xl border border-[#E8E2D9] p-6 sm:p-8 shadow-sm space-y-6">
      {/* Header and Progress Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E2D9] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="size-8 rounded-full bg-[#F3EADF] text-[#9E5338] flex items-center justify-center">
              <ClipboardCheck className="size-4" />
            </span>
            <h3 className="font-serif font-bold text-lg text-[#221F1C]">
              Your Celebration Dream Team
            </h3>
          </div>
          <p className="text-xs text-[#6B6560] mt-1">
            Track confirmed specialists across core event categories and complete your lineup with 0% markup
          </p>
        </div>

        <div className="flex items-center gap-3 bg-[#FAF7F2] p-2.5 px-4 rounded-2xl border border-[#E8E2D9]">
          <div className="text-right">
            <p className="text-[10px] font-bold text-[#6B6560] uppercase tracking-wider">Lineup Status</p>
            <p className="text-xs font-bold text-[#221F1C]">
              {confirmedCount} of {CATEGORY_SLOTS.length} Roles Filled
            </p>
          </div>
          <div className="w-16 h-2 rounded-full bg-[#E8E2D9] overflow-hidden">
            <div
              className="h-full bg-[#9E5338] rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Slots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mappedSlots.map((slot) => {
          const Icon = slot.icon;
          const isBooked = !!slot.booking;
          const b = slot.booking;

          if (isBooked && b) {
            return (
              <div
                key={slot.id}
                className="p-5 rounded-2xl border border-emerald-200 bg-emerald-50/40 shadow-xs flex flex-col justify-between space-y-4 hover:border-emerald-300 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="size-3 text-emerald-600" /> {slot.categoryName}
                    </span>
                    <span className="text-[10px] font-semibold text-[#6B6560] capitalize">
                      {b.status || 'Confirmed'}
                    </span>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="relative size-12 rounded-xl overflow-hidden border border-emerald-200 shrink-0 bg-white">
                      <Image
                        src={b.vendor?.image || 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=300&q=80'}
                        alt={b.vendor?.business_name || 'Vendor'}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-serif font-bold text-[#221F1C] truncate">
                        {b.vendor?.business_name}
                      </h4>
                      <p className="text-[11px] text-[#6B6560] truncate">{b.service?.name}</p>
                      <p className="text-xs font-bold text-emerald-800 mt-0.5">
                        ₹{Number(b.total_amount || 0).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-emerald-200/80 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-[#6B6560] flex items-center gap-1">
                    <Clock className="size-3" />
                    {b.event_date ? new Date(b.event_date).toLocaleDateString() : 'Confirmed Date'}
                  </span>
                  <Link
                    href={`/vendors/${b.vendor?.slug || b.vendor?.id || 1}`}
                    className="font-bold text-[#9E5338] hover:underline flex items-center gap-1"
                  >
                    <span>View Studio</span>
                    <ChevronRight className="size-3" />
                  </Link>
                </div>
              </div>
            );
          }

          // Open Slot Card
          return (
            <div
              key={slot.id}
              className="p-5 rounded-2xl border border-dashed border-[#E8E2D9] bg-[#FAF7F2]/60 hover:bg-[#FAF7F2] hover:border-[#9E5338]/40 transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="size-9 rounded-xl bg-white border border-[#E8E2D9] flex items-center justify-center text-[#9E5338] group-hover:scale-105 transition-transform">
                    <Icon className="size-4" />
                  </div>
                  <span className="text-[10px] font-bold text-[#9E5338] bg-[#F3EADF] px-2.5 py-0.5 rounded-full">
                    Slot Open
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="text-sm font-serif font-bold text-[#221F1C]">
                    {slot.categoryName}
                  </h4>
                  <p className="text-xs text-[#6B6560] line-clamp-2 leading-relaxed">
                    {slot.description}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E8E2D9]/80">
                <Link href={`/marketplace?category=${slot.categorySlug}`}>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full h-9 rounded-full border-[#E8E2D9] text-[#221F1C] group-hover:border-[#9E5338] group-hover:text-[#9E5338] text-xs font-semibold justify-between px-3.5 bg-white cursor-pointer shadow-2xs"
                  >
                    <span>Find {slot.categoryName.split(' ')[0]}</span>
                    <ArrowRight className="size-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
