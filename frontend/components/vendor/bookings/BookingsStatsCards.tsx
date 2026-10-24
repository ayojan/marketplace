'use client';

import React from 'react';
import { AlertCircle, CalendarCheck, Sparkles, IndianRupee } from 'lucide-react';

interface BookingsStatsCardsProps {
  counts: {
    all: number;
    pending: number;
    accepted: number;
    completed: number;
    declined: number;
    totalRevenue: number;
  };
}

export default function BookingsStatsCards({ counts }: BookingsStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="p-4 rounded-2xl bg-white border border-[#E8E2D9] shadow-xs">
        <div className="flex items-center justify-between text-xs font-bold text-[#6B6560] uppercase tracking-wider mb-1">
          <span>Pending Requests</span>
          <AlertCircle className="size-4 text-amber-600" />
        </div>
        <div className="flex items-baseline justify-between mt-2">
          <h4 className="text-2xl font-bold text-[#221F1C]">{counts.pending}</h4>
          {counts.pending > 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 animate-pulse">
              Needs Review
            </span>
          )}
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-white border border-[#E8E2D9] shadow-xs">
        <div className="flex items-center justify-between text-xs font-bold text-[#6B6560] uppercase tracking-wider mb-1">
          <span>Confirmed Events</span>
          <CalendarCheck className="size-4 text-emerald-600" />
        </div>
        <div className="flex items-baseline justify-between mt-2">
          <h4 className="text-2xl font-bold text-[#221F1C]">{counts.accepted}</h4>
          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
            Upcoming
          </span>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-white border border-[#E8E2D9] shadow-xs">
        <div className="flex items-center justify-between text-xs font-bold text-[#6B6560] uppercase tracking-wider mb-1">
          <span>Completed Celebrations</span>
          <Sparkles className="size-4 text-blue-600" />
        </div>
        <div className="flex items-baseline justify-between mt-2">
          <h4 className="text-2xl font-bold text-[#221F1C]">{counts.completed}</h4>
          <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
            Delivered
          </span>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-white border border-[#E8E2D9] shadow-xs">
        <div className="flex items-center justify-between text-xs font-bold text-[#6B6560] uppercase tracking-wider mb-1">
          <span>Booked Value</span>
          <IndianRupee className="size-4 text-[#9E5338]" />
        </div>
        <div className="flex items-baseline justify-between mt-2">
          <h4 className="text-2xl font-bold text-[#221F1C]">
            ₹{counts.totalRevenue.toLocaleString('en-IN')}
          </h4>
          <span className="text-[10px] font-semibold text-[#9E5338] bg-[#F3EADF] px-2 py-0.5 rounded-full">
            Contracted
          </span>
        </div>
      </div>
    </div>
  );
}
