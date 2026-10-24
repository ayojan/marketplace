'use client';

import React from 'react';
import { Ban } from 'lucide-react';
import { Slot } from './constants';

interface CalendarMonthGridProps {
  currentDate: Date;
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
  getBookingsForDate: (date: Date | null) => any[];
  getSlotsForDate: (date: Date | null) => Slot[];
}

export default function CalendarMonthGrid({
  currentDate,
  selectedDate,
  onSelectDate,
  getBookingsForDate,
  getSlotsForDate
}: CalendarMonthGridProps) {
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
              onClick={() => day && onSelectDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
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
        <span className="font-bold text-[#221F1C]">Legend</span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-emerald-500" /> Available
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-rose-600" /> Blocked Date
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-amber-500" /> Pending booking
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-[#9E5338]" /> Confirmed booking
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-blue-600" /> Completed booking
        </span>
      </div>
    </div>
  );
}
