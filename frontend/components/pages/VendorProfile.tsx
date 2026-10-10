'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { apiService } from '../../lib/api';
import { MOCK_VENDORS } from '@/lib/mockVendorData';
import AyojLogo from '@/components/AyojLogo';
import { 
  ShieldCheck, 
  Star, 
  Clock, 
  MapPin, 
  IndianRupee, 
  Calendar as CalendarIcon,
  Check,
  Zap,
  ArrowLeft,
  ArrowRight,
  AlertTriangle,
  Info,
  Camera,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  Plus,
  Sparkles
} from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
// @ts-ignore
import { useAuth } from '@/lib/contexts/AuthContext';

interface Service {
  id: string;
  name: string;
  description: string;
  base_price: number;
  formatted_price: string;
  category: { name: string };
}

const VendorProfile = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const { user } = useAuth();
  const [vendor, setVendor] = useState<any>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [ratingStats, setRatingStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [verificationLoading, setVerificationLoading] = useState(false);
  
  const isOwner = user?.id === vendor?.user?.id;

  // Interactive Booking State
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [addons, setAddons] = useState<string[]>([]);
  const [bookingDate, setBookingDate] = useState('');

  // Category filter & Lightbox states
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const loadVendorData = useCallback(async () => {
    setLoading(true);
    const mockVendor = MOCK_VENDORS.find(v => v.id === params?.id) || MOCK_VENDORS[0];

    try {
      const [vendorRes, servicesRes, portfolioRes, reviewsRes] = await Promise.all([
        apiService.vendors.getById(params.id).catch(() => null),
        apiService.vendors.getServices(params.id).catch(() => null),
        apiService.vendors.getPortfolio(params.id).catch(() => null),
        apiService.vendors.getReviews(params.id).catch(() => null)
      ]);

      if (vendorRes?.data?.vendor) {
        const vendorData = vendorRes.data.vendor;
        setVendor(vendorData);

        // Portfolio items strictly belonging to THIS vendor from API
        const vendorPortfolioItems = 
          (portfolioRes?.data?.portfolio_items && portfolioRes.data.portfolio_items.length > 0)
            ? portfolioRes.data.portfolio_items
            : (vendorData.featured_portfolio && vendorData.featured_portfolio.length > 0)
              ? vendorData.featured_portfolio
              : [];

        setPortfolio(vendorPortfolioItems);

        const vendorServices = servicesRes?.data?.services || [];
        setServices(vendorServices);
        if (vendorServices.length > 0) {
          setSelectedService(vendorServices[0]);
        } else {
          setSelectedService(null);
        }

        setReviews(reviewsRes?.data?.reviews || []);
      } else {
        // Fallback only if this is an explicitly matched mock vendor ID in dev/mock data
        const matchedMock = MOCK_VENDORS.find(v => String(v.id) === String(params?.id));
        if (matchedMock) {
          setVendor({
            id: matchedMock.id,
            business_name: matchedMock.business_name,
            location: matchedMock.location,
            average_rating: matchedMock.rating,
            total_reviews: matchedMock.total_reviews,
            is_verified: matchedMock.verified,
            description: `Premier ${matchedMock.category} specialist based in ${matchedMock.location}. Providing top-tier services for grand weddings and celebrations.`,
          });
          setServices((matchedMock.services as any) || []);
          setPortfolio(matchedMock.portfolio || []);
          setReviews(matchedMock.recent_activity || []);
          setSelectedService((matchedMock.services?.[0] as any) || null);
        } else {
          setVendor(null);
          setPortfolio([]);
          setServices([]);
          setSelectedService(null);
        }
      }
    } catch (err) {
      setVendor(null);
      setPortfolio([]);
      setServices([]);
      setSelectedService(null);
    } finally {
      setLoading(false);
    }
  }, [params?.id]);

  useEffect(() => {
    loadVendorData();
  }, [loadVendorData]);

  // Extract all individual photos across collections so every uploaded media item is visible
  const allPhotos = useMemo(() => {
    const list: Array<{
      id: string | number;
      url: string;
      title: string;
      category: string;
      isFeatured?: boolean;
    }> = [];

    portfolio.forEach((item, itemIdx) => {
      const itemTitle = item.title || `Showcase ${itemIdx + 1}`;
      const itemCategory = item.category || 'General';
      const isFeatured = !!item.is_featured;

      // When portfolio item has an images array attached
      if (Array.isArray(item.images) && item.images.length > 0) {
        item.images.forEach((img: any, imgIdx: number) => {
          const imgUrl = typeof img === 'string' ? img : (img.url || img.thumbnail_url);
          if (imgUrl) {
            list.push({
              id: img.id || `${item.id}-img-${imgIdx}`,
              url: imgUrl,
              title: itemTitle,
              category: itemCategory,
              isFeatured
            });
          }
        });
      } else {
        // Single image per item fallback
        const singleUrl =
          item.primary_image_url ||
          item.image_url ||
          item.url ||
          (typeof item === 'string' ? item : null);

        if (singleUrl) {
          list.push({
            id: item.id || `photo-${itemIdx}`,
            url: singleUrl,
            title: itemTitle,
            category: itemCategory,
            isFeatured
          });
        }
      }
    });

    return list;
  }, [portfolio]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    allPhotos.forEach(p => {
      if (p.category) set.add(p.category);
    });
    return ['All', ...Array.from(set)];
  }, [allPhotos]);

  const filteredPhotos = useMemo(() => {
    if (selectedCategory === 'All') return allPhotos;
    return allPhotos.filter(p => p.category.toLowerCase() === selectedCategory.toLowerCase());
  }, [allPhotos, selectedCategory]);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const nextPhoto = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setLightboxIndex(prev => (prev !== null && filteredPhotos.length > 0 ? (prev + 1) % filteredPhotos.length : null));
  }, [filteredPhotos.length]);

  const prevPhoto = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setLightboxIndex(prev => (prev !== null && filteredPhotos.length > 0 ? (prev - 1 + filteredPhotos.length) % filteredPhotos.length : null));
  }, [filteredPhotos.length]);

  // Keyboard accessibility for lightbox navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextPhoto();
      if (e.key === 'ArrowLeft') prevPhoto();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, nextPhoto, prevPhoto]);

  const handleRequestVerification = async () => {
    try {
      setVerificationLoading(true);
      await apiService.profiles.requestVerification();
      toast.success('Verification request submitted successfully');
      loadVendorData();
    } catch (err: any) {
      toast.error(err.extractedMessage || 'Failed to request verification');
    } finally {
      setVerificationLoading(false);
    }
  };

  const totalPrice = useMemo(() => {
    if (!selectedService) return 0;
    const base = selectedService.base_price || 0;
    const addonPrice = addons.length * 5000;
    return base + addonPrice;
  }, [selectedService, addons]);

  const toggleAddon = (id: string) => {
    setAddons(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);
  };

  const todayStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  const handleBookingRequest = () => {
    if (!bookingDate) {
      toast.error('Please select a date first');
      return;
    }
    if (bookingDate < todayStr) {
      toast.error('Booking date cannot be in the past');
      return;
    }
    toast.success('Requesting booking for ' + bookingDate);
    router.push(`/booking/${selectedService?.id}?date=${bookingDate}`);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FBF8F4]">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#9E5338]"></div>
    </div>
  );

  if (!vendor) return null;

  return (
    <div className="min-h-screen bg-[#FBF8F4] text-[#221F1C] font-sans pb-20">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-[#FBF8F4]/95 backdrop-blur-md border-b border-[#E8E2D9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
           <button onClick={() => router.back()} className="flex items-center gap-1.5 text-[#6B6560] hover:text-[#9E5338] transition-colors text-xs font-medium cursor-pointer">
              <ArrowLeft className="size-4" /> Back to Search
           </button>
           <div className="flex items-center gap-4">
              <span className="text-sm font-serif font-bold text-[#221F1C]">{vendor.business_name}</span>
              <div className="h-4 w-px bg-[#E8E2D9]" />
              <div className="flex items-center gap-1">
                 <Star className="size-3.5 fill-[#D97706] text-[#D97706]" />
                 <span className="text-xs font-bold text-[#221F1C]">{vendor.average_rating || 4.9}</span>
              </div>
           </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Content Column */}
          <div className="lg:col-span-8 space-y-10">
            
            {/* Vendor Pro Banner Header */}
            <section className="space-y-4">
               <div className="flex flex-col sm:flex-row gap-5 items-start">
                  <div className="size-20 sm:size-24 rounded-2xl overflow-hidden relative border border-[#E8E2D9] bg-[#F3EADF] shrink-0 shadow-xs">
                    {(vendor.profile_image_url || vendor.image || allPhotos[0]?.url) ? (
                      <Image
                        src={vendor.profile_image_url || vendor.image || allPhotos[0]?.url}
                        alt={vendor.business_name}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#F3EADF] text-[#9E5338] font-serif font-bold text-2xl">
                        {(vendor.business_name || 'V').charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 flex-1">
                    <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#221F1C] tracking-tight">{vendor.business_name}</h1>
                    
                    {/* Verification Status Banner */}
                    {isOwner && vendor.verification_status !== 'verified' && (
                      <div className="p-4 rounded-xl bg-[#F3EADF] border border-[#E8E2D9] flex items-center justify-between gap-4 max-w-2xl">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="size-5 text-[#9E5338]" />
                          <div>
                            <p className="text-xs font-bold text-[#221F1C] uppercase">Profile Verification Status</p>
                            <p className="text-xs text-[#6B6560] mt-0.5">
                              {vendor.verification_status === 'pending_verification' 
                                ? 'Your verification request is currently under review.' 
                                : 'Get verified to build trust and increase marketplace bookings.'}
                            </p>
                          </div>
                        </div>
                        {vendor.verification_status === 'unverified' && (
                          <Button 
                            size="sm" 
                            disabled={verificationLoading}
                            onClick={handleRequestVerification}
                            className="bg-[#9E5338] hover:bg-[#86442B] text-white font-medium text-xs px-4 h-9 rounded-full"
                          >
                            {verificationLoading ? 'Requesting...' : 'Verify Now'}
                          </Button>
                        )}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-[#6B6560]">
                       <span className="flex items-center gap-1 text-[#221F1C]"><MapPin className="size-3.5 text-[#9E5338]" /> {vendor.location}</span>
                       <span className="flex items-center gap-1"><Clock className="size-3.5 text-[#9E5338]" /> Usually responds in 2h</span>
                       {vendor.is_verified && (
                         <span className="flex items-center gap-1 text-[#9E5338] border border-[#E8E2D9] px-2.5 py-0.5 rounded-full bg-[#F3EADF]">
                           <ShieldCheck className="size-3.5" /> Verified Pro
                         </span>
                       )}
                    </div>
                  </div>
               </div>
               <p className="text-[#6B6560] text-base font-normal leading-relaxed max-w-3xl">
                 {vendor.description || 'Professional creative specialist providing top-tier photography, videography, and event management services for grand weddings and milestone celebrations.'}
               </p>
            </section>

            {/* Gallery Preview & Uploaded Works */}
            <section className="space-y-4">
               <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-serif font-bold text-[#221F1C]">Selected Portfolio</h2>
                    <p className="text-xs text-[#6B6560] mt-0.5">
                      {allPhotos.length > 0 
                        ? `Showcase of client celebrations, candids, and editorial highlights (${allPhotos.length} ${allPhotos.length === 1 ? 'photo' : 'photos'})`
                        : 'Showcase of client celebrations, candids, and editorial highlights'}
                    </p>
                  </div>

                  {isOwner && (
                    <Link href="/vendor/dashboard?tab=portfolio">
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full border-[#E8E2D9] text-[#9E5338] hover:bg-[#F5ECE2] text-xs h-8 px-3 gap-1 shadow-xs cursor-pointer"
                      >
                        <Plus className="size-3.5" /> Manage Photos
                      </Button>
                    </Link>
                  )}
               </div>

               {/* Category filter pills if multiple categories */}
               {categories.length > 2 && (
                 <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
                   {categories.map((cat) => (
                     <button
                       key={cat}
                       type="button"
                       onClick={() => setSelectedCategory(cat)}
                       className={`px-3 py-1 rounded-full whitespace-nowrap transition-all text-xs font-medium border cursor-pointer ${
                         selectedCategory === cat
                           ? 'bg-[#9E5338] text-white border-[#9E5338] shadow-xs'
                           : 'bg-white text-[#6B6560] border-[#E8E2D9] hover:border-[#9E5338]/40 hover:text-[#221F1C]'
                       }`}
                     >
                       {cat}
                     </button>
                   ))}
                 </div>
               )}

               {/* Photo Grid or Empty State */}
               {allPhotos.length > 0 ? (
                 <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {filteredPhotos.map((photo, i) => (
                      <div 
                        key={photo.id || i}
                        onClick={() => openLightbox(i)}
                        className="relative aspect-4/5 rounded-2xl overflow-hidden border border-[#E8E2D9] bg-[#F3EADF] group cursor-pointer shadow-xs"
                      >
                         <Image 
                           src={photo.url} 
                           alt={photo.title || 'work gallery'} 
                           fill 
                           className="object-cover transition-transform duration-500 group-hover:scale-105" 
                           unoptimized 
                         />

                         {/* Hover Overlay */}
                         <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3.5">
                            <span className="self-start px-2 py-0.5 rounded-full text-[9px] font-bold bg-white/95 text-[#221F1C] backdrop-blur-xs shadow-xs">
                              {photo.category}
                            </span>
                            <div className="flex items-center justify-between text-white">
                              <span className="text-xs font-semibold line-clamp-1">{photo.title}</span>
                              <Eye className="size-4 shrink-0 ml-1.5 text-white/90" />
                            </div>
                         </div>
                      </div>
                    ))}
                 </div>
               ) : (
                 <div className="p-8 rounded-2xl border border-dashed border-[#E8E2D9] bg-[#FAF7F2] text-center space-y-3">
                   <div className="size-12 rounded-full bg-[#F3EADF] text-[#9E5338] flex items-center justify-center mx-auto">
                     <Camera className="size-6" />
                   </div>
                   <div className="space-y-1">
                     <h3 className="font-serif font-bold text-[#221F1C] text-base">No Portfolio Showcases Yet</h3>
                     <p className="text-xs text-[#6B6560] max-w-sm mx-auto">
                       This vendor has not uploaded portfolio galleries or showcases yet. Check back soon for event highlights!
                     </p>
                   </div>
                   {isOwner && (
                     <Link href="/vendor/dashboard?tab=portfolio">
                       <Button
                         size="sm"
                         className="mt-2 bg-[#9E5338] hover:bg-[#85432B] text-white rounded-full text-xs"
                       >
                         <Plus className="size-3.5 mr-1" /> Upload Your First Showcase
                       </Button>
                     </Link>
                   )}
                 </div>
               )}
            </section>

            {/* Packages */}
            <section className="space-y-4">
               <h2 className="text-xl font-serif font-bold text-[#221F1C]">Available Service Packages</h2>
               <div className="space-y-3">
                  {services.map((service) => (
                    <div 
                      key={service.id} 
                      onClick={() => setSelectedService(service)}
                      className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row justify-between gap-4 ${
                        selectedService?.id === service.id 
                          ? 'bg-white border-[#9E5338] ring-1 ring-[#9E5338]' 
                          : 'bg-white border-[#E8E2D9] hover:border-[#9E5338]/40'
                      }`}
                    >
                       <div className="space-y-1">
                          <div className="flex items-center gap-2">
                             <h3 className="font-serif font-bold text-[#221F1C] text-base">{service.name}</h3>
                             {selectedService?.id === service.id && <div className="size-4 rounded-full bg-[#9E5338] flex items-center justify-center text-white"><Check className="size-2.5" strokeWidth={3} /></div>}
                          </div>
                          <p className="text-xs text-[#6B6560] font-normal max-w-md">{service.description}</p>
                       </div>
                       <div className="sm:text-right shrink-0">
                          <p className="text-[10px] font-bold text-[#6B6560] uppercase tracking-wider">Starting at</p>
                          <p className="text-xl font-bold text-[#221F1C]">₹{service.base_price?.toLocaleString()}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </section>

            {/* Reviews Section */}
            <section className="p-6 rounded-2xl border border-[#E8E2D9] bg-white space-y-6">
               <div className="flex flex-col sm:flex-row justify-between gap-6 pb-6 border-b border-[#E8E2D9]">
                  <div>
                     <h2 className="text-3xl font-serif font-bold text-[#221F1C]">{vendor.average_rating || 4.9}</h2>
                     <div className="flex gap-1 my-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                           <Star
                              key={i}
                              className={`size-4 ${i <= Math.round(vendor.average_rating || 5) ? 'fill-[#D97706] text-[#D97706]' : 'text-stone-300'}`}
                           />
                        ))}
                     </div>
                     <p className="text-xs text-[#6B6560] font-medium">
                        Based on {vendor.total_reviews || 320} verified client reviews
                     </p>
                  </div>
               </div>

               <div className="space-y-4">
                  {(reviews.length > 0 ? reviews : [
                     { customer: { name: 'Priya Sharma' }, rating: 5, comment: 'Booked for our wedding reception. Incredible photos and seamless communication!', created_at: '2026-02-14' },
                     { customer: { name: 'Rahul Kapoor' }, rating: 5, comment: 'Punctual, professional, and delivered high quality color-graded assets right on schedule.', created_at: '2026-01-20' }
                  ]).slice(0, 3).map((review, i) => (
                     <div key={i} className="space-y-1.5 pb-4 border-b border-[#E8E2D9] last:border-b-0">
                        <div className="flex justify-between items-start">
                           <div>
                              <p className="text-xs font-bold text-[#221F1C]">{review.customer?.name || 'Verified Client'}</p>
                              <div className="flex gap-0.5 mt-0.5">
                                 {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                       key={star}
                                       className={`size-3 ${star <= review.rating ? 'fill-[#D97706] text-[#D97706]' : 'text-stone-300'}`}
                                    />
                                 ))}
                              </div>
                           </div>
                           <span className="text-[10px] text-[#6B6560]">
                              {new Date(review.created_at).toLocaleDateString()}
                           </span>
                        </div>
                        {review.comment && (
                           <p className="text-xs text-[#6B6560] italic font-normal">"{review.comment}"</p>
                        )}
                     </div>
                  ))}
               </div>
            </section>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-4">
            <div className="sticky top-20 space-y-4">
               <Card className="border border-[#E8E2D9] bg-white shadow-sm rounded-2xl overflow-hidden">
                  <div className="p-4 bg-[#F3EADF] border-b border-[#E8E2D9]">
                     <h3 className="text-xs font-bold text-[#9E5338] uppercase tracking-wider flex items-center gap-1.5">
                        <Zap className="size-3.5 fill-[#9E5338]" /> Quick Reservation
                     </h3>
                  </div>
                  <CardContent className="p-5 space-y-5">
                     
                     <div className="space-y-2">
                        <label className="text-xs font-medium text-[#221F1C] flex items-center gap-1.5">
                           <CalendarIcon className="size-3.5 text-[#9E5338]" /> Select Event Date
                        </label>
                        <input 
                          type="date" 
                          value={bookingDate}
                          min={todayStr}
                          onChange={(e) => setBookingDate(e.target.value)}
                          className="w-full bg-[#FBF8F4] border border-[#E8E2D9] rounded-xl h-11 px-3 text-[#221F1C] focus:outline-none focus:border-[#9E5338] text-xs font-medium" 
                        />
                     </div>

                     <div className="p-3 rounded-xl bg-[#FBF8F4] border border-[#E8E2D9] space-y-2">
                        <p className="text-[10px] font-bold text-[#6B6560] uppercase tracking-wider">Selected Package</p>
                        <div className="flex justify-between items-center text-xs">
                           <span className="font-bold text-[#221F1C]">{selectedService?.name}</span>
                           <span className="font-bold text-[#221F1C]">₹{selectedService?.base_price?.toLocaleString()}</span>
                        </div>
                     </div>

                     <div className="space-y-2">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#6B6560]">Optional Add-ons</p>
                        <div className="space-y-1.5">
                           {[
                             { id: 'exp', label: 'Express 48h Delivery', price: '₹5,000' },
                             { id: 'raw', label: 'Raw Asset Disk', price: '₹5,000' },
                           ].map(addon => (
                             <button 
                                key={addon.id}
                                onClick={() => toggleAddon(addon.id)}
                                className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-xs transition-all cursor-pointer ${
                                  addons.includes(addon.id) ? 'bg-[#F3EADF] border-[#9E5338] text-[#9E5338] font-bold' : 'bg-white border-[#E8E2D9] text-[#6B6560] hover:border-[#9E5338]/30'
                                }`}
                             >
                                <span>{addon.label}</span>
                                <span>{addon.price}</span>
                             </button>
                           ))}
                        </div>
                     </div>

                     <div className="pt-4 border-t border-[#E8E2D9] space-y-3">
                        <div className="flex justify-between items-end">
                           <span className="text-xs font-bold text-[#6B6560] uppercase tracking-wider">Estimated Total</span>
                           <div className="text-right">
                              <span className="text-2xl font-bold text-[#221F1C] flex items-center justify-end">
                                 ₹{totalPrice.toLocaleString()}
                              </span>
                           </div>
                        </div>
                        
                        <Button 
                          onClick={handleBookingRequest}
                          className="w-full h-11 rounded-full bg-[#9E5338] hover:bg-[#86442B] text-white font-medium text-xs transition-colors shadow-sm"
                        >
                           Confirm Booking Request
                           <ArrowRight className="size-4 ml-1.5" />
                        </Button>
                     </div>
                  </CardContent>
               </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Full-Screen High-Resolution Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && filteredPhotos[lightboxIndex] && (
          <div 
            onClick={closeLightbox}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md cursor-zoom-out"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={closeLightbox}
              className="absolute top-5 right-5 size-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-50 cursor-pointer"
            >
              <X className="size-5" />
            </button>

            {/* Previous Arrow */}
            {filteredPhotos.length > 1 && (
              <button
                type="button"
                onClick={prevPhoto}
                className="absolute left-4 top-1/2 -translate-y-1/2 size-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-50 cursor-pointer"
              >
                <ChevronLeft className="size-6" />
              </button>
            )}

            {/* Next Arrow */}
            {filteredPhotos.length > 1 && (
              <button
                type="button"
                onClick={nextPhoto}
                className="absolute right-4 top-1/2 -translate-y-1/2 size-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-50 cursor-pointer"
              >
                <ChevronRight className="size-6" />
              </button>
            )}

            {/* Center Image Container */}
            <div 
              onClick={(e) => e.stopPropagation()} 
              className="relative max-w-4xl max-h-[85vh] w-full flex flex-col items-center cursor-default"
            >
              <div className="relative w-full h-[70vh]">
                <Image
                  src={filteredPhotos[lightboxIndex].url}
                  alt={filteredPhotos[lightboxIndex].title || 'Photo view'}
                  fill
                  unoptimized
                  className="object-contain"
                />
              </div>

              {/* Caption pill */}
              <div className="mt-3 px-4 py-2 rounded-full bg-black/60 backdrop-blur-md text-white text-xs flex items-center gap-3">
                <span className="font-semibold">{filteredPhotos[lightboxIndex].title}</span>
                <span className="text-white/40">•</span>
                <span className="text-white/80">{filteredPhotos[lightboxIndex].category}</span>
                <span className="text-white/40">•</span>
                <span className="text-white/60">
                  {lightboxIndex + 1} of {filteredPhotos.length}
                </span>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VendorProfile;
