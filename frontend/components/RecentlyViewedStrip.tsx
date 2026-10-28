'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, Star } from 'lucide-react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { 
  getRecentlyViewedVendors, 
  clearRecentlyViewedVendors, 
  RecentlyViewedVendor 
} from '@/lib/recentlyViewed';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=600&auto=format&fit=crop';

export default function RecentlyViewedStrip() {
  const { user, isAuthenticated } = useAuth();
  const [items, setItems] = useState<RecentlyViewedVendor[]>([]);

  const loadItems = useCallback(() => {
    if (!isAuthenticated || !user?.id) {
      setItems([]);
      return;
    }
    setItems(getRecentlyViewedVendors(user.id));
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    loadItems();
    window.addEventListener('ayoj-recently-viewed-updated', loadItems);
    return () => window.removeEventListener('ayoj-recently-viewed-updated', loadItems);
  }, [loadItems]);

  // If user is not logged in or has no recently viewed vendors, do not render
  if (!isAuthenticated || !user || items.length === 0) return null;

  return (
    <section className="py-6 px-4 sm:px-6 bg-[#FAF7F2] border-b border-[#E8E2D9]">
      <div className="max-w-7xl mx-auto space-y-3">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-6 rounded-lg bg-[#F3EADF] text-[#9E5338] flex items-center justify-center">
              <Clock className="size-3.5" />
            </div>
            <h3 className="text-xs sm:text-sm font-serif font-bold text-[#221F1C]">
              Pick Up Where You Left Off
            </h3>
            <span className="text-[11px] text-[#6B6560]">({items.length} viewed)</span>
          </div>

          <button
            type="button"
            onClick={() => clearRecentlyViewedVendors(user?.id)}
            className="text-[11px] text-[#6B6560] hover:text-[#9E5338] hover:underline cursor-pointer transition-colors"
          >
            Clear history
          </button>
        </div>

        {/* Horizontal Carousel */}
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1">
          {items.map((vendor) => {
            const hasBasePrice = vendor.base_price != null && !isNaN(Number(vendor.base_price)) && Number(vendor.base_price) > 0;
            const priceRange = hasBasePrice
              ? `₹${Number(vendor.base_price).toLocaleString('en-IN')}`
              : 'On request';

            return (
              <Link
                key={vendor.id}
                href={`/vendors/${vendor.slug || vendor.id}`}
                className="group shrink-0 w-64 bg-white border border-[#E8E2D9] rounded-xl p-2.5 flex items-center gap-3 hover:border-[#9E5338]/40 hover:shadow-xs transition-all cursor-pointer"
              >
                <div className="relative size-14 rounded-lg overflow-hidden border border-[#E8E2D9] bg-[#F3EADF] shrink-0">
                  <Image
                    src={vendor.image || FALLBACK_IMAGE}
                    alt={vendor.name}
                    fill
                    sizes="56px"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <div className="min-w-0 flex-1 space-y-0.5">
                  <span className="text-[10px] font-semibold text-[#9E5338] uppercase tracking-wider line-clamp-1">
                    {vendor.category || 'Creative Pro'}
                  </span>
                  <h4 className="text-xs font-bold text-[#221F1C] truncate group-hover:text-[#9E5338] transition-colors">
                    {vendor.name}
                  </h4>
                  
                  <div className="flex items-center justify-between text-[11px] text-[#6B6560]">
                    <span className="font-semibold text-[#221F1C]">
                      {priceRange}
                    </span>
                    {vendor.rating && vendor.rating > 0 && (
                      <span className="flex items-center gap-0.5 text-amber-600 font-bold text-[10px]">
                        <Star className="size-2.5 fill-amber-400 text-amber-400" />
                        {vendor.rating.toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </section>
  );
}
