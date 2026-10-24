'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ShieldCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Service } from './constants';

interface BookingStep3ReviewProps {
  service: Service | null;
  bookingDate: string;
  startTime: string;
  location: string;
  requirements: string;
  loading: boolean;
  onBack: () => void;
  onConfirm: () => void;
}

export default function BookingStep3Review({
  service,
  bookingDate,
  startTime,
  location,
  requirements,
  loading,
  onBack,
  onConfirm
}: BookingStep3ReviewProps) {
  return (
    <motion.div
      key="step3"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="bg-white border border-[#E8E2D9] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6"
    >
      <div className="text-center space-y-2">
        <div className="size-14 rounded-full bg-[#F3EADF] text-[#9E5338] flex items-center justify-center mx-auto mb-2 border border-[#E8E2D9]">
          <CheckCircle2 className="size-7" />
        </div>
        <h3 className="text-2xl font-serif font-normal text-[#221F1C]">Almost Ready to Book!</h3>
        <p className="text-xs text-[#6B6560] max-w-sm mx-auto">
          Review your celebration details below. Your request will be sent directly to{' '}
          <span className="font-semibold text-[#221F1C]">{service?.vendor?.business_name}</span>.
        </p>
      </div>

      {/* Review Summary Card */}
      <div className="bg-[#FAF7F2] border border-[#E8E2D9] rounded-xl p-5 space-y-3.5 text-xs">
        <div className="flex justify-between items-center border-b border-[#E8E2D9] pb-3">
          <span className="font-semibold text-[#6B6560]">Scheduled Date & Time</span>
          <span className="font-bold text-[#221F1C]">
            {bookingDate ? new Date(bookingDate).toLocaleDateString(undefined, { dateStyle: 'long' }) : ''} @ {startTime}
          </span>
        </div>
        <div className="flex justify-between items-center border-b border-[#E8E2D9] pb-3">
          <span className="font-semibold text-[#6B6560]">Event Location</span>
          <span className="font-bold text-[#221F1C] text-right max-w-xs truncate">{location}</span>
        </div>
        {requirements && (
          <div className="space-y-1">
            <span className="font-semibold text-[#6B6560] block">Special Requirements:</span>
            <p className="text-[#221F1C] leading-relaxed bg-white p-2.5 rounded-lg border border-[#E8E2D9]">
              {requirements}
            </p>
          </div>
        )}
      </div>

      {/* Payment & Escrow Guarantee Note */}
      <div className="p-3.5 rounded-xl bg-[#F3EADF] border border-[#E8E2D9] flex items-start gap-3 text-xs text-[#221F1C]">
        <ShieldCheck className="size-5 text-[#9E5338] shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-bold text-[#9E5338]">Ayoj Escrow Protection Guarantee</p>
          <p className="text-[11px] text-[#6B6560] leading-relaxed">
            Your payment is held in trust by Ayoj and only disbursed to the professional after the event is successfully delivered to your satisfaction.
          </p>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex-1 h-11 rounded-full border-[#E8E2D9] bg-white hover:bg-[#F3EADF] text-[#221F1C] text-xs font-semibold cursor-pointer"
        >
          Back
        </Button>
        <Button
          onClick={onConfirm}
          disabled={loading}
          className="flex-[2] h-11 rounded-full font-medium text-xs bg-[#9E5338] hover:bg-[#86442B] text-white shadow-xs transition-colors cursor-pointer"
        >
          {loading ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
          Confirm & Send Booking Request
        </Button>
      </div>
    </motion.div>
  );
}
