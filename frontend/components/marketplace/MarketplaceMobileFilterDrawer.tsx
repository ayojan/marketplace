'use client';

import React from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

export interface MarketplaceMobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeFiltersCount: number;
  onResetAll: () => void;
  resultsCount: number;
  children: React.ReactNode;
}

export function MarketplaceMobileFilterDrawer({
  isOpen,
  onClose,
  activeFiltersCount,
  onResetAll,
  resultsCount,
  children,
}: MarketplaceMobileFilterDrawerProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 lg:hidden"
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 260 }}
            className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-white z-50 shadow-2xl flex flex-col lg:hidden"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#E8E2D9] bg-[#FAF7F2]">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="size-4 text-[#9E5338]" />
                <h2 className="text-sm font-serif font-bold text-[#221F1C]">Filters</h2>
                {activeFiltersCount > 0 && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#F3EADF] text-[#86442B] font-semibold">
                    {activeFiltersCount}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="size-7 rounded-full bg-white border border-[#E8E2D9] flex items-center justify-center text-[#6B6560] hover:text-[#221F1C] cursor-pointer"
                aria-label="Close filters"
              >
                <X className="size-3.5" />
              </button>
            </div>

            {/* Drawer Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {children}
            </div>

            {/* Drawer Sticky Bottom Footer */}
            <div className="p-4 border-t border-[#E8E2D9] bg-[#FAF7F2] flex items-center gap-2">
              {activeFiltersCount > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onResetAll}
                  className="flex-1 h-10 text-xs border-[#E8E2D9] text-[#6B6560] rounded-xl cursor-pointer"
                >
                  Clear all
                </Button>
              )}
              <Button
                type="button"
                onClick={onClose}
                className="flex-1 h-10 bg-[#9E5338] hover:bg-[#86442B] text-white text-xs font-semibold rounded-xl cursor-pointer"
              >
                Show {resultsCount} pros
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
