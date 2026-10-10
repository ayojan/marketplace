'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { RotateCcw, Home, Compass, AlertTriangle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AyojLogo from '@/components/AyojLogo';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to console for monitoring & debugging
    console.error('Unhandled app error captured by boundary:', error);
  }, [error]);

  return (
    <div className="min-h-screen w-full bg-[#FBF8F4] text-[#221F1C] flex flex-col items-center justify-between p-6 sm:p-12 font-sans selection:bg-[#F3EADF] selection:text-[#9E5338]">
      {/* Top Header Logo */}
      <header className="w-full max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="hover:opacity-90 transition-opacity">
          <AyojLogo size="sm" showTagline={false} />
        </Link>
        <Link
          href="/"
          className="text-xs font-medium text-[#6B6560] hover:text-[#9E5338] transition-colors flex items-center gap-1"
        >
          <ArrowLeft className="size-3.5" /> Back to Home
        </Link>
      </header>

      {/* Main Error Surface Card */}
      <main className="max-w-xl w-full text-center my-auto py-12 px-6 sm:px-10 bg-white border border-[#E8E2D9] rounded-2xl shadow-sm space-y-6 relative">
        {/* Editorial Icon Badge */}
        <div className="mx-auto size-16 rounded-2xl bg-[#F3EADF] border border-[#E8E2D9] flex items-center justify-center text-[#9E5338] shadow-xs">
          <AlertTriangle className="size-8 stroke-[1.75]" />
        </div>

        {/* Heading & Subtitle */}
        <div className="space-y-2">
          <span className="block text-xs font-semibold uppercase tracking-widest text-[#9E5338]">
            Something Went Wrong
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-normal text-[#221F1C]">
            We hit an unexpected snag.
          </h1>
          <p className="text-[#6B6560] text-sm font-normal max-w-md mx-auto leading-relaxed">
            An unexpected error occurred while loading this page. Don't worry — your data is safe. You can retry the action or return to the marketplace.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            size="lg"
            onClick={() => reset()}
            className="w-full sm:w-auto bg-[#9E5338] hover:bg-[#86442B] text-white rounded-full text-xs font-medium px-7 h-11 transition-colors gap-2 cursor-pointer shadow-sm"
          >
            <RotateCcw className="size-4" />
            Try Again
          </Button>

          <Link href="/" className="w-full sm:w-auto">
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto border-[#E8E2D9] bg-white hover:bg-[#F3EADF] text-[#221F1C] rounded-full text-xs font-medium px-7 h-11 transition-all gap-2 cursor-pointer"
            >
              <Home className="size-4 text-[#9E5338]" />
              Return to Home
            </Button>
          </Link>
        </div>

        {/* Developer diagnostic details in non-production */}
        {process.env.NODE_ENV !== 'production' && error?.message && (
          <div className="pt-4 text-left border-t border-[#E8E2D9]">
            <details className="text-xs text-[#6B6560] cursor-pointer">
              <summary className="font-mono text-[11px] hover:text-[#9E5338] transition-colors">
                Developer diagnostics
              </summary>
              <pre className="mt-2 p-3 bg-[#FAF7F2] rounded-lg border border-[#E8E2D9] text-[11px] font-mono text-[#7D341E] overflow-x-auto whitespace-pre-wrap">
                {error.message}
                {error.digest ? `\nDigest: ${error.digest}` : ''}
              </pre>
            </details>
          </div>
        )}

        {/* Popular Destination shortcuts */}
        <div className="pt-6 border-t border-[#E8E2D9] space-y-2">
          <p className="text-[11px] font-medium text-[#6B6560] uppercase tracking-wider">
            Quick Navigation
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
            <Link
              href="/marketplace"
              className="px-3 py-1 rounded-md bg-[#F5ECE2] hover:bg-[#F3EADF] border border-[#E8E2D9] text-[#221F1C] transition-colors flex items-center gap-1.5"
            >
              <Compass className="size-3.5 text-[#9E5338]" />
              Explore Marketplace
            </Link>
            <Link
              href="/customer/dashboard"
              className="px-3 py-1 rounded-md bg-[#F5ECE2] hover:bg-[#F3EADF] border border-[#E8E2D9] text-[#221F1C] transition-colors"
            >
              Customer Dashboard
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto text-center pt-6">
        <p className="text-xs text-[#6B6560]">© 2026 Ayoj Marketplace. All rights reserved.</p>
      </footer>
    </div>
  );
}
