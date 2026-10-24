'use client';

import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { CheckCircle2 } from 'lucide-react';
import { VendorSettingsFormData, CANCELLATION_POLICIES } from './constants';

interface VendorSettingsPoliciesTabProps {
  formData: VendorSettingsFormData;
  onChange: (field: string, value: any) => void;
}

export default function VendorSettingsPoliciesTab({
  formData,
  onChange
}: VendorSettingsPoliciesTabProps) {
  return (
    <div className="bg-white border border-[#E8E2D9] rounded-2xl p-6 shadow-xs space-y-6">
      <div>
        <h3 className="text-base font-serif font-bold text-[#221F1C]">Booking & Client Inquiries Policy</h3>
        <p className="text-xs text-[#6B6560] mt-0.5">
          Configure how event inquiries are received, deposit requirements, and cancellation rules.
        </p>
      </div>

      <div className="space-y-5">
        {/* Instant Booking Toggle */}
        <div className="flex items-center justify-between p-4 rounded-xl border border-[#E8E2D9] bg-[#FAF7F2]">
          <div className="space-y-0.5 pr-4">
            <p className="text-xs font-bold text-[#221F1C]">Instant Booking Acceptance</p>
            <p className="text-[11px] text-[#6B6560]">
              Automatically confirm client reservations when calendar dates are available, without requiring manual pre-approval.
            </p>
          </div>
          <Switch
            checked={formData.instant_booking}
            onCheckedChange={(val) => onChange('instant_booking', val)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Min Advance Notice */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-[#221F1C]">Minimum Advance Notice</Label>
            <select
              value={formData.min_advance_days}
              onChange={(e) => onChange('min_advance_days', e.target.value)}
              aria-label="Minimum Advance Notice"
              className="w-full px-3 bg-[#FAF7F2]/60 border border-[#E8E2D9] rounded-md text-xs h-10 text-[#221F1C] focus:outline-none focus:ring-1 focus:ring-[#9E5338]"
            >
              <option value="1">24 Hours Prior</option>
              <option value="2">48 Hours (2 Days)</option>
              <option value="7">1 Week in advance</option>
              <option value="14">2 Weeks in advance</option>
            </select>
          </div>

          {/* Advance Deposit */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-[#221F1C]">Advance Booking Deposit Required</Label>
            <select
              value={formData.advance_deposit_percent}
              onChange={(e) => onChange('advance_deposit_percent', e.target.value)}
              aria-label="Advance Booking Deposit Required"
              className="w-full px-3 bg-[#FAF7F2]/60 border border-[#E8E2D9] rounded-md text-xs h-10 text-[#221F1C] focus:outline-none focus:ring-1 focus:ring-[#9E5338]"
            >
              <option value="20">20% to lock reservation</option>
              <option value="30">30% to lock reservation</option>
              <option value="50">50% to lock reservation</option>
              <option value="100">100% full payment upfront</option>
            </select>
          </div>
        </div>

        {/* Cancellation Policy */}
        <div className="space-y-2 pt-2 border-t border-[#E8E2D9]">
          <Label className="text-xs font-semibold text-[#221F1C]">Cancellation & Refund Policy</Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {CANCELLATION_POLICIES.map((tier) => (
              <div
                key={tier.name}
                onClick={() => onChange('cancellation_policy', tier.name)}
                className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                  formData.cancellation_policy === tier.name
                    ? 'border-[#9E5338] bg-[#F3EADF]/50 ring-1 ring-[#9E5338]'
                    : 'border-[#E8E2D9] bg-white hover:bg-[#FAF7F2]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-bold text-[#221F1C]">{tier.name}</p>
                  {formData.cancellation_policy === tier.name && (
                    <CheckCircle2 className="size-3.5 text-[#9E5338]" />
                  )}
                </div>
                <p className="text-[10px] text-[#6B6560] leading-normal">{tier.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
