'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiService } from '../../lib/api';
import { ShieldCheck, Star, Search, MapPin, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface Service {
  id: string;
  name: string;
  description: string;
  base_price: number;
  formatted_price: string;
  pricing_type: string;
  vendor_profile: {
    id: string;
    business_name: string;
    location: string;
    average_rating: number;
    total_reviews: number;
    verification_status: string;
  };
  category: {
    name: string;
  };
}

const ServiceSearch = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const searchParams = useSearchParams();

  const loadServices = useCallback(async (filters: { search?: string; category?: string } = {}) => {
    try {
      setLoading(true);
      const response = await apiService.services.search({
        q: filters.search || searchQuery,
        category: filters.category || selectedCategory,
        status: 'active'
      });
      setServices(response.data.services || []);
    } catch (error) {
      console.error('Error loading services:', error);
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory]);

  useEffect(() => {
    const initialSearch = searchParams.get('search') || searchParams.get('q') || '';
    const initialCategory = searchParams.get('category') || '';

    setSearchQuery(initialSearch);
    setSelectedCategory(initialCategory);

    loadServices({ search: initialSearch, category: initialCategory });
  }, [searchParams, loadServices]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadServices();
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">Find Professionals</h1>
            <p className="text-slate-400 font-light text-lg">Discover and book the best talent for your next event.</p>
          </div>
        </div>
        
        {/* Search Form - Dark Modern Style */}
        <div className="bg-card/50 backdrop-blur-xl p-2 rounded-2xl md:rounded-full border border-border/50 shadow-2xl mb-16 max-w-5xl mx-auto">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-2">
            <div className="flex-1 flex items-center px-6 gap-3">
              <Search className="size-5 text-primary" />
              <input
                type="text"
                placeholder="Search by name, service or style..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-4 bg-transparent focus:outline-none font-medium text-foreground placeholder:text-slate-500"
              />
            </div>
            
            <div className="hidden md:block w-px h-8 bg-border/50 self-center" />
            
            <div className="px-4 relative flex items-center">
              <MapPin className="size-5 text-primary mr-2" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="py-4 bg-transparent focus:outline-none font-medium text-slate-300 appearance-none cursor-pointer pr-10"
              >
                <option value="" className="bg-card">All Categories</option>
                <option value="photography" className="bg-card">Photography</option>
                <option value="videography" className="bg-card">Videography</option>
                <option value="event-management" className="bg-card">Event Management</option>
                <option value="catering" className="bg-card">Catering</option>
              </select>
              <ChevronDown className="size-4 text-slate-500 absolute right-4 pointer-events-none" />
            </div>

            <button
              type="submit"
              className="px-10 py-4 bg-primary text-white rounded-xl md:rounded-full hover:bg-primary/90 transition-all font-bold shadow-lg shadow-primary/20 transform hover:scale-[1.02] active:scale-95"
            >
              Search
            </button>
          </form>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-[450px] bg-card/50 rounded-3xl animate-pulse border border-border/20" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {services.map((service) => (
                <div key={service.id} className="group bg-card rounded-[2rem] border border-border/50 overflow-hidden hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/30 transition-all duration-500 flex flex-col">
                  <div className="aspect-[4/3] bg-secondary/30 relative overflow-hidden">
                    <div className="absolute top-6 left-6 z-10">
                      <Badge className="bg-background/80 backdrop-blur-md text-primary border border-primary/20 hover:bg-background px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-bold">
                        {service.category.name}
                      </Badge>
                    </div>
                    <div className="w-full h-full bg-slate-900/50 flex flex-col items-center justify-center text-slate-600 font-medium gap-3">
                      <div className="p-4 rounded-full bg-slate-800/50 border border-slate-700/50">
                        <Search className="size-8 opacity-20" />
                      </div>
                      <span className="text-sm opacity-40 uppercase tracking-tighter">No Preview Available</span>
                    </div>
                  </div>
                  
                  <div className="p-8 flex-1 flex flex-col relative">
                    <div className="flex justify-between items-start mb-6">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <p className="text-[10px] font-bold text-primary uppercase tracking-widest">
                            {service.vendor_profile.business_name}
                          </p>
                          {service.vendor_profile.verification_status === 'verified' && (
                            <ShieldCheck size={14} className="text-blue-400 fill-blue-400/10" />
                          )}
                        </div>
                        <h3 className="text-2xl font-bold text-white group-hover:text-primary transition-colors leading-tight">
                          {service.name}
                        </h3>
                      </div>
                      <div className="flex items-center gap-1.5 bg-primary/10 px-2.5 py-1 rounded-lg border border-primary/20">
                        <Star size={14} className="fill-primary text-primary" />
                        <span className="text-xs font-bold text-primary">{service.vendor_profile.average_rating || '5.0'}</span>
                      </div>
                    </div>

                    <p className="text-slate-400 font-light text-sm line-clamp-2 mb-8 flex-1 leading-relaxed">
                      {service.description}
                    </p>

                    <div className="flex items-center justify-between mt-auto pt-6 border-t border-border/30">
                      <div className="space-y-0.5">
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest leading-none">Starting from</p>
                        <span className="text-2xl font-bold text-white">
                          {service.formatted_price}
                        </span>
                      </div>
                      <Link 
                        href={`/photographer/${service.vendor_profile.id}`}
                        className="bg-secondary text-white px-6 py-3 rounded-full hover:bg-primary transition-all text-sm font-bold border border-border/50"
                      >
                        View Profile
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {services.length === 0 && (
              <div className="text-center py-32 bg-card/30 rounded-[3rem] border border-dashed border-border/50 max-w-3xl mx-auto">
                <Search className="size-16 mx-auto mb-6 text-slate-700" strokeWidth={1} />
                <h3 className="text-xl text-slate-300 font-medium mb-2">No professionals found</h3>
                <p className="text-slate-500 font-light italic">Try adjusting your search keywords or categories.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ServiceSearch;
