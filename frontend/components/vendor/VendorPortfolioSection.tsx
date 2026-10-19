'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Eye, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PortfolioPhoto } from './types';

interface VendorPortfolioSectionProps {
  allPhotos: PortfolioPhoto[];
  filteredPhotos: PortfolioPhoto[];
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  onOpenLightbox: (index: number) => void;
  isOwner: boolean;
}

export default function VendorPortfolioSection({
  allPhotos,
  filteredPhotos,
  categories,
  selectedCategory,
  onSelectCategory,
  onOpenLightbox,
  isOwner,
}: VendorPortfolioSectionProps) {
  return (
    <section id="portfolio" className="scroll-mt-28 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-serif font-bold text-[#221F1C]">Selected Portfolio</h2>
          <p className="text-xs text-[#6B6560] mt-0.5">
            {allPhotos.length > 0
              ? `Showcase of client celebrations, candids, and editorial highlights (${allPhotos.length} ${allPhotos.length === 1 ? 'photo' : 'photos'})`
              : 'Showcase of client celebrations, candids, and editorial highlights'}
          </p>
        </div>

        {isOwner && (
          <Link href="/vendor/dashboard?tab=portfolio">
            <Button
              size="sm"
              variant="outline"
              className="rounded-full border-[#E8E2D9] text-[#9E5338] hover:bg-[#F5ECE2] text-xs h-8 px-3 gap-1 shadow-xs cursor-pointer"
            >
              <Plus className="size-3.5" /> Manage Photos
            </Button>
          </Link>
        )}
      </div>

      {/* Category filter pills if multiple categories */}
      {categories.length > 2 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => onSelectCategory(cat)}
              className={`px-3 py-1 rounded-full whitespace-nowrap transition-all text-xs font-medium border cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#9E5338] text-white border-[#9E5338] shadow-xs'
                  : 'bg-white text-[#6B6560] border-[#E8E2D9] hover:border-[#9E5338]/40 hover:text-[#221F1C]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Photo Grid or Empty State */}
      {allPhotos.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {filteredPhotos.map((photo, i) => (
            <div
              key={photo.id || i}
              onClick={() => onOpenLightbox(i)}
              className="relative aspect-4/5 rounded-2xl overflow-hidden border border-[#E8E2D9] bg-[#F3EADF] group cursor-pointer shadow-xs"
            >
              <Image
                src={photo.url}
                alt={photo.title || 'work gallery'}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                unoptimized
              />

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3.5">
                <span className="self-start px-2 py-0.5 rounded-full text-[9px] font-bold bg-white/95 text-[#221F1C] backdrop-blur-xs shadow-xs">
                  {photo.category}
                </span>
                <div className="flex items-center justify-between text-white">
                  <span className="text-xs font-semibold line-clamp-1">{photo.title}</span>
                  <Eye className="size-4 shrink-0 ml-1.5 text-white/90" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 rounded-2xl border border-dashed border-[#E8E2D9] bg-[#FAF7F2] text-center space-y-3">
          <div className="size-12 rounded-full bg-[#F3EADF] text-[#9E5338] flex items-center justify-center mx-auto">
            <Camera className="size-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif font-bold text-[#221F1C] text-base">No Portfolio Showcases Yet</h3>
            <p className="text-xs text-[#6B6560] max-w-sm mx-auto">
              This vendor has not uploaded portfolio galleries or showcases yet. Check back soon for event highlights!
            </p>
          </div>
          {isOwner && (
            <Link href="/vendor/dashboard?tab=portfolio">
              <Button
                size="sm"
                className="mt-2 bg-[#9E5338] hover:bg-[#85432B] text-white rounded-full text-xs"
              >
                <Plus className="size-3.5 mr-1" /> Upload Your First Showcase
              </Button>
            </Link>
          )}
        </div>
      )}
    </section>
  );
}
