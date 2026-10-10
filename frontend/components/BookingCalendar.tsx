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
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const res = await api.get('/availability_slots', {
        params: {
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0]
        }
      });
      setAvailabilitySlots(res.data.availability_slots || []);
    } catch (err) {
      console.error('Error loading calendar data:', err);
    }
  }, [currentDate]);

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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
      {/* Calendar Grid */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold text-white uppercase tracking-widest">
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h2>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={() => navigateMonth(-1)} className="rounded-lg border-white/[0.05] text-slate-400 hover:text-white hover:bg-white/[0.02]">
              <ChevronLeft className="size-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => navigateMonth(1)} className="rounded-lg border-white/[0.05] text-slate-400 hover:text-white hover:bg-white/[0.02]">
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-px bg-white/[0.03] border border-white/[0.03] rounded-2xl overflow-hidden shadow-2xl">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="bg-[#16191e] p-3 text-center text-[10px] font-bold uppercase tracking-widest text-slate-500">
              {d}
            </div>
          ))}
          {daysInMonth(currentDate).map((day, i) => {
            const currentCellDate = day ? new Date(currentDate.getFullYear(), currentDate.getMonth(), day) : null;
            const dayBookings = getBookingsForDate(currentCellDate);
            return (
              <div
                key={i}
                onClick={() => day && setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
                className={`min-h-[100px] p-2 transition-all cursor-pointer relative group ${
                  !day ? 'bg-[#0f1115]/50' : isDayInPast(day) ? 'bg-[#16191e]/60 opacity-60 hover:bg-white/[0.02]' : 'bg-[#16191e] hover:bg-white/[0.02]'
                } ${isSelected(day) ? 'ring-2 ring-inset ring-primary z-10' : ''}`}
              >
                {day && (
                  <>
                    <span className={`text-xs font-bold ${isToday(day) ? 'size-6 bg-primary text-primary-foreground rounded flex items-center justify-center' : isDayInPast(day) ? 'text-slate-600' : 'text-slate-400'}`}>
                      {day}
                    </span>
                    <div className="mt-2 space-y-1">
                      {dayBookings.slice(0, 2).map((b: any, idx: number) => (
                        <div key={idx} className="text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 truncate font-bold uppercase tracking-widest">
                          {b.service_name}
                        </div>
                      ))}
                      {dayBookings.length > 2 && (
                        <div className="text-[9px] text-slate-500 font-bold pl-1.5 uppercase tracking-widest">
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
      </div>

      {/* Sidebar Details */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-white uppercase tracking-widest mb-2">Details</h3>
        {selectedDate ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedDate.toISOString()}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-6"
            >
              <div className="p-5 rounded-2xl bg-gradient-to-br from-primary/10 to-[#16191e] border border-white/[0.03]">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">
                  {selectedDate.toLocaleDateString('default', { weekday: 'long' })}
                </p>
                <p className="text-2xl font-bold text-white tracking-tight">
                  {selectedDate.toLocaleDateString('default', { month: 'long', day: 'numeric' })}
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Scheduled Events</h4>
                {getBookingsForDate(selectedDate).length > 0 ? (
                  getBookingsForDate(selectedDate).map((b: any) => (
                    <Card key={b.id} className="border-white/[0.03] bg-[#16191e] shadow-sm group hover:border-primary/20 transition-colors">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="font-bold text-sm text-white">{b.service_name}</div>
                          <Badge variant="secondary" className="rounded text-[8px] font-bold uppercase tracking-widest px-1.5 bg-white/[0.05] border-none text-slate-400">{b.status}</Badge>
                        </div>
                        <div className="space-y-1 text-xs text-slate-400 font-medium">
                          <div className="flex items-center gap-2"><User className="size-3 text-slate-500" /> {b.customer_name}</div>
                          <div className="flex items-center gap-2"><Clock className="size-3 text-slate-500" /> {b.start_time}</div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="py-12 text-center border-2 border-dashed border-white/[0.03] rounded-2xl">
                    <p className="text-xs text-slate-500 font-medium">No events scheduled</p>
                  </div>
                )}
              </div>

              <Button 
                size="sm" 
                disabled={isPast(selectedDate)}
                className="w-full rounded-lg font-bold disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Plus className="mr-1.5 size-3.5" /> Add Availability
              </Button>
              {isPast(selectedDate) && (
                <p className="text-[10px] text-slate-500 text-center font-medium">
                  Past dates cannot be modified for availability
                </p>
              )}
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="py-20 text-center text-slate-500 text-xs font-medium border border-dashed border-white/[0.03] rounded-2xl">
            Select a date to view details
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingCalendar;
