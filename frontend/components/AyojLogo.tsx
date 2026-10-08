'use client';

import React from 'react';
import Image from 'next/image';

interface AyojLogoProps {
  showTagline?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function AyojLogo({
  showTagline = true,
  className = '',
  size = 'md',
}: AyojLogoProps) {
  const dimensionsMap = {
    sm: showTagline ? { width: 180, height: 50 } : { width: 160, height: 46 },
    md: showTagline ? { width: 230, height: 64 } : { width: 200, height: 56 },
    lg: showTagline ? { width: 320, height: 86 } : { width: 260, height: 72 },
  };

  const { width, height } = dimensionsMap[size];
  const logoSrc = showTagline
    ? '/images/ayoj-logo-with-tagline.jpg'
    : '/images/ayoj-logo-no-tagline.jpg';

  return (
    <div className={`inline-flex items-center select-none overflow-hidden ${className}`}>
      <Image
        src={logoSrc}
        alt="Ayoj Marketplace"
        width={width}
        height={height}
        unoptimized
        className="w-auto object-contain mix-blend-multiply rounded-sm scale-110 origin-left"
        style={{ height: `${height}px` }}
      />
    </div>
  );
}







