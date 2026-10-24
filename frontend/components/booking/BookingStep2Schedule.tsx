'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, AlertCircle, Loader2, CheckCircle2, CalendarDays, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AlternativeSlot } from './types';

interface BookingStep2ScheduleProps {
  bookingDate: string;
  setBookingDate: (val: string) => void;
  startTime: string;
  setStartTime: (val: string) => void;
  todayStr: string;
  currentTimeStr: string;
  isSlotInPast: boolean;
  checkingAvailability: boolean;
  isAvailable: boolean | null;
  alternatives: AlternativeSlot[];
  onSelectAlternative: (alt: AlternativeSlot) => void;
  onBack: () => void;
  onReview: () => void;
}

export default function BookingStep2Schedule({
  bookingDate,
  setBookingDate,
  startTime,
  setStartTime,
  todayStr,
  currentTimeStr,
  isSlotInPast,
  checkingAvailability,
  isAvailable,
  alternatives,
  onSelectAlternative,
  onBack,
  onReview
}: BookingStep2ScheduleProps) {
  return (
    <motion.div
      key="step2"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-white border border-[#E8E2D9] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6"
    >
      <div>
        <h3 className="text-xl font-serif font-normal text-[#221F1C]">
          Select Date & Starting Time
        </h3>
        <p className="text-xs text-[#6B6560] mt-1">
          Pick your preferred celebration date. We will check the professional's availability in real time.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="booking-date" className="text-xs font-bold text-[#221F1C] block">
            Event Date <span className="text-[#9E5338]">*</span>
          </label>
          <div className="relative">
            <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#6B6560]" />
            <input
              id="booking-date"
              type="date"
              value={bookingDate}
              min={todayStr}
              onChange={(e) => setBookingDate(e.target.value)}
              className="w-full bg-[#FBF8F4] border border-[#E8E2D9] rounded-xl h-11 pl-10 pr-4 text-xs text-[#221F1C] focus:outline-none focus:border-[#9E5338] transition-colors"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label htmlFor="booking-time" className="text-xs font-bold text-[#221F1C] block">
            Starting Time <span className="text-[#9E5338]">*</span>
          </label>
          <div className="relative">
            <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#6B6560]" />
            <input
              id="booking-time"
              type="time"
              value={startTime}
              min={bookingDate === todayStr ? currentTimeStr : undefined}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full bg-[#FBF8F4] border border-[#E8E2D9] rounded-xl h-11 pl-10 pr-4 text-xs text-[#221F1C] focus:outline-none focus:border-[#9E5338] transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Availability Status Feedback */}
      <div>
        {isSlotInPast ? (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-2.5 text-xs text-amber-800 font-medium">
            <AlertCircle className="size-4.5 text-amber-600 shrink-0" />
            <span>The selected date or time has already passed. Please choose an upcoming date and time.</span>
          </div>
        ) : checkingAvailability ? (
          <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E8E2D9] flex items-center gap-3 text-xs text-[#6B6560]">
            <Loader2 className="size-4 animate-spin text-[#9E5338]" /> Checking professional availability for this slot...
          </div>
        ) : isAvailable === true ? (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-xs text-emerald-800 font-medium">
            <CheckCircle2 className="size-4.5 text-emerald-600 shrink-0" />
            <span>
              Professional is available on{' '}
              {bookingDate ? new Date(bookingDate).toLocaleDateString(undefined, { dateStyle: 'medium' }) : ''} at {startTime}!
            </span>
          </div>
        ) : isAvailable === false ? (
          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-2.5 text-xs text-amber-800 font-medium">
              <AlertCircle className="size-4.5 text-amber-600 shrink-0" />
              <span>This slot is currently booked. Please choose another date or an alternative time below.</span>
            </div>

            {alternatives.length > 0 && (
              <div className="space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#6B6560]">
                  Suggested Alternative Slots
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {alternatives.map((alt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => onSelectAlternative(alt)}
                      className="flex items-center justify-between p-3 rounded-xl bg-[#FAF7F2] border border-[#E8E2D9] hover:border-[#9E5338] hover:bg-[#F3EADF] transition-all group text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 text-xs">
                        <CalendarDays className="size-4 text-[#9E5338]" />
                        <span className="font-semibold text-[#221F1C]">
                          {new Date(alt.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span className="text-[#6B6560]">•</span>
                        <span className="text-[#6B6560]">{alt.start_time}</span>
                      </div>
                      <span className="text-[11px] font-bold text-[#9E5338] group-hover:underline">Select</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}
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
          onClick={onReview}
          disabled={!bookingDate || !startTime || isAvailable === false || checkingAvailability || isSlotInPast}
          className="flex-[2] h-11 rounded-full font-medium text-xs bg-[#9E5338] hover:bg-[#86442B] text-white shadow-xs transition-colors cursor-pointer"
        >
          Review Booking
          <ChevronRight className="size-4 ml-1" />
        </Button>
      </div>
    </motion.div>
  );
}
