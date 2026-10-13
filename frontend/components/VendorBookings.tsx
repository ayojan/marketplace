'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { apiService } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  User, 
  Mail, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  IndianRupee, 
  Search, 
  Filter, 
  Check, 
  X, 
  Loader2, 
  MessageSquare, 
  Sparkles, 
  ChevronRight,
  ArrowUpRight,
  CalendarCheck,
  Tag
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export interface BookingType {
  id: number | string;
  status: 'pending' | 'accepted' | 'declined' | 'completed' | 'cancelled' | 'counter_offered';
  event_date: string;
  event_end_date?: string;
  event_location: string;
  total_amount: number | string;
  requirements?: string;
  special_instructions?: string;
  event_duration?: string;
  duration_hours?: number;
  created_at: string;
  customer?: {
    id: number | string;
    name: string;
    email: string;
  };
  service?: {
    id: number | string;
    name: string;
    category?: string;
  };
}

export default function VendorBookings() {
  const [bookings, setBookings] = useState<BookingType[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<Record<string | number, string>>({});
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'accepted' | 'completed' | 'declined'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBookingForNotes, setSelectedBookingForNotes] = useState<BookingType | null>(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiService.bookings.getAll();
      const list = res.data?.bookings || (Array.isArray(res.data) ? res.data : []);
      setBookings(list);
    } catch (err) {
      console.warn('Failed to fetch vendor bookings:', err);
      // Fallback empty state
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleBookingAction = async (bookingId: number | string, action: 'accept' | 'decline' | 'complete') => {
    setActionLoading(prev => ({ ...prev, [bookingId]: action }));
    try {
      const res = await apiService.bookings.respond(bookingId, {
        response_action: action
      });

      const updated = res.data?.booking;
      if (updated) {
        setBookings(prev => prev.map(b => (b.id === bookingId ? { ...b, ...updated } : b)));
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
      const errorMsg = err.extractedMessage || err.response?.data?.error || `Failed to ${action} booking.`;
      toast.error(errorMsg);
    } finally {
      setActionLoading(prev => {
        const next = { ...prev };
        delete next[bookingId];
        return next;
      });
    }
  };

  // Filtered lists
  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
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
        return clientName.includes(q) || clientEmail.includes(q) || serviceName.includes(q) || location.includes(q);
      }

      return true;
    });
  }, [bookings, activeTab, searchQuery]);

  // Metric counts
  const counts = useMemo(() => {
    return {
      all: bookings.length,
      pending: bookings.filter(b => b.status === 'pending').length,
      accepted: bookings.filter(b => b.status === 'accepted').length,
      completed: bookings.filter(b => b.status === 'completed').length,
      declined: bookings.filter(b => ['declined', 'cancelled'].includes(b.status)).length,
      totalRevenue: bookings
        .filter(b => ['accepted', 'completed'].includes(b.status))
        .reduce((sum, b) => sum + (Number(b.total_amount) || 0), 0),
    };
  }, [bookings]);

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

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'TBD';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Metrics */}
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
            <h4 className="text-2xl font-bold text-[#221F1C]">₹{counts.totalRevenue.toLocaleString('en-IN')}</h4>
            <span className="text-[10px] font-semibold text-[#9E5338] bg-[#F3EADF] px-2 py-0.5 rounded-full">
              Contracted
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Tab Navigation Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E8E2D9] shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'All Inquiries', count: counts.all },
              { id: 'pending', label: 'Pending Action', count: counts.pending, alert: counts.pending > 0 },
              { id: 'accepted', label: 'Confirmed', count: counts.accepted },
              { id: 'completed', label: 'Completed', count: counts.completed },
              { id: 'declined', label: 'Declined', count: counts.declined },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#9E5338] text-white shadow-xs'
                      : 'bg-[#FAF7F2] text-[#6B6560] hover:text-[#221F1C] hover:bg-[#F3EADF]'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive
                        ? 'bg-white/25 text-white'
                        : tab.alert
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-white text-[#6B6560]'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-[#6B6560]" />
            <input
              type="text"
              placeholder="Search by client or service..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#FAF7F2] border border-[#E8E2D9] rounded-xl focus:outline-none focus:border-[#9E5338] text-[#221F1C]"
            />
          </div>
        </div>
      </div>

      {/* Bookings List Area */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map(i => (
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
          {filteredBookings.map((booking) => {
            const isBookingLoading = !!actionLoading[booking.id];
            const currentAction = actionLoading[booking.id];

            return (
              <div
                key={booking.id}
                className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E8E2D9] shadow-xs hover:border-[#9E5338]/40 transition-all space-y-4"
              >
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
                      "{booking.requirements || booking.special_instructions}"
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
                          onClick={() => handleBookingAction(booking.id, 'decline')}
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
                          onClick={() => handleBookingAction(booking.id, 'accept')}
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
                        onClick={() => handleBookingAction(booking.id, 'complete')}
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
          })}
        </div>
      )}
    </div>
  );
}
