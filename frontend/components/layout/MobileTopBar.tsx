'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export interface MobileTopBarProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  onBack?: () => void;
  backHref?: string;
  actions?: React.ReactNode;
  className?: string;
  showBack?: boolean;
}

export function MobileTopBar({
  title,
  subtitle,
  onBack,
  backHref,
  actions,
  className = '',
  showBack = true,
}: MobileTopBarProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (backHref) {
      router.push(backHref);
    } else {
      router.back();
    }
  };

  return (
    <header
      className={`sticky top-0 z-40 w-full bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E8E2D9] h-14 px-3 flex items-center justify-between gap-2.5 transition-all ${className}`}
    >
      {/* Left: Back button + optional icon */}
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {showBack && (
          <button
            type="button"
            onClick={handleBack}
            aria-label="Go back"
            className="size-9 rounded-full flex items-center justify-center text-[#221F1C] hover:bg-[#F3EADF] border border-[#E8E2D9] bg-white transition-all active:scale-95 shrink-0 cursor-pointer shadow-2xs"
          >
            <ArrowLeft className="size-4 text-[#221F1C]" />
          </button>
        )}

        {/* Center/Left: Title & Subtitle */}
        {(title || subtitle) && (
          <div className="min-w-0 flex-1">
            {typeof title === 'string' ? (
              <span className="text-sm font-serif font-bold text-[#221F1C] truncate leading-tight block">
                {title}
              </span>
            ) : (
              title
            )}
            {subtitle && (
              <div className="text-[11px] text-[#6B6560] truncate leading-tight mt-0.5">
                {subtitle}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right: Actions (Share, Save, Icons, etc.) */}
      {actions && (
        <div className="flex items-center gap-1.5 shrink-0">
          {actions}
        </div>
      )}
    </header>
  );
}

export default MobileTopBar;
