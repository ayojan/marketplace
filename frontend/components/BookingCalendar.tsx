'use client';

import React, { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
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
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BookingCalendar = ({ bookings: initialBookings }: any) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState(initialBookings || []);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [availabilitySlots, setAvailabilitySlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const fetchSlots = api.get('/availability_slots', {
        params: {
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0]
        }
      });

      const fetchBookings = initialBookings === undefined 
        ? api.get('/bookings') 
        : Promise.resolve({ data: { bookings: initialBookings } });

      const [slotsRes, bookingsRes] = await Promise.all([fetchSlots, fetchBookings]);
      setAvailabilitySlots(slotsRes.data?.availability_slots || []);
      if (bookingsRes.data?.bookings) {
        setBookings(bookingsRes.data.bookings);
      }
    } catch (err) {
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

  const getBookingsForDate = (date: Date | null) => {
    if (!date) return [];
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const ds = `${year}-${month}-${day}`;
    return (bookings || []).filter((b: any) => b.event_date?.startsWith(ds));
  };

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

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-1">
        <div>
          <h2 className="text-xl font-serif font-bold text-[#221F1C]">Booking Calendar</h2>
          <p className="text-xs text-[#6B6560]">Manage your availability and view bookings</p>
        </div>
        {loading && <span className="text-xs font-semibold text-[#9E5338] animate-pulse">Loading...</span>}
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold border border-rose-200">
          {error}
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
              const daySelected = isSelected(day);
              const dayToday = isToday(day);
              const dayPast = isDayInPast(day);

              return (
                <div
                  key={i}
                  onClick={() => day && setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
                  className={`min-h-[100px] p-2 transition-all cursor-pointer relative group flex flex-col justify-between ${
                    !day
                      ? 'bg-[#FAF7F2]/60 cursor-default'
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
                              : dayPast
                                ? 'text-[#8C847C]'
                                : 'text-[#221F1C]'
                          }`}
                        >
                          {day}
                        </span>
                        {dayBookings.length > 0 && (
                          <span className="size-2 rounded-full bg-[#9E5338]" />
                        )}
                      </div>

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
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Calendar Status Legend */}
          <div className="p-3.5 bg-[#FAF7F2] border-t border-[#E8E2D9] flex flex-wrap items-center gap-4 text-xs text-[#6B6560]">
            <span className="font-bold text-[#221F1C]">Legend</span>
            <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-emerald-500" /> Available</span>
            <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-amber-500" /> Pending booking</span>
            <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-[#9E5338]" /> Confirmed booking</span>
            <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-blue-500" /> Completed booking</span>
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

              {/* Scheduled Events List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#6B6560]">
                    Scheduled Bookings
                  </h4>
                  <span className="text-[10px] font-bold text-[#9E5338] bg-[#F3EADF] px-2 py-0.5 rounded-full">
                    {getBookingsForDate(selectedDate).length} Events
                  </span>
                </div>

                {getBookingsForDate(selectedDate).length > 0 ? (
                  getBookingsForDate(selectedDate).map((b: any) => (
                    <div
                      key={b.id}
                      className="p-4 rounded-xl border border-[#E8E2D9] bg-[#FBF8F4] space-y-2 hover:border-[#9E5338]/40 transition-colors"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="font-serif font-bold text-sm text-[#221F1C]">
                          {b.service_name || b.service?.name || 'Wedding Session'}
                        </div>
                        <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {b.status || 'Confirmed'}
                        </span>
                      </div>
                      <div className="space-y-1 text-xs text-[#6B6560] font-medium pt-1 border-t border-[#E8E2D9]/60">
                        <div className="flex items-center gap-1.5">
                          <User className="size-3.5 text-[#9E5338]" /> 
                          <span>{b.customer_name || 'Client Host'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="size-3.5 text-[#9E5338]" /> 
                          <span>{b.start_time || 'Full Day Session'}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-10 text-center border border-dashed border-[#E8E2D9] rounded-xl bg-[#FAF7F2] space-y-1">
                    <CalendarIcon className="size-6 text-[#8C847C] mx-auto mb-1.5" />
                    <p className="text-xs font-semibold text-[#221F1C]">No bookings on this day</p>
                    <p className="text-[11px] text-[#6B6560]">Date is open for incoming customer requests</p>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <Button 
                  size="sm" 
                  disabled={isPast(selectedDate)}
                  className="w-full bg-[#9E5338] hover:bg-[#86442B] text-white rounded-full text-xs font-semibold h-10 shadow-xs cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="mr-1.5 size-3.5" /> Add Slot / Block Date
                </Button>
                {isPast(selectedDate) && (
                  <p className="text-[10px] text-[#6B6560] text-center font-medium mt-2">
                    Past dates cannot be modified for availability
                  </p>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="py-20 text-center text-[#6B6560] text-xs font-medium border border-dashed border-[#E8E2D9] rounded-2xl bg-white p-6">
            <CalendarIcon className="size-8 text-[#9E5338] mx-auto mb-2 opacity-60" />
            <p className="font-bold text-[#221F1C]">Select a Date</p>
            <p className="text-[11px] text-[#6B6560] mt-1">Click any day on the calendar to view reservations and manage time slots</p>
          </div>
        )}
      </div>
    </div>
  </div>
  );
};

export default BookingCalendar;
