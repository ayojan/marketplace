'use client';

import React from 'react';
import { Sparkles, Check, ArrowRight } from 'lucide-react';
import { InView } from '@/components/motion';
import { HOW_IT_WORKS_STEPS } from './constants';

export function HomeHowItWorks() {
  return (
    <section className="py-16 px-4 sm:px-6 bg-[#FAF7F2] border-t border-[#E8E2D9]">
      <InView className="max-w-7xl mx-auto space-y-10">
        
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#F3EADF] text-[#9E5338] text-[10px] font-bold uppercase tracking-wider border border-[#E8E2D9]">
            <Sparkles className="size-3 text-[#9E5338]" />
            Discover · Trust · Celebrate
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-normal text-[#221F1C]">
            How Ayoj Works
          </h2>
          <p className="text-xs sm:text-sm text-[#6B6560] leading-relaxed">
            A transparent marketplace built for celebration planning. Connect directly with verified pros, check live slots, and book with complete confidence.
          </p>
        </div>

        {/* 3 Progressive Journey Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Desktop step connector */}
          <div className="hidden md:block absolute top-[52px] left-16 right-16 h-[1px] border-t border-dashed border-[#E8E2D9] pointer-events-none z-0" />
          
          {HOW_IT_WORKS_STEPS.map((s) => {
            const Icon = s.icon;
            return (
              <div 
                key={s.step}
                className="bg-white border border-[#E8E2D9] rounded-2xl p-6 shadow-xs relative flex flex-col justify-between hover:border-[#9E5338]/40 hover:shadow-md hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-serif font-bold text-2xl text-[#9E5338]/40 group-hover:text-[#9E5338] transition-colors">
                        {s.step}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#9E5338] bg-[#F3EADF] px-2.5 py-0.5 rounded-full">
                        {s.badge}
                      </span>
                    </div>
                    <div className="size-10 rounded-xl bg-[#FAF7F2] border border-[#E8E2D9] flex items-center justify-center text-[#9E5338] group-hover:bg-[#F3EADF] group-hover:scale-110 transition-all duration-200">
                      <Icon className="size-5" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-base font-serif font-bold text-[#221F1C] leading-snug">
                      {s.title}
                    </h3>
                    <p className="text-xs text-[#6B6560] leading-relaxed">
                      {s.desc}
                    </p>
                  </div>

                  {/* Grounded Feature Pills */}
                  <div className="pt-2 space-y-1.5 border-t border-[#E8E2D9]/50">
                    {s.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-[11px] text-[#4A4540]">
                        <Check className="size-3 text-[#9E5338] shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-[#E8E2D9]/70 flex items-center justify-between text-[11px] font-semibold text-[#9E5338]">
                  <span>{s.highlight}</span>
                  <ArrowRight className="size-3 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            );
          })}
        </div>

      </InView>
    </section>
  );
}
