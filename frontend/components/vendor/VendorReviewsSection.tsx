'use client';

import React from 'react';
import { Star, Sparkles, Store } from 'lucide-react';

interface VendorReviewsSectionProps {
  vendor: any;
  hasGenuineReviews: boolean;
  reviews: any[];
}

export default function VendorReviewsSection({
  vendor,
  hasGenuineReviews,
  reviews,
}: VendorReviewsSectionProps) {
  return (
    <section id="reviews" className="scroll-mt-28 p-6 rounded-2xl border border-[#E8E2D9] bg-white space-y-6">
      {hasGenuineReviews ? (
        <>
          <div className="flex flex-col sm:flex-row justify-between gap-6 pb-6 border-b border-[#E8E2D9]">
            <div>
              <h2 className="text-3xl font-serif font-bold text-[#221F1C]">
                {Number(vendor.average_rating).toFixed(1)}
              </h2>
              <div className="flex gap-1 my-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className={`size-4 ${
                      i <= Math.round(Number(vendor.average_rating))
                        ? 'fill-[#D97706] text-[#D97706]'
                        : 'text-stone-300'
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-[#6B6560] font-medium">
                Based on {vendor.total_reviews} verified client {vendor.total_reviews === 1 ? 'review' : 'reviews'}
              </p>
            </div>
          </div>

          {reviews.length > 0 && (
            <div className="space-y-4">
              {reviews.slice(0, 5).map((review: any, i: number) => (
                <div key={review.id || i} className="space-y-1.5 pb-4 border-b border-[#E8E2D9] last:border-b-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-bold text-[#221F1C]">{review.customer?.name || 'Verified Client'}</p>
                      <div className="flex gap-0.5 mt-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`size-3 ${star <= review.rating ? 'fill-[#D97706] text-[#D97706]' : 'text-stone-300'}`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-[10px] text-[#6B6560]">
                      {review.created_at ? new Date(review.created_at).toLocaleDateString() : ''}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-xs text-[#6B6560] italic font-normal">&ldquo;{review.comment}&rdquo;</p>
                  )}
                  {review.vendor_response && (
                    <div className="mt-2.5 p-3 rounded-xl bg-[#FAF7F2] border border-[#E8E2D9] space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-[#9E5338] flex items-center gap-1.5">
                          <Store className="size-3 text-[#9E5338]" /> Response from {vendor.business_name}
                        </span>
                        {review.vendor_responded_at && (
                          <span className="text-[10px] text-[#6B6560]">
                            {new Date(review.vendor_responded_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#221F1C]">
                        &ldquo;{review.vendor_response}&rdquo;
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-[#E8E2D9]">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-serif font-bold text-[#221F1C]">Client Reviews &amp; Experiences</h3>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FAF7F2] text-[11px] font-medium text-[#6B6560] border border-[#E8E2D9]">
                  <Sparkles className="size-3 text-[#9E5338]" />
                  <span>New on Ayoj</span>
                </span>
              </div>
              <p className="text-xs text-[#6B6560]">
                All Ayoj reviews are written by confirmed hosts after an event booking is completed.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-xl bg-[#FAF7F2] border border-[#E8E2D9] text-center space-y-2">
            <div className="mx-auto size-10 rounded-full bg-white border border-[#E8E2D9] flex items-center justify-center text-[#9E5338]">
              <Sparkles className="size-5" />
            </div>
            <h4 className="text-sm font-semibold text-[#221F1C]">No Client Reviews Yet</h4>
            <p className="text-xs text-[#6B6560] max-w-md mx-auto leading-relaxed">
              {vendor.business_name} is new on Ayoj. Genuine ratings and reviews will appear here once booked celebrations are completed and verified.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
