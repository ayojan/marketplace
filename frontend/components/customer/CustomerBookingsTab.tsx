'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  Star, 
  FileText, 
  MessageSquare 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ImageWithFallback } from '@/components/ImageWithFallback';
import { BookingStatusBadge } from './BookingStatusBadge';

interface CustomerBookingsTabProps {
  bookings: any[];
  filteredBookings: any[];
  bookingFilter: string;
  setBookingFilter: (filter: string) => void;
  upcomingCount: number;
  completedCount: number;
  onOpenReviewModal: (booking: any) => void;
  onOpenChatModal: (booking: any) => void;
}

export function CustomerBookingsTab({
  bookings,
  filteredBookings,
  bookingFilter,
  setBookingFilter,
  upcomingCount,
  completedCount,
  onOpenReviewModal,
  onOpenChatModal,
}: CustomerBookingsTabProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-[#E8E2D9]">
        <div>
          <h3 className="text-lg font-serif font-bold text-[#221F1C]">My Event Bookings</h3>
          <p className="text-xs text-[#6B6560]">Track reserved vendor sessions, payment status, and invoices</p>
        </div>

        <div className="flex items-center gap-2 bg-[#FBF8F4] p-1 rounded-xl border border-[#E8E2D9]">
          <button
            onClick={() => setBookingFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              bookingFilter === 'all' ? 'bg-[#9E5338] text-white shadow-sm' : 'text-[#6B6560] hover:text-[#221F1C]'
            }`}
          >
            All ({bookings.length})
          </button>
          <button
            onClick={() => setBookingFilter('upcoming')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              bookingFilter === 'upcoming' ? 'bg-[#9E5338] text-white shadow-sm' : 'text-[#6B6560] hover:text-[#221F1C]'
            }`}
          >
            Upcoming ({upcomingCount})
          </button>
          <button
            onClick={() => setBookingFilter('completed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              bookingFilter === 'completed' ? 'bg-[#9E5338] text-white shadow-sm' : 'text-[#6B6560] hover:text-[#221F1C]'
            }`}
          >
            Completed ({completedCount})
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredBookings.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white rounded-2xl border border-dashed border-[#E8E2D9] space-y-3">
            <div className="size-12 rounded-full bg-[#F3EADF] text-[#9E5338] flex items-center justify-center mx-auto">
              <CalendarIcon className="size-6" />
            </div>
            <h4 className="font-serif font-bold text-base text-[#221F1C]">
              {bookingFilter === 'upcoming' 
                ? 'No Upcoming Bookings Found' 
                : bookingFilter === 'completed' 
                  ? 'No Completed Bookings Found' 
                  : 'No Event Bookings Found'}
            </h4>
            <p className="text-xs text-[#6B6560] max-w-sm mx-auto">
              {bookingFilter === 'upcoming'
                ? 'You do not have any upcoming bookings scheduled. Explore verified marketplace pros to book for your celebration!'
                : 'Browse our directory to reserve verified photographers, makeup artists, and event specialists.'}
            </p>
            <Link href="/vendors" className="inline-block mt-2">
              <Button size="sm" className="bg-[#9E5338] hover:bg-[#86442B] text-white rounded-full text-xs">
                Explore Verified Pros
              </Button>
            </Link>
          </div>
        ) : (
          filteredBookings.map((booking) => (
            <div key={booking.id} className="p-6 rounded-2xl border border-[#E8E2D9] bg-white shadow-sm hover:border-[#9E5338]/40 transition-all space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-[#E8E2D9]">
                <div className="flex items-center gap-4">
                  <Link href={`/vendors/${booking.vendor?.slug || booking.vendor?.id || 4}`} className="relative size-16 rounded-xl overflow-hidden border border-[#E8E2D9] shrink-0 group/vimg cursor-pointer">
                    <ImageWithFallback 
                      src={booking.vendor?.image || 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=600&q=80'} 
                      alt={booking.vendor?.business_name || 'Vendor'} 
                      fill 
                      unoptimized 
                      className="object-cover group-hover/vimg:scale-105 transition-transform duration-300" 
                    />
                  </Link>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#9E5338] bg-[#F3EADF] px-2 py-0.5 rounded-md">
                      {booking.vendor?.category || 'Creative Partner'}
                    </span>
                    <h4 className="text-base font-serif font-bold text-[#221F1C] mt-1">{booking.service?.name}</h4>
                    <Link href={`/vendors/${booking.vendor?.slug || booking.vendor?.id || 4}`} className="hover:text-[#9E5338] transition-colors cursor-pointer inline-block">
                      <p className="text-xs text-[#6B6560] font-medium">{booking.vendor?.business_name} • {booking.vendor?.location}</p>
                    </Link>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end md:self-center">
                  <BookingStatusBadge status={booking.status} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs bg-[#FBF8F4] p-4 rounded-xl border border-[#E8E2D9]">
                <div>
                  <span className="text-[#6B6560] block font-medium">Event Date</span>
                  <span className="font-bold text-[#221F1C] flex items-center gap-1.5 mt-0.5">
                    <CalendarIcon size={14} className="text-[#9E5338]" />
                    {booking.event_date ? new Date(booking.event_date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) : 'Date TBD'}
                  </span>
                </div>
                <div>
                  <span className="text-[#6B6560] block font-medium">Payment Status</span>
                  <span className="font-bold text-[#221F1C] flex items-center gap-1.5 mt-0.5">
                    <CheckCircle2 size={14} className="text-emerald-700" />
                    {booking.payment_status || 'Paid'}
                  </span>
                </div>
                <div>
                  <span className="text-[#6B6560] block font-medium">Total Package Investment</span>
                  <span className="font-bold text-[#221F1C] text-sm mt-0.5 block">
                    ₹{booking.total_amount ? Number(booking.total_amount).toLocaleString() : '0'}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" className="text-xs font-medium rounded-full border-[#E8E2D9] text-[#221F1C] hover:bg-[#F3EADF]">
                    <FileText size={14} className="mr-1.5 text-[#6B6560]" /> Receipt PDF
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => onOpenChatModal(booking)}
                    className="text-xs font-medium rounded-full border-[#E8E2D9] text-[#221F1C] hover:bg-[#F3EADF] cursor-pointer"
                  >
                    <MessageSquare size={14} className="mr-1.5 text-[#9E5338]" /> Contact Vendor
                  </Button>
                </div>

                <div>
                  {booking.review ? (
                    <span className="text-xs font-bold text-[#D97706] bg-amber-50 border border-amber-200 px-3 py-1 rounded-full flex items-center gap-1">
                      <Star className="size-3.5 fill-[#D97706]" /> Reviewed (5.0★)
                    </span>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => onOpenReviewModal(booking)}
                      className="bg-[#9E5338] hover:bg-[#86442B] text-white rounded-full text-xs font-medium px-5 cursor-pointer"
                    >
                      Write Verified Review
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
