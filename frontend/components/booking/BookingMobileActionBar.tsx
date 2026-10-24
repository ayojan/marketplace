'use client';

import React from 'react';
import { IndianRupee, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BookingMobileActionBarProps {
  step: number;
  setStep: (step: number) => void;
  totalAmount: number;
  location: string;
  bookingDate: string;
  startTime: string;
  isAvailable: boolean | null;
  checkingAvailability: boolean;
  isSlotInPast: boolean;
  loading: boolean;
  onConfirmBooking: () => void;
}

export default function BookingMobileActionBar({
  step,
  setStep,
  totalAmount,
  location,
  bookingDate,
  startTime,
  isAvailable,
  checkingAvailability,
  isSlotInPast,
  loading,
  onConfirmBooking
}: BookingMobileActionBarProps) {
  return (
    <aside
      aria-label="Booking step actions"
      className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-xl border-t border-[#E8E2D9] p-3.5 pb-safe shadow-[0_-4px_20px_rgba(34,31,28,0.08)] lg:hidden"
    >
      <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
        <div>
          <span className="text-[10px] text-[#6B6560] font-medium block">
            Step {step} of 3 · Total
          </span>
          <div className="text-base font-serif font-bold text-[#9E5338] flex items-center leading-none">
            <IndianRupee className="size-3.5 text-[#9E5338] -mr-0.5" strokeWidth={2.5} />
            <span>{totalAmount.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {step === 1 && (
            <Button
              onClick={() => setStep(2)}
              disabled={!location.trim()}
              className="h-10 px-5 rounded-full font-medium text-xs bg-[#9E5338] hover:bg-[#86442B] text-white shadow-xs transition-transform active:scale-95 cursor-pointer"
            >
              Schedule
              <ChevronRight className="size-4 ml-1" />
            </Button>
          )}

          {step === 2 && (
            <>
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="h-10 px-3.5 rounded-full border-[#E8E2D9] bg-white text-[#221F1C] text-xs font-semibold active:scale-95 cursor-pointer"
              >
                Back
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={!bookingDate || !startTime || isAvailable === false || checkingAvailability || isSlotInPast}
                className="h-10 px-4 rounded-full font-medium text-xs bg-[#9E5338] hover:bg-[#86442B] text-white shadow-xs transition-transform active:scale-95 cursor-pointer"
              >
                Review
                <ChevronRight className="size-4 ml-1" />
              </Button>
            </>
          )}

          {step === 3 && (
            <>
              <Button
                variant="outline"
                onClick={() => setStep(2)}
                className="h-10 px-3.5 rounded-full border-[#E8E2D9] bg-white text-[#221F1C] text-xs font-semibold active:scale-95 cursor-pointer"
              >
                Back
              </Button>
              <Button
                onClick={onConfirmBooking}
                disabled={loading}
                className="h-10 px-4 rounded-full font-medium text-xs bg-[#9E5338] hover:bg-[#86442B] text-white shadow-xs transition-transform active:scale-95 cursor-pointer"
              >
                {loading ? <Loader2 className="size-4 animate-spin mr-1.5" /> : null}
                Confirm & Book
              </Button>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
