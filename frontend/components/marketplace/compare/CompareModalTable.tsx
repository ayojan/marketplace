'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeftRight, X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CompareVendor } from './constants';
import CompareVendorColumn from './CompareVendorColumn';

interface CompareModalTableProps {
  isOpen: boolean;
  onClose: () => void;
  vendors: CompareVendor[];
  onRemove: (vendorId: string | number) => void;
  onClear: () => void;
  onOpenInquireAll: () => void;
  onOpenDirectInquire?: (vendor: CompareVendor) => void;
}

export default function CompareModalTable({
  isOpen,
  onClose,
  vendors,
  onRemove,
  onClear,
  onOpenInquireAll,
  onOpenDirectInquire
}: CompareModalTableProps) {
  if (!isOpen || !vendors || vendors.length === 0) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-xs"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ type: 'spring', damping: 26, stiffness: 260 }}
          className="relative w-full max-w-4xl bg-white rounded-3xl border border-[#E8E2D9] shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
        >
          {/* Modal Header */}
          <div className="p-5 sm:p-6 border-b border-[#E8E2D9] bg-[#FAF7F2] flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#9E5338] uppercase tracking-wider mb-0.5">
                <ArrowLeftRight className="size-3.5" />
                <span>Side-by-Side Comparison</span>
              </div>
              <h3 className="text-lg sm:text-xl font-serif font-bold text-[#221F1C]">
                Comparing {vendors.length} Creative {vendors.length === 1 ? 'Partner' : 'Partners'}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClear}
                className="text-xs text-[#6B6560] hover:text-[#9E5338] underline px-2 py-1 cursor-pointer"
              >
                Clear selection
              </button>
              <button
                type="button"
                onClick={onClose}
                className="size-8 rounded-full bg-white hover:bg-[#F3EADF] border border-[#E8E2D9] flex items-center justify-center text-[#221F1C] cursor-pointer"
                aria-label="Close comparison"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>

          {/* Comparison Table / Grid Body */}
          <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
            <div
              className={`grid gap-4 sm:gap-6 ${
                vendors.length === 1
                  ? 'grid-cols-1 max-w-sm mx-auto'
                  : vendors.length === 2
                  ? 'grid-cols-1 sm:grid-cols-2'
                  : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'
              }`}
            >
              {vendors.map((vendor) => (
                <CompareVendorColumn
                  key={vendor.id}
                  vendor={vendor}
                  onRemove={onRemove}
                  onOpenInquire={onOpenDirectInquire}
                  onCloseModal={onClose}
                />
              ))}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="p-4 border-t border-[#E8E2D9] bg-[#FAF7F2] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#6B6560]">
            <span>
              Tip: Compare verified reviews, published pricing, and portfolios before sending an inquiry.
            </span>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenInquireAll();
                }}
                className="flex-1 sm:flex-none h-8 px-4 bg-[#9E5338] hover:bg-[#86442B] text-white text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="size-3" />
                <span>Inquire All ({vendors.length})</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="h-8 text-xs rounded-xl border-[#E8E2D9]"
              >
                Close
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
