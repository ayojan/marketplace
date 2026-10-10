'use client';

import { Suspense } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import CustomerDashboard from '@/components/pages/CustomerDashboard';

export default function CustomerDashboardPage() {
  return (
    <ProtectedRoute requiredRole="customer">
      <Suspense fallback={<div className="min-h-screen bg-[#FAF7F2]" />}>
        <CustomerDashboard />
      </Suspense>
    </ProtectedRoute>
  );
}

