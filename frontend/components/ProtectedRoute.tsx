'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
// @ts-ignore
import { useAuth } from '@/lib/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'customer' | 'vendor' | 'admin';
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        const fromPath = typeof window !== 'undefined' ? `${window.location.pathname}${window.location.search}` : '';
        router.push(fromPath ? `/login?from=${encodeURIComponent(fromPath)}` : '/login');
      } else if (requiredRole && user?.role !== requiredRole) {
        router.push('/unauthorized');
      } else {
        setIsAuthorized(true);
      }
    }
  }, [isAuthenticated, isLoading, user, requiredRole, router]);

  if (isLoading || !isAuthorized) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex flex-col items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          className="w-full max-w-4xl space-y-12"
        >
          <div className="space-y-4">
            <Skeleton className="h-12 w-1/3 rounded-full" />
            <Skeleton className="h-6 w-1/4 rounded-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
          </div>
          <Skeleton className="h-[400px] w-full rounded-2xl" />
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
