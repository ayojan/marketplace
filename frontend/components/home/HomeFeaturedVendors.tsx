'use client';

import React from 'react';
import Link from 'next/link';
import { Star, ArrowRight, Search } from 'lucide-react';
import { InView } from '@/components/motion';
import { VendorCard } from '@/components/marketplace/card';
import { VENDOR_FILTER_TABS } from './presets';

interface HomeFeaturedVendorsProps {
  selectedCity: string;
  vendors: any[];
  loading: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  getTabCount: (tabId: string) => number;
}

export function HomeFeaturedVendors({
  selectedCity,
  vendors,
  loading,
  activeTab,
  setActiveTab,
  getTabCount,
}: HomeFeaturedVendorsProps) {
  const list = Array.isArray(vendors) ? vendors : [];
  const filtered = list.filter((v: any) => {
    if (activeTab === 'all') return true;
    const cat = (v.category || v.service_category || '').toLowerCase();
    const name = (v.name || v.business_name || '').toLowerCase();
    if (activeTab === 'photographer') return cat.includes('photo') || name.includes('narrative') || name.includes('photo') || name.includes('shutter');
    if (activeTab === 'makeup-artist') return cat.includes('makeup') || name.includes('makeover') || name.includes('glam') || name.includes('glow');
    if (activeTab === 'decorator') return cat.includes('decor') || name.includes('eventica') || name.includes('floral');
    if (activeTab === 'dj') return cat.includes('dj') || cat.includes('music') || name.includes('beat') || name.includes('aryan');
    if (activeTab === 'venue') return cat.includes('venue') || name.includes('palm') || name.includes('haveli') || name.includes('heritage');
    return true;
  });

  return (
    <section className="py-14 px-4 sm:px-6 bg-[#FBF8F4]">
      <InView className="max-w-7xl mx-auto space-y-6 relative">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E2D9] pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#F3EADF] text-[#9E5338] text-[10px] font-bold uppercase tracking-wider mb-1.5">
              <Star className="size-3 fill-[#9E5338]" />
              Featured Talent in {selectedCity}
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-normal text-[#221F1C]">
              Top rated vendors in {selectedCity}
            </h2>
            <p className="text-xs text-[#6B6560] mt-0.5">
              Handpicked, verified celebration artists with stellar customer reviews and transparent packages.
            </p>
          </div>
          <Link 
            href={`/marketplace?location=${encodeURIComponent(selectedCity)}`} 
            className="text-xs font-semibold text-[#9E5338] hover:underline flex items-center gap-1 self-start sm:self-auto shrink-0"
          >
            View all in {selectedCity} <ArrowRight className="size-3.5" />
          </Link>
        </div>

        {/* Category Filter Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {VENDOR_FILTER_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const count = getTabCount(tab.id);
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                  isActive
                    ? 'bg-[#9E5338] text-white shadow-xs'
                    : 'bg-white border border-[#E8E2D9] text-[#6B6560] hover:text-[#221F1C] hover:bg-[#FAF7F2]'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isActive ? 'bg-white/25 text-white' : 'bg-[#FAF7F2] text-[#6B6560]'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Vendors Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-2xl border border-[#E8E2D9] bg-white p-4 animate-pulse space-y-3">
                <div className="h-48 bg-[#F3EADF]/60 rounded-xl" />
                <div className="h-4 bg-[#F3EADF]/60 rounded w-3/4" />
                <div className="h-3 bg-[#F3EADF]/40 rounded w-1/2" />
                <div className="h-4 bg-[#F3EADF]/50 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative">
            {filtered.slice(0, 8).map((vendor) => (
              <VendorCard key={vendor.id} photographer={vendor} />
            ))}

            {filtered.length === 0 && (
              <div className="col-span-full py-12 px-4 text-center border border-dashed border-[#E8E2D9] rounded-2xl bg-white space-y-3">
                <div className="size-12 rounded-full bg-[#FAF7F2] border border-[#E8E2D9] flex items-center justify-center mx-auto text-[#9E5338]">
                  <Search className="size-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-[#221F1C]">No vendors found in this category</p>
                  <p className="text-xs text-[#6B6560] max-w-sm mx-auto">
                    We are actively onboarding verified celebration artists in {selectedCity}. View all pros or explore the catalog.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setActiveTab('all')}
                    className="px-4 py-1.5 rounded-full bg-[#F3EADF] text-[#9E5338] text-xs font-semibold hover:bg-[#E8DACB] transition-colors cursor-pointer"
                  >
                    Show All Verified Pros
                  </button>
                  <Link 
                    href="/marketplace" 
                    className="px-4 py-1.5 rounded-full bg-white border border-[#E8E2D9] text-[#221F1C] text-xs font-medium hover:border-[#9E5338] transition-colors"
                  >
                    Browse Full Catalog
                  </Link>
                </div>
              </div>
            )}

            {/* Explore more button if extra vendors available */}
            {filtered.length > 8 && (
              <div className="col-span-full pt-4 text-center">
                <Link
                  href={`/marketplace?category=${activeTab}${selectedCity !== 'All Cities' ? `&location=${encodeURIComponent(selectedCity)}` : ''}`}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white border border-[#E8E2D9] text-xs font-semibold text-[#9E5338] hover:bg-[#F3EADF] hover:border-[#9E5338]/40 transition-all shadow-xs cursor-pointer"
                >
                  <span>Explore all {filtered.length} {activeTab === 'all' ? 'verified pros' : activeTab} in {selectedCity}</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            )}
          </div>
        )}

      </InView>
    </section>
  );
}
