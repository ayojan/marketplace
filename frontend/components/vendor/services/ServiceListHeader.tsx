'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface ServiceListHeaderProps {
  onAddNew: () => void;
}

export default function ServiceListHeader({ onAddNew }: ServiceListHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-[#E8E2D9] shadow-xs">
      <div>
        <h2 className="text-2xl font-serif text-[#221F1C]">Services & Packages</h2>
        <p className="text-xs text-[#6B6560] mt-1 font-normal">
          Manage your professional offerings, pricing tiers, and service visibility
        </p>
      </div>
      <Button
        onClick={onAddNew}
        className="rounded-full bg-[#9E5338] hover:bg-[#86442B] text-white text-xs font-semibold px-5 h-10 transition-colors shadow-sm cursor-pointer"
      >
        <Plus className="mr-1.5 size-4" /> Add New Service
      </Button>
    </div>
  );
}
