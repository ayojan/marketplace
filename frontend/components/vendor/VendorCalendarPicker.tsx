'use client';

import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Check, Calendar as CalendarIcon } from 'lucide-react';

interface VendorCalendarPickerProps {
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
  availableSlots?: Array<{ id?: string | number; date: string; is_available?: boolean }>;
  minDate?: string;
}

export default function VendorCalendarPicker({
  selectedDate,
  onSelectDate,
  availableSlots = [],
  minDate,
}: VendorCalendarPickerProps) {
  const [currentMonthDate, setCurrentMonthDate] = useState(() => {
    if (selectedDate) return new Date(selectedDate);
    return new Date();
  });

  const availableDateSet = useMemo(() => {
    const set = new Set<string>();
    availableSlots.forEach((s) => {
      if (s.date && s.is_available !== false) {
        set.add(s.date.split('T')[0]);
      }
    });
    return set;
  }, [availableSlots]);

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  const monthName = currentMonthDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const handlePrevMonth = () => {
    setCurrentMonthDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthDate(new Date(year, month + 1, 1));
  };

  interface DayItem {
    empty?: boolean;
    day?: number;
    dateStr?: string;
    isPast?: boolean;
    isSelected?: boolean;
    isSlotAvailable?: boolean;
    isToday?: boolean;
    key: string;
  }

  const daysArray = useMemo(() => {
    const items: DayItem[] = [];
    // Padding before 1st of month
    for (let i = 0; i < firstDayOfWeek; i++) {
      items.push({ empty: true, key: `empty-${i}` });
    }
    // Days
    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(year, month, day);
      dateObj.setHours(0, 0, 0, 0);
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isPast = dateObj < today;
      const isSelected = selectedDate === dateStr;
      const isSlotAvailable = availableDateSet.has(dateStr);
      const isToday = dateObj.getTime() === today.getTime();

      items.push({
        day,
        dateStr,
        isPast,
        isSelected,
        isSlotAvailable,
        isToday,
        key: dateStr,
      });
    }
    return items;
  }, [year, month, daysInMonth, firstDayOfWeek, today, selectedDate, availableDateSet]);

  return (
    <div className="space-y-3 p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D9]">
      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <span className="font-serif font-bold text-xs sm:text-sm text-[#221F1C]">
          {monthName}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePrevMonth}
            aria-label="Previous month"
            className="size-7 rounded-lg bg-white border border-[#E8E2D9] flex items-center justify-center text-[#6B6560] hover:text-[#221F1C] cursor-pointer shadow-2xs"
          >
            <ChevronLeft className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            aria-label="Next month"
            className="size-7 rounded-lg bg-white border border-[#E8E2D9] flex items-center justify-center text-[#6B6560] hover:text-[#221F1C] cursor-pointer shadow-2xs"
          >
            <ChevronRight className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-[#6B6560] uppercase tracking-wider">
        <span>Su</span>
        <span>Mo</span>
        <span>Tu</span>
        <span>We</span>
        <span>Th</span>
        <span>Fr</span>
        <span>Sa</span>
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1">
        {daysArray.map((item) => {
          if (item.empty) {
            return <div key={item.key} className="h-8" />;
          }

          const { day, dateStr, isPast, isSelected, isSlotAvailable, isToday } = item;

          return (
            <button
              key={item.key}
              type="button"
              disabled={isPast}
              onClick={() => dateStr && onSelectDate(dateStr)}
              className={`relative h-8 rounded-lg text-xs font-semibold flex items-center justify-center transition-all ${
                isSelected
                  ? 'bg-[#9E5338] text-white shadow-xs font-bold scale-105 z-10'
                  : isPast
                    ? 'text-stone-300 cursor-not-allowed'
                    : isSlotAvailable
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100 cursor-pointer'
                      : 'bg-white text-[#221F1C] border border-[#E8E2D9]/60 hover:border-[#9E5338] hover:bg-stone-50 cursor-pointer'
              }`}
            >
              <span>{day}</span>

              {/* Slot available green dot */}
              {isSlotAvailable && !isSelected && (
                <span className="absolute bottom-1 size-1 rounded-full bg-emerald-600" />
              )}

              {/* Today indicator border */}
              {isToday && !isSelected && (
                <span className="absolute inset-0 rounded-lg border border-dashed border-[#9E5338]/60 pointer-events-none" />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend & Status */}
      <div className="flex items-center justify-between pt-1 border-t border-[#E8E2D9]/60 text-[10px] text-[#6B6560]">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-emerald-500" />
            <span>Open Slot</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-[#9E5338]" />
            <span>Selected</span>
          </span>
        </div>
        {selectedDate && (
          <span className="font-bold text-[#9E5338]">
            {new Date(selectedDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
          </span>
        )}
      </div>
    </div>
  );
}
