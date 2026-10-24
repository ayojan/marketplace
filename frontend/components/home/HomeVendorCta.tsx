'use client';

import React from 'react';
import Link from 'next/link';
import { Store, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InView } from '@/components/motion';

export function HomeVendorCta() {
  return (
    <section className="py-10 px-4 sm:px-6 bg-[#FBF8F4] border-t border-[#E8E2D9]">
      <InView className="max-w-7xl mx-auto">
        <div className="bg-white border border-[#E8E2D9] rounded-2xl p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#F3EADF] text-[#9E5338] text-[10px] font-bold uppercase tracking-wider">
                <Store className="size-3.5" />
                For Event Pros &amp; Creative Studios
              </div>

              <h2 className="text-xl sm:text-2xl font-serif font-normal text-[#221F1C]">
                Grow your celebration business with India&apos;s trusted event marketplace.
              </h2>

              <p className="text-xs sm:text-sm text-[#6B6560] leading-relaxed">
                Join event photographers, makeup artists, decorators, and venues. Receive direct client inquiries, manage your booking calendar, and list your creative services with zero upfront fees.
              </p>

              {/* 4 Compact Benefits Badges */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {[
                  '0% Upfront Listing Fee',
                  'Direct Host Inquiries',
                  'Calendar Slot Management',
                  'Showcase Creative Portfolios'
                ].map((benefit) => (
                  <span 
                    key={benefit}
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FAF7F2] text-[#221F1C] text-[11px] font-medium border border-[#E8E2D9]"
                  >
                    <CheckCircle2 className="size-3 text-[#9E5338]" />
                    {benefit}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row lg:flex-col items-stretch lg:items-end gap-2.5 shrink-0">
              <Link href="/register?role=vendor">
                <Button 
                  className="w-full sm:w-auto bg-[#9E5338] hover:bg-[#86442B] active:scale-95 text-white font-semibold text-xs px-6 h-10 min-h-[44px] sm:min-h-[40px] rounded-full shadow-xs cursor-pointer transition-all gap-2"
                >
                  List Your Business on Ayoj
                  <ArrowRight className="size-3.5" />
                </Button>
              </Link>

              <Link href="/login" className="text-center lg:text-right">
                <span className="text-xs text-[#6B6560] hover:text-[#9E5338] font-medium transition-colors cursor-pointer">
                  Already a partner? Sign In
                </span>
              </Link>
            </div>

          </div>
        </div>
      </InView>
    </section>
  );
}
