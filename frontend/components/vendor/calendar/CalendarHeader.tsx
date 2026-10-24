'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarHeaderProps {
  currentDate: Date;
  onNavigate: (step: number) => void;
}

export default function CalendarHeader({ currentDate, onNavigate }: CalendarHeaderProps) {
  return (
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
          onClick={() => onNavigate(-1)}
          className="size-8 rounded-full border border-[#E8E2D9] text-[#221F1C] hover:text-[#9E5338] hover:bg-[#F3EADF] transition-colors cursor-pointer"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          aria-label="Next Month"
          onClick={() => onNavigate(1)}
          className="size-8 rounded-full border border-[#E8E2D9] text-[#221F1C] hover:text-[#9E5338] hover:bg-[#F3EADF] transition-colors cursor-pointer"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
