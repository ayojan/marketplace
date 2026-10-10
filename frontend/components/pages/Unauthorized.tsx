'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft, LogIn, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AyojLogo from '@/components/AyojLogo';

const Unauthorized = () => {
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

      {/* Center Surface Card */}
      <main className="max-w-xl w-full text-center my-auto py-12 px-6 sm:px-10 bg-white border border-[#E8E2D9] rounded-2xl shadow-sm space-y-6 relative">
        
        {/* Icon */}
        <div className="size-16 rounded-full bg-[#F3EADF] border border-[#E8E2D9] flex items-center justify-center mx-auto">
          <ShieldAlert className="size-7 text-[#9E5338]" />
        </div>

        {/* Heading & Subtitle */}
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-serif font-normal text-[#221F1C]">
            Access Denied
          </h2>
          <p className="text-[#6B6560] text-sm font-normal max-w-md mx-auto leading-relaxed">
            You don&apos;t have permission to access this page. Please make sure you&apos;re logged in with the correct account type.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link href="/login" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto bg-[#9E5338] hover:bg-[#86442B] text-white rounded-full text-xs font-medium px-7 h-11 transition-colors gap-2 cursor-pointer">
              <LogIn className="size-4" />
              Login with Different Account
            </Button>
          </Link>

          <Link href="/register" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full sm:w-auto border-[#E8E2D9] bg-white hover:bg-[#F3EADF] text-[#221F1C] rounded-full text-xs font-medium px-7 h-11 transition-all gap-2 cursor-pointer">
              <UserPlus className="size-4 text-[#9E5338]" />
              Create New Account
            </Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto text-center pt-6">
        <p className="text-xs text-[#6B6560]">© 2026 Ayoj Marketplace. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Unauthorized;