'use client';

import { Suspense } from 'react';
import Register from '@/components/pages/Register';

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FBF8F4] flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-2 border-[#9E5338] border-t-transparent"></div></div>}>
      <Register />
    </Suspense>
  );
}
