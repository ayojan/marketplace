'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';
import { VendorSettingsFormData } from './constants';

interface VendorSettingsSidebarProps {
  formData: VendorSettingsFormData;
}

export default function VendorSettingsSidebar({ formData }: VendorSettingsSidebarProps) {
  return (
    <div className="space-y-4">
      <div className="bg-white border border-[#E8E2D9] rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-[#E8E2D9]">
          <div className="size-10 rounded-full bg-[#F3EADF] text-[#9E5338] border border-[#E8E2D9] flex items-center justify-center font-serif font-bold text-sm">
            {formData.business_name[0] || 'V'}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-[#221F1C] truncate">{formData.business_name || 'Vendor Studio'}</p>
            <p className="text-[10px] text-[#6B6560] truncate">{formData.location} · {formData.years_experience} yrs exp</p>
          </div>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between items-center text-[#6B6560]">
            <span>Status</span>
            <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px]">
              {formData.verification_status === 'verified' ? 'Verified Partner' : formData.verification_status === 'pending_verification' ? 'In Review' : 'Standard'}
            </span>
          </div>
          <div className="flex justify-between items-center text-[#6B6560]">
            <span>Booking Mode</span>
            <span className="font-semibold text-[#221F1C] text-[11px]">
              {formData.instant_booking ? 'Instant Confirm' : 'Manual Review'}
            </span>
          </div>
          <div className="flex justify-between items-center text-[#6B6560]">
            <span>Deposit</span>
            <span className="font-semibold text-[#221F1C] text-[11px]">
              {formData.advance_deposit_percent}% Upfront
            </span>
          </div>
          <div className="flex justify-between items-center text-[#6B6560]">
            <span>Cancellation</span>
            <span className="font-semibold text-[#221F1C] text-[11px]">
              {formData.cancellation_policy}
            </span>
          </div>
        </div>

        <div className="pt-3 border-t border-[#E8E2D9]">
          <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#E8E2D9] text-[11px] text-[#6B6560] space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-[#221F1C]">
              <Sparkles className="size-3 text-[#9E5338]" />
              <span>Pro Visibility Tip</span>
            </div>
            <p>
              Adding your verified GSTIN and Instagram profile increases booking conversion by 42%.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
