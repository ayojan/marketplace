'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api, { apiService } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  MapPin, 
  User, 
  Calendar as CalendarIcon,
  Plus,
  Trash2,
  X,
  Ban,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  Loader2,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface Slot {
  id: number;
  date: string;
  start_time: string;
  end_time: string;
  time_range?: string;
  duration_hours?: number;
  is_available: boolean;
  has_booking_conflict?: boolean;
}

interface BookingCalendarProps {
  bookings?: any[];
}

const formatDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

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

      const fetchBookings = (!initialBookings || initialBookings.length === 0)
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

  const daysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days: (number | null)[] = [];
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= lastDate; d++) days.push(d);
    
    return days;
  };

  const getBookingsForDate = useCallback((date: Date | null) => {
    if (!date) return [];
    const ds = formatDateKey(date);
    return (bookings || []).filter((b: any) => b.event_date?.startsWith(ds));
  }, [bookings]);

  const getSlotsForDate = useCallback((date: Date | null): Slot[] => {
    if (!date) return [];
    const ds = formatDateKey(date);
    return availabilitySlots.filter((s) => s.date === ds);
  }, [availabilitySlots]);

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

  const isDayInPast = (day: number | null) => {
    if (!day) return false;
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return isPast(date);
  };

  const isToday = (day: number | null) => {
    if (!day) return false;
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return date.toDateString() === new Date().toDateString();
  };

  const isSelected = (day: number | null) => {
    if (!day || !selectedDate) return false;
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return date.toDateString() === selectedDate.toDateString();
  };

  // Selected date slot analysis
  const selectedSlots = useMemo(() => {
    return getSlotsForDate(selectedDate);
  }, [selectedDate, getSlotsForDate]);

  const selectedBookings = useMemo(() => {
    return getBookingsForDate(selectedDate);
  }, [selectedDate, getBookingsForDate]);

  // Is selected date blocked?
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
        toast.success(`Date unblocked — marked as available`);
      } else {
        // BLOCK:
        if (selectedSlots.length > 0) {
          // Update existing slots to false
          await Promise.all(
            selectedSlots.map((s) =>
              apiService.availabilitySlots.update(s.id, {
                availability_slot: { is_available: false }
              })
            )
          );
        } else {
          // Create a new full-day blocked slot
          await apiService.availabilitySlots.create({
            availability_slot: {
              date: dateStr,
              start_time: '09:00',
              end_time: '21:00',
              is_available: false
            }
          });
        }
        toast.success(`Date blocked — unavailable for customer bookings`);
      }
      await loadData();
    } catch (err: any) {
      console.error('Failed to update date availability:', err);
      const msg = err.response?.data?.errors?.[0] || err.response?.data?.error || 'Failed to update date availability';
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
      const msg = err.response?.data?.error || err.response?.data?.errors?.[0] || 'Failed to delete slot';
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
      const msg = err.response?.data?.errors?.[0] || err.response?.data?.error || 'Failed to create slot';
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
          <p className="text-xs text-[#6B6560]">Manage your real-time availability and block dates for customer bookings</p>
        </div>
        {loading && (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#9E5338] animate-pulse">
            <Loader2 className="size-3.5 animate-spin" /> Updating calendar...
          </span>
        )}
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold border border-rose-200 flex items-center justify-between">
          <span>{error}</span>
          <Button variant="ghost" size="sm" onClick={() => loadData()} className="text-xs text-rose-800 underline p-0 h-auto">
            Retry
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 space-y-4">
          {/* Month Navigation Header */}
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-[#E8E2D9] shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-full bg-[#F3EADF] text-[#9E5338] flex items-center justify-center">
                <CalendarIcon className="size-4" />
              </div>
              <h2 className="text-xl font-serif font-bold text-[#221F1C] tracking-tight">
                {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </h2>
            </div>
            <div className="flex items-center gap-1.5">
              <Button 
                variant="outline" 
                size="icon" 
                aria-label="Previous Month"
                onClick={() => navigateMonth(-1)} 
                className="size-8 rounded-full border border-[#E8E2D9] text-[#221F1C] hover:text-[#9E5338] hover:bg-[#F3EADF] transition-colors cursor-pointer"
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                aria-label="Next Month"
                onClick={() => navigateMonth(1)} 
                className="size-8 rounded-full border border-[#E8E2D9] text-[#221F1C] hover:text-[#9E5338] hover:bg-[#F3EADF] transition-colors cursor-pointer"
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>

          {/* Days Grid Container */}
          <div className="bg-white border border-[#E8E2D9] rounded-2xl overflow-hidden shadow-xs">
            {/* Weekday Names Header */}
            <div className="grid grid-cols-7 border-b border-[#E8E2D9] bg-[#FAF7F2]">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div key={d} className="py-2.5 text-center text-[11px] font-bold uppercase tracking-wider text-[#9E5338]">
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar Cells Grid */}
            <div className="grid grid-cols-7 gap-px bg-[#E8E2D9]">
              {daysInMonth(currentDate).map((day, i) => {
                const currentCellDate = day ? new Date(currentDate.getFullYear(), currentDate.getMonth(), day) : null;
                const dayBookings = getBookingsForDate(currentCellDate);
                const daySlots = getSlotsForDate(currentCellDate);
                const daySelected = isSelected(day);
                const dayToday = isToday(day);
                const dayPast = isDayInPast(day);

                // Slot states
                const isBlocked = daySlots.length > 0 && daySlots.every((s) => s.is_available === false);
                const isAvailable = daySlots.length > 0 && daySlots.some((s) => s.is_available === true);

                return (
                  <div
                    key={i}
                    onClick={() => day && setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
                    className={`min-h-[105px] p-2 transition-all cursor-pointer relative group flex flex-col justify-between ${
                      !day
                        ? 'bg-[#FAF7F2]/60 cursor-default'
                        : isBlocked
                          ? 'bg-rose-50/70 hover:bg-rose-100/70'
                          : dayPast
                            ? 'bg-white/80 opacity-70 hover:bg-[#FAF7F2]'
                            : 'bg-white hover:bg-[#FAF7F2]'
                    } ${daySelected ? 'ring-2 ring-inset ring-[#9E5338] bg-[#F3EADF]/40 z-10' : ''}`}
                  >
                    {day && (
                      <>
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-xs font-bold ${
                              dayToday
                                ? 'size-6 bg-[#9E5338] text-white rounded-full flex items-center justify-center shadow-xs'
                                : isBlocked
                                  ? 'text-rose-700'
                                  : dayPast
                                    ? 'text-[#8C847C]'
                                    : 'text-[#221F1C]'
                            }`}
                          >
                            {day}
                          </span>
                          
                          {/* Status Indicators */}
                          <div className="flex items-center gap-1">
                            {isBlocked && (
                              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold uppercase text-rose-700 bg-rose-100/90 border border-rose-200 px-1 rounded">
                                Blocked
                              </span>
                            )}
                            {isAvailable && !isBlocked && (
                              <span className="size-2 rounded-full bg-emerald-500" title="Slots available" />
                            )}
                            {dayBookings.length > 0 && (
                              <span className="size-2 rounded-full bg-[#9E5338]" title={`${dayBookings.length} booking(s)`} />
                            )}
                          </div>
                        </div>

                        {/* Booking chips */}
                        <div className="mt-2 space-y-1">
                          {dayBookings.slice(0, 2).map((b: any, idx: number) => (
                            <div
                              key={idx}
                              className="text-[10px] px-1.5 py-0.5 rounded-md bg-[#F3EADF] text-[#9E5338] border border-[#E8E2D9] truncate font-semibold"
                            >
                              {b.service_name || b.service?.name || 'Booking'}
                            </div>
                          ))}
                          {dayBookings.length > 2 && (
                            <div className="text-[10px] text-[#6B6560] font-bold pl-1">
                              +{dayBookings.length - 2} more
                            </div>
                          )}

                          {/* Blocked indicator when no bookings */}
                          {isBlocked && dayBookings.length === 0 && (
                            <div className="text-[10px] px-1.5 py-0.5 rounded-md bg-rose-100/80 text-rose-700 border border-rose-200 truncate font-semibold flex items-center gap-1">
                              <Ban className="size-2.5" /> Closed
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Calendar Status Legend */}
            <div className="p-3.5 bg-[#FAF7F2] border-t border-[#E8E2D9] flex flex-wrap items-center gap-4 text-xs text-[#6B6560]">
              <span className="font-bold text-[#221F1C]">Legend:</span>
              <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-emerald-500" /> Available Slot</span>
              <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-rose-600" /> Blocked Date</span>
              <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-[#9E5338]" /> Booking / Event</span>
            </div>
          </div>
        </div>

        {/* Sidebar Details Panel */}
        <div className="space-y-4">
          {selectedDate ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedDate.toISOString()}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="bg-white border border-[#E8E2D9] rounded-2xl shadow-xs p-6 space-y-5"
              >
                {/* Selected Date Header */}
                <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E8E2D9]">
                  <p className="text-[10px] text-[#9E5338] font-bold uppercase tracking-wider mb-0.5">
                    {selectedDate.toLocaleDateString('default', { weekday: 'long' })}
                  </p>
                  <p className="text-xl font-serif font-bold text-[#221F1C] tracking-tight">
                    {selectedDate.toLocaleDateString('default', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>

                {/* Date Status Banner & Quick Block/Unblock Action */}
                <div className="p-4 rounded-xl border space-y-3 transition-colors bg-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isSelectedDateBlocked ? (
                        <>
                          <div className="size-7 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center">
                            <Ban className="size-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-rose-800">Date is Blocked</p>
                            <p className="text-[11px] text-rose-600">Clients cannot request bookings</p>
                          </div>
                        </>
                      ) : isSelectedDateAvailable ? (
                        <>
                          <div className="size-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                            <CheckCircle2 className="size-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-emerald-800">Date is Available</p>
                            <p className="text-[11px] text-emerald-600">Open for new bookings</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="size-7 rounded-full bg-[#F3EADF] text-[#9E5338] flex items-center justify-center">
                            <CalendarIcon className="size-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-[#221F1C]">Standard Open Day</p>
                            <p className="text-[11px] text-[#6B6560]">No custom slots defined</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Primary One-Click Block / Unblock Toggle */}
                  <Button
                    size="sm"
                    disabled={isPast(selectedDate) || actionLoading}
                    onClick={handleToggleBlockDate}
                    className={`w-full rounded-xl text-xs font-semibold h-10 shadow-xs cursor-pointer transition-all ${
                      isSelectedDateBlocked
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-rose-600 hover:bg-rose-700 text-white'
                    }`}
                  >
                    {actionLoading ? (
                      <span className="flex items-center gap-1.5">
                        <Loader2 className="size-3.5 animate-spin" /> Updating...
                      </span>
                    ) : isSelectedDateBlocked ? (
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="size-4" /> Unblock Date (Make Available)
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <Ban className="size-4" /> Block Entire Date
                      </span>
                    )}
                  </Button>
                </div>

                {/* Custom Time Slots on Selected Day */}
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#6B6560]">
                      Time Slots ({selectedSlots.length})
                    </h4>
                    {!isPast(selectedDate) && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsAddSlotOpen(!isAddSlotOpen)}
                        className="text-xs text-[#9E5338] hover:bg-[#F3EADF]/60 h-7 px-2 font-bold cursor-pointer"
                      >
                        <Plus className="size-3.5 mr-1" /> Add Slot
                      </Button>
                    )}
                  </div>

                  {/* Inline Add Slot Form */}
                  <AnimatePresence>
                    {isAddSlotOpen && (
                      <motion.form
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        onSubmit={handleCreateCustomSlot}
                        className="p-3.5 rounded-xl border border-[#E8E2D9] bg-[#FAF7F2] space-y-3 overflow-hidden"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#221F1C]">New Time Slot</span>
                          <button
                            type="button"
                            onClick={() => setIsAddSlotOpen(false)}
                            className="text-[#6B6560] hover:text-[#221F1C] cursor-pointer"
                          >
                            <X className="size-3.5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <label className="block text-[10px] font-bold uppercase text-[#6B6560] mb-1">
                              Start Time
                            </label>
                            <input
                              type="time"
                              value={slotStartTime}
                              onChange={(e) => setSlotStartTime(e.target.value)}
                              required
                              className="w-full px-2 py-1.5 rounded-lg border border-[#E8E2D9] bg-white text-[#221F1C] text-xs font-medium focus:outline-[#9E5338]"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold uppercase text-[#6B6560] mb-1">
                              End Time
                            </label>
                            <input
                              type="time"
                              value={slotEndTime}
                              onChange={(e) => setSlotEndTime(e.target.value)}
                              required
                              className="w-full px-2 py-1.5 rounded-lg border border-[#E8E2D9] bg-white text-[#221F1C] text-xs font-medium focus:outline-[#9E5338]"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <label className="flex items-center gap-1.5 text-xs text-[#221F1C] cursor-pointer">
                            <input
                              type="checkbox"
                              checked={slotIsAvailable}
                              onChange={(e) => setSlotIsAvailable(e.target.checked)}
                              className="accent-[#9E5338] size-3.5 rounded"
                            />
                            <span className="font-semibold">Available for bookings</span>
                          </label>

                          <Button
                            type="submit"
                            size="sm"
                            disabled={actionLoading}
                            className="bg-[#9E5338] hover:bg-[#86442B] text-white text-xs px-3 h-7 rounded-lg"
                          >
                            {actionLoading ? <Loader2 className="size-3 animate-spin" /> : 'Save Slot'}
                          </Button>
                        </div>
                      </motion.form>
                    )}
                  </AnimatePresence>

                  {/* List of slots */}
                  {selectedSlots.length > 0 ? (
                    <div className="space-y-2">
                      {selectedSlots.map((slot) => (
                        <div
                          key={slot.id}
                          className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                            slot.is_available
                              ? 'bg-emerald-50/50 border-emerald-200'
                              : 'bg-rose-50/50 border-rose-200'
                          }`}
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <Clock className={`size-3.5 ${slot.is_available ? 'text-emerald-700' : 'text-rose-700'}`} />
                              <span className="text-xs font-bold text-[#221F1C]">
                                {slot.time_range || `${slot.start_time} - ${slot.end_time}`}
                              </span>
                            </div>
                            <span
                              className={`inline-block text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded ${
                                slot.is_available
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {slot.is_available ? 'Open / Available' : 'Blocked'}
                            </span>
                          </div>

                          {!isPast(selectedDate) && (
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                disabled={actionLoading}
                                onClick={() => handleToggleSlot(slot)}
                                title={slot.is_available ? 'Block this slot' : 'Make slot available'}
                                className="size-7 p-0 text-xs text-[#6B6560] hover:text-[#221F1C] cursor-pointer"
                              >
                                {slot.is_available ? (
                                  <Ban className="size-3.5 text-rose-600" />
                                ) : (
                                  <CheckCircle2 className="size-3.5 text-emerald-600" />
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                disabled={actionLoading}
                                onClick={() => handleDeleteSlot(slot.id)}
                                title="Delete this slot"
                                className="size-7 p-0 text-xs text-rose-600 hover:bg-rose-100/60 cursor-pointer"
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-[#6B6560] italic py-1">
                      No custom slots set. This date is open according to your default business hours.
                    </p>
                  )}
                </div>

                {/* Scheduled Events List */}
                <div className="space-y-3 pt-2 border-t border-[#E8E2D9]">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#6B6560]">
                      Confirmed Bookings
                    </h4>
                    <span className="text-[10px] font-bold text-[#9E5338] bg-[#F3EADF] px-2 py-0.5 rounded-full">
                      {selectedBookings.length} Events
                    </span>
                  </div>

                  {selectedBookings.length > 0 ? (
                    selectedBookings.map((b: any) => (
                      <div
                        key={b.id}
                        className="p-3.5 rounded-xl border border-[#E8E2D9] bg-[#FBF8F4] space-y-1.5 hover:border-[#9E5338]/40 transition-colors"
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div className="font-serif font-bold text-xs text-[#221F1C]">
                            {b.service_name || b.service?.name || 'Celebration Session'}
                          </div>
                          <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {b.status || 'Confirmed'}
                          </span>
                        </div>
                        <div className="space-y-0.5 text-[11px] text-[#6B6560] font-medium pt-1 border-t border-[#E8E2D9]/60">
                          <div className="flex items-center gap-1.5">
                            <User className="size-3 text-[#9E5338]" /> 
                            <span>{b.customer_name || 'Client Host'}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="size-3 text-[#9E5338]" /> 
                            <span>{b.start_time || 'Full Day Session'}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-6 text-center border border-dashed border-[#E8E2D9] rounded-xl bg-[#FAF7F2] space-y-1">
                      <CalendarIcon className="size-5 text-[#8C847C] mx-auto mb-1 opacity-70" />
                      <p className="text-xs font-semibold text-[#221F1C]">No bookings on this day</p>
                      <p className="text-[11px] text-[#6B6560]">
                        {isSelectedDateBlocked ? 'Date is closed for requests' : 'Open for incoming bookings'}
                      </p>
                    </div>
                  )}
                </div>

                {isPast(selectedDate) && (
                  <p className="text-[10px] text-[#8C847C] text-center font-medium pt-1">
                    Past dates cannot be modified for availability
                  </p>
                )}
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="py-20 text-center text-[#6B6560] text-xs font-medium border border-dashed border-[#E8E2D9] rounded-2xl bg-white p-6">
              <CalendarIcon className="size-8 text-[#9E5338] mx-auto mb-2 opacity-60" />
              <p className="font-bold text-[#221F1C]">Select a Date</p>
              <p className="text-[11px] text-[#6B6560] mt-1">Click any day on the calendar to block dates or manage time slots</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingCalendar;
