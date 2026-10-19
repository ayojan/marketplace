'use client';

import React from 'react';
import { User, Mail, Phone, MapPin, CheckCircle2, ShieldCheck, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CITIES } from '@/components/Header';
import { CustomerProfileData } from './types';

interface CustomerPersonalDetailsCardProps {
  data: CustomerProfileData;
  onChange: (updated: Partial<CustomerProfileData>) => void;
  onSave: () => void;
  saving: boolean;
  completionPercentage: number;
}

export default function CustomerPersonalDetailsCard({
  data,
  onChange,
  onSave,
  saving,
  completionPercentage,
}: CustomerPersonalDetailsCardProps) {
  return (
    <div className="bg-white rounded-3xl border border-[#E8E2D9] p-6 sm:p-8 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E2D9] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="size-8 rounded-full bg-[#F3EADF] text-[#9E5338] flex items-center justify-center">
              <User className="size-4" />
            </span>
            <h3 className="font-serif font-bold text-lg text-[#221F1C]">
              Primary Host Information
            </h3>
          </div>
          <p className="text-xs text-[#6B6560] mt-1">
            Your legal contact information shared with booked specialists upon reservation confirmation
          </p>
        </div>

        {/* Profile Completion Meter Pill */}
        <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D9]">
          <span className="text-[10px] font-bold text-[#6B6560] uppercase tracking-wider">Profile Strength:</span>
          <div className="w-16 h-2 rounded-full bg-[#E8E2D9] overflow-hidden">
            <div
              className="h-full bg-emerald-600 rounded-full transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          <span className="text-xs font-bold text-[#221F1C]">{completionPercentage}%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#221F1C] block">
            First Name <span className="text-[#9E5338]">*</span>
          </label>
          <input
            type="text"
            required
            value={data.firstName}
            onChange={(e) => onChange({ firstName: e.target.value })}
            placeholder="e.g. Pooja"
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E2D9] bg-[#FAF7F2] text-xs text-[#221F1C] focus:outline-none focus:border-[#9E5338] transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#221F1C] block">
            Last Name <span className="text-[#9E5338]">*</span>
          </label>
          <input
            type="text"
            required
            value={data.lastName}
            onChange={(e) => onChange({ lastName: e.target.value })}
            placeholder="e.g. Sharma"
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E2D9] bg-[#FAF7F2] text-xs text-[#221F1C] focus:outline-none focus:border-[#9E5338] transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#221F1C] block">
            Account Email Address
          </label>
          <div className="relative">
            <input
              type="email"
              disabled
              value={data.email}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E2D9] bg-[#F3EADF]/60 text-xs text-[#6B6560] cursor-not-allowed pr-24"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle2 className="size-3 text-emerald-600" /> Verified
            </span>
          </div>
          <span className="text-[10px] text-[#6B6560]">Primary login identity</span>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#221F1C] block">
            Phone / WhatsApp Number
          </label>
          <input
            type="tel"
            placeholder="+91 98765 43210"
            value={data.phone}
            onChange={(e) => onChange({ phone: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E2D9] bg-[#FAF7F2] text-xs text-[#221F1C] focus:outline-none focus:border-[#9E5338] transition-colors"
          />
          <span className="text-[10px] text-[#6B6560]">Used for vendor date confirmations &amp; WhatsApp alerts</span>
        </div>
      </div>

      {/* Save Action Banner */}
      <div className="pt-4 border-t border-[#E8E2D9] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <span className="text-xs text-[#6B6560] flex items-center gap-1.5">
          <ShieldCheck className="size-4 text-[#9E5338]" />
          All details are protected under Ayoj strict host privacy terms
        </span>

        <Button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="bg-[#9E5338] hover:bg-[#86442B] text-white rounded-full text-xs font-semibold px-8 h-11 shadow-sm active:scale-95 transition-all cursor-pointer"
        >
          {saving ? (
            <>
              <Loader2 className="size-4 animate-spin mr-2" />
              Saving Profile...
            </>
          ) : (
            'Save Profile Changes'
          )}
        </Button>
      </div>
    </div>
  );
}
