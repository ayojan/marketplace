'use client';

import React from 'react';
import Image from 'next/image';
import { AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface PortfolioLightboxProps {
  imageUrl: string | null;
  onClose: () => void;
}

export default function PortfolioLightbox({
  imageUrl,
  onClose
}: PortfolioLightboxProps) {
  return (
    <AnimatePresence>
      {imageUrl && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md cursor-zoom-out"
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 size-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="size-5" />
          </button>
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl max-h-[85vh] w-full h-[80vh] flex items-center justify-center"
          >
            <Image
              src={imageUrl}
              alt="Full preview"
              fill
              unoptimized
              className="object-contain"
            />
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
