'use client';

import React from 'react';
import { IndianRupee, MessageSquare, Calendar, ArrowRight, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VendorStickyMobileBarProps {
  selectedService?: any;
  basePrice?: number | string;
  bookingDate?: string;
  totalPrice?: number;
  onOpenInquire: () => void;
  onOpenReservation: () => void;
}

export default function VendorStickyMobileBar({
  selectedService,
  basePrice,
  bookingDate,
  totalPrice = 0,
  onOpenInquire,
  onOpenReservation,
}: VendorStickyMobileBarProps) {
  const priceDisplay = totalPrice > 0 
    ? `₹${totalPrice.toLocaleString('en-IN')}`
    : selectedService?.base_price 
      ? `₹${Number(selectedService.base_price).toLocaleString('en-IN')}`
      : basePrice 
        ? `₹${Number(basePrice).toLocaleString('en-IN')} onwards`
        : 'On request';

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E8E2D9] px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] flex items-center justify-between gap-3">
      {/* Price & Date Context */}
      <div className="min-w-0 flex-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#9E5338] block truncate">
          {selectedService?.name || 'Starting Package'}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-base font-serif font-bold text-[#221F1C]">
            {priceDisplay}
          </span>
          {bookingDate && (
            <span className="text-[10px] font-semibold text-[#6B6560] bg-[#FAF7F2] border border-[#E8E2D9] px-1.5 py-0.5 rounded-md flex items-center gap-1">
              <Calendar className="size-2.5 text-[#9E5338]" />
              {new Date(bookingDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onOpenInquire}
          title="Ask artist a question"
          className="size-10 rounded-xl bg-[#FAF7F2] hover:bg-[#F3EADF] border border-[#E8E2D9] text-[#221F1C] flex items-center justify-center transition-colors cursor-pointer active:scale-95"
          aria-label="Ask a question"
        >
          <MessageSquare className="size-4 text-[#9E5338]" />
        </button>

        <Button
          type="button"
          onClick={onOpenReservation}
          className="h-10 px-4 bg-[#9E5338] hover:bg-[#86442B] text-white text-xs font-semibold rounded-xl shadow-xs transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
        >
          <span>{selectedService ? 'Reserve Date' : 'Check Date & Inquire'}</span>
          <ArrowRight className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
