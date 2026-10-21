'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, useSpring, useTransform, type SpringOptions } from 'framer-motion';
import { cn } from '@/components/ui/utils';

export type SpotlightProps = {
  className?: string;
  size?: number;
  springOptions?: SpringOptions;
};

export function Spotlight({
  className,
  size = 320,
  springOptions = { bounce: 0 },
}: SpotlightProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const mouseX = useSpring(0, springOptions);
  const mouseY = useSpring(0, springOptions);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const parent = container.parentElement;
    if (!parent) return;

    const handleMouseMove = (event: MouseEvent) => {
      const { left, top } = parent.getBoundingClientRect();
      mouseX.set(event.clientX - left);
      mouseY.set(event.clientY - top);
    };

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => setIsHovered(false);

    parent.addEventListener('mousemove', handleMouseMove, { passive: true });
    parent.addEventListener('mouseenter', handleMouseEnter);
    parent.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      parent.removeEventListener('mousemove', handleMouseMove);
      parent.removeEventListener('mouseenter', handleMouseEnter);
      parent.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [mouseX, mouseY]);

  return (
    <motion.div
      ref={containerRef}
      className={cn(
        'pointer-events-none absolute top-0 left-0 rounded-full bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops),transparent_75%)] blur-2xl transition-opacity duration-300 z-30',
        'from-[#9E5338]/20 via-[#9E5338]/8 to-transparent',
        isHovered ? 'opacity-100' : 'opacity-0',
        className
      )}
      style={{
        width: size,
        height: size,
        x: mouseX,
        y: mouseY,
        translateX: -size / 2,
        translateY: -size / 2,
      }}
    />
  );
}
