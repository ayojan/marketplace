'use client';

import React from 'react';
import {
  Calendar as CalendarIcon,
  MapPin,
  User,
  Mail,
  CheckCircle2,
  XCircle,
  CalendarCheck,
  Check,
  X,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BookingType } from './types';
import { formatDate } from './utils';

interface BookingCardItemProps {
  booking: BookingType;
  actionLoading: Record<string | number, string>;
  onBookingAction: (bookingId: number | string, action: 'accept' | 'decline' | 'complete') => Promise<void>;
}

export default function BookingCardItem({
  booking,
  actionLoading,
  onBookingAction
}: BookingCardItemProps) {
  const isBookingLoading = !!actionLoading[booking.id];
  const currentAction = actionLoading[booking.id];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
            Action Required
          </span>
        );
      case 'accepted':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="size-3.5 text-emerald-600" />
            Confirmed
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
            <CalendarCheck className="size-3.5 text-blue-600" />
            Completed
          </span>
        );
      case 'declined':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
            <XCircle className="size-3.5 text-rose-500" />
            Declined
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-stone-100 text-stone-600 border border-stone-200">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-stone-100 text-stone-600">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E8E2D9] shadow-xs hover:border-[#9E5338]/40 transition-all space-y-4">
      {/* Header row: Service, Client & Status */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#F3EADF] text-[#9E5338]">
              Booking #{booking.id}
            </span>
            {getStatusBadge(booking.status)}
          </div>
          <h3 className="text-lg font-serif font-bold text-[#221F1C] mt-1">
            {booking.service?.name || 'Celebration Service'}
          </h3>
        </div>

        <div className="sm:text-right">
          <span className="text-[10px] font-bold text-[#6B6560] uppercase tracking-wider block">
            Agreed Total
          </span>
          <span className="text-xl font-bold text-[#221F1C] tracking-tight">
            ₹{Number(booking.total_amount || 0).toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Event Key Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E8E2D9]/70 text-xs text-[#221F1C]">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-white border border-[#E8E2D9] text-[#9E5338] shrink-0">
            <CalendarIcon className="size-3.5" />
          </div>
          <div>
            <p className="text-[10px] text-[#6B6560] font-medium">Event Date</p>
            <p className="font-bold">{formatDate(booking.event_date)}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-white border border-[#E8E2D9] text-[#9E5338] shrink-0">
            <MapPin className="size-3.5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-[#6B6560] font-medium">Venue Location</p>
            <p className="font-bold truncate">{booking.event_location || 'Not specified'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-white border border-[#E8E2D9] text-[#9E5338] shrink-0">
            <User className="size-3.5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-[#6B6560] font-medium">Client Host</p>
            <p className="font-bold truncate">{booking.customer?.name || 'Host Client'}</p>
          </div>
        </div>
      </div>

      {/* Requirements / Notes if provided */}
      {(booking.requirements || booking.special_instructions) && (
        <div className="p-3 rounded-xl bg-white border border-[#E8E2D9] text-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#9E5338]">
            Host Requirements & Notes:
          </span>
          <p className="text-[#6B6560] italic">
            &ldquo;{booking.requirements || booking.special_instructions}&rdquo;
          </p>
        </div>
      )}

      {/* Footer Controls & Response Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-[#E8E2D9]/70">
        <div className="flex items-center gap-2 text-xs text-[#6B6560]">
          {booking.customer?.email && (
            <span className="flex items-center gap-1">
              <Mail className="size-3 text-[#9E5338]" /> {booking.customer.email}
            </span>
          )}
        </div>

        {/* Actions for Vendor */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {booking.status === 'pending' && (
            <>
              <Button
                size="sm"
                disabled={isBookingLoading}
                onClick={() => onBookingAction(booking.id, 'decline')}
                variant="outline"
                className="h-9 px-3.5 rounded-xl border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold cursor-pointer"
              >
                {isBookingLoading && currentAction === 'decline' ? (
                  <Loader2 className="size-3.5 animate-spin mr-1" />
                ) : (
                  <X className="size-3.5 mr-1" />
                )}
                Decline
              </Button>

              <Button
                size="sm"
                disabled={isBookingLoading}
                onClick={() => onBookingAction(booking.id, 'accept')}
                className="h-9 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                {isBookingLoading && currentAction === 'accept' ? (
                  <Loader2 className="size-3.5 animate-spin mr-1" />
                ) : (
                  <Check className="size-3.5 mr-1" strokeWidth={2.5} />
                )}
                Accept Booking
              </Button>
            </>
          )}

          {booking.status === 'accepted' && (
            <Button
              size="sm"
              disabled={isBookingLoading}
              onClick={() => onBookingAction(booking.id, 'complete')}
              className="h-9 px-4 rounded-xl bg-[#9E5338] hover:bg-[#86442B] text-white text-xs font-semibold shadow-xs cursor-pointer"
            >
              {isBookingLoading && currentAction === 'complete' ? (
                <Loader2 className="size-3.5 animate-spin mr-1" />
              ) : (
                <CalendarCheck className="size-3.5 mr-1" />
              )}
              Mark Event Completed
            </Button>
          )}

          {['completed', 'declined', 'cancelled'].includes(booking.status) && (
            <span className="text-xs text-[#6B6560] font-medium py-1.5 px-3 rounded-lg bg-[#FAF7F2]">
              Archived · {booking.status}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
