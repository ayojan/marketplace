'use client';

import { useState, useEffect, useMemo, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PhotographerCard from '@/components/PhotographerCard';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Camera, 
  Brush, 
  Flower2, 
  Sparkles, 
  Utensils, 
  Music, 
  Building2, 
  Grid, 
  Search, 
  SlidersHorizontal,
  X,
  RotateCcw,
  Check,
  MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiService } from '@/lib/api';
import { CITIES } from '@/components/Header';

// Unified Trade Categories matching Home Page
const TRADE_CATEGORIES = [
  { id: 'all', name: 'All Categories', slug: 'all', icon: Grid, matchKeys: [] },
  { id: 'photographer', name: 'Photographers', slug: 'photographer', icon: Camera, matchKeys: ['photo', 'photographer', 'photography'] },
  { id: 'makeup-artist', name: 'Makeup Artists', slug: 'makeup-artist', icon: Brush, matchKeys: ['makeup', 'makeover', 'beauty', 'bridal makeup'] },
  { id: 'decorator', name: 'Decorators', slug: 'decorator', icon: Flower2, matchKeys: ['decor', 'decorator', 'decoration', 'mandap', 'floral'] },
  { id: 'event-planner', name: 'Event Planners', slug: 'event-planner', icon: Sparkles, matchKeys: ['planner', 'planning', 'event planning', 'wedding planner'] },
  { id: 'caterer', name: 'Caterers', slug: 'caterer', icon: Utensils, matchKeys: ['caterer', 'catering', 'food', 'buffet'] },
  { id: 'dj', name: 'DJs & Music', slug: 'dj', icon: Music, matchKeys: ['dj', 'music', 'sound', 'entertainment', 'beats'] },
  { id: 'venue', name: 'Venues', slug: 'venue', icon: Building2, matchKeys: ['venue', 'banquet', 'resort', 'lawn', 'hall'] },
];

// Occasions / Event Types
const OCCASIONS = [
  { id: 'all', name: 'All Occasions', emoji: '✨', matchKeys: [] },
  { id: 'wedding', name: 'Weddings', emoji: '💍', matchKeys: ['wedding', 'shaadi', 'bridal', 'vivah'] },
  { id: 'pre-wedding', name: 'Pre-Wedding', emoji: '📸', matchKeys: ['pre-wedding', 'pre wedding', 'engagement', 'roka'] },
  { id: 'engagement', name: 'Engagement', emoji: '💎', matchKeys: ['engagement', 'ring ceremony', 'roka'] },
  { id: 'birthday', name: 'Birthdays', emoji: '🎂', matchKeys: ['birthday', 'celebration', 'party'] },
  { id: 'corporate', name: 'Corporate Events', emoji: '💼', matchKeys: ['corporate', 'conference', 'summit', 'office'] },
  { id: 'baby-shower', name: 'Baby Shower', emoji: '👶', matchKeys: ['baby shower', 'maternity', 'godh bharai'] },
  { id: 'anniversary', name: 'Anniversaries', emoji: '🥂', matchKeys: ['anniversary', 'silver jubilee'] },
];

const pricingTypes = [
  { id: 'all', name: 'All Pricing Models' },
  { id: 'hourly', name: 'Hourly Rate' },
  { id: 'package', name: 'Full Package' },
  { id: 'custom', name: 'Custom Quote' },
];

// Fallback high-quality curated catalog matching Home page
const FALLBACK_VENDORS = [
  {
    id: '1',
    name: 'The Wedding Narratives',
    business_name: 'The Wedding Narratives',
    location: 'Delhi NCR',
    rating: 4.9,
    total_reviews: 320,
    base_price: 50000,
    image: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80',
    trade: 'photographer',
    service_categories: ['Photography', 'Pre-Wedding', 'Wedding'],
    occasions: ['wedding', 'pre-wedding'],
    description: 'Premier wedding and candid photography studio capturing authentic celebrations.'
  },
  {
    id: '2',
    name: 'Meera Makeovers',
    business_name: 'Meera Makeovers',
    location: 'Gurgaon',
    rating: 4.8,
    total_reviews: 214,
    base_price: 15000,
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80',
    trade: 'makeup-artist',
    service_categories: ['Makeup Artist', 'Bridal Beauty'],
    occasions: ['wedding', 'pre-wedding', 'birthday'],
    description: 'Certified bridal makeup artist specializing in HD, Airbrush, and cocktail party makeovers.'
  },
  {
    id: '3',
    name: 'Eventica Decor',
    business_name: 'Eventica Decor',
    location: 'Delhi NCR',
    rating: 4.9,
    total_reviews: 189,
    base_price: 100000,
    image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=800&q=80',
    trade: 'decorator',
    service_categories: ['Decorator', 'Event Staging', 'Floral Styling'],
    occasions: ['wedding', 'birthday', 'corporate'],
    description: 'Grand floral mandap designs, royal reception stages, and ambient wedding themes.'
  },
  {
    id: '4',
    name: 'Beats & Beyond',
    business_name: 'Beats & Beyond',
    location: 'Noida',
    rating: 4.7,
    total_reviews: 96,
    base_price: 25000,
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80',
    trade: 'dj',
    service_categories: ['DJs & Entertainment', 'Sangeet Production'],
    occasions: ['wedding', 'birthday', 'corporate'],
    description: 'High-energy DJ sound setups, intelligent lighting, and Bollywood sangeet entertainment.'
  },
  {
    id: '5',
    name: 'The Palm Venue',
    business_name: 'The Palm Venue',
    location: 'Delhi NCR',
    rating: 4.8,
    total_reviews: 276,
    base_price: 250000,
    image: 'https://images.unsplash.com/photo-1545232979-fbfd430a996c?auto=format&fit=crop&w=800&q=80',
    trade: 'venue',
    service_categories: ['Venues', 'Banquet Halls', 'Lawn'],
    occasions: ['wedding', 'corporate', 'birthday'],
    description: 'Sprawling banquet lawns and luxury air-conditioned indoor banquet halls.'
  },
  {
    id: '6',
    name: 'Bombay Shutterbugs',
    business_name: 'Bombay Shutterbugs',
    location: 'Mumbai',
    rating: 4.9,
    total_reviews: 142,
    base_price: 65000,
    image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80',
    trade: 'photographer',
    service_categories: ['Photography', 'Candid Wedding'],
    occasions: ['wedding', 'engagement', 'pre-wedding'],
    description: 'Bespoke destination wedding photography capturing timeless moments across Mumbai & Goa.'
  },
  {
    id: '7',
    name: 'Bengaluru Flora & Lights',
    business_name: 'Bengaluru Flora & Lights',
    location: 'Bengaluru',
    rating: 4.8,
    total_reviews: 118,
    base_price: 80000,
    image: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=800&q=80',
    trade: 'decorator',
    service_categories: ['Decorator', 'Floral Design'],
    occasions: ['wedding', 'corporate', 'birthday'],
    description: 'Eco-luxe wedding backdrops and contemporary floral setups in Bengaluru.'
  }
];

function MarketplaceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Parse initial state from URL query parameters
  const initialCategoryParam = searchParams.get('category') || searchParams.get('trade') || 'all';
  const initialOccasionParam = searchParams.get('occasion') || 'all';
  const initialSearchParam = searchParams.get('search') || searchParams.get('q') || '';

  // Resolve matching category ID
  const matchedCategoryId = useMemo(() => {
    const normalized = initialCategoryParam.toLowerCase().trim();
    const found = TRADE_CATEGORIES.find(
      c => c.id === normalized || c.slug === normalized || c.name.toLowerCase() === normalized
    );
    return found ? found.id : 'all';
  }, [initialCategoryParam]);

  // Resolve matching occasion ID
  const matchedOccasionId = useMemo(() => {
    const normalized = initialOccasionParam.toLowerCase().trim();
    const found = OCCASIONS.find(
      o => o.id === normalized || o.name.toLowerCase() === normalized
    );
    return found ? found.id : 'all';
  }, [initialOccasionParam]);

  const initialLocationParam = searchParams.get('location') || 'all';

  const [selectedCategory, setSelectedCategory] = useState<string>(matchedCategoryId);
  const [selectedOccasion, setSelectedOccasion] = useState<string>(matchedOccasionId);
  const [selectedLocation, setSelectedLocation] = useState<string>(initialLocationParam);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearchParam);
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [selectedPricingType, setSelectedPricingType] = useState<string>('all');
  
  const [apiVendors, setApiVendors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);
  const [showDesktopFilters, setShowDesktopFilters] = useState<boolean>(true);

  // Sync state if URL query params change
  useEffect(() => {
    if (matchedCategoryId !== 'all' && matchedCategoryId !== selectedCategory) {
      setSelectedCategory(matchedCategoryId);
    }
  }, [matchedCategoryId, selectedCategory]);

  useEffect(() => {
    if (matchedOccasionId !== 'all' && matchedOccasionId !== selectedOccasion) {
      setSelectedOccasion(matchedOccasionId);
    }
  }, [matchedOccasionId, selectedOccasion]);

  const locationParam = searchParams.get('location') || 'all';
  useEffect(() => {
    if (locationParam !== selectedLocation) {
      setSelectedLocation(locationParam);
    }
  }, [locationParam, selectedLocation]);

  useEffect(() => {
    if (initialSearchParam && initialSearchParam !== searchQuery) {
      setSearchQuery(initialSearchParam);
    }
  }, [initialSearchParam, searchQuery]);

  // Fetch from backend
  useEffect(() => {
    let isMounted = true;
    const fetchVendors = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const params: any = {};
        if (searchQuery) params.q = searchQuery;
        if (minPrice) params.min_price = minPrice;
        if (maxPrice) params.max_price = maxPrice;
        if (selectedPricingType !== 'all') params.pricing_type = selectedPricingType;

        const response = await apiService.services.search(params);
        const data = response.data?.services || [];

        // Aggregate services by vendor
        const uniqueVendors = Array.from(new Set(data.map((s: any) => s.vendor?.id))).filter(Boolean).map(id => {
          const service = data.find((s: any) => s.vendor?.id === id);
          return {
            ...service.vendor,
            base_price: service.base_price,
            service_categories: [service.category?.name].filter(Boolean),
            occasions: service.occasions || []
          };
        });

        if (isMounted) {
          setApiVendors(uniqueVendors);
        }
      } catch (err: any) {
        // Keep fallback gracefully
        if (isMounted) {
          setApiVendors([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    const timer = setTimeout(fetchVendors, 250);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [searchQuery, minPrice, maxPrice, selectedPricingType]);

  // Master vendor list: combines API results with fallback catalog
  const allVendors = useMemo(() => {
    if (apiVendors.length > 0) return apiVendors;
    return FALLBACK_VENDORS;
  }, [apiVendors]);

  // Filter vendors based on Category, Occasion, Price, and Search
  const filteredVendors = useMemo(() => {
    return allVendors.filter(vendor => {
      const vendorName = (vendor.name || vendor.business_name || '').toLowerCase();
      const vendorDesc = (vendor.description || '').toLowerCase();
      const vendorLoc = (vendor.location || '').toLowerCase();
      const vendorCategories = (vendor.service_categories || []).map((c: string) => c.toLowerCase());
      const vendorTrade = (vendor.trade || '').toLowerCase();

      // 1. Trade Category Filter
      if (selectedCategory !== 'all') {
        const catObj = TRADE_CATEGORIES.find(c => c.id === selectedCategory);
        if (catObj && catObj.matchKeys.length > 0) {
          const matchesTrade = catObj.id === vendorTrade;
          const matchesCategoryName = vendorCategories.some((c: string) => 
            catObj.matchKeys.some(k => c.includes(k))
          );
          const matchesDescOrName = catObj.matchKeys.some(k => 
            vendorName.includes(k) || vendorDesc.includes(k)
          );
          if (!matchesTrade && !matchesCategoryName && !matchesDescOrName) {
            return false;
          }
        }
      }

      // 2. Occasion Filter
      if (selectedOccasion !== 'all') {
        const occObj = OCCASIONS.find(o => o.id === selectedOccasion);
        if (occObj && occObj.matchKeys.length > 0) {
          const vendorOccasions = (vendor.occasions || []).map((o: string) => o.toLowerCase());
          const matchesOccasionArray = vendorOccasions.some((o: string) => 
            occObj.matchKeys.some(k => o.includes(k))
          );
          const matchesText = occObj.matchKeys.some(k => 
            vendorDesc.includes(k) || vendorName.includes(k)
          );
          if (!matchesOccasionArray && !matchesText) {
            return false;
          }
        }
      }

      // 3. Location Filter
      if (selectedLocation !== 'all') {
        const locLower = selectedLocation.toLowerCase().trim();
        const matchesLoc = vendorLoc.includes(locLower) || 
          (locLower === 'delhi ncr' && (vendorLoc.includes('delhi') || vendorLoc.includes('noida') || vendorLoc.includes('gurgaon')));
        if (!matchesLoc) {
          return false;
        }
      }

      // 4. Search Query Filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesQuery = 
          vendorName.includes(query) ||
          vendorDesc.includes(query) ||
          vendorLoc.includes(query) ||
          vendorCategories.some((c: string) => c.includes(query));
        if (!matchesQuery) return false;
      }

      // 5. Price Min Filter
      if (minPrice) {
        const min = Number(minPrice);
        if (!isNaN(min) && (vendor.base_price || 0) < min) return false;
      }

      // 6. Price Max Filter
      if (maxPrice) {
        const max = Number(maxPrice);
        if (!isNaN(max) && (vendor.base_price || 0) > max) return false;
      }

      return true;
    });
  }, [allVendors, selectedCategory, selectedOccasion, selectedLocation, searchQuery, minPrice, maxPrice]);

  const activeCategoryObj = TRADE_CATEGORIES.find(c => c.id === selectedCategory);
  const activeOccasionObj = OCCASIONS.find(o => o.id === selectedOccasion);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== 'all') count++;
    if (selectedOccasion !== 'all') count++;
    if (selectedLocation !== 'all') count++;
    if (minPrice) count++;
    if (maxPrice) count++;
    if (selectedPricingType !== 'all') count++;
    return count;
  }, [selectedCategory, selectedOccasion, selectedLocation, minPrice, maxPrice, selectedPricingType]);

  const hasActiveFilters = 
    selectedCategory !== 'all' || 
    selectedOccasion !== 'all' || 
    selectedLocation !== 'all' || 
    Boolean(searchQuery) || 
    Boolean(minPrice) || 
    Boolean(maxPrice) || 
    selectedPricingType !== 'all';

  const resetAllFilters = () => {
    setSelectedCategory('all');
    setSelectedOccasion('all');
    setSelectedLocation('all');
    setSearchQuery('');
    setMinPrice('');
    setMaxPrice('');
    setSelectedPricingType('all');
    router.replace('/marketplace');
  };

  const FilterSidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className="space-y-6">
      {/* Category Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-[#1C1B19] uppercase tracking-wider">
            Category
          </label>
          {selectedCategory !== 'all' && (
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className="text-[11px] text-[#A9573D] hover:underline cursor-pointer font-medium"
            >
              Reset
            </button>
          )}
        </div>
        <div className="space-y-1">
          {TRADE_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat.id);
                  if (isMobile) {
                    setIsMobileFilterOpen(false);
                  }
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer text-left ${
                  isSelected
                    ? 'bg-[#F3E4DB] text-[#8E4532] font-semibold border border-[#E5DED6]'
                    : 'text-[#6F6A64] hover:bg-[#FAF7F2] hover:text-[#1C1B19]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`size-3.5 ${isSelected ? 'text-[#8E4532]' : 'text-[#6F6A64]'}`} />
                  <span>{cat.name}</span>
                </div>
                {isSelected && <Check className="size-3.5 text-[#8E4532]" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="border-t border-[#E5DED6]" />

      {/* Occasion / Event Section */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-[#1C1B19] uppercase tracking-wider">
            Occasion / Event
          </label>
          {selectedOccasion !== 'all' && (
            <button
              type="button"
              onClick={() => setSelectedOccasion('all')}
              className="text-[11px] text-[#A9573D] hover:underline cursor-pointer font-medium"
            >
              Reset
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {OCCASIONS.map((occ) => {
            const isSelected = selectedOccasion === occ.id;
            return (
              <button
                key={occ.id}
                type="button"
                onClick={() => {
                  setSelectedOccasion(occ.id);
                  if (isMobile) {
                    setIsMobileFilterOpen(false);
                  }
                }}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#A9573D] text-white shadow-xs'
                    : 'bg-[#FAF7F2] text-[#6F6A64] border border-[#E5DED6] hover:bg-[#F3E4DB] hover:text-[#1C1B19]'
                }`}
              >
                <span>{occ.emoji}</span>
                <span>{occ.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="border-t border-[#E5DED6]" />

      {/* City / Location Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-[#1C1B19] uppercase tracking-wider">
            City / Region
          </label>
          {selectedLocation !== 'all' && (
            <button
              type="button"
              onClick={() => setSelectedLocation('all')}
              className="text-[11px] text-[#A9573D] hover:underline cursor-pointer font-medium"
            >
              Reset
            </button>
          )}
        </div>
        <div className="space-y-1">
          {['all', ...CITIES].map((city) => {
            const isAll = city === 'all';
            const displayName = isAll ? 'All Locations' : city;
            const isSelected = isAll ? selectedLocation === 'all' : selectedLocation.toLowerCase() === city.toLowerCase();
            return (
              <button
                key={city}
                type="button"
                onClick={() => {
                  setSelectedLocation(city);
                  if (isMobile) setIsMobileFilterOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs transition-colors cursor-pointer text-left ${
                  isSelected
                    ? 'bg-[#F3E4DB] text-[#8E4532] font-semibold border border-[#E5DED6]'
                    : 'text-[#6F6A64] hover:bg-[#FAF7F2] hover:text-[#1C1B19]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <MapPin className={`size-3.5 ${isSelected ? 'text-[#8E4532]' : 'text-[#6F6A64]'}`} />
                  <span>{displayName}</span>
                </div>
                {isSelected && <Check className="size-3 text-[#8E4532]" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="border-t border-[#E5DED6]" />

      {/* Price Range Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-[#1C1B19] uppercase tracking-wider">
            Budget Range (₹)
          </label>
          {(minPrice || maxPrice) && (
            <button
              type="button"
              onClick={() => { setMinPrice(''); setMaxPrice(''); }}
              className="text-[11px] text-[#A9573D] hover:underline cursor-pointer font-medium"
            >
              Clear
            </button>
          )}
        </div>

        {/* Min / Max Inputs */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <span className="text-[11px] text-[#6F6A64]">Min (₹)</span>
            <Input
              type="number"
              placeholder="0"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="bg-[#FAF7F2] border-[#E5DED6] h-8 rounded-lg text-xs"
            />
          </div>
          <div className="space-y-1">
            <span className="text-[11px] text-[#6F6A64]">Max (₹)</span>
            <Input
              type="number"
              placeholder="1,00,000+"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="bg-[#FAF7F2] border-[#E5DED6] h-8 rounded-lg text-xs"
            />
          </div>
        </div>

        {/* Quick Presets */}
        <div className="space-y-1 pt-1">
          <span className="text-[11px] text-[#6F6A64] block font-medium">Quick Presets:</span>
          <div className="grid grid-cols-1 gap-1">
            {[
              { label: 'Under ₹25,000', min: '', max: '25000' },
              { label: '₹25,000 - ₹50,000', min: '25000', max: '50000' },
              { label: '₹50,000 - ₹1,00,000', min: '50000', max: '100000' },
              { label: 'Above ₹1,00,000', min: '100000', max: '' },
            ].map((preset) => {
              const isActive = minPrice === preset.min && maxPrice === preset.max;
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    setMinPrice(preset.min);
                    setMaxPrice(preset.max);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer text-left ${
                    isActive
                      ? 'bg-[#F3E4DB] text-[#8E4532] font-semibold border border-[#E5DED6]'
                      : 'text-[#6F6A64] hover:bg-[#FAF7F2] hover:text-[#1C1B19]'
                  }`}
                >
                  <span>{preset.label}</span>
                  {isActive && <Check className="size-3 text-[#8E4532]" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="border-t border-[#E5DED6]" />

      {/* Pricing Model Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-[#1C1B19] uppercase tracking-wider">
            Pricing Model
          </label>
          {selectedPricingType !== 'all' && (
            <button
              type="button"
              onClick={() => setSelectedPricingType('all')}
              className="text-[11px] text-[#A9573D] hover:underline cursor-pointer font-medium"
            >
              Reset
            </button>
          )}
        </div>
        <div className="space-y-1">
          {pricingTypes.map((type) => {
            const isSelected = selectedPricingType === type.id;
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => setSelectedPricingType(type.id)}
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer text-left ${
                  isSelected
                    ? 'bg-[#F3E4DB] text-[#8E4532] font-semibold border border-[#E5DED6]'
                    : 'text-[#6F6A64] hover:bg-[#FAF7F2] hover:text-[#1C1B19]'
                }`}
              >
                <span>{type.name}</span>
                {isSelected && <Check className="size-3 text-[#8E4532]" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1C1B19] selection:bg-[#F3E4DB] selection:text-[#8E4532]">
      <Header />
      
      {/* Header Banner */}
      <section className="py-10 border-b border-[#E5DED6] bg-[#FAF7F2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center space-y-3">
            
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#F3E4DB] border border-[#E5DED6] text-xs font-medium text-[#A9573D]">
              <Sparkles className="size-3.5 text-[#A9573D]" />
              <span>Discover · Trust · Celebrate</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-serif font-semibold tracking-tight text-[#1C1B19]">
              Find & Book Top Event Pros
            </h1>
            <p className="text-xs sm:text-sm text-[#6F6A64] font-normal">
              Browse top photographers, makeup artists, decorators, and planners.
            </p>
            
            {/* Search Input Bar */}
            <div className="pt-2 max-w-xl mx-auto">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#A9573D]" />
                <Input
                  type="text"
                  placeholder="Search by vendor name, profession, or city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10 h-11 bg-white border-[#E5DED6] rounded-xl text-xs focus:border-[#A9573D] text-[#1C1B19] placeholder:text-[#6F6A64] shadow-xs"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 size-5 rounded-full bg-[#E5DED6]/60 flex items-center justify-center text-[#6F6A64] hover:bg-[#A9573D] hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="size-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Quick-Scroll Category Pills for Mobile & Desktop */}
            <div className="pt-3 flex items-center gap-2 overflow-x-auto no-scrollbar snap-x snap-mandatory py-1 max-w-2xl mx-auto -mx-4 px-4 sm:mx-auto sm:px-0">
              {TRADE_CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = selectedCategory === cat.slug;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.slug)}
                    className={`snap-start shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all active:scale-95 cursor-pointer border ${
                      isSelected
                        ? 'bg-[#9E5338] text-white border-[#9E5338] shadow-xs'
                        : 'bg-white text-[#221F1C] border-[#E5DED6] hover:border-[#9E5338]/40'
                    }`}
                  >
                    <Icon className="size-3.5" />
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Slide-in Left Filter Drawer (Amazon & Flipkart style) */}
      <AnimatePresence>
        {isMobileFilterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileFilterOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 lg:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 260 }}
              className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-white z-50 shadow-2xl flex flex-col lg:hidden"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between p-4 border-b border-[#E5DED6] bg-[#FAF7F2]">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="size-4 text-[#A9573D]" />
                  <h2 className="text-sm font-serif font-bold text-[#1C1B19]">Filters</h2>
                  {activeFiltersCount > 0 && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#F3E4DB] text-[#8E4532] font-semibold">
                      {activeFiltersCount}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="size-7 rounded-full bg-white border border-[#E5DED6] flex items-center justify-center text-[#6F6A64] hover:text-[#1C1B19] cursor-pointer"
                >
                  <X className="size-3.5" />
                </button>
              </div>

              {/* Drawer Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-4">
                <FilterSidebarContent isMobile />
              </div>

              {/* Drawer Sticky Bottom Footer */}
              <div className="p-4 border-t border-[#E5DED6] bg-[#FAF7F2] flex items-center gap-2">
                {activeFiltersCount > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetAllFilters}
                    className="flex-1 h-10 text-xs border-[#E5DED6] text-[#6F6A64] rounded-xl cursor-pointer"
                  >
                    Clear all
                  </Button>
                )}
                <Button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="flex-1 h-10 bg-[#A9573D] hover:bg-[#8E4532] text-white text-xs font-medium rounded-xl cursor-pointer"
                >
                  Show {filteredVendors.length} pros
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Catalog Section: Left Filter Sidebar + Right Listings Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-start gap-8">
          
          {/* Desktop Left Filter Sidebar (Amazon / Flipkart layout) */}
          {showDesktopFilters && (
            <aside className="hidden lg:block w-64 xl:w-72 shrink-0 sticky top-24 self-start rounded-2xl bg-white border border-[#E5DED6] p-5 shadow-xs max-h-[calc(100vh-7rem)] overflow-y-auto no-scrollbar">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E5DED6]">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="size-4 text-[#A9573D]" />
                  <h2 className="text-sm font-serif font-bold text-[#1C1B19]">Filters</h2>
                  {activeFiltersCount > 0 && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#F3E4DB] text-[#8E4532] font-semibold">
                      {activeFiltersCount}
                    </span>
                  )}
                </div>
                {activeFiltersCount > 0 && (
                  <button
                    type="button"
                    onClick={resetAllFilters}
                    className="text-xs text-[#A9573D] hover:underline font-medium cursor-pointer"
                  >
                    Clear all
                  </button>
                )}
              </div>
              <FilterSidebarContent />
            </aside>
          )}

          {/* Right Column: Listings and Active Filters */}
          <main className="flex-1 min-w-0 space-y-4">
            
            {/* Top Bar with Filter Toggle, Results Count */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5DED6]">
              <div className="flex items-center gap-3">
                {/* Mobile Trigger Button */}
                <Button
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="lg:hidden h-9 px-3.5 rounded-xl bg-white border border-[#E5DED6] text-[#1C1B19] text-xs font-medium gap-1.5 cursor-pointer shadow-xs"
                >
                  <SlidersHorizontal className="size-3.5 text-[#A9573D]" />
                  <span>Filters</span>
                  {activeFiltersCount > 0 && (
                    <span className="size-4 rounded-full bg-[#A9573D] text-white text-[10px] font-bold flex items-center justify-center ml-0.5">
                      {activeFiltersCount}
                    </span>
                  )}
                </Button>

                {/* Desktop Toggle Sidebar Button */}
                <Button
                  onClick={() => setShowDesktopFilters(!showDesktopFilters)}
                  variant="ghost"
                  className="hidden lg:flex h-9 px-3 rounded-xl border border-[#E5DED6] text-xs text-[#6F6A64] hover:text-[#1C1B19] bg-white gap-2 cursor-pointer shadow-xs"
                >
                  <SlidersHorizontal className="size-3.5 text-[#A9573D]" />
                  <span>{showDesktopFilters ? 'Hide Filters' : 'Show Filters'}</span>
                  {activeFiltersCount > 0 && (
                    <span className="size-4 rounded-full bg-[#A9573D] text-white text-[10px] font-bold flex items-center justify-center">
                      {activeFiltersCount}
                    </span>
                  )}
                </Button>

                <div>
                  <h2 className="text-base font-serif font-semibold text-[#1C1B19]">
                    {selectedCategory !== 'all' ? activeCategoryObj?.name : 'Verified Creative Partners'}
                  </h2>
                  <p className="text-xs text-[#6F6A64]">
                    Showing {filteredVendors.length} matching experts {selectedOccasion !== 'all' ? `for ${activeOccasionObj?.name}` : ''}
                  </p>
                </div>
              </div>
            </div>

            {/* Active Filter Chips */}
            {hasActiveFilters && (
              <div className="flex items-center gap-2 flex-wrap py-1">
                <span className="text-[11px] font-semibold text-[#6F6A64] uppercase tracking-wider">Active:</span>

                {selectedCategory !== 'all' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F3E4DB] border border-[#E5DED6] text-xs font-medium text-[#8E4532]">
                    Category: {activeCategoryObj?.name}
                    <button onClick={() => setSelectedCategory('all')} className="hover:text-black cursor-pointer">
                      <X className="size-3" />
                    </button>
                  </span>
                )}

                {selectedOccasion !== 'all' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F3E4DB] border border-[#E5DED6] text-xs font-medium text-[#8E4532]">
                    Occasion: {activeOccasionObj?.name}
                    <button onClick={() => setSelectedOccasion('all')} className="hover:text-black cursor-pointer">
                      <X className="size-3" />
                    </button>
                  </span>
                )}

                {selectedLocation !== 'all' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F3E4DB] border border-[#E5DED6] text-xs font-medium text-[#8E4532]">
                    City: {selectedLocation}
                    <button onClick={() => setSelectedLocation('all')} className="hover:text-black cursor-pointer">
                      <X className="size-3" />
                    </button>
                  </span>
                )}

                {searchQuery && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F3E4DB] border border-[#E5DED6] text-xs font-medium text-[#8E4532]">
                    Query: &ldquo;{searchQuery}&rdquo;
                    <button onClick={() => setSearchQuery('')} className="hover:text-black cursor-pointer">
                      <X className="size-3" />
                    </button>
                  </span>
                )}

                {minPrice && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F3E4DB] border border-[#E5DED6] text-xs font-medium text-[#8E4532]">
                    Min: ₹{Number(minPrice).toLocaleString()}
                    <button onClick={() => setMinPrice('')} className="hover:text-black cursor-pointer">
                      <X className="size-3" />
                    </button>
                  </span>
                )}

                {maxPrice && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F3E4DB] border border-[#E5DED6] text-xs font-medium text-[#8E4532]">
                    Max: ₹{Number(maxPrice).toLocaleString()}
                    <button onClick={() => setMaxPrice('')} className="hover:text-black cursor-pointer">
                      <X className="size-3" />
                    </button>
                  </span>
                )}

                {selectedPricingType !== 'all' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F3E4DB] border border-[#E5DED6] text-xs font-medium text-[#8E4532]">
                    Model: {pricingTypes.find(t => t.id === selectedPricingType)?.name}
                    <button onClick={() => setSelectedPricingType('all')} className="hover:text-black cursor-pointer">
                      <X className="size-3" />
                    </button>
                  </span>
                )}

                <button
                  onClick={resetAllFilters}
                  className="inline-flex items-center gap-1 text-xs font-medium text-[#A9573D] hover:underline cursor-pointer ml-1"
                >
                  <RotateCcw className="size-3" />
                  <span>Clear all</span>
                </button>
              </div>
            )}

            {/* Vendor Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 pt-2">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="aspect-[16/10] w-full rounded-2xl bg-[#F5F0EA]" />
                    <Skeleton className="h-4 w-3/4 bg-[#F5F0EA]" />
                    <Skeleton className="h-3 w-1/2 bg-[#F5F0EA]" />
                  </div>
                ))}
              </div>
            ) : filteredVendors.length === 0 ? (
              <div className="space-y-8 mt-4">
                {/* Helpful Zero Results Recovery Box */}
                <div className="text-center py-12 px-6 border border-dashed border-[#E5DED6] rounded-2xl space-y-4 bg-white shadow-xs">
                  <div className="size-14 rounded-full bg-[#F3E4DB] flex items-center justify-center mx-auto text-[#A9573D]">
                    <Search className="size-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-serif font-bold text-[#1C1B19]">No creative partners match your filters</h3>
                    <p className="text-xs text-[#6F6A64] max-w-md mx-auto">
                      We couldn&apos;t find pros matching all criteria currently selected. You can clear filters or choose from recommended shortcuts below:
                    </p>
                  </div>

                  {/* Quick Shortcut Pills */}
                  <div className="flex items-center justify-center gap-2 flex-wrap pt-1 max-w-lg mx-auto">
                    <button
                      type="button"
                      onClick={() => {
                        resetAllFilters();
                        setSelectedCategory('photographer');
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAF7F2] border border-[#E5DED6] text-xs font-medium text-[#1C1B19] hover:bg-[#F3E4DB] hover:text-[#8E4532] transition-colors cursor-pointer"
                    >
                      <span>📸 Top Photographers</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        resetAllFilters();
                        setSelectedOccasion('wedding');
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAF7F2] border border-[#E5DED6] text-xs font-medium text-[#1C1B19] hover:bg-[#F3E4DB] hover:text-[#8E4532] transition-colors cursor-pointer"
                    >
                      <span>💍 Wedding Pros</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        resetAllFilters();
                        setSelectedLocation('Delhi NCR');
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAF7F2] border border-[#E5DED6] text-xs font-medium text-[#1C1B19] hover:bg-[#F3E4DB] hover:text-[#8E4532] transition-colors cursor-pointer"
                    >
                      <span>📍 Delhi NCR</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        resetAllFilters();
                        setSelectedCategory('makeup-artist');
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAF7F2] border border-[#E5DED6] text-xs font-medium text-[#1C1B19] hover:bg-[#F3E4DB] hover:text-[#8E4532] transition-colors cursor-pointer"
                    >
                      <span>💄 Makeup Artists</span>
                    </button>
                  </div>

                  <div className="pt-2">
                    <Button 
                      variant="outline" 
                      onClick={resetAllFilters} 
                      className="text-xs font-semibold border-[#A9573D] text-[#A9573D] hover:bg-[#F3E4DB] cursor-pointer rounded-full px-6 h-9"
                    >
                      Reset all filters
                    </Button>
                  </div>
                </div>

                {/* Recommended Top Verified Partners Section */}
                <div className="space-y-4 pt-2">
                  <div className="border-b border-[#E5DED6] pb-2">
                    <h4 className="text-sm font-serif font-bold text-[#1C1B19]">
                      Recommended Creative Partners You Might Like
                    </h4>
                    <p className="text-xs text-[#6F6A64]">
                      Explore these top-rated verified partners across popular categories
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {FALLBACK_VENDORS.slice(0, 3).map((vendor, index) => (
                      <motion.div
                        key={`rec-${vendor.id}-${index}`}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, delay: index * 0.05 }}
                      >
                        <PhotographerCard photographer={vendor} />
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 pt-2">
                {filteredVendors.map((vendor, index) => (
                  <motion.div
                    key={`${vendor.id}-${index}`}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: index * 0.03 }}
                  >
                    <PhotographerCard photographer={vendor} />
                  </motion.div>
                ))}
              </div>
            )}
          </main>
        </div>
      </section>
    </div>
  );
}

export default function Marketplace() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FAF7F2] p-8 flex items-center justify-center">
        <Skeleton className="h-10 w-48 bg-[#F3E4DB]" />
      </div>
    }>
      <MarketplaceContent />
    </Suspense>
  );
}
