'use client';

import React from 'react';

interface AyojLogoProps {
  showTagline?: boolean;
  taglinePosition?: 'bottom' | 'side';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function AyojLogo({
  showTagline = true,
  taglinePosition = 'bottom',
  className = '',
  size = 'md',
}: AyojLogoProps) {
  const dimensionsMap = {
    sm: { height: 28, text: 'text-[9px] tracking-[0.2em]' },
    md: { height: 34, text: 'text-[10px] tracking-[0.22em]' },
    lg: { height: 42, text: 'text-[11px] tracking-[0.24em]' },
  };

  const { height, text } = dimensionsMap[size];

  if (showTagline && taglinePosition === 'side') {
    return (
      <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/ayoj-without-tagline.svg"
          alt="Ayoj Marketplace"
          className="w-auto object-contain"
          style={{ height: `${height}px` }}
        />
        <div className="hidden sm:block h-4 w-[1px] bg-[#E8E2D9]" />
        <span className={`hidden sm:inline-block ${text} uppercase font-medium text-[#9E5338] whitespace-nowrap leading-none`}>
          Discover · Trust · Celebrate
        </span>
      </div>
    );
  }

  return (
    <div className={`inline-flex flex-col items-start select-none ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/ayoj-without-tagline.svg"
        alt="Ayoj Marketplace"
        className="w-auto object-contain"
        style={{ height: `${height}px` }}
      />
      {showTagline && (
        <span className={`${text} uppercase font-medium text-[#9E5338] mt-1 whitespace-nowrap leading-none`}>
          Discover · Trust · Celebrate
        </span>
      )}
    </div>
  );
}







