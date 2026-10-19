'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { PortfolioPhoto } from './types';

interface VendorLightboxModalProps {
  lightboxIndex: number | null;
  photos: PortfolioPhoto[];
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export default function VendorLightboxModal({
  lightboxIndex,
  photos,
  onClose,
  onPrev,
  onNext,
}: VendorLightboxModalProps) {
  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNext();
      if (e.key === 'ArrowLeft') onPrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, onClose, onNext, onPrev]);

  return (
    <AnimatePresence>
      {lightboxIndex !== null && photos[lightboxIndex] && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md cursor-zoom-out"
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 size-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-50 cursor-pointer"
            aria-label="Close lightbox"
          >
            <X className="size-5" />
          </button>

          {/* Previous Arrow */}
          {photos.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onPrev();
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 size-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-50 cursor-pointer"
              aria-label="Previous photo"
            >
              <ChevronLeft className="size-6" />
            </button>
          )}

          {/* Next Arrow */}
          {photos.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onNext();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 size-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-50 cursor-pointer"
              aria-label="Next photo"
            >
              <ChevronRight className="size-6" />
            </button>
          )}

          {/* Center Image Container */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl max-h-[85vh] w-full flex flex-col items-center cursor-default"
          >
            <div className="relative w-full h-[70vh]">
              <Image
                src={photos[lightboxIndex].url}
                alt={photos[lightboxIndex].title || 'Photo view'}
                fill
                unoptimized
                className="object-contain"
              />
            </div>

            {/* Caption pill */}
            <div className="mt-3 px-4 py-2 rounded-full bg-black/60 backdrop-blur-md text-white text-xs flex items-center gap-3">
              <span className="font-semibold">{photos[lightboxIndex].title}</span>
              <span className="text-white/40">•</span>
              <span className="text-white/80">{photos[lightboxIndex].category}</span>
              <span className="text-white/40">•</span>
              <span className="text-white/60">
                {lightboxIndex + 1} of {photos.length}
              </span>
            </div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
