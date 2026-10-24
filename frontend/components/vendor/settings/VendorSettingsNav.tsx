'use client';

import React from 'react';
import { Building2, CalendarClock, ShieldCheck, Bell } from 'lucide-react';
import { SettingsTabType } from './types';

interface VendorSettingsNavProps {
  activeTab: SettingsTabType;
  onTabChange: (tab: SettingsTabType) => void;
}

const TABS: { id: SettingsTabType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'profile', label: 'Business Profile', icon: Building2 },
  { id: 'policies', label: 'Booking & Policies', icon: CalendarClock },
  { id: 'verification', label: 'Trust & Verification', icon: ShieldCheck },
  { id: 'notifications', label: 'Notifications', icon: Bell }
];

export default function VendorSettingsNav({ activeTab, onTabChange }: VendorSettingsNavProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-[#E8E2D9] pb-4">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              isActive
                ? 'bg-[#9E5338] text-white shadow-xs'
                : 'text-[#6B6560] bg-white border border-[#E8E2D9] hover:bg-[#FAF7F2] hover:text-[#221F1C]'
            }`}
          >
            <Icon className="size-3.5" />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
