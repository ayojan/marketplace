'use client';

import React from 'react';
import { 
  Zap, 
  Calendar as CalendarIcon, 
  Check, 
  Info, 
  Eye, 
  ArrowRight, 
  MessageCircle, 
  ShieldCheck 
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import VendorCalendarPicker from './VendorCalendarPicker';
import { Service } from './types';

interface VendorBookingSidebarProps {
  bookingDate: string;
  onSelectDate: (date: string) => void;
  availabilitySlots: any[];
  todayStr: string;
  upcomingAvailableSlots: any[];
  isDateInAvailableSlots: boolean | null;
  selectedService: Service | null;
  onViewService: (service: Service) => void;
  addons: string[];
  onToggleAddon: (id: string) => void;
  totalPrice: number;
  onBookingRequest: () => void;
  onOpenCustomInquiry: () => void;
}

export default function VendorBookingSidebar({
  bookingDate,
  onSelectDate,
  availabilitySlots,
  todayStr,
  upcomingAvailableSlots,
  isDateInAvailableSlots,
  selectedService,
  onViewService,
  addons,
  onToggleAddon,
  totalPrice,
  onBookingRequest,
  onOpenCustomInquiry,
}: VendorBookingSidebarProps) {
  return (
    <div className="lg:col-span-4">
      <div id="booking-sidebar" className="sticky top-20 space-y-4">
        <Card className="border border-[#E8E2D9] bg-white shadow-sm rounded-2xl overflow-hidden">
          <div className="p-4 bg-[#F3EADF] border-b border-[#E8E2D9]">
            <h3 className="text-xs font-bold text-[#9E5338] uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="size-3.5 fill-[#9E5338]" /> Quick Reservation
            </h3>
          </div>
          <CardContent className="p-5 space-y-5">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-[#221F1C] flex items-center gap-1.5">
                  <CalendarIcon className="size-3.5 text-[#9E5338]" /> Select Event Date
                </label>
                {isDateInAvailableSlots === true && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Check className="size-3" /> Slot Open
                  </span>
                )}
              </div>

              {/* Interactive Visual Month Calendar */}
              <VendorCalendarPicker
                selectedDate={bookingDate}
                onSelectDate={onSelectDate}
                availableSlots={availabilitySlots}
                minDate={todayStr}
              />

              {isDateInAvailableSlots === false && bookingDate && (
                <p className="text-[10px] text-amber-700 flex items-center gap-1 leading-snug">
                  <Info className="size-3 shrink-0" />
                  Custom date request: Studio has not opened public slots for this date. You may still submit your inquiry.
                </p>
              )}
              {upcomingAvailableSlots.length > 0 && !bookingDate && (
                <div className="pt-1 space-y-1">
                  <p className="text-[10px] text-[#6B6560] font-medium">Upcoming open celebration dates:</p>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {upcomingAvailableSlots.map((slot: any) => (
                      <button
                        key={slot.id || slot.date}
                        type="button"
                        onClick={() => onSelectDate(slot.date)}
                        className="px-2 py-0.5 rounded-lg bg-[#FAF7F2] hover:bg-[#F3EADF] border border-[#E8E2D9] text-[10px] font-semibold text-[#9E5338] transition-colors cursor-pointer"
                      >
                        {new Date(slot.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 rounded-xl bg-[#FBF8F4] border border-[#E8E2D9] space-y-2">
              <div className="flex justify-between items-center">
                <p className="text-[10px] font-bold text-[#6B6560] uppercase tracking-wider">Selected Package</p>
                {selectedService && (
                  <button
                    type="button"
                    onClick={() => onViewService(selectedService)}
                    className="text-[10px] font-semibold text-[#9E5338] hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <Eye className="size-3" /> View Details
                  </button>
                )}
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-[#221F1C]">{selectedService?.name || 'No package selected'}</span>
                <span className="font-bold text-[#221F1C]">
                  {selectedService?.pricing_type === 'custom'
                    ? 'Custom Quote'
                    : `₹${selectedService?.base_price?.toLocaleString() || '0'}`}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#6B6560]">Optional Add-ons</p>
              <div className="space-y-1.5">
                {[
                  { id: 'exp', label: 'Express 48h Delivery', price: '₹5,000' },
                  { id: 'raw', label: 'Raw Asset Disk', price: '₹5,000' },
                ].map((addon) => (
                  <button
                    key={addon.id}
                    type="button"
                    onClick={() => onToggleAddon(addon.id)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-xs transition-all cursor-pointer ${
                      addons.includes(addon.id)
                        ? 'bg-[#F3EADF] border-[#9E5338] text-[#9E5338] font-bold'
                        : 'bg-white border-[#E8E2D9] text-[#6B6560] hover:border-[#9E5338]/30'
                    }`}
                  >
                    <span>{addon.label}</span>
                    <span>{addon.price}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-[#E8E2D9] space-y-3">
              <div className="flex justify-between items-end">
                <span className="text-xs font-bold text-[#6B6560] uppercase tracking-wider">Estimated Total</span>
                <div className="text-right">
                  <span className="text-2xl font-bold text-[#221F1C] flex items-center justify-end">
                    ₹{totalPrice.toLocaleString()}
                  </span>
                </div>
              </div>

              <Button
                type="button"
                onClick={onBookingRequest}
                className="w-full h-11 rounded-full bg-[#9E5338] hover:bg-[#86442B] text-white font-medium text-xs transition-colors shadow-sm cursor-pointer"
              >
                <span>{selectedService ? 'Confirm Reservation Request' : 'Check Date & Request Booking'}</span>
                <ArrowRight className="size-4 ml-1.5" />
              </Button>

              <button
                type="button"
                onClick={onOpenCustomInquiry}
                className="w-full py-2.5 rounded-full bg-[#FAF7F2] hover:bg-[#F3EADF] border border-[#E8E2D9] text-[#221F1C] font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <MessageCircle className="size-3.5 text-[#9E5338]" />
                <span>Ask a Question / Custom Quote</span>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Ayoj Booking Guarantees Card */}
        <div className="p-4 rounded-2xl bg-white border border-[#E8E2D9] shadow-2xs space-y-3">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#6B6560] flex items-center gap-1.5">
            <ShieldCheck className="size-3.5 text-[#9E5338]" /> Ayoj Booking Guarantees
          </h4>
          <div className="space-y-2 text-xs text-[#221F1C]">
            <div className="flex items-start gap-2">
              <span className="size-1.5 rounded-full bg-[#9E5338] mt-1.5 shrink-0" />
              <p className="leading-snug"><strong className="font-semibold">0% Commission Markup:</strong> Direct artist rates with no middleman inflation.</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="size-1.5 rounded-full bg-[#9E5338] mt-1.5 shrink-0" />
              <p className="leading-snug"><strong className="font-semibold">Date Protection:</strong> Official slot reservation with clear milestone terms.</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="size-1.5 rounded-full bg-[#9E5338] mt-1.5 shrink-0" />
              <p className="leading-snug"><strong className="font-semibold">Direct Communication:</strong> Instant phone & WhatsApp chat with the lead team.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
