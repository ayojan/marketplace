'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function VendorPortfolioRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/vendor/dashboard?tab=portfolio');
  }, [router]);

  return null;
}
