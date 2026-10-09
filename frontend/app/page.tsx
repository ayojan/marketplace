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
  Sparkles,
  Utensils,
  Music,
  Grid,
  Flower2,
  Brush,
  Building2,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import Link from 'next/link';
import Header, { CITIES } from '@/components/Header';
import PhotographerCard from '@/components/PhotographerCard';
import AyojLogo from '@/components/AyojLogo';

export default function Landing() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('Delhi NCR');
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const cityDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(e.target as Node)) {
        setIsCityDropdownOpen(false);
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

  const DEFAULT_TOP_VENDORS = [
    {
      id: '1',
      name: 'The Wedding Narratives',
      business_name: 'The Wedding Narratives',
      location: 'Delhi NCR',
      rating: 4.9,
      total_reviews: 320,
      base_price: 50000,
      image: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: '2',
      name: 'Meera Makeovers',
      business_name: 'Meera Makeovers',
      location: 'Gurgaon',
      rating: 4.8,
      total_reviews: 214,
      base_price: 15000,
      image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: '3',
      name: 'Eventica Decor',
      business_name: 'Eventica Decor',
      location: 'Delhi NCR',
      rating: 4.9,
      total_reviews: 189,
      base_price: 100000,
      image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: '4',
      name: 'Beats & Beyond',
      business_name: 'Beats & Beyond',
      location: 'Noida',
      rating: 4.7,
      total_reviews: 96,
      base_price: 25000,
      image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: '5',
      name: 'The Palm Venue',
      business_name: 'The Palm Venue',
      location: 'Delhi NCR',
      rating: 4.8,
      total_reviews: 276,
      base_price: 250000,
      image: 'https://images.unsplash.com/photo-1545232979-fbfd430a996c?auto=format&fit=crop&w=800&q=80'
    }
  ];

  const [topVendors, setTopVendors] = useState<any[]>(DEFAULT_TOP_VENDORS);

  useEffect(() => {
    const fetchTopVendors = async () => {
      try {
        const res = await apiService.vendors.getAll();
        const rawData = res.data?.vendors || (Array.isArray(res.data) ? res.data : null);
        if (Array.isArray(rawData) && rawData.length > 0) {
          setTopVendors(rawData);
        }
      } catch (err) {
        // Keep DEFAULT_TOP_VENDORS on error/offline
      }
    };
    fetchTopVendors();
  }, []);

  return (
    <div className="min-h-screen bg-[#FBF8F4] text-[#221F1C] selection:bg-[#F3EADF] selection:text-[#9E5338]">
      <Header />

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
              best moments.
            </h1>

            {/* Subheading */}
            <p className="text-sm sm:text-base text-[#6B6560] max-w-lg font-normal leading-relaxed">
              Discover and book trusted photographers, makeup artists, decorators, planners and more — all in one place.
            </p>

            {/* Main Search Pill Capsule */}
            <form onSubmit={handleSearchSubmit} className="pt-2">
              <div className="bg-white border border-[#E8E2D9] rounded-full p-2 shadow-lg shadow-black/5 flex flex-col sm:flex-row items-center gap-2 max-w-xl">
                
                {/* Location Selector Inside Search */}
                <div className="relative w-full sm:w-auto" ref={cityDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-normal text-[#221F1C] border-b sm:border-b-0 sm:border-r border-[#E8E2D9] w-full sm:w-auto shrink-0 cursor-pointer hover:text-[#9E5338] transition-colors"
                  >
                    <MapPin className="size-3.5 text-[#9E5338]" />
                    <span>{selectedCity}</span>
                    <ChevronDown className="size-3 text-[#6B6560] ml-1" />
                  </button>

                  {isCityDropdownOpen && (
                    <div className="absolute left-0 mt-2 w-44 rounded-2xl bg-white border border-[#E8E2D9] shadow-xl py-1.5 z-50">
                      <div className="px-3 py-1 text-[10px] font-bold text-[#6B6560] uppercase tracking-wider">
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
                            className={`w-full flex items-center justify-between px-3 py-1.5 text-xs text-left cursor-pointer transition-colors ${
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
                    </div>
                  )}
                </div>

                {/* Input Search */}
                <div className="flex items-center gap-2 px-3 py-1.5 flex-1 w-full">
                  <Search className="size-4 text-[#6B6560] shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="What do you need? (e.g. Photographer, Makeup...)"
                    className="w-full bg-transparent text-xs text-[#221F1C] placeholder:text-[#6B6560] focus:outline-none"
                  />
                </div>

                {/* Solid Terracotta Search Pill Button */}
                <Button 
                  type="submit"
                  className="w-full sm:w-auto bg-[#9E5338] hover:bg-[#86442B] text-white rounded-full text-xs font-medium px-7 h-10 transition-colors shrink-0 cursor-pointer"
                >
                  Search
                </Button>

              </div>
            </form>

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
                  <div className="text-sm font-bold text-[#221F1C] leading-none">2.5M+</div>
                  <div className="text-[11px] text-[#6B6560] leading-tight mt-0.5">real reviews from <br /> happy customers</div>
                </div>

                <div className="size-7 rounded-full bg-[#F3EADF] flex items-center justify-center text-[#221F1C] ml-1">
                  <ChevronRight className="size-4" />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Circular Icon Categories Bar */}
      <section className="py-8 bg-[#FBF8F4] border-b border-[#E8E2D9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-4 text-center">
            {categoryIcons.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.name}
                  onClick={() => router.push(`/marketplace?category=${encodeURIComponent(cat.slug || cat.name)}`)}
                  className="flex flex-col items-center gap-2 group cursor-pointer"
                >
                  <div className="size-14 rounded-full bg-[#F3EADF] border border-[#E8E2D9] flex items-center justify-center text-[#221F1C] group-hover:bg-[#9E5338] group-hover:text-white group-hover:border-[#9E5338] transition-all duration-200 shadow-sm">
                    <Icon className="size-5" />
                  </div>
                  <span className="text-xs font-medium text-[#221F1C] group-hover:text-[#9E5338] transition-colors leading-tight max-w-[85px]">
                    {cat.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Popular Occasions Section */}
      <section id="occasions" className="py-14 px-4 sm:px-6 bg-[#FBF8F4]">
        <div className="max-w-7xl mx-auto space-y-6">
          
          <div className="flex items-center justify-between border-b border-[#E8E2D9] pb-4">
            <h2 className="text-2xl sm:text-3xl font-serif font-normal text-[#221F1C]">
              Popular occasions
            </h2>
            <Link href="/marketplace" className="text-xs font-normal text-[#9E5338] hover:underline flex items-center gap-1">
              View all occasions <ArrowRight className="size-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 overflow-x-auto no-scrollbar">
            {occasions.map((occ) => (
              <div
                key={occ.name}
                onClick={() => router.push(`/marketplace?occasion=${encodeURIComponent(occ.name.toLowerCase().replace(/\s+/g, '-'))}`)}
                className="relative aspect-[3/2] sm:aspect-[4/3] rounded-2xl overflow-hidden group cursor-pointer border border-[#E8E2D9]"
              >
                <ImageWithFallback
                  src={occ.image}
                  alt={occ.name}
                  fill
                  unoptimized
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-3 left-3 text-white font-medium text-xs sm:text-sm">
                  {occ.name}
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Top rated vendors in Delhi NCR Section */}
      <section className="py-14 px-4 sm:px-6 bg-[#FBF8F4] border-t border-[#E8E2D9]">
        <div className="max-w-7xl mx-auto space-y-6 relative">
          
          <div className="flex items-center justify-between border-b border-[#E8E2D9] pb-4">
            <h2 className="text-2xl sm:text-3xl font-serif font-normal text-[#221F1C]">
              Top rated vendors in Delhi NCR
            </h2>
            <Link href="/marketplace" className="text-xs font-normal text-[#9E5338] hover:underline flex items-center gap-1">
              View all vendors <ArrowRight className="size-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 relative">
            {(Array.isArray(topVendors) ? topVendors : DEFAULT_TOP_VENDORS).map((vendor) => (
              <PhotographerCard key={vendor.id} photographer={vendor} />
            ))}

            {/* Scroll Right Arrow Button */}
            <button 
              onClick={() => router.push('/marketplace')}
              className="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 size-10 rounded-full bg-white border border-[#E8E2D9] shadow-lg items-center justify-center text-[#221F1C] hover:bg-[#9E5338] hover:text-white transition-all cursor-pointer z-20"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>

        </div>
      </section>

      {/* Footer with Official Logo & Tagline */}
      <footer className="py-12 border-t border-[#E8E2D9] bg-[#FBF8F4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col items-start gap-1">
              <AyojLogo size="sm" showTagline={true} />
              <span className="text-xs text-[#6B6560] mt-2">© 2026 Ayoj Marketplace. All rights reserved.</span>
            </div>

            <div className="flex items-center gap-6 text-xs text-[#6B6560]">
              <Link href="/marketplace" className="hover:text-[#9E5338] transition-colors">Marketplace</Link>
              <Link href="/#occasions" className="hover:text-[#9E5338] transition-colors">Occasions</Link>
              <Link href="/register?role=vendor" className="hover:text-[#9E5338] transition-colors">For Vendors</Link>
              <Link href="/login" className="hover:text-[#9E5338] transition-colors">Log in</Link>
              <Link href="/register" className="hover:text-[#9E5338] transition-colors">Sign up</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
