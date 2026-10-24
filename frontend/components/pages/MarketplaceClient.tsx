'use client';

import { useState, useEffect, useMemo, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import PhotographerCard from '@/components/PhotographerCard';
import Header from '@/components/Header';
import { Skeleton } from '@/components/ui/skeleton';
import { SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { apiService } from '@/lib/api';
import { useLocation } from '@/lib/contexts/LocationContext';
import Footer from '@/components/Footer';
import RecentlyViewedStrip from '@/components/RecentlyViewedStrip';
import {
  TRADE_CATEGORIES,
  OCCASIONS,
  SORT_OPTIONS,
  MarketplaceHero,
  MarketplaceSidebarFilters,
  MarketplaceControlsBar,
  MarketplaceEmptyState,
  MarketplaceRequestModal,
  MarketplaceMobileFilterDrawer,
} from '@/components/marketplace';

function MarketplaceContent() {
  const searchParams = useSearchParams();

  // Parse initial state from URL query parameters
  const initialCategoryParam = searchParams.get('category') || searchParams.get('trade') || 'all';
  const initialOccasionParam = searchParams.get('occasion') || 'all';
  const initialSearchParam = searchParams.get('search') || searchParams.get('q') || '';
  const initialLocationParam = searchParams.get('location') || 'all';
  const initialMinPrice = searchParams.get('min_price') || '';
  const initialMaxPrice = searchParams.get('max_price') || '';
  const initialSort = searchParams.get('sort') || 'featured';

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
  const [minPrice, setMinPrice] = useState<string>(initialMinPrice);
  const [maxPrice, setMaxPrice] = useState<string>(initialMaxPrice);
  const [sortBy, setSortBy] = useState<string>(initialSort);

  const { selectedCity } = useLocation();

  const [apiVendors, setApiVendors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);
  const [showDesktopFilters, setShowDesktopFilters] = useState<boolean>(true);

  // Concierge Request Modal state
  const [isRequestModalOpen, setIsRequestModalOpen] = useState<boolean>(false);
  const [requestedService, setRequestedService] = useState<string>('Photography');

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
    setRequestedService(serviceName || 'Photography');
    setIsRequestModalOpen(true);
  };

  // Collapsible sidebar accordion sections
  const [openSections, setOpenSections] = useState({
    category: true,
    occasion: false,
    location: true,
    price: true,
  });

  const toggleSection = (section: 'category' | 'occasion' | 'location' | 'price') => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Bi-directional URL synchronization
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const params = new URLSearchParams();
    if (selectedCategory && selectedCategory !== 'all') params.set('category', selectedCategory);
    if (selectedOccasion && selectedOccasion !== 'all') params.set('occasion', selectedOccasion);
    if (selectedLocation && selectedLocation !== 'all' && selectedLocation !== 'All Locations') params.set('location', selectedLocation);
    if (searchQuery.trim()) params.set('search', searchQuery.trim());
    if (minPrice) params.set('min_price', minPrice);
    if (maxPrice) params.set('max_price', maxPrice);
    if (sortBy && sortBy !== 'featured') params.set('sort', sortBy);

    const qs = params.toString();
    const newPath = qs ? `/marketplace?${qs}` : '/marketplace';
    window.history.replaceState(null, '', newPath);
  }, [selectedCategory, selectedOccasion, selectedLocation, searchQuery, minPrice, maxPrice, sortBy]);

  // Support native browser Back & Forward navigation via popstate
  useEffect(() => {
    const handlePopState = () => {
      const sp = new URLSearchParams(window.location.search);
      const cat = sp.get('category') || sp.get('trade') || 'all';
      const occ = sp.get('occasion') || 'all';
      const loc = sp.get('location') || 'all';
      const q = sp.get('search') || sp.get('q') || '';
      const minP = sp.get('min_price') || '';
      const maxP = sp.get('max_price') || '';
      const s = sp.get('sort') || 'featured';

      setSelectedCategory(cat);
      setSelectedOccasion(occ);
      setSelectedLocation(loc);
      setSearchQuery(q);
      setMinPrice(minP);
      setMaxPrice(maxP);
      setSortBy(s);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Track last URL search string to detect genuine external Next.js navigation (e.g. from navbar/footer)
  const lastKnownSearchStr = useRef(searchParams.toString());
  useEffect(() => {
    const currentSearchStr = searchParams.toString();
    if (currentSearchStr !== lastKnownSearchStr.current) {
      lastKnownSearchStr.current = currentSearchStr;
      const cat = searchParams.get('category') || searchParams.get('trade') || 'all';
      const occ = searchParams.get('occasion') || 'all';
      const loc = searchParams.get('location') || 'all';
      const q = searchParams.get('search') || searchParams.get('q') || '';
      const minP = searchParams.get('min_price') || '';
      const maxP = searchParams.get('max_price') || '';
      const s = searchParams.get('sort') || 'featured';

      const normalizedCat = cat.toLowerCase().trim();
      const foundCat = TRADE_CATEGORIES.find(
        c => c.id === normalizedCat || c.slug === normalizedCat || c.name.toLowerCase() === normalizedCat
      );
      setSelectedCategory(foundCat ? foundCat.slug : 'all');

      const normalizedOcc = occ.toLowerCase().trim();
      const foundOcc = OCCASIONS.find(
        o => o.id === normalizedOcc || o.name.toLowerCase() === normalizedOcc
      );
      setSelectedOccasion(foundOcc ? foundOcc.id : 'all');

      setSelectedLocation(loc);
      setSearchQuery(q);
      setMinPrice(minP);
      setMaxPrice(maxP);
      setSortBy(s);
    }
  }, [searchParams]);

  // Fetch from backend
  useEffect(() => {
    let isMounted = true;
    const fetchVendors = async () => {
      if (apiVendors.length === 0) {
        setIsLoading(true);
      }
      try {
        const params: any = { per_page: 100 };
        if (searchQuery) params.q = searchQuery;
        if (minPrice) params.min_price = minPrice;
        if (maxPrice) params.max_price = maxPrice;

        const response = await apiService.services.search(params);
        const data = response.data?.services || [];

        // Aggregate services by vendor
        const uniqueVendors = Array.from(new Set(data.map((s: any) => s.vendor?.id))).filter(Boolean).map(id => {
          const vendorServices = data.filter((s: any) => s.vendor?.id === id);
          const firstService = vendorServices[0];
          
          const serviceImages = vendorServices.flatMap((s: any) => 
            (s.images || []).map((img: any) => typeof img === 'string' ? img : img.url).filter(Boolean)
          );

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
          setApiVendors((prev) => {
            if (uniqueVendors.length > 0) {
              const prevMap = new Map(prev.map((v) => [v.id, v]));
              uniqueVendors.forEach((v) => prevMap.set(v.id, v));
              return Array.from(prevMap.values());
            }
            return prev.length > 0 ? prev : uniqueVendors;
          });
        }
      } catch (err: any) {
        console.warn('Background vendor fetch failed:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    const debounceMs = searchQuery ? 600 : 0;
    const timer = setTimeout(fetchVendors, debounceMs);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [searchQuery, minPrice, maxPrice]);

  // Master vendor list
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
        const rawQuery = searchQuery.toLowerCase().trim();
        const stemQuery = rawQuery.replace(/(ers|er|or|ors|ies|s)$/i, '');
        const queryVariants = [rawQuery];
        if (stemQuery.length >= 3 && stemQuery !== rawQuery) queryVariants.push(stemQuery);
        if (rawQuery.startsWith('photo')) queryVariants.push('photo', 'photograph');
        if (rawQuery.startsWith('cater')) queryVariants.push('cater');
        if (rawQuery.startsWith('decor')) queryVariants.push('decor');

        const matchesQuery = queryVariants.some(q => 
          vendorName.includes(q) ||
          vendorDesc.includes(q) ||
          vendorLoc.includes(q) ||
          vendorCategories.some((c: string) => c.includes(q))
        );
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
    return count;
  }, [selectedCategory, selectedOccasion, selectedLocation, minPrice, maxPrice]);

  const hasActiveFilters = 
    selectedCategory !== 'all' || 
    selectedOccasion !== 'all' || 
    selectedLocation !== 'all' || 
    Boolean(searchQuery) || 
    Boolean(minPrice) || 
    Boolean(maxPrice);

  const resetAllFilters = () => {
    setSelectedCategory('all');
    setSelectedOccasion('all');
    setSelectedLocation('all');
    setSearchQuery('');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('featured');
    window.history.replaceState(null, '', '/marketplace');
  };

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
      
      {/* Search Hero Capsule and Filter Presets */}
      <MarketplaceHero
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedLocation={selectedLocation}
        setSelectedLocation={setSelectedLocation}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        minPrice={minPrice}
        setMinPrice={setMinPrice}
        maxPrice={maxPrice}
        setMaxPrice={setMaxPrice}
        getCategoryCount={getCategoryCount}
      />

      {/* Pick Up Where You Left Off Strip */}
      <RecentlyViewedStrip />

      {/* Mobile Slide-in Filter Drawer */}
      <MarketplaceMobileFilterDrawer
        isOpen={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
        activeFiltersCount={activeFiltersCount}
        onResetAll={resetAllFilters}
        resultsCount={sortedVendors.length}
      >
        <MarketplaceSidebarFilters
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedOccasion={selectedOccasion}
          setSelectedOccasion={setSelectedOccasion}
          selectedLocation={selectedLocation}
          setSelectedLocation={setSelectedLocation}
          minPrice={minPrice}
          setMinPrice={setMinPrice}
          maxPrice={maxPrice}
          setMaxPrice={setMaxPrice}
          openSections={openSections}
          toggleSection={toggleSection}
          getCategoryCount={getCategoryCount}
          isMobile
          onMobileClose={() => setIsMobileFilterOpen(false)}
        />
      </MarketplaceMobileFilterDrawer>

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
              <MarketplaceSidebarFilters
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                selectedOccasion={selectedOccasion}
                setSelectedOccasion={setSelectedOccasion}
                selectedLocation={selectedLocation}
                setSelectedLocation={setSelectedLocation}
                minPrice={minPrice}
                setMinPrice={setMinPrice}
                maxPrice={maxPrice}
                setMaxPrice={setMaxPrice}
                openSections={openSections}
                toggleSection={toggleSection}
                getCategoryCount={getCategoryCount}
              />
            </aside>
          )}

          {/* Right Column: Listings and Active Filters */}
          <main id="marketplace-listings" className="flex-1 min-w-0 space-y-4">
            
            <MarketplaceControlsBar
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              selectedOccasion={selectedOccasion}
              setSelectedOccasion={setSelectedOccasion}
              selectedLocation={selectedLocation}
              setSelectedLocation={setSelectedLocation}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              minPrice={minPrice}
              setMinPrice={setMinPrice}
              maxPrice={maxPrice}
              setMaxPrice={setMaxPrice}
              sortBy={sortBy}
              setSortBy={setSortBy}
              showDesktopFilters={showDesktopFilters}
              setShowDesktopFilters={setShowDesktopFilters}
              openMobileFilter={() => setIsMobileFilterOpen(true)}
              resetAllFilters={resetAllFilters}
              activeFiltersCount={activeFiltersCount}
              hasActiveFilters={hasActiveFilters}
              totalResults={sortedVendors.length}
              activeCategoryName={activeCategoryObj?.name}
              activeOccasionName={activeOccasionObj?.name}
            />

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
              <MarketplaceEmptyState
                city={currentCityForCopy}
                hasActiveFilters={hasActiveFilters}
                minPrice={minPrice}
                maxPrice={maxPrice}
                selectedLocation={selectedLocation}
                selectedCategory={selectedCategory}
                setMinPrice={setMinPrice}
                setMaxPrice={setMaxPrice}
                setSelectedLocation={setSelectedLocation}
                setSelectedCategory={setSelectedCategory}
                resetAllFilters={resetAllFilters}
                onOpenRequestModal={handleOpenRequestModal}
                recommendedVendors={allVendors}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 pt-2">
                {sortedVendors.map((vendor) => (
                  <PhotographerCard 
                    key={vendor.id}
                    photographer={vendor} 
                    onQuickInquire={(v) => handleOpenRequestModal(v.name || v.business_name)}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </section>

      {/* Modern Marketplace Footer */}
      <Footer />

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
      <MarketplaceRequestModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        initialService={requestedService}
        city={currentCityForCopy}
      />
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
