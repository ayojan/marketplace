'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Calendar as CalendarIcon,
  Ban,
  CheckCircle2,
  Clock,
  Plus,
  Trash2,
  User,
  Loader2,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Slot } from './types';

interface CalendarSidebarProps {
  selectedDate: Date | null;
  selectedSlots: Slot[];
  selectedBookings: any[];
  isSelectedDateBlocked: boolean;
  isSelectedDateAvailable: boolean;
  actionLoading: boolean;
  isPast: boolean;
  isAddSlotOpen: boolean;
  slotStartTime: string;
  slotEndTime: string;
  slotIsAvailable: boolean;
  onToggleBlockDate: () => Promise<void>;
  onToggleSlot: (slot: Slot) => Promise<void>;
  onDeleteSlot: (slotId: number) => Promise<void>;
  onToggleAddSlotOpen: () => void;
  onSetSlotStartTime: (val: string) => void;
  onSetSlotEndTime: (val: string) => void;
  onSetSlotIsAvailable: (val: boolean) => void;
  onCreateCustomSlot: (e: React.FormEvent) => Promise<void>;
}

export default function CalendarSidebar({
  selectedDate,
  selectedSlots,
  selectedBookings,
  isSelectedDateBlocked,
  isSelectedDateAvailable,
  actionLoading,
  isPast,
  isAddSlotOpen,
  slotStartTime,
  slotEndTime,
  slotIsAvailable,
  onToggleBlockDate,
  onToggleSlot,
  onDeleteSlot,
  onToggleAddSlotOpen,
  onSetSlotStartTime,
  onSetSlotEndTime,
  onSetSlotIsAvailable,
  onCreateCustomSlot
}: CalendarSidebarProps) {
  if (!selectedDate) {
    return (
      <div className="py-20 text-center text-[#6B6560] text-xs font-medium border border-dashed border-[#E8E2D9] rounded-2xl bg-white p-6">
        <CalendarIcon className="size-8 text-[#9E5338] mx-auto mb-2 opacity-60" />
        <p className="font-bold text-[#221F1C]">Select a Date</p>
        <p className="text-[11px] text-[#6B6560] mt-1">
          Click any day on the calendar to block dates or manage time slots
        </p>
      </div>
    );
  }

  return (
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
            {selectedDate.toLocaleDateString('default', {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}
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
            disabled={isPast || actionLoading}
            onClick={onToggleBlockDate}
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
            {!isPast && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onToggleAddSlotOpen}
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
                onSubmit={onCreateCustomSlot}
                className="p-3.5 rounded-xl border border-[#E8E2D9] bg-[#FAF7F2] space-y-3 overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#221F1C]">New Time Slot</span>
                  <button
                    type="button"
                    onClick={onToggleAddSlotOpen}
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
                      onChange={(e) => onSetSlotStartTime(e.target.value)}
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
                      onChange={(e) => onSetSlotEndTime(e.target.value)}
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
                      onChange={(e) => onSetSlotIsAvailable(e.target.checked)}
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
                      <Clock
                        className={`size-3.5 ${slot.is_available ? 'text-emerald-700' : 'text-rose-700'}`}
                      />
                      <span className="text-xs font-bold text-[#221F1C]">
                        {slot.time_range || `${slot.start_time} - ${slot.end_time}`}
                      </span>
                    </div>
                    <span
                      className={`inline-block text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded ${
                        slot.is_available ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {slot.is_available ? 'Open / Available' : 'Blocked'}
                    </span>
                  </div>

                  {!isPast && (
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={actionLoading}
                        onClick={() => onToggleSlot(slot)}
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
                        onClick={() => onDeleteSlot(slot.id)}
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

        {isPast && (
          <p className="text-[10px] text-[#8C847C] text-center font-medium pt-1">
            Past dates cannot be modified for availability
          </p>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
