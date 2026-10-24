'use client';

import React from 'react';
import { Sparkles, Briefcase, Check } from 'lucide-react';

interface AuthRoleSelectorProps {
  activeRole: 'customer' | 'vendor';
  onRoleChange: (role: 'customer' | 'vendor') => void;
  variant?: 'tabs' | 'cards';
  className?: string;
}

export default function AuthRoleSelector({
  activeRole,
  onRoleChange,
  variant = 'tabs',
  className = ''
}: AuthRoleSelectorProps) {
  if (variant === 'cards') {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3.5 ${className}`}>
        {/* Customer Card */}
        <button
          type="button"
          onClick={() => onRoleChange('customer')}
          className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer relative group ${
            activeRole === 'customer'
              ? 'bg-[#FAF7F2] border-[#9E5338] shadow-sm ring-1 ring-[#9E5338]'
              : 'bg-white border-[#E8E2D9] hover:border-[#9E5338]/40 hover:bg-[#FAF7F2]/40'
          }`}
        >
          {activeRole === 'customer' && (
            <div className="absolute top-3 right-3 size-5 rounded-full bg-[#9E5338] text-white flex items-center justify-center">
              <Check className="size-3" />
            </div>
          )}
          <div className="size-9 rounded-xl bg-[#F3EADF] text-[#9E5338] flex items-center justify-center mb-2.5">
            <Sparkles className="size-4.5" />
          </div>
          <h4 className="font-serif font-bold text-sm text-[#221F1C] mb-0.5">
            Host an Event
          </h4>
          <p className="text-[11px] text-[#6B6560] leading-snug">
            Plan celebrations, compare top verified creatives &amp; book with 0% markup.
          </p>
        </button>

        {/* Vendor Card */}
        <button
          type="button"
          onClick={() => onRoleChange('vendor')}
          className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer relative group ${
            activeRole === 'vendor'
              ? 'bg-[#FAF7F2] border-[#9E5338] shadow-sm ring-1 ring-[#9E5338]'
              : 'bg-white border-[#E8E2D9] hover:border-[#9E5338]/40 hover:bg-[#FAF7F2]/40'
          }`}
        >
          {activeRole === 'vendor' && (
            <div className="absolute top-3 right-3 size-5 rounded-full bg-[#9E5338] text-white flex items-center justify-center">
              <Check className="size-3" />
            </div>
          )}
          <div className="size-9 rounded-xl bg-[#F3EADF] text-[#9E5338] flex items-center justify-center mb-2.5">
            <Briefcase className="size-4.5" />
          </div>
          <h4 className="font-serif font-bold text-sm text-[#221F1C] mb-0.5">
            Join as Creative Pro
          </h4>
          <p className="text-[11px] text-[#6B6560] leading-snug">
            Showcase your portfolio, receive client leads &amp; grow your business directly.
          </p>
        </button>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-2 gap-1.5 p-1 bg-[#F3EADF] rounded-xl border border-[#E8E2D9] ${className}`}>
      <button
        type="button"
        onClick={() => onRoleChange('customer')}
        className={`py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
          activeRole === 'customer'
            ? 'bg-white text-[#9E5338] shadow-xs'
            : 'text-[#6B6560] hover:text-[#221F1C]'
        }`}
      >
        <Sparkles className="size-3.5" />
        <span>Host an Event</span>
      </button>

      <button
        type="button"
        onClick={() => onRoleChange('vendor')}
        className={`py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
          activeRole === 'vendor'
            ? 'bg-white text-[#9E5338] shadow-xs'
            : 'text-[#6B6560] hover:text-[#221F1C]'
        }`}
      >
        <Briefcase className="size-3.5" />
        <span>Join as Creative Pro</span>
      </button>
    </div>
  );
}
