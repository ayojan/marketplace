'use client';

import React from 'react';
import Link from 'next/link';
import { Star, Heart, ArrowRight } from 'lucide-react';
import { InView } from '@/components/motion';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { CORE_GUARANTEES, TESTIMONIAL_STORIES } from './presets';

export function HomeTrustPromise() {
  return (
    <>
      {/* 4 Core Guarantees Ribbon */}
      <section className="py-8 px-4 sm:px-6 bg-[#FAF7F2] border-t border-[#E8E2D9]">
        <InView className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-5xl mx-auto">
            {CORE_GUARANTEES.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="p-3.5 rounded-xl bg-white border border-[#E8E2D9] shadow-2xs flex items-center gap-3">
                  <div className="size-9 rounded-lg bg-[#FAF7F2] border border-[#E8E2D9] flex items-center justify-center text-[#9E5338] shrink-0">
                    <Icon className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#221F1C]">{item.title}</p>
                    <p className="text-[11px] text-[#6B6560]">{item.subtitle}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </InView>
      </section>

      {/* Real Celebrations, Real Stories Testimonial Section */}
      <section id="reviews" className="scroll-mt-20 py-16 px-4 sm:px-6 bg-[#FAF7F2] border-t border-[#E8E2D9]">
        <InView className="max-w-7xl mx-auto space-y-10">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E8E2D9] pb-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#F3EADF] text-[#9E5338] text-[10px] font-bold uppercase tracking-wider border border-[#E8E2D9]">
                <Heart className="size-3 fill-[#9E5338]" />
                Host Stories &amp; Verified Reviews
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-normal text-[#221F1C]">
                Real Celebrations, Real Stories
              </h2>
              <p className="text-xs sm:text-sm text-[#6B6560] max-w-xl leading-relaxed">
                Hear from couples and families who brought their milestone moments to life with Ayoj verified professionals.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="size-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-xs font-bold text-[#221F1C]">4.9 / 5.0</span>
              <span className="text-xs text-[#6B6560]">from 2,500+ verified events</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIAL_STORIES.map((story) => (
              <div 
                key={story.id}
                className="bg-white border border-[#E8E2D9] rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between hover:border-[#9E5338]/40 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <ImageWithFallback
                    src={story.image}
                    alt={story.occasion}
                    fill
                    unoptimized
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/25 backdrop-blur-md text-white border border-white/20">
                      {story.occasion}
                    </span>
                    <p className="text-xs font-bold mt-1 text-white/95">{story.couple}</p>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-1 text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="size-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-xs text-[#221F1C] leading-relaxed italic">
                      &ldquo;{story.quote}&rdquo;
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#E8E2D9] flex items-center justify-between text-xs">
                    <div>
                      <p className="text-[10px] text-[#6B6560] uppercase font-bold tracking-wider">Booked Studio</p>
                      <Link
                        href={`/marketplace?search=${encodeURIComponent(story.vendor)}`}
                        className="font-semibold text-[#221F1C] hover:text-[#9E5338] hover:underline flex items-center gap-1 group/studio cursor-pointer transition-colors"
                      >
                        <span>{story.vendor}</span>
                        <ArrowRight className="size-3 text-[#9E5338] opacity-0 group-hover/studio:opacity-100 transition-opacity" />
                      </Link>
                    </div>
                    <span className="text-[10px] font-bold text-[#9E5338] bg-[#F3EADF] px-2 py-0.5 rounded-full">
                      Verified Host
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </InView>
      </section>
    </>
  );
}
