'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api, { apiService } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Slot, BookingCalendarProps } from './types';
import { formatDateKey } from './utils';
import CalendarHeader from './CalendarHeader';
import CalendarMonthGrid from './CalendarMonthGrid';
import CalendarSidebar from './CalendarSidebar';

const BookingCalendar: React.FC<BookingCalendarProps> = ({ bookings: initialBookings }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState<any[]>(initialBookings || []);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [availabilitySlots, setAvailabilitySlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Custom slot modal state
  const [isAddSlotOpen, setIsAddSlotOpen] = useState(false);
  const [slotStartTime, setSlotStartTime] = useState('10:00');
  const [slotEndTime, setSlotEndTime] = useState('18:00');
  const [slotIsAvailable, setSlotIsAvailable] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);

      const startDateStr = formatDateKey(firstDay);
      const endDateStr = formatDateKey(lastDay);

      const fetchSlots = api.get('/availability_slots', {
        params: {
          start_date: startDateStr,
          end_date: endDateStr,
          per_page: 100
        }
      });

      const fetchBookings =
        !initialBookings || initialBookings.length === 0
          ? api.get('/bookings').catch(() => ({ data: { bookings: [] } }))
          : Promise.resolve({ data: { bookings: initialBookings } });

      const [slotsRes, bookingsRes] = await Promise.all([fetchSlots, fetchBookings]);
      setAvailabilitySlots(slotsRes.data?.availability_slots || []);
      if (bookingsRes.data?.bookings) {
        setBookings(bookingsRes.data.bookings);
      }
    } catch (err: any) {
      console.error('Error loading calendar data:', err);
      setError('Failed to load calendar data');
    } finally {
      setLoading(false);
    }
  }, [currentDate, initialBookings]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getBookingsForDate = useCallback(
    (date: Date | null) => {
      if (!date) return [];
      const ds = formatDateKey(date);
      return (bookings || []).filter((b: any) => b.event_date?.startsWith(ds));
    },
    [bookings]
  );

  const getSlotsForDate = useCallback(
    (date: Date | null): Slot[] => {
      if (!date) return [];
      const ds = formatDateKey(date);
      return availabilitySlots.filter((s) => s.date === ds);
    },
    [availabilitySlots]
  );

  const navigateMonth = (step: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + step, 1));
  };

  const isPast = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    return d < today;
  };

  // Selected date slot analysis
  const selectedSlots = useMemo(() => {
    return getSlotsForDate(selectedDate);
  }, [selectedDate, getSlotsForDate]);

  const selectedBookings = useMemo(() => {
    return getBookingsForDate(selectedDate);
  }, [selectedDate, getBookingsForDate]);

  const isSelectedDateBlocked = useMemo(() => {
    if (selectedSlots.length === 0) return false;
    return selectedSlots.every((s) => s.is_available === false);
  }, [selectedSlots]);

  const isSelectedDateAvailable = useMemo(() => {
    if (selectedSlots.length === 0) return false;
    return selectedSlots.some((s) => s.is_available === true);
  }, [selectedSlots]);

  // Toggle blocking for the entire date
  const handleToggleBlockDate = async () => {
    if (!selectedDate) return;
    if (isPast(selectedDate)) {
      toast.error('Past dates cannot be blocked or modified');
      return;
    }

    const dateStr = formatDateKey(selectedDate);
    setActionLoading(true);

    try {
      if (isSelectedDateBlocked) {
        // UNBLOCK: mark all slots as available
        await Promise.all(
          selectedSlots.map((s) =>
            apiService.availabilitySlots.update(s.id, {
              availability_slot: { is_available: true }
            })
          )
        );
        toast.success('Date unblocked — marked as available');
      } else {
        // BLOCK:
        if (selectedSlots.length > 0) {
          await Promise.all(
            selectedSlots.map((s) =>
              apiService.availabilitySlots.update(s.id, {
                availability_slot: { is_available: false }
              })
            )
          );
        } else {
          await apiService.availabilitySlots.create({
            availability_slot: {
              date: dateStr,
              start_time: '09:00',
              end_time: '21:00',
              is_available: false
            }
          });
        }
        toast.success('Date blocked — unavailable for customer bookings');
      }
      await loadData();
    } catch (err: any) {
      console.error('Failed to update date availability:', err);
      const msg =
        err.response?.data?.errors?.[0] ||
        err.response?.data?.error ||
        'Failed to update date availability';
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle a single slot's availability
  const handleToggleSlot = async (slot: Slot) => {
    setActionLoading(true);
    try {
      const nextState = !slot.is_available;
      await apiService.availabilitySlots.update(slot.id, {
        availability_slot: { is_available: nextState }
      });
      toast.success(nextState ? 'Slot marked available' : 'Slot blocked');
      await loadData();
    } catch (err: any) {
      console.error('Failed to toggle slot:', err);
      const msg = err.response?.data?.errors?.[0] || 'Failed to update slot';
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  // Delete a slot
  const handleDeleteSlot = async (slotId: number) => {
    setActionLoading(true);
    try {
      await apiService.availabilitySlots.delete(slotId);
      toast.success('Time slot removed');
      await loadData();
    } catch (err: any) {
      console.error('Failed to delete slot:', err);
      const msg =
        err.response?.data?.error || err.response?.data?.errors?.[0] || 'Failed to delete slot';
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  // Add custom time slot
  const handleCreateCustomSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) return;
    if (isPast(selectedDate)) {
      toast.error('Cannot create slots for past dates');
      return;
    }

    if (slotStartTime >= slotEndTime) {
      toast.error('End time must be after start time');
      return;
    }

    setActionLoading(true);
    const dateStr = formatDateKey(selectedDate);

    try {
      await apiService.availabilitySlots.create({
        availability_slot: {
          date: dateStr,
          start_time: slotStartTime,
          end_time: slotEndTime,
          is_available: slotIsAvailable
        }
      });
      toast.success(slotIsAvailable ? 'Available slot created' : 'Blocked slot created');
      setIsAddSlotOpen(false);
      await loadData();
    } catch (err: any) {
      console.error('Failed to create slot:', err);
      const msg =
        err.response?.data?.errors?.[0] || err.response?.data?.error || 'Failed to create slot';
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-1">
        <div>
          <h2 className="text-xl font-serif font-bold text-[#221F1C]">Booking Calendar</h2>
          <p className="text-xs text-[#6B6560]">
            Manage your availability and view bookings
          </p>
        </div>
        {loading && (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#9E5338] animate-pulse">
            <Loader2 className="size-3.5 animate-spin" /> Loading...
          </span>
        )}
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold border border-rose-200 flex items-center justify-between">
          <span>{error}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => loadData()}
            className="text-xs text-rose-800 underline p-0 h-auto"
          >
            Retry
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 space-y-4">
          <CalendarHeader currentDate={currentDate} onNavigate={navigateMonth} />
          <CalendarMonthGrid
            currentDate={currentDate}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            getBookingsForDate={getBookingsForDate}
            getSlotsForDate={getSlotsForDate}
          />
        </div>

        {/* Sidebar Details Panel */}
        <div className="space-y-4">
          <CalendarSidebar
            selectedDate={selectedDate}
            selectedSlots={selectedSlots}
            selectedBookings={selectedBookings}
            isSelectedDateBlocked={isSelectedDateBlocked}
            isSelectedDateAvailable={isSelectedDateAvailable}
            actionLoading={actionLoading}
            isPast={isPast(selectedDate)}
            isAddSlotOpen={isAddSlotOpen}
            slotStartTime={slotStartTime}
            slotEndTime={slotEndTime}
            slotIsAvailable={slotIsAvailable}
            onToggleBlockDate={handleToggleBlockDate}
            onToggleSlot={handleToggleSlot}
            onDeleteSlot={handleDeleteSlot}
            onToggleAddSlotOpen={() => setIsAddSlotOpen(!isAddSlotOpen)}
            onSetSlotStartTime={setSlotStartTime}
            onSetSlotEndTime={setSlotEndTime}
            onSetSlotIsAvailable={setSlotIsAvailable}
            onCreateCustomSlot={handleCreateCustomSlot}
          />
        </div>
      </div>
    </div>
  );
};

export default BookingCalendar;
