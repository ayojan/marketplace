'use client';

import { useState, useEffect, useMemo, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PhotographerCard from '@/components/PhotographerCard';
import Header, { CITIES } from '@/components/Header';
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
  MapPin,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  Heart,
  Gift,
  Star,
  Navigation,
  Loader2,
  CheckCircle2,
  Send,
  Calendar,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiService } from '@/lib/api';
import { useLocation } from '@/lib/contexts/LocationContext';
import { useAuth } from '@/lib/contexts/AuthContext';
import { toast } from 'sonner';

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

// Occasions / Event Types with Elegant Icons
const OCCASIONS = [
  { id: 'all', name: 'All Occasions', icon: Sparkles, matchKeys: [] },
  { id: 'wedding', name: 'Weddings', icon: Heart, matchKeys: ['wedding', 'shaadi', 'bridal', 'vivah'] },
  { id: 'pre-wedding', name: 'Pre-Wedding', icon: Camera, matchKeys: ['pre-wedding', 'pre wedding', 'engagement', 'roka'] },
  { id: 'engagement', name: 'Engagement', icon: Sparkles, matchKeys: ['engagement', 'ring ceremony', 'roka'] },
  { id: 'birthday', name: 'Birthdays', icon: Gift, matchKeys: ['birthday', 'celebration', 'party'] },
  { id: 'corporate', name: 'Corporate Events', icon: Building2, matchKeys: ['corporate', 'conference', 'summit', 'office'] },
  { id: 'baby-shower', name: 'Baby Shower', icon: Heart, matchKeys: ['baby shower', 'maternity', 'godh bharai'] },
  { id: 'anniversary', name: 'Anniversaries', icon: Sparkles, matchKeys: ['anniversary', 'silver jubilee'] },
];

const pricingTypes = [
  { id: 'all', name: 'All Pricing Models' },
  { id: 'hourly', name: 'Hourly Rate' },
  { id: 'package', name: 'Full Package' },
  { id: 'custom', name: 'Custom Quote' },
];

const SORT_OPTIONS = [
  { id: 'featured', label: 'Featured & Top Rated' },
  { id: 'rating', label: 'Highest Rated (★ 5.0)' },
  { id: 'reviews', label: 'Most Reviewed' },
  { id: 'price-low', label: 'Price: Low to High' },
  { id: 'price-high', label: 'Price: High to Low' },
];


function MarketplaceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Parse initial state from URL query parameters
  const initialCategoryParam = searchParams.get('category') || searchParams.get('trade') || 'all';
  const initialOccasionParam = searchParams.get('occasion') || 'all';
  const initialSearchParam = searchParams.get('search') || searchParams.get('q') || '';
  const initialLocationParam = searchParams.get('location') || 'all';

  // Resolve matching category ID
  const matchedCategoryId = useMemo(() => {
    const normalized = initialCategoryParam.toLowerCase().trim();
    const found = TRADE_CATEGORIES.find(
      c => c.id === normalized || c.slug === normalized || c.name.toLowerCase() === normalized
    );
    return found ? found.slug : 'all';
  }, [initialCategoryParam]);

  // Resolve matching occasion ID
  const matchedOccasionId = useMemo(() => {
    const normalized = initialOccasionParam.toLowerCase().trim();
    const found = OCCASIONS.find(
      o => o.id === normalized || o.name.toLowerCase() === normalized
    );
    return found ? found.id : 'all';
  }, [initialOccasionParam]);

  const [selectedCategory, setSelectedCategory] = useState<string>(matchedCategoryId);
  const [selectedOccasion, setSelectedOccasion] = useState<string>(matchedOccasionId);
  const [selectedLocation, setSelectedLocation] = useState<string>(initialLocationParam);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearchParam);
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [selectedPricingType, setSelectedPricingType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('featured');

  const {
    selectedCity,
    setSelectedCity,
    openLocationPrompt,
    detectLocation,
    isDetecting,
  } = useLocation();

  const handleDetectLocationMarketplace = async (isMobileClose?: boolean) => {
    const res = await detectLocation();
    if (res.success && res.city) {
      setSelectedLocation(res.city);
      if (isMobileClose) setIsMobileFilterOpen(false);
    }
  };
  
  const [apiVendors, setApiVendors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);
  const [showDesktopFilters, setShowDesktopFilters] = useState<boolean>(true);

  const { user } = useAuth();
  const [isRequestModalOpen, setIsRequestModalOpen] = useState<boolean>(false);
  const [requestedService, setRequestedService] = useState<string>('Photography');
  const [requestSubmitted, setRequestSubmitted] = useState<boolean>(false);
  const [isSubmittingRequest, setIsSubmittingRequest] = useState<boolean>(false);
  const [requestForm, setRequestForm] = useState({
    service: 'Photography',
    city: '',
    date: '',
    notes: '',
    name: '',
    email: '',
    phone: '',
  });

  // Effective city for messaging
  const currentCityForCopy = useMemo(() => {
    if (selectedLocation && selectedLocation !== 'all' && selectedLocation !== 'All Locations') {
      return selectedLocation;
    }
    if (selectedCity && selectedCity !== 'All Cities' && selectedCity !== 'All Locations') {
      return selectedCity;
    }
    return '';
  }, [selectedLocation, selectedCity]);

  const handleOpenRequestModal = (serviceName?: string) => {
    const serviceToSet = serviceName || requestedService || 'Photography';
    setRequestedService(serviceToSet);
    const defaultName = user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.name || '' : '';
    setRequestForm({
      service: serviceToSet === 'More' ? 'Other' : serviceToSet,
      city: currentCityForCopy || '',
      date: '',
      notes: '',
      name: defaultName,
      email: user?.email || '',
      phone: user?.phone || '',
    });
    setRequestSubmitted(false);
    setIsRequestModalOpen(true);
  };

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestForm.name.trim()) {
      toast.error('Please enter your name');
      return;
    }
    if (!requestForm.email.trim() && !requestForm.phone.trim()) {
      toast.error('Please provide an email or phone number so we can contact you');
      return;
    }

    setIsSubmittingRequest(true);
    try {
      if (typeof window !== 'undefined') {
        const existing = JSON.parse(localStorage.getItem('ayoj_vendor_requests') || '[]');
        const newEntry = {
          ...requestForm,
          id: `req_${Date.now()}`,
          city: requestForm.city || currentCityForCopy || 'Local City',
          submittedAt: new Date().toISOString()
        };
        localStorage.setItem('ayoj_vendor_requests', JSON.stringify([newEntry, ...existing]));
      }
      toast.success("Request received! We'll work to connect you with suitable local professionals.");
      setRequestSubmitted(true);
    } catch {
      toast.error('Failed to submit request. Please try again.');
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  // Collapsible sidebar accordion sections
  const [openSections, setOpenSections] = useState({
    category: true,
    occasion: true,
    location: true,
    price: true,
    pricingType: true,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

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
          const vendorServices = data.filter((s: any) => s.vendor?.id === id);
          const firstService = vendorServices[0];
          
          // Collect all images from vendor's services as supplementary images
          const serviceImages = vendorServices.flatMap((s: any) => 
            (s.images || []).map((img: any) => typeof img === 'string' ? img : img.url).filter(Boolean)
          );

          // Find minimum valid price across services
          const prices = vendorServices
            .map((s: any) => Number(s.base_price))
            .filter((p: number) => !isNaN(p) && p > 0);
          const minPrice = prices.length > 0 ? Math.min(...prices) : (Number(firstService.vendor?.base_price) || 0);

          return {
            ...firstService.vendor,
            base_price: minPrice,
            service_images: serviceImages,
            service_categories: Array.from(new Set(vendorServices.map((s: any) => s.category?.name).filter(Boolean))),
            occasions: vendorServices.flatMap((s: any) => s.occasions || [])
          };
        });

        if (isMounted) {
          setApiVendors(uniqueVendors);
        }
      } catch (err: any) {
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

  // Master vendor list: strictly from API results
  const allVendors = useMemo(() => {
    return apiVendors;
  }, [apiVendors]);

  // Helper to count vendors per category in master list
  const getCategoryCount = (slug: string) => {
    if (slug === 'all') return allVendors.length;
    const catObj = TRADE_CATEGORIES.find(c => c.slug === slug);
    if (!catObj) return 0;
    return allVendors.filter(v => {
      const vendorTrade = (v.trade || '').toLowerCase();
      const vendorCategories = [
        ...(v.categories?.map((c: any) => (typeof c === 'string' ? c : c.name)) || []),
        ...(v.primary_category ? [typeof v.primary_category === 'string' ? v.primary_category : v.primary_category.name] : []),
        ...(v.service_categories || [])
      ].filter(Boolean).map((c: string) => c.toLowerCase());
      const vendorName = (v.name || v.business_name || '').toLowerCase();
      const vendorDesc = (v.description || '').toLowerCase();
      return (
        catObj.id === vendorTrade ||
        vendorCategories.some((c: string) => catObj.matchKeys.some(k => c.includes(k))) ||
        catObj.matchKeys.some(k => vendorName.includes(k) || vendorDesc.includes(k))
      );
    }).length;
  };

  // Filter vendors based on Category, Occasion, Location, Price, and Search
  const filteredVendors = useMemo(() => {
    return allVendors.filter(vendor => {
      const vendorName = (vendor.name || vendor.business_name || '').toLowerCase();
      const vendorDesc = (vendor.description || '').toLowerCase();
      const vendorLoc = (vendor.location || '').toLowerCase();
      const vendorCategories = [
        ...(vendor.categories?.map((c: any) => (typeof c === 'string' ? c : c.name)) || []),
        ...(vendor.primary_category ? [typeof vendor.primary_category === 'string' ? vendor.primary_category : vendor.primary_category.name] : []),
        ...(vendor.service_categories || [])
      ].filter(Boolean).map((c: string) => c.toLowerCase());
      const vendorTrade = (vendor.trade || '').toLowerCase();

      // 1. Trade Category Filter
      if (selectedCategory !== 'all') {
        const catObj = TRADE_CATEGORIES.find(c => c.slug === selectedCategory);
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

  // Sort filtered vendors based on selected sort option
  const sortedVendors = useMemo(() => {
    const list = [...filteredVendors];
    if (sortBy === 'price-low') {
      return list.sort((a, b) => (a.base_price || 0) - (b.base_price || 0));
    }
    if (sortBy === 'price-high') {
      return list.sort((a, b) => (b.base_price || 0) - (a.base_price || 0));
    }
    if (sortBy === 'rating') {
      return list.sort((a, b) => (b.rating || b.average_rating || 0) - (a.rating || a.average_rating || 0));
    }
    if (sortBy === 'reviews') {
      return list.sort((a, b) => (b.total_reviews || 0) - (a.total_reviews || 0));
    }
    return list; // default featured
  }, [filteredVendors, sortBy]);

  const activeCategoryObj = TRADE_CATEGORIES.find(c => c.slug === selectedCategory);
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
    setSortBy('featured');
    router.replace('/marketplace');
  };

  const FilterSidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className="space-y-5">
      
      {/* Category Section with Accordion */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => toggleSection('category')}
          className="w-full flex items-center justify-between text-left cursor-pointer group"
          aria-expanded={openSections.category}
        >
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-[#221F1C] uppercase tracking-wider">
              Category
            </span>
            {selectedCategory !== 'all' && (
              <span className="size-2 rounded-full bg-[#9E5338]" />
            )}
          </div>
          <div className="flex items-center gap-2">
            {selectedCategory !== 'all' && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedCategory('all');
                }}
                className="text-[11px] text-[#9E5338] hover:underline font-semibold"
              >
                Reset
              </span>
            )}
            {openSections.category ? (
              <ChevronUp className="size-3.5 text-[#6B6560] group-hover:text-[#221F1C]" />
            ) : (
              <ChevronDown className="size-3.5 text-[#6B6560] group-hover:text-[#221F1C]" />
            )}
          </div>
        </button>

        {openSections.category && (
          <div className="space-y-1 pt-1 animate-in fade-in-0 duration-150">
            {TRADE_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.slug;
              const count = getCategoryCount(cat.slug);
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat.slug);
                    if (isMobile) setIsMobileFilterOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer text-left ${
                    isSelected
                      ? 'bg-[#F3EADF] text-[#86442B] font-semibold border border-[#E8E2D9]'
                      : 'text-[#6B6560] hover:bg-[#FAF7F2] hover:text-[#221F1C]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`size-3.5 ${isSelected ? 'text-[#86442B]' : 'text-[#6B6560]'}`} />
                    <span>{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      isSelected ? 'bg-white/70 text-[#86442B] font-bold' : 'text-[#6B6560]'
                    }`}>
                      {count}
                    </span>
                    {isSelected && <Check className="size-3.5 text-[#86442B]" />}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="border-t border-[#E8E2D9]" />

      {/* Occasion / Event Section with Accordion */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => toggleSection('occasion')}
          className="w-full flex items-center justify-between text-left cursor-pointer group"
          aria-expanded={openSections.occasion}
        >
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-[#221F1C] uppercase tracking-wider">
              Occasion
            </span>
            {selectedOccasion !== 'all' && (
              <span className="size-2 rounded-full bg-[#9E5338]" />
            )}
          </div>
          <div className="flex items-center gap-2">
            {selectedOccasion !== 'all' && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedOccasion('all');
                }}
                className="text-[11px] text-[#9E5338] hover:underline font-semibold"
              >
                Reset
              </span>
            )}
            {openSections.occasion ? (
              <ChevronUp className="size-3.5 text-[#6B6560] group-hover:text-[#221F1C]" />
            ) : (
              <ChevronDown className="size-3.5 text-[#6B6560] group-hover:text-[#221F1C]" />
            )}
          </div>
        </button>

        {openSections.occasion && (
          <div className="flex flex-wrap gap-1.5 pt-1 animate-in fade-in-0 duration-150">
            {OCCASIONS.map((occ) => {
              const Icon = occ.icon;
              const isSelected = selectedOccasion === occ.id;
              return (
                <button
                  key={occ.id}
                  type="button"
                  onClick={() => {
                    setSelectedOccasion(occ.id);
                    if (isMobile) setIsMobileFilterOpen(false);
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all active:scale-95 cursor-pointer ${
                    isSelected
                      ? 'bg-[#9E5338] text-white shadow-xs font-semibold'
                      : 'bg-[#FAF7F2] text-[#6B6560] border border-[#E8E2D9] hover:bg-[#F3EADF] hover:text-[#221F1C]'
                  }`}
                >
                  <Icon className="size-3" />
                  <span>{occ.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="border-t border-[#E8E2D9]" />

      {/* City / Location Section with Accordion */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => toggleSection('location')}
          className="w-full flex items-center justify-between text-left cursor-pointer group"
          aria-expanded={openSections.location}
        >
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-[#221F1C] uppercase tracking-wider">
              City / Region
            </span>
            {selectedLocation !== 'all' && (
              <span className="size-2 rounded-full bg-[#9E5338]" />
            )}
          </div>
          <div className="flex items-center gap-2">
            {selectedLocation !== 'all' && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedLocation('all');
                }}
                className="text-[11px] text-[#9E5338] hover:underline font-semibold"
              >
                Reset
              </span>
            )}
            {openSections.location ? (
              <ChevronUp className="size-3.5 text-[#6B6560] group-hover:text-[#221F1C]" />
            ) : (
              <ChevronDown className="size-3.5 text-[#6B6560] group-hover:text-[#221F1C]" />
            )}
          </div>
        </button>

        {openSections.location && (
          <div className="space-y-1 pt-1 animate-in fade-in-0 duration-150">
            {/* Quick GPS auto-detect button */}
            <button
              type="button"
              disabled={isDetecting}
              onClick={() => handleDetectLocationMarketplace(isMobile)}
              className="w-full mb-2 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-[#9E5338] bg-[#F3EADF] border border-[#9E5338]/30 hover:bg-[#9E5338] hover:text-white transition-colors cursor-pointer"
            >
              {isDetecting ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Navigation className="size-3.5" />
              )}
              <span>{isDetecting ? 'Detecting Hub...' : 'Detect My Location'}</span>
            </button>

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
                    if (!isAll) setSelectedCity(city, { silentToast: true });
                    if (isMobile) setIsMobileFilterOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs transition-colors cursor-pointer text-left ${
                    isSelected
                      ? 'bg-[#F3EADF] text-[#86442B] font-semibold border border-[#E8E2D9]'
                      : 'text-[#6B6560] hover:bg-[#FAF7F2] hover:text-[#221F1C]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <MapPin className={`size-3.5 ${isSelected ? 'text-[#86442B]' : 'text-[#6B6560]'}`} />
                    <span>{displayName}</span>
                  </div>
                  {isSelected && <Check className="size-3 text-[#86442B]" />}
                </button>
              );
            })}

            <div className="pt-1 mt-1 border-t border-[#E8E2D9]/80">
              <button
                type="button"
                onClick={() => {
                  if (isMobile) setIsMobileFilterOpen(false);
                  openLocationPrompt();
                }}
                className="w-full px-3 py-1 text-[11px] font-medium text-[#6B6560] hover:text-[#9E5338] text-left cursor-pointer transition-colors"
              >
                Change celebration hub...
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-[#E8E2D9]" />

      {/* Budget Range Section with Accordion */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => toggleSection('price')}
          className="w-full flex items-center justify-between text-left cursor-pointer group"
          aria-expanded={openSections.price}
        >
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-[#221F1C] uppercase tracking-wider">
              Budget Range (₹)
            </span>
            {(minPrice || maxPrice) && (
              <span className="size-2 rounded-full bg-[#9E5338]" />
            )}
          </div>
          <div className="flex items-center gap-2">
            {(minPrice || maxPrice) && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  setMinPrice('');
                  setMaxPrice('');
                }}
                className="text-[11px] text-[#9E5338] hover:underline font-semibold"
              >
                Clear
              </span>
            )}
            {openSections.price ? (
              <ChevronUp className="size-3.5 text-[#6B6560] group-hover:text-[#221F1C]" />
            ) : (
              <ChevronDown className="size-3.5 text-[#6B6560] group-hover:text-[#221F1C]" />
            )}
          </div>
        </button>

        {openSections.price && (
          <div className="space-y-3 pt-1 animate-in fade-in-0 duration-150">
            {/* Min / Max Inputs */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <span className="text-[11px] text-[#6B6560]">Min (₹)</span>
                <Input
                  type="number"
                  placeholder="0"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="bg-[#FAF7F2] border-[#E8E2D9] h-8 rounded-lg text-xs"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[11px] text-[#6B6560]">Max (₹)</span>
                <Input
                  type="number"
                  placeholder="1,00,000+"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="bg-[#FAF7F2] border-[#E8E2D9] h-8 rounded-lg text-xs"
                />
              </div>
            </div>

            {/* Quick Presets */}
            <div className="space-y-1">
              <span className="text-[11px] text-[#6B6560] block font-medium">Quick Presets:</span>
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
                          ? 'bg-[#F3EADF] text-[#86442B] font-semibold border border-[#E8E2D9]'
                          : 'text-[#6B6560] hover:bg-[#FAF7F2] hover:text-[#221F1C]'
                      }`}
                    >
                      <span>{preset.label}</span>
                      {isActive && <Check className="size-3 text-[#86442B]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-[#E8E2D9]" />

      {/* Pricing Model Section with Accordion */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => toggleSection('pricingType')}
          className="w-full flex items-center justify-between text-left cursor-pointer group"
          aria-expanded={openSections.pricingType}
        >
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-[#221F1C] uppercase tracking-wider">
              Pricing Model
            </span>
            {selectedPricingType !== 'all' && (
              <span className="size-2 rounded-full bg-[#9E5338]" />
            )}
          </div>
          <div className="flex items-center gap-2">
            {selectedPricingType !== 'all' && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPricingType('all');
                }}
                className="text-[11px] text-[#9E5338] hover:underline font-semibold"
              >
                Reset
              </span>
            )}
            {openSections.pricingType ? (
              <ChevronUp className="size-3.5 text-[#6B6560] group-hover:text-[#221F1C]" />
            ) : (
              <ChevronDown className="size-3.5 text-[#6B6560] group-hover:text-[#221F1C]" />
            )}
          </div>
        </button>

        {openSections.pricingType && (
          <div className="space-y-1 pt-1 animate-in fade-in-0 duration-150">
            {pricingTypes.map((type) => {
              const isSelected = selectedPricingType === type.id;
              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setSelectedPricingType(type.id)}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer text-left ${
                    isSelected
                      ? 'bg-[#F3EADF] text-[#86442B] font-semibold border border-[#E8E2D9]'
                      : 'text-[#6B6560] hover:bg-[#FAF7F2] hover:text-[#221F1C]'
                  }`}
                >
                  <span>{type.name}</span>
                  {isSelected && <Check className="size-3 text-[#86442B]" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#221F1C] selection:bg-[#F3EADF] selection:text-[#9E5338]">
      {/* Accessible Skip to Content Link */}
      <a
        href="#marketplace-listings"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-[100] px-4 py-2 bg-[#9E5338] text-white rounded-xl shadow-lg font-medium text-xs focus:outline-none focus:ring-2 focus:ring-[#9E5338] focus:ring-offset-2"
      >
        Skip to marketplace listings
      </a>

      <Header />
      
      {/* Header Banner with Integrated Search Capsule */}
      <section className="py-10 border-b border-[#E8E2D9] bg-[#FAF7F2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center space-y-3">
            
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3EADF] border border-[#E8E2D9] text-xs font-semibold tracking-wider text-[#9E5338] uppercase">
              <Sparkles className="size-3.5 text-[#9E5338]" />
              <span>Discover · Trust · Celebrate</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-serif font-normal tracking-tight text-[#221F1C]">
              Find & Book Top Event Pros
            </h1>
            <p className="text-xs sm:text-sm text-[#6B6560] font-normal max-w-lg mx-auto">
              Explore authentic portfolios, transparent pricing, and live availability across verified celebration artists.
            </p>
            
            {/* Search Input Bar with Integrated City Selector */}
            <div className="pt-2 max-w-xl mx-auto">
              <div className="bg-white border border-[#E8E2D9] rounded-2xl sm:rounded-full p-2 shadow-sm flex flex-col sm:flex-row items-center gap-2">
                
                {/* Location Selector Inside Search */}
                <div className="relative w-full sm:w-auto">
                  <select
                    value={selectedLocation}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedLocation(val);
                      if (val !== 'all') setSelectedCity(val, { silentToast: true });
                    }}
                    aria-label="Filter by city"
                    className="w-full sm:w-auto bg-transparent text-xs font-medium text-[#221F1C] px-3 py-1.5 border-b sm:border-b-0 sm:border-r border-[#E8E2D9] focus:outline-none cursor-pointer"
                  >
                    <option value="all">📍 All Cities</option>
                    {CITIES.map((city) => (
                      <option key={city} value={city}>
                        📍 {city}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Search Text Input */}
                <div className="flex items-center gap-2 px-3 py-1.5 flex-1 w-full min-h-[40px] sm:min-h-0">
                  <label htmlFor="marketplace-search" className="sr-only">
                    Search creative partners
                  </label>
                  <Search className="size-4 text-[#9E5338] shrink-0" />
                  <input
                    id="marketplace-search"
                    type="text"
                    placeholder="Search by pro name, trade, or service..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    aria-label="Search by pro name, trade, or service"
                    className="w-full bg-transparent text-xs text-[#221F1C] placeholder:text-[#6B6560] focus:outline-none"
                  />
                  {searchQuery && (
                    <button 
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="size-5 rounded-full bg-[#E8E2D9]/60 flex items-center justify-center text-[#6B6560] hover:bg-[#9E5338] hover:text-white transition-colors cursor-pointer"
                      aria-label="Clear search query"
                    >
                      <X className="size-3" />
                    </button>
                  )}
                </div>

                {/* Clear query button if typed */}
                {searchQuery && (
                  <Button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    variant="ghost"
                    className="h-8 text-xs text-[#9E5338] hover:bg-[#F3EADF] rounded-full px-3"
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>

            {/* Quick-Scroll Category Pills with Live Count Badges */}
            <div className="pt-3 flex items-center gap-2 overflow-x-auto no-scrollbar snap-x snap-mandatory py-1 max-w-2xl mx-auto -mx-4 px-4 sm:mx-auto sm:px-0">
              {TRADE_CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = selectedCategory === cat.slug;
                const count = getCategoryCount(cat.slug);
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.slug)}
                    className={`snap-start shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-95 cursor-pointer border ${
                      isSelected
                        ? 'bg-[#9E5338] text-white border-[#9E5338] shadow-xs'
                        : 'bg-white text-[#221F1C] border-[#E8E2D9] hover:border-[#9E5338]/40 hover:bg-[#FAF7F2]'
                    }`}
                  >
                    <Icon className="size-3.5" />
                    <span>{cat.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isSelected ? 'bg-white/25 text-white' : 'bg-[#FAF7F2] text-[#6B6560]'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Slide-in Left Filter Drawer */}
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
              <div className="flex items-center justify-between p-4 border-b border-[#E8E2D9] bg-[#FAF7F2]">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="size-4 text-[#9E5338]" />
                  <h2 className="text-sm font-serif font-bold text-[#221F1C]">Filters</h2>
                  {activeFiltersCount > 0 && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#F3EADF] text-[#86442B] font-semibold">
                      {activeFiltersCount}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="size-7 rounded-full bg-white border border-[#E8E2D9] flex items-center justify-center text-[#6B6560] hover:text-[#221F1C] cursor-pointer"
                  aria-label="Close filters"
                >
                  <X className="size-3.5" />
                </button>
              </div>

              {/* Drawer Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-4">
                <FilterSidebarContent isMobile />
              </div>

              {/* Drawer Sticky Bottom Footer */}
              <div className="p-4 border-t border-[#E8E2D9] bg-[#FAF7F2] flex items-center gap-2">
                {activeFiltersCount > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetAllFilters}
                    className="flex-1 h-10 text-xs border-[#E8E2D9] text-[#6B6560] rounded-xl cursor-pointer"
                  >
                    Clear all
                  </Button>
                )}
                <Button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="flex-1 h-10 bg-[#9E5338] hover:bg-[#86442B] text-white text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Show {sortedVendors.length} pros
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Catalog Section: Left Filter Sidebar + Right Listings Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-start gap-8">
          
          {/* Desktop Left Filter Sidebar */}
          {showDesktopFilters && (
            <aside className="hidden lg:block w-64 xl:w-72 shrink-0 sticky top-24 self-start rounded-2xl bg-white border border-[#E8E2D9] p-5 shadow-xs max-h-[calc(100vh-7rem)] overflow-y-auto no-scrollbar">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E8E2D9]">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="size-4 text-[#9E5338]" />
                  <h2 className="text-sm font-serif font-bold text-[#221F1C]">Filters</h2>
                  {activeFiltersCount > 0 && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#F3EADF] text-[#86442B] font-bold">
                      {activeFiltersCount}
                    </span>
                  )}
                </div>
                {activeFiltersCount > 0 && (
                  <button
                    type="button"
                    onClick={resetAllFilters}
                    className="text-xs text-[#9E5338] hover:underline font-semibold cursor-pointer"
                  >
                    Clear all
                  </button>
                )}
              </div>
              <FilterSidebarContent />
            </aside>
          )}

          {/* Right Column: Listings and Active Filters */}
          <main id="marketplace-listings" className="flex-1 min-w-0 space-y-4">
            
            {/* Top Bar with Filter Toggle, Results Count, and Sort Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8E2D9]">
              <div className="flex items-center gap-3">
                {/* Mobile Trigger Button */}
                <Button
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="lg:hidden h-9 px-3.5 rounded-xl bg-white border border-[#E8E2D9] text-[#221F1C] text-xs font-semibold gap-1.5 cursor-pointer shadow-xs active:scale-95"
                >
                  <SlidersHorizontal className="size-3.5 text-[#9E5338]" />
                  <span>Filters</span>
                  {activeFiltersCount > 0 && (
                    <span className="size-4 rounded-full bg-[#9E5338] text-white text-[10px] font-bold flex items-center justify-center ml-0.5">
                      {activeFiltersCount}
                    </span>
                  )}
                </Button>

                {/* Desktop Toggle Sidebar Button */}
                <Button
                  onClick={() => setShowDesktopFilters(!showDesktopFilters)}
                  variant="ghost"
                  className="hidden lg:flex h-9 px-3 rounded-xl border border-[#E8E2D9] text-xs font-medium text-[#6B6560] hover:text-[#221F1C] bg-white gap-2 cursor-pointer shadow-xs active:scale-95"
                >
                  <SlidersHorizontal className="size-3.5 text-[#9E5338]" />
                  <span>{showDesktopFilters ? 'Hide Filters' : 'Show Filters'}</span>
                  {activeFiltersCount > 0 && (
                    <span className="size-4 rounded-full bg-[#9E5338] text-white text-[10px] font-bold flex items-center justify-center">
                      {activeFiltersCount}
                    </span>
                  )}
                </Button>

                <div>
                  <h2 className="text-base font-serif font-bold text-[#221F1C]">
                    {selectedCategory !== 'all' ? activeCategoryObj?.name : 'Creative Partners'}
                    {selectedLocation !== 'all' ? ` in ${selectedLocation}` : ''}
                  </h2>
                  <p className="text-xs text-[#6B6560]">
                    Showing {sortedVendors.length} matching {sortedVendors.length === 1 ? 'expert' : 'experts'}
                    {selectedOccasion !== 'all' ? ` for ${activeOccasionObj?.name}` : ''}
                  </p>
                </div>
              </div>

              {/* Sort by Dropdown */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <span className="text-xs text-[#6B6560] flex items-center gap-1 font-medium">
                  <ArrowUpDown className="size-3.5 text-[#9E5338]" />
                  Sort:
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  aria-label="Sort marketplace listings"
                  className="bg-white border border-[#E8E2D9] text-[#221F1C] text-xs font-semibold rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#9E5338] cursor-pointer shadow-xs hover:border-[#9E5338]/40 transition-colors"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active Filter Chips */}
            {hasActiveFilters && (
              <div className="flex items-center gap-2 flex-wrap py-1">
                <span className="text-[11px] font-bold text-[#6B6560] uppercase tracking-wider">Active:</span>

                {selectedCategory !== 'all' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F3EADF] border border-[#E8E2D9] text-xs font-medium text-[#86442B]">
                    Category: {activeCategoryObj?.name}
                    <button onClick={() => setSelectedCategory('all')} aria-label="Remove category filter" className="hover:text-black cursor-pointer">
                      <X className="size-3" />
                    </button>
                  </span>
                )}

                {selectedOccasion !== 'all' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F3EADF] border border-[#E8E2D9] text-xs font-medium text-[#86442B]">
                    Occasion: {activeOccasionObj?.name}
                    <button onClick={() => setSelectedOccasion('all')} aria-label="Remove occasion filter" className="hover:text-black cursor-pointer">
                      <X className="size-3" />
                    </button>
                  </span>
                )}

                {selectedLocation !== 'all' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F3EADF] border border-[#E8E2D9] text-xs font-medium text-[#86442B]">
                    City: {selectedLocation}
                    <button onClick={() => setSelectedLocation('all')} aria-label="Remove city filter" className="hover:text-black cursor-pointer">
                      <X className="size-3" />
                    </button>
                  </span>
                )}

                {searchQuery && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F3EADF] border border-[#E8E2D9] text-xs font-medium text-[#86442B]">
                    Query: &ldquo;{searchQuery}&rdquo;
                    <button onClick={() => setSearchQuery('')} aria-label="Remove query filter" className="hover:text-black cursor-pointer">
                      <X className="size-3" />
                    </button>
                  </span>
                )}

                {minPrice && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F3EADF] border border-[#E8E2D9] text-xs font-medium text-[#86442B]">
                    Min: ₹{Number(minPrice).toLocaleString()}
                    <button onClick={() => setMinPrice('')} aria-label="Remove minimum price filter" className="hover:text-black cursor-pointer">
                      <X className="size-3" />
                    </button>
                  </span>
                )}

                {maxPrice && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F3EADF] border border-[#E8E2D9] text-xs font-medium text-[#86442B]">
                    Max: ₹{Number(maxPrice).toLocaleString()}
                    <button onClick={() => setMaxPrice('')} aria-label="Remove maximum price filter" className="hover:text-black cursor-pointer">
                      <X className="size-3" />
                    </button>
                  </span>
                )}

                {selectedPricingType !== 'all' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F3EADF] border border-[#E8E2D9] text-xs font-medium text-[#86442B]">
                    Model: {pricingTypes.find(t => t.id === selectedPricingType)?.name}
                    <button onClick={() => setSelectedPricingType('all')} aria-label="Remove pricing model filter" className="hover:text-black cursor-pointer">
                      <X className="size-3" />
                    </button>
                  </span>
                )}

                <button
                  onClick={resetAllFilters}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#9E5338] hover:underline cursor-pointer ml-1"
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
                  <div key={i} className="space-y-3 bg-white p-4 rounded-2xl border border-[#E8E2D9]">
                    <Skeleton className="aspect-[16/10] w-full rounded-xl bg-[#F5F0EA]" />
                    <Skeleton className="h-4 w-3/4 bg-[#F5F0EA]" />
                    <Skeleton className="h-3 w-1/2 bg-[#F5F0EA]" />
                  </div>
                ))}
              </div>
            ) : sortedVendors.length === 0 ? (
              <div className="space-y-8 mt-4">
                {/* Transparent Ayoj City Network Building Box */}
                <div className="text-center py-12 px-6 sm:px-12 border border-[#E8E2D9] rounded-3xl space-y-6 bg-[#FAF7F2] shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 -mt-8 -mr-8 w-44 h-44 bg-[#F3EADF] rounded-full blur-2xl pointer-events-none opacity-60" />
                  <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-44 h-44 bg-[#9E5338]/5 rounded-full blur-2xl pointer-events-none" />

                  {/* Icon Badge */}
                  <div className="size-14 rounded-2xl bg-[#F3EADF] border border-[#E8DACB] flex items-center justify-center mx-auto text-[#9E5338] shadow-2xs">
                    <Building2 className="size-6 text-[#9E5338]" />
                  </div>

                  {/* Headline & Subtitle */}
                  <div className="space-y-2 max-w-xl mx-auto">
                    <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#221F1C] tracking-tight">
                      We&apos;re building Ayoj in {currentCityForCopy || 'your city'}
                    </h3>
                    <p className="text-sm text-[#6B6560] leading-relaxed max-w-lg mx-auto">
                      Tell us what you&apos;re planning, and we&apos;ll work to connect you with suitable local event professionals.
                    </p>
                  </div>

                  {/* Services Prompt & Interactive Chips */}
                  <div className="space-y-3 pt-1 max-w-lg mx-auto">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#9E5338]">
                      What service do you need?
                    </p>
                    <div className="flex items-center justify-center flex-wrap gap-2 text-xs text-[#221F1C]">
                      {['Photography', 'Decoration', 'Makeup', 'Catering', 'More'].map((service, index, arr) => (
                        <div key={service} className="inline-flex items-center">
                          <button
                            type="button"
                            onClick={() => handleOpenRequestModal(service)}
                            className="px-3.5 py-1.5 rounded-full border border-[#E8E2D9] bg-white hover:border-[#9E5338] hover:bg-[#F3EADF] text-[#221F1C] hover:text-[#86442B] font-medium transition-all cursor-pointer shadow-2xs active:scale-95"
                          >
                            {service}
                          </button>
                          {index < arr.length - 1 && (
                            <span className="text-[#9E5338] mx-1.5 font-bold select-none">·</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Primary CTA Button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => handleOpenRequestModal()}
                      className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full bg-[#9E5338] hover:bg-[#86442B] text-white text-sm font-semibold shadow-sm hover:shadow-md active:scale-95 transition-all cursor-pointer"
                    >
                      <Sparkles className="size-4" />
                      <span>Request a vendor</span>
                    </button>
                  </div>

                  {/* Honest Transparency Disclaimer */}
                  <p className="text-xs text-[#8A847E] italic pt-1 max-w-md mx-auto">
                    No guarantee of a match. We&apos;ll contact you if we find a suitable provider.
                  </p>

                  {/* Reset Filters Link */}
                  <div className="pt-2 border-t border-[#E8E2D9]/70 max-w-xs mx-auto">
                    <button
                      type="button"
                      onClick={resetAllFilters}
                      className="text-xs text-[#6B6560] hover:text-[#9E5338] transition-colors underline cursor-pointer"
                    >
                      Clear all filters to view partners in all locations
                    </button>
                  </div>
                </div>

                {/* Recommended Top Verified Partners Section */}
                {allVendors.length > 0 && (
                  <div className="space-y-4 pt-2">
                    <div className="border-b border-[#E8E2D9] pb-2">
                      <h4 className="text-sm font-serif font-bold text-[#221F1C]">
                        Recommended Creative Partners You Might Like
                      </h4>
                      <p className="text-xs text-[#6B6560]">
                        Explore these top-rated partners across popular categories
                      </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                      {allVendors.slice(0, 3).map((vendor, index) => (
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
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 pt-2">
                {sortedVendors.map((vendor, index) => (
                  <motion.div
                    key={`${vendor.id}-${index}`}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: Math.min(index * 0.03, 0.3) }}
                  >
                    <PhotographerCard photographer={vendor} />
                  </motion.div>
                ))}
              </div>
            )}
          </main>
        </div>
      </section>

      {/* Mobile Sticky Floating Filter & Sort Pill */}
      <div className="lg:hidden fixed bottom-20 left-1/2 -translate-x-1/2 z-40 bg-white/95 backdrop-blur-md border border-[#E8E2D9] shadow-xl rounded-full px-4 py-2 flex items-center gap-3">
        <button
          type="button"
          onClick={() => setIsMobileFilterOpen(true)}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#221F1C] active:scale-95 cursor-pointer"
        >
          <SlidersHorizontal className="size-3.5 text-[#9E5338]" />
          <span>Filters</span>
          {activeFiltersCount > 0 && (
            <span className="size-4 rounded-full bg-[#9E5338] text-white text-[10px] font-bold flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </button>

        <div className="w-[1px] h-4 bg-[#E8E2D9]" />

        <div className="flex items-center gap-1">
          <ArrowUpDown className="size-3 text-[#9E5338]" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            aria-label="Sort vendors mobile"
            className="bg-transparent text-xs font-semibold text-[#221F1C] focus:outline-none cursor-pointer"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Request a Vendor Modal */}
      <AnimatePresence>
        {isRequestModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsRequestModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg bg-white rounded-3xl border border-[#E8E2D9] shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-6 pb-4 border-b border-[#E8E2D9] bg-[#FAF7F2] flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#9E5338] uppercase tracking-wider">
                    <Sparkles className="size-3.5" />
                    <span>Ayoj Concierge</span>
                  </div>
                  <h3 className="text-xl font-serif font-bold text-[#221F1C]">
                    Request an Event Professional
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsRequestModalOpen(false)}
                  className="size-8 rounded-full bg-white hover:bg-[#F3EADF] border border-[#E8E2D9] flex items-center justify-center text-[#221F1C] cursor-pointer"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-5">
                {requestSubmitted ? (
                  <div className="text-center py-8 space-y-4">
                    <div className="size-16 rounded-full bg-[#F3EADF] text-[#9E5338] flex items-center justify-center mx-auto shadow-sm">
                      <CheckCircle2 className="size-8" />
                    </div>
                    <div className="space-y-1.5">
                      <h4 className="text-xl font-serif font-bold text-[#221F1C]">
                        Request Submitted!
                      </h4>
                      <p className="text-xs text-[#6B6560] max-w-sm mx-auto leading-relaxed">
                        We&apos;ve recorded your request for <strong className="text-[#221F1C]">{requestForm.service}</strong> in <strong className="text-[#221F1C]">{requestForm.city || 'your city'}</strong>.
                      </p>
                      <p className="text-xs text-[#6B6560] max-w-sm mx-auto pt-1 leading-relaxed">
                        Our local team is actively scouting verified professionals and will contact you directly if a suitable match is available.
                      </p>
                    </div>
                    <div className="pt-4">
                      <button
                        type="button"
                        onClick={() => setIsRequestModalOpen(false)}
                        className="px-6 py-2.5 rounded-full bg-[#9E5338] hover:bg-[#86442B] text-white text-xs font-semibold cursor-pointer shadow-xs active:scale-95 transition-all"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleRequestSubmit} className="space-y-4">
                    <p className="text-xs text-[#6B6560] leading-relaxed">
                      Tell us what you&apos;re planning, and we&apos;ll work to connect you with suitable local event professionals.
                    </p>

                    {/* Service Selection */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#221F1C]">
                        What service do you need?
                      </label>
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {['Photography', 'Decoration', 'Makeup', 'Catering', 'DJs & Music', 'Event Planners', 'Venues', 'Other'].map((svc) => (
                          <button
                            key={svc}
                            type="button"
                            onClick={() => setRequestForm(prev => ({ ...prev, service: svc }))}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer border ${
                              requestForm.service === svc
                                ? 'bg-[#9E5338] text-white border-[#9E5338] shadow-xs'
                                : 'bg-[#FAF7F2] text-[#221F1C] border-[#E8E2D9] hover:bg-[#F3EADF]'
                            }`}
                          >
                            {svc}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* City / Location */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#221F1C]">
                        Location / City
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#9E5338]" />
                        <Input
                          type="text"
                          required
                          value={requestForm.city}
                          onChange={(e) => setRequestForm(prev => ({ ...prev, city: e.target.value }))}
                          placeholder="e.g. Mumbai, Jaipur, Delhi NCR, Pune..."
                          className="pl-9 text-xs rounded-xl border-[#E8E2D9] bg-white h-10"
                        />
                      </div>
                    </div>

                    {/* Event Date (optional) */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#221F1C]">
                        Approximate Event Date (Optional)
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#6B6560]" />
                        <Input
                          type="text"
                          value={requestForm.date}
                          onChange={(e) => setRequestForm(prev => ({ ...prev, date: e.target.value }))}
                          placeholder="e.g. Nov 2026, or tentative dates"
                          className="pl-9 text-xs rounded-xl border-[#E8E2D9] bg-white h-10"
                        />
                      </div>
                    </div>

                    {/* Planning Notes */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#221F1C]">
                        Tell us what you&apos;re planning
                      </label>
                      <textarea
                        rows={3}
                        value={requestForm.notes}
                        onChange={(e) => setRequestForm(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Briefly describe your celebration style, guest count, or any specific requirements..."
                        className="w-full text-xs rounded-xl border border-[#E8E2D9] bg-white p-3 focus:outline-none focus:ring-1 focus:ring-[#9E5338] resize-none"
                      />
                    </div>

                    {/* Contact details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-xs font-bold text-[#221F1C]">
                          Your Name *
                        </label>
                        <Input
                          type="text"
                          required
                          value={requestForm.name}
                          onChange={(e) => setRequestForm(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Your full name"
                          className="text-xs rounded-xl border-[#E8E2D9] bg-white h-10"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#221F1C]">
                          Email Address
                        </label>
                        <Input
                          type="email"
                          value={requestForm.email}
                          onChange={(e) => setRequestForm(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="name@example.com"
                          className="text-xs rounded-xl border-[#E8E2D9] bg-white h-10"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#221F1C]">
                          Phone Number
                        </label>
                        <Input
                          type="tel"
                          value={requestForm.phone}
                          onChange={(e) => setRequestForm(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="+91 98765 43210"
                          className="text-xs rounded-xl border-[#E8E2D9] bg-white h-10"
                        />
                      </div>
                    </div>

                    {/* Disclaimer text */}
                    <p className="text-[11px] text-[#8A847E] italic pt-1 leading-normal">
                      No guarantee of a match. We&apos;ll contact you if we find a suitable provider.
                    </p>

                    {/* Actions */}
                    <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#E8E2D9]">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsRequestModalOpen(false)}
                        className="rounded-full border-[#E8E2D9] text-xs font-semibold px-5 h-9"
                      >
                        Cancel
                      </Button>
                      <button
                        type="submit"
                        disabled={isSubmittingRequest}
                        className="inline-flex items-center gap-1.5 px-6 h-9 rounded-full bg-[#9E5338] hover:bg-[#86442B] active:scale-95 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer disabled:opacity-50"
                      >
                        {isSubmittingRequest ? (
                          <>
                            <Loader2 className="size-3.5 animate-spin" />
                            <span>Submitting...</span>
                          </>
                        ) : (
                          <>
                            <Send className="size-3.5" />
                            <span>Submit Request</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Marketplace() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FAF7F2] p-8 flex items-center justify-center">
        <Skeleton className="h-10 w-48 bg-[#F3EADF]" />
      </div>
    }>
      <MarketplaceContent />
    </Suspense>
  );
}
