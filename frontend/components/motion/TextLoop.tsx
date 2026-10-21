'use client';

import React, { useState, useEffect, Children } from 'react';
import { motion, AnimatePresence, type Transition, type Variants } from 'framer-motion';
import { cn } from '@/components/ui/utils';

export type TextLoopProps = {
  children: React.ReactNode[];
  className?: string;
  interval?: number;
  transition?: Transition;
  variants?: Variants;
  onIndexChange?: (index: number) => void;
  trigger?: boolean;
  mode?: 'popLayout' | 'wait' | 'sync';
};

export function TextLoop({
  children,
  className,
  interval = 2.8,
  transition = { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
  variants,
  onIndexChange,
  trigger = true,
  mode = 'popLayout',
}: TextLoopProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const items = Children.toArray(children);

  useEffect(() => {
    if (!trigger || items.length <= 1) return;

    const intervalMs = interval * 1000;
    const timer = setInterval(() => {
      setCurrentIndex((current) => {
        const next = (current + 1) % items.length;
        onIndexChange?.(next);
        return next;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [items.length, interval, onIndexChange, trigger]);

  const motionVariants: Variants = variants || {
    initial: { y: 22, opacity: 0, filter: 'blur(4px)' },
    animate: { y: 0, opacity: 1, filter: 'blur(0px)' },
    exit: { y: -22, opacity: 0, filter: 'blur(4px)' },
  };

  return (
    <span className={cn('relative inline-flex items-center overflow-hidden align-baseline', className)}>
      <AnimatePresence mode={mode} initial={false}>
        <motion.span
          key={currentIndex}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={transition}
          variants={motionVariants}
          className="inline-block"
        >
          {items[currentIndex]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
