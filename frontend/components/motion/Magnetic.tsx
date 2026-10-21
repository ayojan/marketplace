'use client';

import React, { useEffect, useRef } from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  type SpringOptions,
} from 'framer-motion';
import { cn } from '@/components/ui/utils';

const DEFAULT_SPRING_CONFIG: SpringOptions = {
  stiffness: 26.7,
  damping: 4.1,
  mass: 0.2,
};

export type MagneticProps = {
  children: React.ReactNode;
  intensity?: number;
  range?: number;
  actionArea?: 'self' | 'parent';
  springOptions?: SpringOptions;
  className?: string;
};

export function Magnetic({
  children,
  intensity = 0.35,
  range = 80,
  actionArea = 'self',
  springOptions = DEFAULT_SPRING_CONFIG,
  className,
}: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, springOptions);
  const springY = useSpring(y, springOptions);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const target = actionArea === 'parent' ? element.parentElement : element;
    if (!target) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = target.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distanceX = e.clientX - centerX;
      const distanceY = e.clientY - centerY;

      const absoluteDistance = Math.sqrt(distanceX ** 2 + distanceY ** 2);

      if (absoluteDistance <= range) {
        const scale = 1 - absoluteDistance / range;
        x.set(distanceX * intensity * scale);
        y.set(distanceY * intensity * scale);
      } else {
        x.set(0);
        y.set(0);
      }
    };

    const handleMouseLeave = () => {
      x.set(0);
      y.set(0);
    };

    target.addEventListener('mousemove', handleMouseMove);
    target.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      target.removeEventListener('mousemove', handleMouseMove);
      target.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [actionArea, intensity, range, x, y]);

  return (
    <motion.div
      ref={ref}
      style={{
        x: springX,
        y: springY,
      }}
      className={cn('inline-block', className)}
    >
      {children}
    </motion.div>
  );
}
