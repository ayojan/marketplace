'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Sparkles, Clock } from 'lucide-react';

interface BookingStatusBadgeProps {
  status: string;
}

export function BookingStatusBadge({ status }: BookingStatusBadgeProps) {
  const s = String(status || '').toLowerCase();
  switch (s) {
    case 'completed':
      return (
        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-xs px-3 py-1 font-semibold">
          <CheckCircle2 size={12} className="mr-1" /> Completed
        </Badge>
      );
    case 'confirmed':
    case 'accepted':
      return (
        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs px-3 py-1 font-semibold">
          <Sparkles size={12} className="mr-1" /> Confirmed
        </Badge>
      );
    case 'pending':
      return (
        <Badge className="bg-[#F3EADF] text-[#9E5338] border-[#E8E2D9] text-xs px-3 py-1 font-semibold">
          <Clock size={12} className="mr-1" /> Pending Approval
        </Badge>
      );
    case 'counter_offered':
      return (
        <Badge className="bg-amber-50 text-amber-800 border-amber-200 text-xs px-3 py-1 font-semibold">
          Counter Offer
        </Badge>
      );
    case 'declined':
    case 'cancelled':
      return (
        <Badge className="bg-rose-50 text-rose-700 border-rose-200 text-xs px-3 py-1 font-semibold capitalize">
          {s}
        </Badge>
      );
    default:
      return (
        <Badge className="bg-[#FBF8F4] text-[#6B6560] border-[#E8E2D9] text-xs px-3 py-1 font-semibold capitalize">
          {s}
        </Badge>
      );
  }
}
