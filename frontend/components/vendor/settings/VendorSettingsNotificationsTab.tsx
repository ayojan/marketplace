'use client';

import React from 'react';
import { Switch } from '@/components/ui/switch';
import { VendorSettingsFormData } from './types';
import { NOTIFICATION_ITEMS } from './presets';

interface VendorSettingsNotificationsTabProps {
  formData: VendorSettingsFormData;
  onChange: (field: string, value: any) => void;
}

export default function VendorSettingsNotificationsTab({
  formData,
  onChange
}: VendorSettingsNotificationsTabProps) {
  return (
    <div className="bg-white border border-[#E8E2D9] rounded-2xl p-6 shadow-xs space-y-6">
      <div>
        <h3 className="text-base font-serif font-bold text-[#221F1C]">Communication & Alert Preferences</h3>
        <p className="text-xs text-[#6B6560] mt-0.5">
          Choose how and when Ayoj notifies you of client inquiries and platform events.
        </p>
      </div>

      <div className="space-y-4">
        {NOTIFICATION_ITEMS.map((item) => (
          <div
            key={item.key}
            className="flex items-center justify-between p-3.5 rounded-xl border border-[#E8E2D9] bg-[#FAF7F2]/60"
          >
            <div className="pr-4">
              <p className="text-xs font-semibold text-[#221F1C]">{item.title}</p>
              <p className="text-[11px] text-[#6B6560] mt-0.5">{item.desc}</p>
            </div>
            <Switch
              checked={(formData as any)[item.key]}
              onCheckedChange={(val) => onChange(item.key, val)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
