'use client';

import React from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ArrowLeftRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CompareVendor, FALLBACK_IMAGE } from './constants';

interface CompareFloatingDockProps {
  vendors: CompareVendor[];
  onRemove: (vendorId: string | number) => void;
  onClear: () => void;
  onOpenInquire: () => void;
  onOpenModal: () => void;
}

export default function CompareFloatingDock({
  vendors,
  onRemove,
  onClear,
  onOpenInquire,
  onOpenModal
}: CompareFloatingDockProps) {
  if (!vendors || vendors.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 280 }}
        className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-2xl bg-white/95 backdrop-blur-md border border-[#E8E2D9] shadow-2xl rounded-2xl p-3 sm:px-5 sm:py-3.5 flex items-center justify-between gap-3"
      >
        {/* Left: Indicator & Thumbnails */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="size-8 rounded-xl bg-[#F3EADF] border border-[#E8E2D9] flex items-center justify-center text-[#9E5338] shrink-0">
            <Send className="size-4" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#221F1C]">
                Inquiry Basket ({vendors.length}/3)
              </span>
              <button
                type="button"
                onClick={onClear}
                className="text-[11px] text-[#6B6560] hover:text-[#9E5338] underline cursor-pointer"
              >
                Clear all
              </button>
            </div>

            {/* Avatars */}
            <div className="flex items-center gap-1.5 pt-1">
              {vendors.map((v) => {
                const name = v.name || v.business_name || 'Vendor';
                const img = v.image || v.profile_image_url || FALLBACK_IMAGE;
                return (
                  <div
                    key={v.id}
                    className="group/thumb relative size-7 rounded-full border border-white ring-1 ring-[#E8E2D9] overflow-hidden shrink-0 shadow-2xs"
                    title={name}
                  >
                    <Image
                      src={img}
                      alt={name}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemove(v.id);
                      }}
                      aria-label={`Remove ${name} from basket`}
                      className="absolute inset-0 bg-black/60 flex items-center justify-center text-white opacity-0 group-hover/thumb:opacity-100 transition-opacity cursor-pointer"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Primary Inquire All & Secondary Compare Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            onClick={onOpenInquire}
            className="h-9 px-3.5 sm:px-4 bg-[#9E5338] hover:bg-[#86442B] text-white text-xs font-semibold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer shrink-0 gap-1.5"
          >
            <Send className="size-3" />
            <span className="hidden sm:inline">Inquire All ({vendors.length})</span>
            <span className="sm:hidden">Inquire ({vendors.length})</span>
          </Button>

          <button
            type="button"
            onClick={onOpenModal}
            className="h-9 px-3 bg-[#FAF7F2] hover:bg-[#F3EADF] text-[#221F1C] border border-[#E8E2D9] text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 shrink-0"
          >
            <ArrowLeftRight className="size-3 text-[#9E5338]" />
            <span className="hidden sm:inline">Compare</span>
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
