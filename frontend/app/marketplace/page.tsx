'use client';

import { useState, useEffect } from 'react';
import PhotographerCard from '@/components/PhotographerCard';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Heart, 
  Camera, 
  Cake, 
  PartyPopper, 
  Briefcase, 
  Users, 
  Grid, 
  Search, 
  AlertCircle,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiService } from '@/lib/api';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const iconMap = {
  Grid,
  Heart,
  Camera,
  Cake,
  PartyPopper,
  Briefcase,
  Users,
};

const categories = [
  { id: 'all', name: 'All Categories', icon: 'Grid' },
  { id: 'wedding', name: 'Weddings', icon: 'Heart' },
  { id: 'pre-wedding', name: 'Pre-Wedding', icon: 'Camera' },
  { id: 'birthday', name: 'Celebrations', icon: 'Cake' },
  { id: 'party', name: 'Private Parties', icon: 'PartyPopper' },
  { id: 'corporate', name: 'Corporate Summits', icon: 'Briefcase' },
  { id: 'family', name: 'Family Portraits', icon: 'Users' },
] as const;

const pricingTypes = [
  { id: 'all', name: 'All Pricing' },
  { id: 'hourly', name: 'Hourly Rate' },
  { id: 'package', name: 'Full Package' },
  { id: 'custom', name: 'Custom Quote' },
];

export default function Marketplace() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedPricingType, setSelectedPricingType] = useState('all');
  const [vendors, setVendors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchVendors = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const params: any = {};
        if (selectedCategory !== 'all') params.category_id = selectedCategory;
        if (searchQuery) params.q = searchQuery;
        if (minPrice) params.min_price = minPrice;
        if (maxPrice) params.max_price = maxPrice;
        if (selectedPricingType !== 'all') params.pricing_type = selectedPricingType;
        
        const response = await apiService.services.search(params);
        const data = response.data.services || [];
        
        // Group services by vendor for marketplace view
        const uniqueVendors = Array.from(new Set(data.map((s: any) => s.vendor.id))).map(id => {
          const service = data.find((s: any) => s.vendor.id === id);
          return {
            ...service.vendor,
            base_price: service.base_price,
            service_categories: [service.category?.name].filter(Boolean)
          };
        });
        
        setVendors(uniqueVendors);
      } catch (err: any) {
        console.error('Error fetching vendors:', err);
        setError('Failed to load photographers. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchVendors, 300); // Debounce search
    return () => clearTimeout(timeoutId);
  }, [selectedCategory, searchQuery, minPrice, maxPrice, selectedPricingType]);

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1C1B19] selection:bg-[#F3E4DB] selection:text-[#8E4532]">
      <Header />
      
      {/* Header Banner */}
      <section className="py-14 border-b border-[#E5DED6] bg-[#FAF7F2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center space-y-3">
            
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#F3E4DB] border border-[#E5DED6] text-xs font-medium text-[#A9573D]">
              <span>Editorial Marketplace</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-serif font-semibold tracking-tight text-[#1C1B19]">
              Creative Partners & Event Pros
            </h1>
            <p className="text-sm sm:text-base text-[#6F6A64] font-normal">
              Connect with verified Indian photographers, videographers, and event specialists.
            </p>
            
            {/* Search & Filter Inputs */}
            <div className="pt-3 flex flex-col sm:flex-row gap-2.5 max-w-2xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#A9573D]" />
                <Input
                  type="text"
                  placeholder="Search by name, service, or city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 bg-white border-[#E5DED6] rounded-lg text-xs focus:border-[#A9573D] text-[#1C1B19] placeholder:text-[#6F6A64]"
                />
              </div>

              <Button 
                onClick={() => setShowFilters(!showFilters)}
                variant="ghost" 
                className={`h-11 px-4 rounded-lg border text-xs font-medium gap-2 transition-all cursor-pointer ${
                  showFilters 
                    ? 'bg-[#F3E4DB] border-[#A9573D]/40 text-[#8E4532]' 
                    : 'bg-white border-[#E5DED6] text-[#6F6A64] hover:bg-[#F5F0EA] hover:text-[#1C1B19]'
                }`}
              >
                <SlidersHorizontal className="size-3.5 text-[#A9573D]" />
                Filters
              </Button>
            </div>

            {/* Advanced Filters Drawer */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="max-w-2xl mx-auto pt-3 overflow-hidden"
                >
                  <div className="p-4 rounded-xl border border-[#E5DED6] bg-white grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-[#6F6A64]">Min Price (₹)</label>
                      <Input 
                        type="number" 
                        placeholder="e.g. 15000" 
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="bg-[#FAF7F2] border-[#E5DED6] h-9 rounded-md text-xs" 
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-[#6F6A64]">Max Price (₹)</label>
                      <Input 
                        type="number" 
                        placeholder="e.g. 75000" 
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="bg-[#FAF7F2] border-[#E5DED6] h-9 rounded-md text-xs" 
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-[#6F6A64]">Package Model</label>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="w-full h-9 justify-between rounded-md bg-[#FAF7F2] border border-[#E5DED6] text-xs font-medium text-[#1C1B19]">
                            {pricingTypes.find(t => t.id === selectedPricingType)?.name}
                            <ChevronDown className="size-3.5 opacity-60 text-[#A9573D]" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-48 bg-white border-[#E5DED6] text-[#1C1B19]">
                          {pricingTypes.map((type) => (
                            <DropdownMenuItem 
                              key={type.id} 
                              onClick={() => setSelectedPricingType(type.id)}
                              className="focus:bg-[#F3E4DB] focus:text-[#8E4532] cursor-pointer text-xs font-medium"
                            >
                              {type.name}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>
      </section>

      {/* Sticky Categories Bar */}
      <section className="sticky top-16 z-40 bg-[#FAF7F2]/90 backdrop-blur-md border-b border-[#E5DED6] py-2.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            {categories.map((category) => {
              const Icon = iconMap[category.icon as keyof typeof iconMap];
              const isSelected = selectedCategory === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 h-8 px-3.5 rounded-lg text-xs font-medium shrink-0 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#A9573D] text-white border border-[#A9573D]'
                      : 'bg-white text-[#6F6A64] hover:bg-[#F3E4DB] hover:text-[#1C1B19] border border-[#E5DED6]'
                  }`}
                >
                  <Icon className={`size-3.5 ${isSelected ? 'text-white' : 'text-[#A9573D]'}`} />
                  {category.name}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Vendor Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {error ? (
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
            <AlertCircle className="size-9 text-[#BE123C]" />
            <p className="text-sm text-[#6F6A64] font-normal">{error}</p>
            <Button variant="outline" className="rounded-lg border-[#E5DED6] text-xs" onClick={() => window.location.reload()}>Retry</Button>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-[#E5DED6] pb-3">
              <div>
                <h2 className="text-base font-serif font-semibold text-[#1C1B19]">Verified Creative Partners</h2>
                <p className="text-xs text-[#6F6A64] font-medium">Showing {vendors.length} matching experts</p>
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="aspect-[4/5] w-full rounded-xl bg-[#F5F0EA]" />
                    <Skeleton className="h-4 w-3/4 bg-[#F5F0EA]" />
                    <Skeleton className="h-3 w-1/2 bg-[#F5F0EA]" />
                  </div>
                ))}
              </div>
            ) : vendors.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-[#E5DED6] rounded-xl space-y-2 bg-white">
                <div className="size-10 rounded-lg bg-[#F5F0EA] flex items-center justify-center mx-auto text-[#A9573D]">
                  <Search className="size-5" />
                </div>
                <h3 className="text-base font-serif font-semibold text-[#1C1B19]">No experts found</h3>
                <p className="text-xs text-[#6F6A64] font-normal">Try adjusting your filters or search keywords.</p>
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchQuery('');
                    setMinPrice('');
                    setMaxPrice('');
                    setSelectedPricingType('all');
                  }} 
                  className="text-xs font-medium text-[#A9573D] hover:text-[#8E4532] cursor-pointer"
                >
                  Reset all filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {vendors.map((vendor, index) => (
                  <motion.div
                    key={`${vendor.id}-${index}`}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.04 }}
                  >
                    <PhotographerCard photographer={vendor} />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
