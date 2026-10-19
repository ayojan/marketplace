'use client';

import React from 'react';
import CelebrationPassportCard from './CelebrationPassportCard';
import CustomerDreamTeamTracker from './CustomerDreamTeamTracker';
import CustomerBudgetProgress from './CustomerBudgetProgress';
import CustomerCoHostCard from './CustomerCoHostCard';
import CustomerNotificationSettings from './CustomerNotificationSettings';
import CustomerPersonalDetailsCard from './CustomerPersonalDetailsCard';
import { CustomerProfileData } from './types';

interface CustomerProfileViewProps {
  data: CustomerProfileData;
  onChange: (updated: Partial<CustomerProfileData>) => void;
  onSave: () => void;
  saving: boolean;
  bookings: any[];
  completionPercentage: number;
}

export default function CustomerProfileView({
  data,
  onChange,
  onSave,
  saving,
  bookings,
  completionPercentage,
}: CustomerProfileViewProps) {
  return (
    <div className="space-y-8 animate-in fade-in duration-300 w-full">
      {/* 1. Celebration Passport & Identity */}
      <CelebrationPassportCard
        data={data}
        onChange={onChange}
      />

      {/* 2. Dream Team Category Slot Matrix */}
      <CustomerDreamTeamTracker
        bookings={bookings}
      />

      {/* 3. Budget Planner & Spend Allocator */}
      <CustomerBudgetProgress
        data={data}
        onChange={onChange}
        bookings={bookings}
      />

      {/* 4. Co-Host & Planning Partner */}
      <CustomerCoHostCard
        data={data}
        onChange={onChange}
      />

      {/* 5. Communication & Alert Channels */}
      <CustomerNotificationSettings
        data={data}
        onChange={onChange}
      />

      {/* 6. Primary Host Contact Details & Master Save */}
      <CustomerPersonalDetailsCard
        data={data}
        onChange={onChange}
        onSave={onSave}
        saving={saving}
        completionPercentage={completionPercentage}
      />
    </div>
  );
}
