'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';

export interface MobileActionSheetOption {
  id: string;
  label: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: React.ReactNode;
  selected?: boolean;
  onClick: () => void;
  destructive?: boolean;
}

export interface MobileActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  options?: MobileActionSheetOption[];
  children?: React.ReactNode;
  className?: string;
  showCloseButton?: boolean;
}

export function MobileActionSheet({
  isOpen,
  onClose,
  title,
  subtitle,
  options,
  children,
  className = '',
  showCloseButton = true,
}: MobileActionSheetProps) {
  // Prevent background scrolling while open & listen for escape key
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center md:hidden" role="dialog" aria-modal="true">
          {/* Dimmed Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            aria-hidden="true"
          />

          {/* Bottom Sheet Drawer */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className={`relative w-full max-h-[82vh] bg-[#FAF7F2] rounded-t-3xl border-t border-[#E8E2D9] shadow-2xl flex flex-col overflow-hidden pb-safe z-10 ${className}`}
          >
            {/* Grab Drag Indicator */}
            <div className="pt-3 pb-1.5 flex justify-center cursor-grab active:cursor-grabbing">
              <div className="w-12 h-1.5 bg-[#D5CDC2] rounded-full" />
            </div>

            {/* Sheet Header */}
            {(title || subtitle || showCloseButton) && (
              <div className="px-5 pt-1.5 pb-3 border-b border-[#E8E2D9] flex items-center justify-between gap-3 shrink-0">
                <div className="min-w-0 flex-1">
                  {typeof title === 'string' ? (
                    <h2 className="text-base font-serif font-bold text-[#221F1C] truncate">
                      {title}
                    </h2>
                  ) : (
                    title
                  )}
                  {subtitle && (
                    <p className="text-xs text-[#6B6560] mt-0.5 truncate leading-normal">
                      {subtitle}
                    </p>
                  )}
                </div>

                {showCloseButton && (
                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close sheet"
                    className="size-8 rounded-full bg-white border border-[#E8E2D9] flex items-center justify-center text-[#6B6560] hover:text-[#221F1C] transition-colors cursor-pointer shrink-0 shadow-2xs active:scale-95"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>
            )}

            {/* Scrollable Content Body */}
            <div className="overflow-y-auto px-4 py-3 space-y-1.5 overscroll-contain">
              {children}

              {/* Standard Selectable Option List */}
              {options && options.length > 0 && (
                <div className="space-y-1">
                  {options.map((opt) => {
                    const Icon = opt.icon;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          opt.onClick();
                          onClose();
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-left transition-all active:scale-[0.99] cursor-pointer border ${
                          opt.selected
                            ? 'bg-[#F3EADF] text-[#9E5338] border-[#9E5338]/30 font-semibold shadow-2xs'
                            : opt.destructive
                              ? 'bg-white text-rose-600 border-[#E8E2D9] hover:bg-rose-50'
                              : 'bg-white text-[#221F1C] border-[#E8E2D9] hover:bg-[#F3EADF]/60'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          {Icon && (
                            <div className={`size-8 rounded-xl flex items-center justify-center shrink-0 ${
                              opt.selected 
                                ? 'bg-[#9E5338] text-white' 
                                : opt.destructive
                                  ? 'bg-rose-100 text-rose-600'
                                  : 'bg-[#FAF7F2] text-[#6B6560] border border-[#E8E2D9]'
                            }`}>
                              <Icon className="size-4" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-semibold truncate leading-tight">
                              {opt.label}
                            </div>
                            {opt.description && (
                              <div className="text-[11px] text-[#6B6560] font-normal truncate mt-0.5">
                                {opt.description}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          {opt.badge}
                          {opt.selected && (
                            <Check className="size-4 text-[#9E5338]" strokeWidth={2.5} />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default MobileActionSheet;
