'use client';

import React from 'react';
import Link from 'next/link';
import { Home, Compass, Search, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AyojLogo from '@/components/AyojLogo';

const NotFound = () => {
  return (
    <div className="min-h-screen w-full bg-[#FBF8F4] text-[#221F1C] flex flex-col items-center justify-between p-6 sm:p-12 font-sans selection:bg-[#F3EADF] selection:text-[#9E5338]">
      
      {/* Top Header Logo */}
      <header className="w-full max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="hover:opacity-90 transition-opacity">
          <AyojLogo size="sm" showTagline={false} />
        </Link>
        <Link href="/" className="text-xs font-medium text-[#6B6560] hover:text-[#9E5338] transition-colors flex items-center gap-1">
          <ArrowLeft className="size-3.5" /> Back to Home
        </Link>
      </header>

      {/* Center 404 Surface Card */}
      <main className="max-w-xl w-full text-center my-auto py-12 px-6 sm:px-10 bg-white border border-[#E8E2D9] rounded-2xl shadow-sm space-y-6 relative">
        
        {/* Large Editorial 404 Number */}
        <div className="relative inline-block">
          <span className="text-7xl sm:text-9xl font-serif font-normal text-[#221F1C] tracking-tight">
            404
          </span>
          <span className="block text-xs font-medium uppercase tracking-widest text-[#9E5338] mt-1">
            PAGE NOT FOUND
          </span>
        </div>

        {/* Heading & Subtitle */}
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-serif font-normal text-[#221F1C]">
            This moment seems to be out of frame.
          </h2>
          <p className="text-[#6B6560] text-sm font-normal max-w-md mx-auto leading-relaxed">
            The page you are looking for doesn't exist, has been removed, or moved to a new destination on Ayoj.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link href="/" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto bg-[#9E5338] hover:bg-[#86442B] text-white rounded-full text-xs font-medium px-7 h-11 transition-colors gap-2">
              <Home className="size-4" />
              Return to Home
            </Button>
          </Link>

          <Link href="/marketplace" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full sm:w-auto border-[#E8E2D9] bg-white hover:bg-[#F3EADF] text-[#221F1C] rounded-full text-xs font-medium px-7 h-11 transition-all gap-2">
              <Compass className="size-4 text-[#9E5338]" />
              Explore Marketplace
            </Button>
          </Link>
        </div>

        {/* Quick Category Suggestions */}
        <div className="pt-6 border-t border-[#E8E2D9] space-y-2">
          <p className="text-[11px] font-medium text-[#6B6560] uppercase tracking-wider">Popular Destinations</p>
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
            {[
              { label: 'Weddings', href: '/marketplace?category=Weddings' },
              { label: 'Pre-Wedding', href: '/marketplace?category=Pre-Wedding' },
              { label: 'Private Parties', href: '/marketplace?category=Celebrations' },
              { label: 'Venues', href: '/marketplace?category=Venues' },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="px-3 py-1 rounded-md bg-[#F5ECE2] hover:bg-[#F3EADF] border border-[#E8E2D9] text-[#221F1C] transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto text-center pt-6">
        <p className="text-xs text-[#6B6560]">© 2026 Ayoj Marketplace. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default NotFound;