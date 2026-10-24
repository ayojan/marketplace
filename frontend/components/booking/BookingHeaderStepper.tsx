'use client';

import React from 'react';
import { ShieldCheck, Check } from 'lucide-react';
import { Service } from './constants';

interface BookingHeaderStepperProps {
  service: Service | null;
  step: number;
}

export default function BookingHeaderStepper({
  service,
  step
}: BookingHeaderStepperProps) {
  const steps = [
    { num: 1, label: 'Details' },
    { num: 2, label: 'Schedule' },
    { num: 3, label: 'Review' }
  ];

  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#E8E2D9]">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3EADF] text-[#9E5338] text-[11px] font-semibold mb-2.5 border border-[#E8E2D9]">
          <ShieldCheck className="size-3.5" />
          <span>Ayoj Secure Booking & Escrow Protection</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-serif font-normal text-[#221F1C] tracking-tight">
          {service?.name || 'Service Booking'}
        </h1>
        <p className="text-xs sm:text-sm text-[#6B6560] mt-1.5 flex items-center gap-2">
          <span className="font-semibold text-[#221F1C]">
            {service?.vendor?.business_name || (service?.vendor?.is_verified ? 'Ayoj Verified Partner' : 'Ayoj Creative Partner')}
          </span>
          {service?.category?.name && (
            <>
              <span className="size-1 rounded-full bg-[#9E5338]" />
              <span className="text-[#9E5338] font-medium">{service.category.name}</span>
            </>
          )}
          {service?.vendor?.location && (
            <>
              <span className="size-1 rounded-full bg-[#E8E2D9]" />
              <span>{service.vendor.location}</span>
            </>
          )}
        </p>
      </div>

      {/* 3-Step Indicator */}
      <div className="flex items-center gap-2">
        {steps.map((item, idx) => {
          const isActive = step === item.num;
          const isCompleted = step > item.num;
          return (
            <React.Fragment key={item.num}>
              <div className="flex items-center gap-2">
                <div
                  className={`size-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 border ${
                    isActive
                      ? 'bg-[#9E5338] text-white border-[#9E5338] shadow-sm'
                      : isCompleted
                      ? 'bg-[#F3EADF] text-[#9E5338] border-[#9E5338]/40'
                      : 'bg-white text-[#6B6560] border-[#E8E2D9]'
                  }`}
                >
                  {isCompleted ? <Check className="size-3.5 stroke-[3]" /> : item.num}
                </div>
                <span
                  className={`text-xs font-medium hidden sm:inline ${
                    isActive ? 'text-[#221F1C] font-bold' : 'text-[#6B6560]'
                  }`}
                >
                  {item.label}
                </span>
              </div>
              {idx < 2 && (
                <div
                  className={`w-8 h-0.5 mx-1 transition-colors ${
                    step > item.num ? 'bg-[#9E5338]' : 'bg-[#E8E2D9]'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
