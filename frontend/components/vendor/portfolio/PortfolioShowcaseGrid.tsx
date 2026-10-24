'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Camera, Star, Trash2, Image as ImageIcon, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PortfolioItemType } from './types';

interface PortfolioShowcaseGridProps {
  items: PortfolioItemType[];
  searchQuery: string;
  activeCategoryFilter: string;
  onSelectCollection: (item: PortfolioItemType) => void;
  onToggleFeatured: (item: PortfolioItemType, e?: React.MouseEvent) => void;
  onDeleteShowcase: (id: string | number, title: string, e?: React.MouseEvent) => void;
  onResetFilters: () => void;
}

export default function PortfolioShowcaseGrid({
  items,
  searchQuery,
  activeCategoryFilter,
  onSelectCollection,
  onToggleFeatured,
  onDeleteShowcase,
  onResetFilters
}: PortfolioShowcaseGridProps) {
  if (items.length === 0) {
    return (
      <div className="col-span-full py-16 text-center border border-dashed border-[#E8E2D9] rounded-2xl bg-white p-8">
        <Camera className="size-10 text-[#6B6560]/40 mx-auto mb-2" />
        <h4 className="text-base font-serif font-bold text-[#221F1C]">No showcases found</h4>
        <p className="text-xs text-[#6B6560] max-w-sm mx-auto mt-1 mb-4">
          {searchQuery || activeCategoryFilter !== 'All'
            ? 'Try adjusting your search terms or category filter to discover your collections.'
            : 'Your portfolio is currently empty. Upload your first wedding or event showcase above.'}
        </p>
        {(searchQuery || activeCategoryFilter !== 'All') && (
          <Button
            variant="outline"
            size="sm"
            onClick={onResetFilters}
            className="rounded-full text-xs border-[#E8E2D9] text-[#221F1C]"
          >
            Reset Filters
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {items.map((item, index) => {
        const coverImage = item.images?.[0]?.url || item.images?.[0]?.thumbnail_url;
        const photoCount = item.images?.length || item.image_count || 0;

        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: index * 0.04 }}
            onClick={() => onSelectCollection(item)}
            className="group relative rounded-2xl overflow-hidden border border-[#E8E2D9] bg-white shadow-xs hover:border-[#9E5338]/60 hover:shadow-md transition-all cursor-pointer flex flex-col"
          >
            {/* Media Thumbnail Container */}
            <div className="relative aspect-4/3 w-full bg-[#FAF7F2] overflow-hidden">
              {coverImage ? (
                <Image
                  src={coverImage}
                  alt={item.title}
                  fill
                  unoptimized
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-[#6B6560]">
                  <Camera className="size-8 stroke-1 text-[#6B6560]/40 mb-1" />
                  <span className="text-[10px]">No photos yet</span>
                </div>
              )}

              {/* Gradient shade on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

              {/* Top Badges & Quick Action Buttons */}
              <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1 z-10">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/95 backdrop-blur-md text-[#221F1C] shadow-xs">
                  {item.category}
                </span>

                <div className="flex items-center gap-1.5">
                  {/* Featured Star Toggle */}
                  <button
                    type="button"
                    onClick={(e) => onToggleFeatured(item, e)}
                    title={item.is_featured ? 'Remove from featured' : 'Highlight as featured'}
                    className={`p-1.5 rounded-full backdrop-blur-md transition-all cursor-pointer ${
                      item.is_featured
                        ? 'bg-amber-400 text-[#221F1C] shadow-xs'
                        : 'bg-black/40 text-white hover:bg-black/60'
                    }`}
                  >
                    <Star className={`size-3.5 ${item.is_featured ? 'fill-[#221F1C]' : ''}`} />
                  </button>

                  {/* Delete Showcase button */}
                  <button
                    type="button"
                    onClick={(e) => onDeleteShowcase(item.id, item.title, e)}
                    title="Delete showcase"
                    className="p-1.5 rounded-full bg-black/40 text-white hover:bg-red-600 transition-colors cursor-pointer backdrop-blur-md"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>

              {/* Bottom Photo Count Pill */}
              <div className="absolute bottom-2.5 right-2.5 z-10">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-black/60 backdrop-blur-md text-white flex items-center gap-1">
                  <ImageIcon className="size-3 text-[#9E5338]" />
                  {photoCount} {photoCount === 1 ? 'photo' : 'photos'}
                </span>
              </div>
            </div>

            {/* Card Meta Content */}
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-serif font-bold text-sm text-[#221F1C] line-clamp-1 group-hover:text-[#9E5338] transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-[#6B6560] line-clamp-2 mt-1 leading-relaxed">
                  {item.description || 'Editorial gallery showcasing candid moments, lighting, and venue atmosphere.'}
                </p>
              </div>

              <div className="pt-3 mt-3 border-t border-[#E8E2D9] flex items-center justify-between text-[11px] text-[#6B6560]">
                <span className="flex items-center gap-1">
                  {item.is_featured && (
                    <span className="inline-block size-1.5 rounded-full bg-amber-500" />
                  )}
                  {item.is_featured ? 'Featured Hero' : 'Standard'}
                </span>
                <span className="text-[#9E5338] font-medium flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                  Manage <ChevronRight className="size-3" />
                </span>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
