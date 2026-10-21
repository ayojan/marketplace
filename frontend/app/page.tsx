'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { apiService } from '@/lib/api';
import { 
  Camera, 
  ArrowRight, 
  Search, 
  MapPin, 
  ChevronDown, 
  ChevronRight, 
  ChevronLeft,
  Sparkles,
  Utensils,
  Music,
  Grid,
  Flower2,
  Brush,
  Building2,
  Check,
  X,
  TrendingUp,
  Clock,
  ShieldCheck,
  Lock,
  BadgeCheck,
  IndianRupee,
  CalendarCheck,
  MessageSquare,
  Star,
  Heart,
  Store,
  CheckCircle2,
  Instagram,
  Linkedin,
  Facebook,
  Twitter,
  Youtube,
  Navigation,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import Link from 'next/link';
import Header, { CITIES } from '@/components/Header';
import PhotographerCard from '@/components/PhotographerCard';
import AyojLogo from '@/components/AyojLogo';
import { useLocation } from '@/lib/contexts/LocationContext';
import Footer from '@/components/Footer';
import RecentlyViewedStrip from '@/components/RecentlyViewedStrip';
import CelebrationMatchmaker from '@/components/CelebrationMatchmaker';
import { TextLoop, Magnetic, InView } from '@/components/motion';

const TRENDING_SEARCHES = [
  { label: 'Candid Wedding Photographers', category: 'photographer', icon: Camera, tag: 'High Demand' },
  { label: 'Bridal Makeup & Hair Artists', category: 'makeup-artist', icon: Brush, tag: 'Trending' },
  { label: 'Luxury Floral & Stage Decor', category: 'decorator', icon: Flower2, tag: 'Popular' },
  { label: 'Destination Farmhouses & Venues', category: 'venue', icon: Building2, tag: 'Top Rated' },
  { label: 'Sangeet DJs & Sound Setup', category: 'dj', icon: Music, tag: 'Party' },
  { label: 'Full Event Planners & Management', category: 'event-planner', icon: Sparkles, tag: 'Full Service' },
];

const POPULAR_SEARCH_PILLS = [
  { label: 'Photographers', slug: 'photographer' },
  { label: 'Bridal Makeup', slug: 'makeup-artist' },
  { label: 'Wedding Decor', slug: 'decorator' },
  { label: 'Banquet Venues', slug: 'venue' },
  { label: 'Sangeet DJs', slug: 'dj' },
];

export default function Landing() {
  const router = useRouter();
  const { 
    selectedCity, 
    setSelectedCity, 
    openLocationPrompt, 
    detectLocation, 
    isDetecting 
  } = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const cityDropdownRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const occasionsScrollRef = useRef<HTMLDivElement>(null);

  const scrollOccasions = (direction: 'left' | 'right') => {
    if (occasionsScrollRef.current) {
      const offset = direction === 'left' ? -260 : 260;
      occasionsScrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

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

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim();
    const params = new URLSearchParams();
    if (query) params.set('search', query);
    if (selectedCity && selectedCity !== 'All Cities') params.set('location', selectedCity);
    const qs = params.toString();
    setIsSearchFocused(false);
    router.push(qs ? `/marketplace?${qs}` : '/marketplace');
  };

  const handleDirectSearch = (query?: string, categorySlug?: string) => {
    const params = new URLSearchParams();
    if (query) params.set('search', query);
    if (categorySlug && categorySlug !== 'all') params.set('category', categorySlug);
    if (selectedCity && selectedCity !== 'All Cities') params.set('location', selectedCity);
    const qs = params.toString();
    setIsSearchFocused(false);
    router.push(qs ? `/marketplace?${qs}` : '/marketplace');
  };

  // Categories with circular icon representation matching screenshot
  const categoryIcons = [
    { name: 'Photographers', icon: Camera, slug: 'photographer' },
    { name: 'Makeup Artists', icon: Brush, slug: 'makeup-artist' },
    { name: 'Decorators', icon: Flower2, slug: 'decorator' },
    { name: 'Event Planners', icon: Sparkles, slug: 'event-planner' },
    { name: 'Caterers', icon: Utensils, slug: 'caterer' },
    { name: 'DJs & Entertainment', icon: Music, slug: 'dj' },
    { name: 'Venues', icon: Building2, slug: 'venue' },
    { name: 'More', icon: Grid, slug: 'all' },
  ];

  // Popular occasions
  const occasions = [
    {
      name: 'Wedding',
      image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: 'Pre-Wedding',
      image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: 'Engagement',
      image: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: 'Birthday',
      image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: 'Corporate Events',
      image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: 'Baby Shower',
      image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: 'Anniversary',
      image: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=600&q=80',
    },
  ];

  const VENDOR_FILTER_TABS = [
    { id: 'all', label: 'All Verified Pros' },
    { id: 'photographer', label: 'Photographers' },
    { id: 'makeup-artist', label: 'Makeup Artists' },
    { id: 'decorator', label: 'Decorators' },
    { id: 'dj', label: 'DJs & Music' },
    { id: 'venue', label: 'Venues' }
  ];

  const [topVendors, setTopVendors] = useState<any[]>([]);
  const [loadingVendors, setLoadingVendors] = useState<boolean>(true);
  const [activeVendorTab, setActiveVendorTab] = useState<string>('all');

  useEffect(() => {
    const fetchTopVendors = async () => {
      try {
        setLoadingVendors(true);
        const res = await apiService.vendors.getAll();
        const rawData = res.data?.vendors || (Array.isArray(res.data) ? res.data : []);
        setTopVendors(Array.isArray(rawData) ? rawData : []);
      } catch (err) {
        setTopVendors([]);
      } finally {
        setLoadingVendors(false);
      }
    };
    fetchTopVendors();

    // Scroll to anchor on load if hash is present (e.g. /#reviews or /#occasions)
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash.substring(1);
      setTimeout(() => {
        const el = document.getElementById(hash);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 150);
    }
  }, []);

  const getTabCount = (tabId: string) => {
    const list = Array.isArray(topVendors) ? topVendors : [];
    if (tabId === 'all') return list.length;
    return list.filter((v: any) => {
      const cat = (v.category || v.service_category || '').toLowerCase();
      const name = (v.name || v.business_name || '').toLowerCase();
      if (tabId === 'photographer') return cat.includes('photo') || name.includes('narrative') || name.includes('photo') || name.includes('shutter');
      if (tabId === 'makeup-artist') return cat.includes('makeup') || name.includes('makeover') || name.includes('glam') || name.includes('glow');
      if (tabId === 'decorator') return cat.includes('decor') || name.includes('eventica') || name.includes('floral');
      if (tabId === 'dj') return cat.includes('dj') || cat.includes('music') || name.includes('beat') || name.includes('aryan');
      if (tabId === 'venue') return cat.includes('venue') || name.includes('palm') || name.includes('haveli') || name.includes('heritage');
      return true;
    }).length;
  };

  return (
    <div className="min-h-screen bg-[#FBF8F4] text-[#221F1C] selection:bg-[#F3EADF] selection:text-[#9E5338]">
      {/* Accessible Skip Link for Keyboard Navigators */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-[100] px-4 py-2 bg-[#9E5338] text-white rounded-xl shadow-lg font-medium text-xs focus:outline-none focus:ring-2 focus:ring-[#9E5338] focus:ring-offset-2"
      >
        Skip to main content
      </a>

      <Header />

      <main id="main-content">

      {/* Hero Section - Image Gradients into Text and Search Bar */}
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
          {/* Horizontal Gradient Mask: Image seamlessly bleeds into text and search bar */}
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
              <form onSubmit={handleSearchSubmit}>
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
                      className="text-[10px] text-[#6B6560] hover:text-[#221F1C]"
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
                          onClick={() => handleDirectSearch(item.label, item.category)}
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
                        onClick={handleSearchSubmit}
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
                    onClick={() => handleDirectSearch('', pill.slug)}
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

      {/* Circular Icon Categories Bar with Motion Primitives InView & Magnetic */}
      <InView as="section" className="py-8 bg-[#FBF8F4] border-b border-[#E8E2D9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-4 text-center">
            {categoryIcons.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.name}
                  onClick={() => router.push(`/marketplace?category=${encodeURIComponent(cat.slug || cat.name)}`)}
                  className="flex flex-col items-center gap-2 group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9E5338] rounded-2xl p-1 active:scale-95 transition-transform"
                  aria-label={`Browse ${cat.name}`}
                >
                  <Magnetic intensity={0.3} range={60}>
                    <div className="size-14 rounded-full bg-[#F3EADF] border border-[#E8E2D9] flex items-center justify-center text-[#221F1C] group-hover:bg-[#9E5338] group-hover:text-white group-hover:border-[#9E5338] group-hover:scale-105 group-hover:shadow-md transition-all duration-200 shadow-xs">
                      <Icon className="size-5 transition-transform duration-200 group-hover:scale-110" />
                    </div>
                  </Magnetic>
                  <span className="text-xs font-medium text-[#221F1C] group-hover:text-[#9E5338] transition-colors leading-tight max-w-[85px]">
                    {cat.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </InView>

      {/* Popular Occasions Section - Placed right after categories for natural browsing */}
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
            {occasions.map((occ) => (
              <div
                key={occ.name}
                onClick={() => router.push(`/marketplace?occasion=${encodeURIComponent(occ.name.toLowerCase().replace(/\s+/g, '-'))}`)}
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

      {/* Pick Up Where You Left Off Strip (Self-hides if no history) */}
      <RecentlyViewedStrip />

      {/* Top rated vendors in Selected City Section - Immediate inventory proof */}
      <section className="py-14 px-4 sm:px-6 bg-[#FBF8F4]">
        <InView className="max-w-7xl mx-auto space-y-6 relative">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E2D9] pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#F3EADF] text-[#9E5338] text-[10px] font-bold uppercase tracking-wider mb-1.5">
                <Star className="size-3 fill-[#9E5338]" />
                Featured Talent in {selectedCity}
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-normal text-[#221F1C]">
                Top rated vendors in {selectedCity}
              </h2>
              <p className="text-xs text-[#6B6560] mt-0.5">
                Handpicked, verified celebration artists with stellar customer reviews and transparent packages.
              </p>
            </div>
            <Link 
              href={`/marketplace?location=${encodeURIComponent(selectedCity)}`} 
              className="text-xs font-semibold text-[#9E5338] hover:underline flex items-center gap-1 self-start sm:self-auto shrink-0"
            >
              View all in {selectedCity} <ArrowRight className="size-3.5" />
            </Link>
          </div>

          {/* Category Filter Pills Bar */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {VENDOR_FILTER_TABS.map((tab) => {
              const isActive = activeVendorTab === tab.id;
              const count = getTabCount(tab.id);
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveVendorTab(tab.id)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                    isActive
                      ? 'bg-[#9E5338] text-white shadow-xs'
                      : 'bg-white border border-[#E8E2D9] text-[#6B6560] hover:text-[#221F1C] hover:bg-[#FAF7F2]'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-white/25 text-white' : 'bg-[#FAF7F2] text-[#6B6560]'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Vendors Grid */}
          {loadingVendors ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-2xl border border-[#E8E2D9] bg-white p-4 animate-pulse space-y-3">
                  <div className="h-48 bg-[#F3EADF]/60 rounded-xl" />
                  <div className="h-4 bg-[#F3EADF]/60 rounded w-3/4" />
                  <div className="h-3 bg-[#F3EADF]/40 rounded w-1/2" />
                  <div className="h-4 bg-[#F3EADF]/50 rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : (() => {
            const list = Array.isArray(topVendors) ? topVendors : [];
            const filtered = list.filter((v: any) => {
              if (activeVendorTab === 'all') return true;
              const cat = (v.category || v.service_category || '').toLowerCase();
              const name = (v.name || v.business_name || '').toLowerCase();
              if (activeVendorTab === 'photographer') return cat.includes('photo') || name.includes('narrative') || name.includes('photo') || name.includes('shutter');
              if (activeVendorTab === 'makeup-artist') return cat.includes('makeup') || name.includes('makeover') || name.includes('glam') || name.includes('glow');
              if (activeVendorTab === 'decorator') return cat.includes('decor') || name.includes('decor') || name.includes('eventica') || name.includes('floral');
              if (activeVendorTab === 'dj') return cat.includes('dj') || cat.includes('music') || name.includes('beat') || name.includes('aryan');
              if (activeVendorTab === 'venue') return cat.includes('venue') || name.includes('palm') || name.includes('haveli') || name.includes('heritage');
              return true;
            });

            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative">
                {filtered.slice(0, 8).map((vendor) => (
                  <PhotographerCard key={vendor.id} photographer={vendor} />
                ))}

                {filtered.length === 0 && (
                  <div className="col-span-full py-12 px-4 text-center border border-dashed border-[#E8E2D9] rounded-2xl bg-white space-y-3">
                    <div className="size-12 rounded-full bg-[#FAF7F2] border border-[#E8E2D9] flex items-center justify-center mx-auto text-[#9E5338]">
                      <Search className="size-5" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-[#221F1C]">No vendors found in this category</p>
                      <p className="text-xs text-[#6B6560] max-w-sm mx-auto">
                        We are actively onboarding verified celebration artists in {selectedCity}. View all pros or explore the catalog.
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setActiveVendorTab('all')}
                        className="px-4 py-1.5 rounded-full bg-[#F3EADF] text-[#9E5338] text-xs font-semibold hover:bg-[#E8DACB] transition-colors cursor-pointer"
                      >
                        Show All Verified Pros
                      </button>
                      <Link 
                        href="/marketplace" 
                        className="px-4 py-1.5 rounded-full bg-white border border-[#E8E2D9] text-[#221F1C] text-xs font-medium hover:border-[#9E5338] transition-colors"
                      >
                        Browse Full Catalog
                      </Link>
                    </div>
                  </div>
                )}

                {/* Explore more button if extra vendors available */}
                {filtered.length > 8 && (
                  <div className="col-span-full pt-4 text-center">
                    <Link
                      href={`/marketplace?category=${activeVendorTab}${selectedCity !== 'All Cities' ? `&location=${encodeURIComponent(selectedCity)}` : ''}`}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white border border-[#E8E2D9] text-xs font-semibold text-[#9E5338] hover:bg-[#F3EADF] hover:border-[#9E5338]/40 transition-all shadow-xs cursor-pointer"
                    >
                      <span>Explore all {filtered.length} {activeVendorTab === 'all' ? 'verified pros' : activeVendorTab} in {selectedCity}</span>
                      <ArrowRight className="size-3.5" />
                    </Link>
                  </div>
                )}
              </div>
            );
          })()}

        </InView>
      </section>

      {/* 60-Second Celebration Budget & Pro Matchmaker Wizard */}
      <CelebrationMatchmaker />

      {/* Unified "How Ayoj Works & Transparent Marketplace" Section */}
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

          {/* 4 Core Guarantees Ribbon */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-5xl mx-auto">
            <div className="p-3.5 rounded-xl bg-white border border-[#E8E2D9] shadow-2xs flex items-center gap-3">
              <div className="size-9 rounded-lg bg-[#FAF7F2] border border-[#E8E2D9] flex items-center justify-center text-[#9E5338] shrink-0">
                <IndianRupee className="size-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#221F1C]">0% Middleman Markups</p>
                <p className="text-[11px] text-[#6B6560]">Direct artist-to-host pricing</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-[#E8E2D9] shadow-2xs flex items-center gap-3">
              <div className="size-9 rounded-lg bg-[#FAF7F2] border border-[#E8E2D9] flex items-center justify-center text-[#9E5338] shrink-0">
                <Camera className="size-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#221F1C]">100% Real Portfolios</p>
                <p className="text-[11px] text-[#6B6560]">Verified celebration photos</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-[#E8E2D9] shadow-2xs flex items-center gap-3">
              <div className="size-9 rounded-lg bg-[#FAF7F2] border border-[#E8E2D9] flex items-center justify-center text-[#9E5338] shrink-0">
                <MessageSquare className="size-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#221F1C]">Direct Host Chat</p>
                <p className="text-[11px] text-[#6B6560]">Talk directly with artists</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-[#E8E2D9] shadow-2xs flex items-center gap-3">
              <div className="size-9 rounded-lg bg-[#FAF7F2] border border-[#E8E2D9] flex items-center justify-center text-[#9E5338] shrink-0">
                <CalendarCheck className="size-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#221F1C]">Live Slot Checking</p>
                <p className="text-[11px] text-[#6B6560]">Real-time date availability</p>
              </div>
            </div>
          </div>

          {/* 3 Progressive Journey Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Desktop step connector */}
            <div className="hidden md:block absolute top-[52px] left-16 right-16 h-[1px] border-t border-dashed border-[#E8E2D9] pointer-events-none z-0" />
            
            {[
              {
                step: '01',
                badge: 'Discover & Shortlist',
                title: 'Curated Portfolios & Verified Reviews',
                desc: 'Explore authentic high-resolution galleries, equipment gear, and real celebration work directly from creative studios.',
                icon: Camera,
                features: ['Real client galleries & albums', 'Verified host reviews & ratings', 'Multi-category creative talent'],
                highlight: 'Explore authentic portfolios'
              },
              {
                step: '02',
                badge: 'Connect & Align',
                title: 'Transparent Pricing & Direct Chat',
                desc: 'View published starting rates with zero hidden markups. Chat directly with artists to customize deliverables and quotes.',
                icon: IndianRupee,
                features: ['Published upfront package rates', 'Direct artist-to-host chat', 'Customizable celebration quotes'],
                highlight: 'Direct host-to-artist messaging'
              },
              {
                step: '03',
                badge: 'Reserve & Celebrate',
                title: 'Live Slot Availability & Dashboard Booking',
                desc: 'Check open dates on vendor profiles. Submit your date reservation request and manage celebration status directly.',
                icon: CalendarCheck,
                features: ['Live calendar slot checking', 'Host dashboard status tracking', 'Direct date reservation coordination'],
                highlight: 'Seamless celebration coordination'
              }
            ].map((s) => {
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

      {/* Real Celebrations, Real Stories Testimonial Section */}
      <section id="reviews" className="scroll-mt-20 py-16 px-4 sm:px-6 bg-[#FAF7F2] border-t border-[#E8E2D9]">
        <InView className="max-w-7xl mx-auto space-y-10">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E8E2D9] pb-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#F3EADF] text-[#9E5338] text-[10px] font-bold uppercase tracking-wider border border-[#E8E2D9]">
                <Heart className="size-3 fill-[#9E5338]" />
                Host Stories & Verified Reviews
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
            {[
              {
                id: 't1',
                couple: 'Aanya & Rohan Kapoor',
                occasion: 'Grand Wedding in Jaipur',
                image: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=600&q=80',
                quote: 'Finding our wedding photographer on Ayoj was effortless. We could browse their full portfolio, check open dates directly, and coordinate every detail in one place.',
                vendor: 'The Wedding Narratives',
                category: 'Wedding Photography'
              },
              {
                id: 't2',
                couple: 'Pooja & Sameer Verma',
                occasion: 'Bridal Makeover & Sangeet',
                image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=600&q=80',
                quote: 'Meera did my bridal makeover and she was absolutely magical. Seeing transparent packages and reading genuine host reviews gave me full confidence for my big day.',
                vendor: 'Meera Makeovers',
                category: 'Bridal Makeup'
              },
              {
                id: 't3',
                couple: 'Vikram & Sneha Singhal',
                occasion: '25th Anniversary Celebration',
                image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=600&q=80',
                quote: 'Eventica Decor turned our banquet into a floral paradise. The quote was completely transparent from day one — zero hidden markups. Highly recommended!',
                vendor: 'Eventica Decor',
                category: 'Stage & Floral Decor'
              }
            ].map((story) => (
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

      {/* Grow Your Business On Ayoj - Compact Vendor Partner Banner */}
      <section className="py-10 px-4 sm:px-6 bg-[#FBF8F4] border-t border-[#E8E2D9]">
        <InView className="max-w-7xl mx-auto">
          <div className="bg-white border border-[#E8E2D9] rounded-2xl p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              
              <div className="space-y-3 max-w-2xl">
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#F3EADF] text-[#9E5338] text-[10px] font-bold uppercase tracking-wider">
                  <Store className="size-3.5" />
                  For Event Pros & Creative Studios
                </div>

                <h2 className="text-xl sm:text-2xl font-serif font-normal text-[#221F1C]">
                  Grow your celebration business with India&apos;s trusted event marketplace.
                </h2>

                <p className="text-xs sm:text-sm text-[#6B6560] leading-relaxed">
                  Join event photographers, makeup artists, decorators, and venues. Receive direct client inquiries, manage your booking calendar, and list your creative services with zero upfront fees.
                </p>

                {/* 4 Compact Benefits Badges */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {[
                    '0% Upfront Listing Fee',
                    'Direct Host Inquiries',
                    'Calendar Slot Management',
                    'Showcase Creative Portfolios'
                  ].map((benefit) => (
                    <span 
                      key={benefit}
                      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FAF7F2] text-[#221F1C] text-[11px] font-medium border border-[#E8E2D9]"
                    >
                      <CheckCircle2 className="size-3 text-[#9E5338]" />
                      {benefit}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row lg:flex-col items-stretch lg:items-end gap-2.5 shrink-0">
                <Link href="/register?role=vendor">
                  <Button 
                    className="w-full sm:w-auto bg-[#9E5338] hover:bg-[#86442B] active:scale-95 text-white font-semibold text-xs px-6 h-10 min-h-[44px] sm:min-h-[40px] rounded-full shadow-xs cursor-pointer transition-all gap-2"
                  >
                    List Your Business on Ayoj
                    <ArrowRight className="size-3.5" />
                  </Button>
                </Link>

                <Link href="/login" className="text-center lg:text-right">
                  <span className="text-xs text-[#6B6560] hover:text-[#9E5338] font-medium transition-colors">
                    Already a partner? Sign In
                  </span>
                </Link>
              </div>

            </div>
          </div>
        </InView>
      </section>
      </main>

      {/* Modern Marketplace Footer */}
      <Footer />
    </div>
  );
}
