'use client';

import { Suspense } from 'react';
import VendorOnboardingWizard from '@/components/vendor/VendorOnboardingWizard';

export default function VendorOnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FBF8F4] flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#9E5338] border-t-transparent" />
        </div>
      }
    >
      <VendorOnboardingWizard />
    </Suspense>
  );
}
