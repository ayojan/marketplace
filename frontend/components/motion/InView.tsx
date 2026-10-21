'use client';

import React, { useRef, type ReactNode } from 'react';
import {
  motion,
  useInView,
  type Variant,
  type Transition,
  type UseInViewOptions,
} from 'framer-motion';
import { cn } from '@/components/ui/utils';

export type InViewProps = {
  children: ReactNode;
  variants?: {
    hidden: Variant;
    visible: Variant;
  };
  transition?: Transition;
  viewOptions?: UseInViewOptions;
  as?: 'div' | 'section' | 'article' | 'span' | 'header' | 'footer';
  once?: boolean;
  className?: string;
};

const defaultVariants = {
  hidden: { opacity: 0, y: 24, filter: 'blur(4px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)' },
};

const defaultTransition: Transition = {
  duration: 0.5,
  ease: [0.21, 0.47, 0.32, 0.98],
};

export function InView({
  children,
  variants = defaultVariants,
  transition = defaultTransition,
  viewOptions,
  as = 'div',
  once = true,
  className,
}: InViewProps) {
  const ref = useRef<HTMLDivElement>(null);
  
  // Framer Motion's useInView has native `once` support and never re-triggers setState
  const isInView = useInView(ref, {
    once,
    margin: '0px 0px -40px 0px',
    ...viewOptions,
  });

  const MotionComponent = motion[as] as typeof motion.div;

  return (
    <MotionComponent
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={variants}
      transition={transition}
      className={cn(className)}
    >
      {children}
    </MotionComponent>
  );
}
