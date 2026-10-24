'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { apiService } from '@/lib/api';
import { CalendarCheck } from 'lucide-react';
import { toast } from 'sonner';
import { BookingType, BookingTabType } from './types';
import BookingsStatsCards from './BookingsStatsCards';
import BookingsFilterTabs from './BookingsFilterTabs';
import BookingCardItem from './BookingCardItem';

export default function VendorBookings() {
  const [bookings, setBookings] = useState<BookingType[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<Record<string | number, string>>({});
  const [activeTab, setActiveTab] = useState<BookingTabType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiService.bookings.getAll();
      const list = res.data?.bookings || (Array.isArray(res.data) ? res.data : []);
      setBookings(list);
    } catch (err) {
      console.warn('Failed to fetch vendor bookings:', err);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleBookingAction = async (
    bookingId: number | string,
    action: 'accept' | 'decline' | 'complete'
  ) => {
    setActionLoading((prev) => ({ ...prev, [bookingId]: action }));
    try {
      const res = await apiService.bookings.respond(bookingId, {
        response_action: action
      });

      const updated = res.data?.booking;
      if (updated) {
        setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, ...updated } : b)));
      } else {
        await fetchBookings();
      }

      if (action === 'accept') {
        toast.success('Booking accepted successfully! Client has been notified.');
      } else if (action === 'decline') {
        toast.info('Booking request declined.');
      } else if (action === 'complete') {
        toast.success('Celebration marked as completed! Revenue added to balance.');
      }
    } catch (err: any) {
      const errorMsg =
        err.extractedMessage || err.response?.data?.error || `Failed to ${action} booking.`;
      toast.error(errorMsg);
    } finally {
      setActionLoading((prev) => {
        const next = { ...prev };
        delete next[bookingId];
        return next;
      });
    }
  };

  // Filtered lists
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      // Tab filter
      if (activeTab === 'pending' && b.status !== 'pending') return false;
      if (activeTab === 'accepted' && b.status !== 'accepted') return false;
      if (activeTab === 'completed' && b.status !== 'completed') return false;
      if (activeTab === 'declined' && !['declined', 'cancelled'].includes(b.status)) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const clientName = (b.customer?.name || '').toLowerCase();
        const clientEmail = (b.customer?.email || '').toLowerCase();
        const serviceName = (b.service?.name || '').toLowerCase();
        const location = (b.event_location || '').toLowerCase();
        return (
          clientName.includes(q) ||
          clientEmail.includes(q) ||
          serviceName.includes(q) ||
          location.includes(q)
        );
      }

      return true;
    });
  }, [bookings, activeTab, searchQuery]);

  // Metric counts
  const counts = useMemo(() => {
    return {
      all: bookings.length,
      pending: bookings.filter((b) => b.status === 'pending').length,
      accepted: bookings.filter((b) => b.status === 'accepted').length,
      completed: bookings.filter((b) => b.status === 'completed').length,
      declined: bookings.filter((b) => ['declined', 'cancelled'].includes(b.status)).length,
      totalRevenue: bookings
        .filter((b) => ['accepted', 'completed'].includes(b.status))
        .reduce((sum, b) => sum + (Number(b.total_amount) || 0), 0)
    };
  }, [bookings]);

  return (
    <div className="space-y-6">
      {/* Top Header & Metrics */}
      <BookingsStatsCards counts={counts} />

      {/* Filter and Tab Navigation Bar */}
      <BookingsFilterTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        counts={counts}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Bookings List Area */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-white rounded-2xl border border-[#E8E2D9]" />
          ))}
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white border border-[#E8E2D9] space-y-3">
          <div className="size-12 rounded-full bg-[#FAF7F2] text-[#9E5338] flex items-center justify-center mx-auto border border-[#E8E2D9]">
            <CalendarCheck className="size-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif font-bold text-base text-[#221F1C]">No bookings found</h3>
            <p className="text-xs text-[#6B6560] max-w-md mx-auto">
              {searchQuery
                ? 'No client bookings match your search query.'
                : activeTab === 'pending'
                  ? 'Great job! You have zero pending inquiries waiting for review.'
                  : 'Client booking requests and landmark celebration inquiries will appear here.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <BookingCardItem
              key={booking.id}
              booking={booking}
              actionLoading={actionLoading}
              onBookingAction={handleBookingAction}
            />
          ))}
        </div>
      )}
    </div>
  );
}
