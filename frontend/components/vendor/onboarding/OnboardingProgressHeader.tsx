'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { ONBOARDING_STEPS } from './presets';

interface OnboardingProgressHeaderProps {
  currentStep: number;
  onStepClick: (stepNumber: number) => void;
  isVendorAuthenticated: boolean;
}

export default function OnboardingProgressHeader({
  currentStep,
  onStepClick,
  isVendorAuthenticated
}: OnboardingProgressHeaderProps) {
  const steps = ONBOARDING_STEPS(isVendorAuthenticated);

  if (currentStep > 5) return null;

  return (
    <div className="mb-10">
      {/* Step Indicators */}
      <div className="grid grid-cols-5 gap-2 md:gap-4 relative">
        {steps.map((step) => {
          const isCompleted = currentStep > step.number || (step.number === 1 && isVendorAuthenticated);
          const isCurrent = currentStep === step.number;
          const isClickable = (isCompleted || isCurrent) && !(step.number === 1 && isVendorAuthenticated);

          return (
            <button
              key={step.number}
              onClick={() => {
                if (isClickable) onStepClick(step.number);
              }}
              disabled={!isClickable}
              className={`flex flex-col items-center text-center group transition-all ${
                isClickable ? 'cursor-pointer' : 'cursor-default'
              } ${!isCompleted && !isCurrent ? 'opacity-40' : ''}`}
            >
              <div
                className={`size-9 rounded-full flex items-center justify-center font-bold text-xs mb-1.5 transition-all shadow-sm ${
                  isCompleted
                    ? 'bg-emerald-600 text-white'
                    : isCurrent
                    ? 'bg-[#9E5338] text-white ring-4 ring-[#9E5338]/20 scale-105'
                    : 'bg-[#F3EADF] text-[#6B6560] border border-[#E8E2D9]'
                }`}
              >
                {isCompleted ? <Check className="size-4 stroke-[3]" /> : step.number}
              </div>
              <span
                className={`text-[11px] md:text-xs font-bold truncate max-w-[80px] md:max-w-none ${
                  isCurrent ? 'text-[#9E5338]' : isCompleted ? 'text-[#221F1C]' : 'text-[#6B6560]'
                }`}
              >
                {step.title}
              </span>
              <span className="hidden md:block text-[10px] text-[#6B6560] truncate">
                {step.subtitle}
              </span>
            </button>
          );
        })}
      </div>

      {/* Linear Progress Indicator */}
      <div className="w-full bg-[#E8E2D9] h-1.5 rounded-full mt-4 overflow-hidden">
        <motion.div
          className="bg-[#9E5338] h-full rounded-full"
          initial={{ width: '20%' }}
          animate={{ width: `${(currentStep / 5) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  );
}
