'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  MapPin, 
  ChevronDown, 
  Search, 
  X, 
  TrendingUp, 
  ArrowRight, 
  ChevronRight, 
  Check, 
  Navigation, 
  Loader2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ImageWithFallback } from '@/components/ImageWithFallback';
import { TextLoop, Magnetic } from '@/components/motion';
import { CITIES } from '@/components/Header';
import { useLocation } from '@/lib/contexts/LocationContext';
import { TRENDING_SEARCHES, POPULAR_SEARCH_PILLS } from './presets';

interface HomeHeroProps {
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSearchSubmit: (e?: React.FormEvent) => void;
  onDirectSearch: (query?: string, categorySlug?: string) => void;
}

export function HomeHero({
  selectedCity,
  setSelectedCity,
  searchQuery,
  setSearchQuery,
  onSearchSubmit,
  onDirectSearch,
}: HomeHeroProps) {
  const { detectLocation, isDetecting, openLocationPrompt } = useLocation();
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const cityDropdownRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(e.target as Node)) {
        setIsCityDropdownOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <section className="relative min-h-[580px] lg:min-h-[640px] flex items-center overflow-hidden bg-[#FBF8F4] py-12 lg:py-16">
      
      {/* Full Right Hero Background Image with Smooth Leftward Gradient Overlay */}
      <div className="absolute top-0 right-0 bottom-0 w-full lg:w-[65%] z-0 overflow-hidden">
        <ImageWithFallback
          src="/images/indian-bride-groom-hero.jpg"
          fallbackSrc="https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1600&q=80"
          alt="Ayoj Indian Bride & Groom Celebration"
          fill
          unoptimized
          className="object-cover object-right lg:object-center"
        />
        {/* Horizontal Gradient Mask */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#FBF8F4] via-[#FBF8F4]/85 sm:via-[#FBF8F4]/60 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#FBF8F4] via-transparent to-transparent opacity-90 pointer-events-none" />
      </div>

      {/* Hero Content Overlay */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 w-full">
        <div className="max-w-2xl space-y-6">
          
          {/* Official Brand Tagline */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F3EADF] border border-[#E8E2D9] text-xs font-semibold tracking-widest text-[#9E5338] uppercase">
            <Sparkles className="size-3.5 text-[#9E5338]" />
            <span>Discover · Trust · Celebrate</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-normal text-[#221F1C] leading-[1.12] tracking-tight">
            Find the people <br />
            behind your <br />
            <span className="text-[#9E5338] italic">best moments.</span>
          </h1>

          {/* Subheading with Motion Primitives TextLoop */}
          <div className="text-sm sm:text-base text-[#6B6560] max-w-xl font-normal leading-relaxed flex items-center flex-wrap gap-x-1.5 gap-y-1">
            <span>Discover &amp; book trusted</span>
            <TextLoop 
              className="font-semibold text-[#9E5338] bg-[#F3EADF] px-2.5 py-0.5 rounded-lg border border-[#E8E2D9] shadow-2xs"
              interval={2.8}
            >
              <span>Candid Photographers</span>
              <span>Bridal Makeup Artists</span>
              <span>Luxury Stage Decorators</span>
              <span>Royal Event Planners</span>
              <span>Sangeet DJs &amp; Beats</span>
              <span>Heritage Banquet Venues</span>
            </TextLoop>
            <span>— all in one place.</span>
          </div>

          {/* Main Search Pill Capsule */}
          <div className="relative max-w-xl pt-2" ref={searchContainerRef}>
            <form onSubmit={onSearchSubmit}>
              <div className="bg-white border border-[#E8E2D9] rounded-2xl sm:rounded-full p-2 shadow-lg shadow-black/5 flex flex-col sm:flex-row items-center gap-2">
                
                {/* Location Selector Inside Search */}
                <div className="relative w-full sm:w-auto" ref={cityDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
                    aria-haspopup="listbox"
                    aria-expanded={isCityDropdownOpen}
                    aria-label="Select city"
                    className="flex items-center gap-1.5 px-4 py-2 min-h-[44px] sm:min-h-0 text-xs font-normal text-[#221F1C] border-b sm:border-b-0 sm:border-r border-[#E8E2D9] w-full sm:w-auto shrink-0 cursor-pointer hover:text-[#9E5338] transition-colors"
                  >
                    <MapPin className="size-3.5 text-[#9E5338]" />
                    <span>{selectedCity}</span>
                    <ChevronDown className="size-3 text-[#6B6560] ml-1" />
                  </button>

                  {isCityDropdownOpen && (
                    <div className="absolute left-0 mt-2 w-52 rounded-2xl bg-white border border-[#E8E2D9] shadow-xl py-1.5 z-50 overflow-hidden">
                      <button
                        type="button"
                        disabled={isDetecting}
                        onClick={async () => {
                          setIsCityDropdownOpen(false);
                          await detectLocation();
                        }}
                        className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-[#9E5338] hover:bg-[#F3EADF] border-b border-[#E8E2D9] cursor-pointer transition-colors"
                      >
                        {isDetecting ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <Navigation className="size-3.5" />
                        )}
                        <span>{isDetecting ? 'Detecting Hub...' : 'Detect My Location'}</span>
                      </button>

                      <div className="px-3.5 pt-2 pb-1 text-[10px] font-bold text-[#6B6560] uppercase tracking-wider">
                        Select City
                      </div>
                      {['All Cities', ...CITIES].map((city) => {
                        const isSelected = selectedCity === city;
                        return (
                          <button
                            key={city}
                            type="button"
                            onClick={() => {
                              setSelectedCity(city);
                              setIsCityDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3.5 py-1.5 text-xs text-left cursor-pointer transition-colors ${
                              isSelected
                                ? 'bg-[#F3EADF] text-[#9E5338] font-semibold'
                                : 'text-[#221F1C] hover:bg-[#FAF7F2]'
                            }`}
                          >
                            <span>{city}</span>
                            {isSelected && <Check className="size-3 text-[#9E5338]" />}
                          </button>
                        );
                      })}

                      <div className="pt-1 mt-1 border-t border-[#E8E2D9]/80">
                        <button
                          type="button"
                          onClick={() => {
                            setIsCityDropdownOpen(false);
                            openLocationPrompt();
                          }}
                          className="w-full px-3.5 py-1.5 text-[11px] font-medium text-[#6B6560] hover:text-[#9E5338] hover:bg-[#FAF7F2] text-left cursor-pointer transition-colors"
                        >
                          Change celebration hub...
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input Search with Clear Button & Accessibility Labels */}
                <div className="flex items-center gap-2 px-3 py-1.5 flex-1 w-full min-h-[44px] sm:min-h-0">
                  <label htmlFor="celebration-search" className="sr-only">
                    Search celebration services or vendors
                  </label>
                  <Search className="size-4 text-[#6B6560] shrink-0" />
                  <input
                    id="celebration-search"
                    type="text"
                    value={searchQuery}
                    onFocus={() => setIsSearchFocused(true)}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') setIsSearchFocused(false);
                    }}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="What do you need? (e.g. Photographer, Makeup...)"
                    aria-label="Search celebration services or vendors"
                    className="w-full bg-transparent text-xs text-[#221F1C] placeholder:text-[#6B6560] focus:outline-none"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="p-1 text-[#6B6560] hover:text-[#221F1C] cursor-pointer"
                      aria-label="Clear search text"
                    >
                      <X className="size-3.5" />
                    </button>
                  )}
                </div>

                {/* Solid Terracotta Search Pill Button with Motion Primitives Magnetic */}
                <Magnetic intensity={0.25} range={75} className="w-full sm:w-auto">
                  <Button 
                    type="submit"
                    className="w-full sm:w-auto bg-[#9E5338] hover:bg-[#86442B] active:scale-95 text-white rounded-full text-xs font-medium px-7 h-10 min-h-[44px] sm:min-h-[40px] transition-all shrink-0 cursor-pointer shadow-md shadow-[#9E5338]/20"
                  >
                    Search
                  </Button>
                </Magnetic>

              </div>
            </form>

            {/* Instant Search Suggestions Popover */}
            {isSearchFocused && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-[#E8E2D9] rounded-2xl shadow-xl p-3 z-50 animate-in fade-in-0 zoom-in-95 duration-150">
                <div className="flex items-center justify-between px-2 pb-2 mb-1 border-b border-[#E8E2D9]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B6560] flex items-center gap-1.5">
                    <TrendingUp className="size-3 text-[#9E5338]" />
                    {searchQuery ? `Matching "${searchQuery}"` : `Popular in ${selectedCity}`}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsSearchFocused(false)}
                    className="text-[10px] text-[#6B6560] hover:text-[#221F1C] cursor-pointer"
                  >
                    Close (Esc)
                  </button>
                </div>

                <div className="space-y-1">
                  {(searchQuery 
                    ? TRENDING_SEARCHES.filter(t => 
                        t.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        t.category.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                    : TRENDING_SEARCHES
                  ).slice(0, 5).map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => {
                          setIsSearchFocused(false);
                          onDirectSearch(item.label, item.category);
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs hover:bg-[#F3EADF]/60 text-[#221F1C] transition-colors group cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="size-7 rounded-full bg-[#FAF7F2] border border-[#E8E2D9] flex items-center justify-center text-[#9E5338] group-hover:bg-white transition-colors">
                            <Icon className="size-3.5" />
                          </div>
                          <span className="font-medium text-xs text-[#221F1C]">{item.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FAF7F2] text-[#6B6560] border border-[#E8E2D9]">
                            {item.tag}
                          </span>
                          <ArrowRight className="size-3 text-[#6B6560] opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </button>
                    );
                  })}

                  {searchQuery && (
                    <button
                      type="button"
                      onClick={(e) => {
                        setIsSearchFocused(false);
                        onSearchSubmit(e);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 mt-1 pt-2 border-t border-[#E8E2D9] rounded-xl text-left text-xs font-semibold text-[#9E5338] hover:bg-[#F3EADF]/40 cursor-pointer"
                    >
                      <span>Search all results for &ldquo;{searchQuery}&rdquo;</span>
                      <ArrowRight className="size-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* 1-Tap Quick Trending Search Pills */}
            <div className="flex flex-wrap items-center gap-1.5 pt-3">
              <span className="text-[11px] font-bold text-[#6B6560] uppercase tracking-wider flex items-center gap-1 shrink-0">
                <TrendingUp className="size-3 text-[#9E5338]" /> Popular:
              </span>
              {POPULAR_SEARCH_PILLS.map((pill) => (
                <button
                  key={pill.label}
                  type="button"
                  onClick={() => onDirectSearch('', pill.slug)}
                  className="px-2.5 py-0.5 rounded-full bg-white/85 hover:bg-white text-[#221F1C] hover:text-[#9E5338] border border-[#E8E2D9] hover:border-[#9E5338]/40 transition-all text-[11px] font-medium shadow-2xs cursor-pointer"
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          {/* Floating Social Proof Pill Badge */}
          <div className="pt-4 flex items-center">
            <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3 sm:p-4 shadow-xl border border-[#E8E2D9] flex items-center gap-3.5">
              <div className="flex -space-x-2 overflow-hidden">
                <div className="inline-block size-8 rounded-full ring-2 ring-white overflow-hidden relative">
                  <ImageWithFallback src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" alt="User 1" fill unoptimized className="object-cover" />
                </div>
                <div className="inline-block size-8 rounded-full ring-2 ring-white overflow-hidden relative">
                  <ImageWithFallback src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" alt="User 2" fill unoptimized className="object-cover" />
                </div>
                <div className="inline-block size-8 rounded-full ring-2 ring-white overflow-hidden relative">
                  <ImageWithFallback src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80" alt="User 3" fill unoptimized className="object-cover" />
                </div>
              </div>

              <div className="text-left">
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="text-xs font-bold text-[#9E5338] bg-[#F3EADF] px-2 py-0.5 rounded-full border border-[#E8E2D9]">
                    Curated &amp; Verified
                  </span>
                </div>
                <div className="text-[11px] text-[#6B6560] leading-tight mt-1">
                  Authentic portfolios &amp; direct <br /> creative partner booking
                </div>
              </div>

              <div className="size-7 rounded-full bg-[#F3EADF] flex items-center justify-center text-[#221F1C] ml-1">
                <ChevronRight className="size-4" />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
