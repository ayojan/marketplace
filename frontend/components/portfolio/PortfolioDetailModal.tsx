'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, Plus, Eye, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PortfolioItemType } from './constants';

interface PortfolioDetailModalProps {
  collection: PortfolioItemType | null;
  onClose: () => void;
  onToggleFeatured: (item: PortfolioItemType) => void;
  onAddPhotos: (files: FileList | File[]) => void;
  onDeletePhoto: (imageId: string | number, e: React.MouseEvent) => void;
  onDeleteShowcase: (id: string | number, title: string, e?: React.MouseEvent) => void;
  onViewImage: (url: string) => void;
}

export default function PortfolioDetailModal({
  collection,
  onClose,
  onToggleFeatured,
  onAddPhotos,
  onDeletePhoto,
  onDeleteShowcase,
  onViewImage
}: PortfolioDetailModalProps) {
  const detailDropzoneInputRef = useRef<HTMLInputElement>(null);

  return (
    <AnimatePresence>
      {collection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-3xl border border-[#E8E2D9] shadow-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 space-y-6"
          >
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-[#E8E2D9]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F5ECE2] text-[#9E5338] border border-[#E8E2D9]">
                    {collection.category}
                  </span>
                  {collection.is_featured && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
                      <Star className="size-3 fill-amber-700" /> Featured
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-serif font-bold text-[#221F1C] mt-1.5">
                  {collection.title}
                </h2>
                <p className="text-xs text-[#6B6560] mt-1">
                  {collection.description || 'No story provided for this collection.'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onToggleFeatured(collection)}
                  className={`p-2 rounded-full border transition-all cursor-pointer ${
                    collection.is_featured
                      ? 'border-amber-400 bg-amber-50 text-amber-700'
                      : 'border-[#E8E2D9] bg-white text-[#6B6560] hover:text-[#221F1C]'
                  }`}
                  title={collection.is_featured ? 'Remove featured' : 'Make featured'}
                >
                  <Star className={`size-4 ${collection.is_featured ? 'fill-amber-600' : ''}`} />
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="size-8 rounded-full border border-[#E8E2D9] flex items-center justify-center text-[#6B6560] hover:text-[#221F1C] hover:bg-[#FAF7F2] transition-colors"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            {/* Photos Gallery */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-[#221F1C] uppercase tracking-wider">
                  Showcase Photos ({collection.images.length})
                </h3>
                <button
                  type="button"
                  onClick={() => detailDropzoneInputRef.current?.click()}
                  className="text-xs font-semibold text-[#9E5338] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="size-3.5" /> Upload More Photos
                </button>
                <input
                  ref={detailDropzoneInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files && onAddPhotos(e.target.files)}
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {collection.images.map((img, idx) => (
                  <div
                    key={img.id}
                    onClick={() => onViewImage(img.url)}
                    className="group relative aspect-square rounded-2xl overflow-hidden border border-[#E8E2D9] bg-[#FAF7F2] cursor-pointer"
                  >
                    <Image
                      src={img.thumbnail_url || img.url}
                      alt="collection photo"
                      fill
                      unoptimized
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    {idx === 0 && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[9px] font-bold bg-[#9E5338] text-white shadow-xs z-10">
                        Cover
                      </span>
                    )}

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewImage(img.url);
                        }}
                        title="View High-Res"
                        className="p-1.5 rounded-full bg-white/90 text-[#221F1C] hover:bg-white transition-colors"
                      >
                        <Eye className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => onDeletePhoto(img.id, e)}
                        title="Delete Photo"
                        className="p-1.5 rounded-full bg-white/90 text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-[#E8E2D9]">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => onDeleteShowcase(collection.id, collection.title, e)}
                className="rounded-full text-red-600 border-red-200 hover:bg-red-50 text-xs h-9 px-4 gap-1.5"
              >
                <Trash2 className="size-3.5" />
                Delete Showcase
              </Button>

              <Button
                size="sm"
                onClick={onClose}
                className="bg-[#9E5338] hover:bg-[#86442B] text-white rounded-full text-xs font-semibold h-9 px-6"
              >
                Done
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
