'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, Star, MapPin, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ImageWithFallback } from '@/components/ImageWithFallback';
import { SavedVendor } from './types';

interface CustomerSavedTabProps {
  savedVendors: SavedVendor[];
  onRemoveSavedVendor: (id: string) => void;
}

export function CustomerSavedTab({
  savedVendors,
  onRemoveSavedVendor,
}: CustomerSavedTabProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-[#E8E2D9]">
        <div>
          <h3 className="text-lg font-serif font-bold text-[#221F1C]">Saved Professionals</h3>
          <p className="text-xs text-[#6B6560]">Your curated wishlist of top wedding creative partners</p>
        </div>
        <Link href="/vendors">
          <Button size="sm" className="bg-[#9E5338] hover:bg-[#86442B] text-white rounded-full text-xs font-medium px-5 cursor-pointer">
            + Explore More
          </Button>
        </Link>
      </div>

      {savedVendors.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-dashed border-[#E8E2D9]">
          <Heart size={36} className="mx-auto text-[#6B6560] mb-3" />
          <h4 className="text-sm font-bold text-[#221F1C] mb-1">Your Wishlist is Empty</h4>
          <p className="text-xs text-[#6B6560] mb-4">Save photographers, makeup artists, and planners as you explore.</p>
          <Link href="/vendors">
            <Button size="sm" className="bg-[#9E5338] hover:bg-[#86442B] text-white rounded-full text-xs font-medium px-6 cursor-pointer">
              Browse Directory
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedVendors.map((vendor) => (
            <div key={vendor.id} className="bg-white rounded-2xl border border-[#E8E2D9] overflow-hidden shadow-sm hover:border-[#9E5338]/40 transition-all group flex flex-col justify-between">
              <div>
                <div className="relative aspect-[16/10] w-full bg-[#FBF8F4]">
                  <Link href={`/vendors/${vendor.slug || vendor.id}`} className="block w-full h-full cursor-pointer">
                    <ImageWithFallback src={vendor.image} alt={vendor.name} fill unoptimized className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    <span className="absolute bottom-3 left-3 text-[10px] font-bold uppercase tracking-wider text-white bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md pointer-events-none">
                      {vendor.category}
                    </span>
                  </Link>
                  <button
                    onClick={() => onRemoveSavedVendor(vendor.id)}
                    className="absolute top-3 right-3 size-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-rose-500 hover:bg-rose-500 hover:text-white transition-colors cursor-pointer shadow-md z-10"
                    aria-label={`Remove ${vendor.name} from saved wishlist`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="p-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <Link href={`/vendors/${vendor.slug || vendor.id}`}>
                      <h4 className="text-base font-serif font-bold text-[#221F1C] hover:text-[#9E5338] transition-colors cursor-pointer">{vendor.name}</h4>
                    </Link>
                    <div className="flex items-center gap-1 text-xs font-bold text-[#221F1C]">
                      <Star size={13} className="fill-[#D97706] text-[#D97706]" />
                      {vendor.rating}
                    </div>
                  </div>

                  <p className="text-xs text-[#6B6560] flex items-center gap-1">
                    <MapPin size={13} className="text-[#9E5338]" />
                    {vendor.location}
                  </p>

                  <div className="pt-2 flex items-center justify-between text-xs border-t border-[#E8E2D9] mt-3">
                    <span className="text-[#6B6560]">Starting Packages</span>
                    <span className="font-bold text-[#221F1C]">{vendor.price}</span>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0">
                <Link href={`/vendors/${vendor.slug || vendor.id}`}>
                  <Button size="sm" className="w-full bg-[#F3EADF] hover:bg-[#9E5338] hover:text-white text-[#9E5338] font-bold text-xs rounded-full h-9 transition-colors cursor-pointer">
                    View Vendor Profile
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
