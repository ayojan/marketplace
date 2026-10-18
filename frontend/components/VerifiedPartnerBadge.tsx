'use client';

import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, Info, Building2, Phone, Sparkles, Award } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

export interface VerificationCheckItem {
  key?: string;
  title: string;
  description: string;
  completed?: boolean;
  value?: string;
}

export interface VerifiedPartnerBadgeProps {
  vendorName?: string;
  verificationChecks?: Record<string, VerificationCheckItem> | VerificationCheckItem[];
  isVerified?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const VERIFICATION_STANDARDS = [
  {
    key: 'business_license',
    title: 'Business Registration / GSTIN',
    description: 'Government business registration, GSTIN, or trade license authenticated on file.',
    icon: Building2,
  },
  {
    key: 'contact_verified',
    title: 'Direct Contact & Base Location',
    description: 'Operational service location and direct telephone contact verified.',
    icon: Phone,
  },
  {
    key: 'profile_complete',
    title: 'Comprehensive Profile & Portfolio',
    description: 'Detailed professional studio bio and transparent operating details.',
    icon: Sparkles,
  },
  {
    key: 'curation_approved',
    title: 'Ayoj Curation & Safety Approval',
    description: 'Vetted and formally approved by the Ayoj Trust & Safety operations team.',
    icon: Award,
  },
];

export default function VerifiedPartnerBadge({
  vendorName = 'Creative Partner',
  verificationChecks,
  isVerified = true,
  size = 'sm',
  className = '',
}: VerifiedPartnerBadgeProps) {
  const [open, setOpen] = useState(false);

  if (!isVerified) return null;

  const sizeClasses = {
    sm: 'text-[11px] px-2.5 py-1 gap-1',
    md: 'text-xs px-3 py-1.5 gap-1.5',
    lg: 'text-sm px-4 py-2 gap-2',
  }[size];

  const iconSizes = {
    sm: 'size-3.5',
    md: 'size-4',
    lg: 'size-4.5',
  }[size];

  // Resolve checks if passed dynamically
  const checksMap: Record<string, any> = Array.isArray(verificationChecks)
    ? verificationChecks.reduce((acc, curr) => ({ ...acc, [curr.key || curr.title]: curr }), {})
    : verificationChecks || {};

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setOpen((prev) => !prev);
          }}
          className={`inline-flex items-center rounded-full bg-white/95 backdrop-blur-md border border-white/70 font-semibold text-[#8E4532] shadow-xs hover:bg-white hover:text-[#7A3624] transition-all cursor-pointer group/badge focus:outline-none focus:ring-2 focus:ring-[#9E5338]/30 ${sizeClasses} ${className}`}
          aria-label={`Ayoj Verified Partner badge for ${vendorName}. Click to view verification standards.`}
          title="Ayoj Verified Partner — Click for details"
        >
          <ShieldCheck className={`${iconSizes} text-[#9E5338] shrink-0`} />
          <span>Verified Partner</span>
          <Info className="size-2.5 text-[#9E5338]/60 group-hover/badge:text-[#9E5338] ml-0.5 shrink-0 transition-colors" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        side="bottom"
        align="start"
        sideOffset={6}
        className="w-84 sm:w-92 p-4 rounded-2xl bg-white border border-[#E8E2D9] shadow-xl text-[#221F1C] z-50 text-left"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        {/* Header */}
        <div className="flex items-start gap-3 border-b border-[#E8E2D9]/80 pb-3 mb-3">
          <div className="size-9 rounded-full bg-[#F3EADF] flex items-center justify-center shrink-0 border border-[#E8E2D9]">
            <ShieldCheck className="size-5 text-[#9E5338]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-sm font-serif font-bold text-[#221F1C]">Ayoj Verified Partner</h4>
            </div>
            <p className="text-[11px] text-[#6B6560] mt-0.5 leading-tight">
              Certification of authenticity, verified business credentials, and platform quality.
            </p>
          </div>
        </div>

        {/* Verification Definition Copy */}
        <p className="text-[11px] text-[#6B6560] mb-3 leading-relaxed">
          <span className="font-semibold text-[#221F1C]">{vendorName}</span> displays this badge because all of the following checks have been completed and verified by Ayoj:
        </p>

        {/* The 4 Verification Pillars Checklist */}
        <div className="space-y-2.5">
          {VERIFICATION_STANDARDS.map((std) => {
            const dynamicCheck = checksMap[std.key];
            const isCompleted = dynamicCheck ? dynamicCheck.completed !== false : true;
            const Icon = std.icon;

            return (
              <div
                key={std.key}
                className="flex items-start gap-2.5 p-2 rounded-xl bg-[#FAF7F2] border border-[#E8E2D9]/70"
              >
                <div className="mt-0.5 shrink-0">
                  {isCompleted ? (
                    <CheckCircle2 className="size-4 text-emerald-600 fill-emerald-100" />
                  ) : (
                    <Icon className="size-4 text-[#9E5338]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-[#221F1C] leading-none">
                    {std.title}
                  </p>
                  <p className="text-[10px] text-[#6B6560] mt-1 leading-snug">
                    {std.description}
                  </p>
                  {dynamicCheck?.value && (
                    <span className="inline-block mt-1 font-mono text-[9px] text-[#9E5338] bg-white px-1.5 py-0.5 rounded border border-[#E8E2D9]">
                      {dynamicCheck.value}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Trust Footer */}
        <div className="mt-3.5 pt-2.5 border-t border-[#E8E2D9]/80 flex items-center justify-between text-[10px] text-[#6B6560]">
          <span>Ayoj Trust & Safety Standard</span>
          <span className="font-semibold text-emerald-700 flex items-center gap-1">
            <CheckCircle2 className="size-3" /> 100% Certified
          </span>
        </div>
      </PopoverContent>
    </Popover>
  );
}
