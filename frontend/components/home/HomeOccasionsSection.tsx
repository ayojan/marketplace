'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { InView } from '@/components/motion';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { POPULAR_OCCASIONS } from './constants';

interface HomeOccasionsSectionProps {
  onSelectOccasion: (slug: string) => void;
}

export function HomeOccasionsSection({ onSelectOccasion }: HomeOccasionsSectionProps) {
  const occasionsScrollRef = useRef<HTMLDivElement>(null);

  const scrollOccasions = (direction: 'left' | 'right') => {
    if (occasionsScrollRef.current) {
      const offset = direction === 'left' ? -260 : 260;
      occasionsScrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <section id="occasions" className="scroll-mt-20 py-12 px-4 sm:px-6 bg-[#FAF7F2] border-b border-[#E8E2D9]">
      <InView className="max-w-7xl mx-auto space-y-6">
        
        <div className="flex items-center justify-between border-b border-[#E8E2D9] pb-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-serif font-normal text-[#221F1C]">
              Popular occasions
            </h2>
            <p className="text-xs text-[#6B6560] mt-0.5">
              Curated talent and services tailored for every celebration milestone.
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollOccasions('left')}
              className="hidden sm:flex size-8 rounded-full border border-[#E8E2D9] bg-white items-center justify-center text-[#6B6560] hover:text-[#9E5338] hover:border-[#9E5338]/40 transition-colors cursor-pointer shadow-2xs active:scale-95"
              aria-label="Scroll occasions left"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollOccasions('right')}
              className="hidden sm:flex size-8 rounded-full border border-[#E8E2D9] bg-white items-center justify-center text-[#6B6560] hover:text-[#9E5338] hover:border-[#9E5338]/40 transition-colors cursor-pointer shadow-2xs active:scale-95"
              aria-label="Scroll occasions right"
            >
              <ChevronRight className="size-4" />
            </button>
            <Link href="/marketplace" className="text-xs font-semibold text-[#9E5338] hover:underline flex items-center gap-1 sm:ml-2">
              View all <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>

        <div 
          ref={occasionsScrollRef}
          className="flex gap-4 overflow-x-auto no-scrollbar pb-2 snap-x snap-mandatory scroll-smooth"
        >
          {POPULAR_OCCASIONS.map((occ) => (
            <div
              key={occ.name}
              onClick={() => onSelectOccasion(occ.name.toLowerCase().replace(/\s+/g, '-'))}
              className="relative aspect-[3/2] sm:aspect-[4/3] w-[180px] sm:w-[200px] md:w-[220px] rounded-2xl overflow-hidden group cursor-pointer border border-[#E8E2D9] shrink-0 snap-start shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
            >
              <ImageWithFallback
                src={occ.image}
                alt={occ.name}
                fill
                unoptimized
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent transition-opacity group-hover:from-black/90" />
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                <span className="font-serif font-bold text-xs sm:text-sm tracking-tight">{occ.name}</span>
                <ArrowRight className="size-3 text-white/80 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
          ))}
        </div>

      </InView>
    </section>
  );
}
