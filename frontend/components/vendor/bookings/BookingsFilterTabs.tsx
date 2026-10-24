'use client';

import React from 'react';
import { Search } from 'lucide-react';
import { BookingTabType } from './constants';

interface BookingsFilterTabsProps {
  activeTab: BookingTabType;
  onTabChange: (tab: BookingTabType) => void;
  counts: {
    all: number;
    pending: number;
    accepted: number;
    completed: number;
    declined: number;
  };
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function BookingsFilterTabs({
  activeTab,
  onTabChange,
  counts,
  searchQuery,
  onSearchChange
}: BookingsFilterTabsProps) {
  const tabs: { id: BookingTabType; label: string; count: number; alert?: boolean }[] = [
    { id: 'all', label: 'All Inquiries', count: counts.all },
    { id: 'pending', label: 'Pending Action', count: counts.pending, alert: counts.pending > 0 },
    { id: 'accepted', label: 'Confirmed', count: counts.accepted },
    { id: 'completed', label: 'Completed', count: counts.completed },
    { id: 'declined', label: 'Declined', count: counts.declined }
  ];

  return (
    <div className="bg-white p-4 rounded-2xl border border-[#E8E2D9] shadow-xs space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#9E5338] text-white shadow-xs'
                    : 'bg-[#FAF7F2] text-[#6B6560] hover:text-[#221F1C] hover:bg-[#F3EADF]'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive
                      ? 'bg-white/25 text-white'
                      : tab.alert
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-white text-[#6B6560]'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Box */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-[#6B6560]" />
          <input
            type="text"
            placeholder="Search by client or service..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#FAF7F2] border border-[#E8E2D9] rounded-xl focus:outline-none focus:border-[#9E5338] text-[#221F1C]"
          />
        </div>
      </div>
    </div>
  );
}
