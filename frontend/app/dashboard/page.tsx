'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      if (user.role === 'vendor') {
        router.replace('/vendor/dashboard');
      } else {
        router.replace('/customer/dashboard');
      }
    }
  }, [user, isLoading, router]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md space-y-8 text-center">
          <div className="space-y-4">
            <Skeleton className="h-12 w-3/4 mx-auto rounded-full" />
            <Skeleton className="h-6 w-1/2 mx-auto rounded-full" />
          </div>
          <div className="grid grid-cols-1 gap-4">
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
