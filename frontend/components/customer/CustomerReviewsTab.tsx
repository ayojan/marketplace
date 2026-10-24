'use client';

import React from 'react';
import Link from 'next/link';
import { Star, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';

interface CustomerReviewsTabProps {
  bookings: any[];
}

export function CustomerReviewsTab({ bookings }: CustomerReviewsTabProps) {
  const reviewedBookings = bookings.filter((b) => b.review);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-white p-5 rounded-2xl border border-[#E8E2D9]">
        <h3 className="text-lg font-serif font-bold text-[#221F1C]">My Submitted Reviews</h3>
        <p className="text-xs text-[#6B6560]">Honest ratings and testimonials shared with the Ayoj community</p>
      </div>

      {reviewedBookings.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-dashed border-[#E8E2D9]">
          <Star size={36} className="mx-auto text-[#6B6560] mb-3" />
          <h4 className="text-sm font-bold text-[#221F1C] mb-1">No Reviews Submitted Yet</h4>
          <p className="text-xs text-[#6B6560] mb-4">Reviews will appear here after you complete bookings with verified vendors.</p>
          <Link href="/marketplace">
            <Button size="sm" className="bg-[#9E5338] hover:bg-[#86442B] text-white rounded-full text-xs font-medium px-6 cursor-pointer">
              Explore Marketplace
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {reviewedBookings.map((booking) => (
            <div key={booking.id} className="p-6 rounded-2xl border border-[#E8E2D9] bg-white shadow-sm space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="relative size-12 rounded-xl overflow-hidden border border-[#E8E2D9]">
                    <ImageWithFallback 
                      src={booking.vendor?.image || 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=600&q=80'} 
                      alt={booking.vendor?.business_name || 'Vendor'} 
                      fill 
                      unoptimized 
                      className="object-cover" 
                    />
                  </div>
                  <div>
                    <h4 className="text-sm font-serif font-bold text-[#221F1C]">{booking.vendor?.business_name}</h4>
                    <p className="text-xs text-[#6B6560]">{booking.service?.name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-amber-500 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full text-xs font-bold">
                  {[...Array(booking.review.rating)].map((_, i) => (
                    <Star key={i} size={12} className="fill-[#D97706] text-[#D97706]" />
                  ))}
                  <span className="ml-1 text-[#221F1C]">{booking.review.rating}.0</span>
                </div>
              </div>

              <p className="text-xs text-[#221F1C] bg-[#FBF8F4] p-4 rounded-xl border border-[#E8E2D9] italic leading-relaxed">
                &ldquo;{booking.review.comment}&rdquo;
              </p>

              <div className="text-[11px] text-[#6B6560] flex items-center justify-between pt-1">
                <span>Reviewed after event completion on {booking.event_date}</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 size={12} /> Verified Review
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
