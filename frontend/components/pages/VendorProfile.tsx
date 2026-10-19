'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { apiService } from '../../lib/api';
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
  Sparkles,
  Heart,
  Share2,
  Globe,
  Instagram,
  Phone,
  Plane,
  Store,
  MessageCircle,
  BadgeCheck,
  ShieldAlert
} from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
// @ts-ignore
import { useAuth } from '@/lib/contexts/AuthContext';
import VerifiedPartnerBadge from '../VerifiedPartnerBadge';

interface Service {
  id: string | number;
  name: string;
  description: string;
  base_price?: number;
  formatted_price?: string;
  pricing_type?: string;
  category?: { id?: number | string; name: string; slug?: string };
  categories?: Array<{ id?: number | string; name: string; slug?: string }>;
  service_category?: { id?: number | string; name: string; slug?: string };
  images?: Array<{ id: number; url: string; is_primary?: boolean }>;
}

const VendorProfile = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const { user } = useAuth();
  const [vendor, setVendor] = useState<any>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [ratingStats, setRatingStats] = useState<any>(null);
  const [availabilitySlots, setAvailabilitySlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  
  const isOwner = user?.id === vendor?.user?.id;

  // Interactive Booking State
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [viewingService, setViewingService] = useState<Service | null>(null);
  const [addons, setAddons] = useState<string[]>([]);
  const [bookingDate, setBookingDate] = useState('');

  // Category filter & Lightbox states
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const loadVendorData = useCallback(async () => {
    setLoading(true);

    try {
      const [vendorRes, servicesRes, portfolioRes, reviewsRes, availabilityRes] = await Promise.all([
        apiService.vendors.getById(params.id).catch(() => null),
        apiService.vendors.getServices(params.id).catch(() => null),
        apiService.vendors.getPortfolio(params.id).catch(() => null),
        apiService.vendors.getReviews(params.id).catch(() => null),
        apiService.vendors.getAvailability(params.id).catch(() => null)
      ]);

      if (vendorRes?.data?.vendor) {
        const vendorData = vendorRes.data.vendor;
        setVendor(vendorData);

        // Availability slots
        const slots = availabilityRes?.data?.availability_slots || [];
        setAvailabilitySlots(slots);

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
        setSelectedService(null);

        setReviews(reviewsRes?.data?.reviews || []);
      } else {
        setVendor(null);
        setPortfolio([]);
        setServices([]);
        setSelectedService(null);
        setReviews([]);
      }
    } catch (err) {
      setVendor(null);
      setPortfolio([]);
      setServices([]);
      setSelectedService(null);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [params?.id]);

  useEffect(() => {
    loadVendorData();
  }, [loadVendorData]);

  const isOwnProfile = user?.role === 'vendor' && (
    (user.vendor_id && String(user.vendor_id) === String(vendor?.id)) ||
    (user.vendor?.id && String(user.vendor.id) === String(vendor?.id)) ||
    (user.vendor?.slug && vendor?.slug && user.vendor.slug === vendor.slug) ||
    (user.id && vendor?.user_id && String(user.id) === String(vendor.user_id))
  );

  // Check customer favorite status
  useEffect(() => {
    if (user && vendor?.id && !isOwnProfile) {
      apiService.favorites.check(vendor.id)
        .then(res => setIsFavorite(!!res.data?.is_favorite))
        .catch(() => setIsFavorite(false));
    }
  }, [user, vendor?.id, isOwnProfile]);

  // Operating categories
  const vendorCategoriesList = useMemo(() => {
    if (!vendor) return [];
    if (vendor.categories && Array.isArray(vendor.categories) && vendor.categories.length > 0) {
      return vendor.categories;
    }
    if (vendor.service_categories && Array.isArray(vendor.service_categories)) {
      return vendor.service_categories.map((sc: string, idx: number) => ({
        id: idx,
        name: sc,
        is_primary: idx === 0
      }));
    }
    return [];
  }, [vendor]);

  const hasGenuineReviews = Boolean(
    vendor?.total_reviews &&
    Number(vendor.total_reviews) > 0 &&
    vendor?.average_rating &&
    Number(vendor.average_rating) > 0
  );

  const handleToggleFavorite = async () => {
    if (!user) {
      toast.info('Please log in to save this vendor to your favorites.');
      router.push(`/login?redirect=/vendors/${params.id}`);
      return;
    }
    if (isOwnProfile) {
      toast.info('You cannot favorite your own business profile');
      return;
    }
    setFavoriteLoading(true);
    try {
      if (isFavorite) {
        await apiService.favorites.removeByVendor(vendor.id);
        setIsFavorite(false);
        toast.success(`Removed ${vendor.business_name} from favorites`);
      } else {
        await apiService.favorites.add(vendor.id);
        setIsFavorite(true);
        toast.success(`Saved ${vendor.business_name} to favorites!`);
      }
      window.dispatchEvent(new CustomEvent('favorites-updated'));
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.message || 'Could not update favorites';
      toast.error(errorMsg);
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleShareProfile = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const shareData = {
      title: `${vendor?.business_name || 'Vendor'} on Ayoj`,
      text: `Discover verified celebration artist ${vendor?.business_name || 'Vendor'} on Ayoj`,
      url,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      toast.success('Profile link copied to clipboard!');
    } catch (err) {
      toast.error('Unable to copy link.');
    }
  };

  const isDateInAvailableSlots = useMemo(() => {
    if (!bookingDate || availabilitySlots.length === 0) return null;
    return availabilitySlots.some(slot => slot.date === bookingDate && slot.is_available);
  }, [bookingDate, availabilitySlots]);

  const upcomingAvailableSlots = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return availabilitySlots
      .filter(s => s.date >= today && s.is_available)
      .slice(0, 3);
  }, [availabilitySlots]);

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
      <span className="sr-only">Loading...</span>
    </div>
  );

  if (!vendor) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FBF8F4] px-4 text-center">
      <h2 className="text-2xl font-serif font-bold text-[#221F1C] mb-2">Vendor Not Found</h2>
      <p className="text-[#6B6560] mb-6 text-sm">Failed to load vendor profile or the requested vendor does not exist.</p>
      <button
        type="button"
        onClick={() => router.push('/marketplace')}
        className="px-5 py-2.5 bg-[#9E5338] text-white rounded-xl text-xs font-semibold hover:bg-[#86442B] transition-colors cursor-pointer shadow-xs"
      >
        Back to Marketplace
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FBF8F4] text-[#221F1C] font-sans pb-20">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-[#FBF8F4]/95 backdrop-blur-md border-b border-[#E8E2D9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
           <button onClick={() => router.back()} className="flex items-center gap-1.5 text-[#6B6560] hover:text-[#9E5338] transition-colors text-xs font-medium cursor-pointer">
              <ArrowLeft className="size-4" /> Back to Search
           </button>
           <div className="flex items-center gap-3">
              <span className="hidden sm:inline text-sm font-serif font-bold text-[#221F1C]">{vendor.business_name}</span>
              {hasGenuineReviews ? (
                <div className="hidden sm:flex items-center gap-1">
                  <Star className="size-3.5 fill-[#D97706] text-[#D97706]" />
                  <span className="text-xs font-bold text-[#221F1C]">{Number(vendor.average_rating).toFixed(1)}</span>
                  <span className="text-[11px] text-[#6B6560]">({vendor.total_reviews})</span>
                </div>
              ) : (
                <div className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FAF7F2] text-[11px] font-medium text-[#6B6560] border border-[#E8E2D9]">
                  <Sparkles className="size-3 text-[#9E5338]" />
                  <span>New on Ayoj</span>
                </div>
              )}
              <div className="hidden sm:block h-4 w-px bg-[#E8E2D9]" />

              {/* Save / Favorite Button */}
              <button
                type="button"
                onClick={handleToggleFavorite}
                disabled={favoriteLoading}
                aria-label={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                  isFavorite
                    ? 'bg-rose-50 text-rose-600 border-rose-200 shadow-xs'
                    : 'bg-white text-[#221F1C] border-[#E8E2D9] hover:border-rose-300 hover:text-rose-600'
                }`}
              >
                <Heart className={`size-3.5 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
                <span>{isFavorite ? 'Saved' : 'Save'}</span>
              </button>

              {/* Share Profile Button */}
              <button
                type="button"
                onClick={handleShareProfile}
                aria-label="Share vendor profile"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white text-[#221F1C] border border-[#E8E2D9] hover:border-[#9E5338] hover:text-[#9E5338] transition-all cursor-pointer shadow-xs"
              >
                <Share2 className="size-3.5" />
                <span>Share</span>
              </button>
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
                    {isOwner && !vendor.is_verified && (
                      <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E8E2D9] flex flex-col sm:flex-row sm:items-center justify-between gap-4 max-w-2xl">
                        <div className="flex items-start gap-3">
                          <ShieldAlert className="size-5 text-[#9E5338] shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-bold text-[#221F1C] uppercase tracking-wide">
                              Ayoj Verified Partner Badge: {vendor.verification_status === 'pending_verification' ? 'Under Review' : 'Action Required'}
                            </p>
                            <p className="text-xs text-[#6B6560] mt-0.5">
                              {vendor.verification_status === 'pending_verification'
                                ? 'Your credentials have been submitted and are being reviewed by Ayoj trust operations.'
                                : 'Complete your business registration (GSTIN), phone, and service packages to earn the Verified Partner badge.'}
                            </p>
                          </div>
                        </div>
                        <Button
                          asChild
                          size="sm"
                          className="bg-[#9E5338] hover:bg-[#86442B] text-white font-medium text-xs px-4 h-9 rounded-full shrink-0"
                        >
                          <Link href="/dashboard/vendor/settings?tab=verification">
                            {vendor.verification_status === 'pending_verification' ? 'View Status' : 'Complete Verification'}
                          </Link>
                        </Button>
                      </div>
                    )}

                    {/* Operating Categories Badges */}
                    {vendorCategoriesList.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2 pt-0.5">
                        {vendorCategoriesList.map((cat: any) => {
                          const isPrimary = Boolean(
                            cat.is_primary ||
                            (vendor.primary_category && (
                              cat.id === vendor.primary_category.id ||
                              cat.name?.toLowerCase() === vendor.primary_category.name?.toLowerCase()
                            ))
                          );
                          return (
                            <span
                              key={cat.id || cat.name}
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                                isPrimary
                                  ? 'bg-[#F3EADF] text-[#9E5338] border-[#E8E2D9] shadow-xs'
                                  : 'bg-white text-[#221F1C] border-[#E8E2D9]'
                              }`}
                            >
                              {isPrimary && <Star className="size-3 fill-[#9E5338] text-[#9E5338]" />}
                              <span>{cat.name}</span>
                              {isPrimary && <span className="text-[10px] uppercase font-bold text-[#9E5338]/80">(Primary)</span>}
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {/* Operational & Trust Badges */}
                    <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-[#6B6560]">
                       <span className="flex items-center gap-1 text-[#221F1C] font-semibold">
                         <MapPin className="size-3.5 text-[#9E5338]" /> {vendor.location}
                       </span>
                       {hasGenuineReviews ? (
                         <span className="flex items-center gap-1 text-[#221F1C] font-semibold">
                           <Star className="size-3.5 fill-[#D97706] text-[#D97706]" />
                           <span>{Number(vendor.average_rating).toFixed(1)}</span>
                           <span className="text-[#6B6560] font-normal">({vendor.total_reviews})</span>
                         </span>
                       ) : (
                         <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#6B6560] border border-[#E8E2D9] px-2.5 py-0.5 rounded-full bg-[#FAF7F2]">
                           <Sparkles className="size-3 text-[#9E5338]" /> New on Ayoj
                         </span>
                       )}
                       <span className="flex items-center gap-1">
                         <Clock className="size-3.5 text-[#9E5338]" /> Usually responds in ~{Math.round(vendor.response_time_hours || 2)}h
                       </span>
                       <span className="flex items-center gap-1">
                         <Sparkles className="size-3.5 text-[#9E5338]" /> {vendor.years_experience || 5}+ Years Experience
                       </span>
                       {vendor.is_verified && (
                         <VerifiedPartnerBadge
                           vendorName={vendor.business_name}
                           verificationChecks={vendor.verification_checks}
                           isVerified={vendor.is_verified}
                           size="sm"
                         />
                       )}
                       <span className="flex items-center gap-1 text-[#6B6560] border border-[#E8E2D9] px-2.5 py-0.5 rounded-full bg-[#FAF7F2]">
                         <Plane className="size-3.5 text-[#9E5338]" /> Destination Events
                       </span>
                    </div>

                    {/* Social Presence & Contact Quick Bar */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {vendor.instagram_handle && (
                        <a
                          href={`https://instagram.com/${vendor.instagram_handle.replace('@', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E8E2D9] text-xs font-semibold text-[#221F1C] hover:border-[#9E5338] hover:text-[#9E5338] transition-colors shadow-2xs"
                        >
                          <Instagram className="size-3.5 text-[#E1306C]" />
                          <span>@{vendor.instagram_handle.replace('@', '')}</span>
                        </a>
                      )}
                      {vendor.website && (
                        <a
                          href={vendor.website.startsWith('http') ? vendor.website : `https://${vendor.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E8E2D9] text-xs font-semibold text-[#221F1C] hover:border-[#9E5338] hover:text-[#9E5338] transition-colors shadow-2xs"
                        >
                          <Globe className="size-3.5 text-[#9E5338]" />
                          <span>Official Website</span>
                        </a>
                      )}
                      {vendor.phone && (
                        <a
                          href={`tel:${vendor.phone}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E8E2D9] text-xs font-semibold text-[#221F1C] hover:border-[#9E5338] hover:text-[#9E5338] transition-colors shadow-2xs"
                        >
                          <Phone className="size-3.5 text-[#9E5338]" />
                          <span>{vendor.phone}</span>
                        </a>
                      )}
                      {vendor.cancellation_policy && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] text-[#6B6560] bg-[#FBF8F4] border border-[#E8E2D9]">
                          {vendor.cancellation_policy} Cancellation
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
               <div className="flex items-center justify-between">
                  <div>
                     <h2 className="text-xl font-serif font-bold text-[#221F1C]">Available Service Packages</h2>
                     <p className="text-xs text-[#6B6560] mt-0.5">Click any service to view full details, deliverables, and inclusions</p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#FAF7F2] border border-[#E8E2D9] text-[#9E5338]">
                     {services.length} {services.length === 1 ? 'Package' : 'Packages'}
                  </span>
               </div>

               {services.length === 0 ? (
                 <div className="p-8 rounded-2xl border border-dashed border-[#E8E2D9] text-center bg-white space-y-2">
                    <p className="text-sm font-semibold text-[#221F1C]">No packages listed yet</p>
                    <p className="text-xs text-[#6B6560]">This vendor has not published active service packages yet. You can still reach out via custom booking inquiry.</p>
                 </div>
               ) : (
                 <div className="space-y-3">
                    {services.map((service) => {
                      const isSelected = selectedService?.id === service.id;
                      const categoryName = service.category?.name || (service.categories && service.categories[0]?.name);
                      const pricingLabel = service.pricing_type === 'hourly' ? '/ hr' : service.pricing_type === 'custom' ? 'Quote' : '';
                      const primaryImg = service.images?.find(i => i.is_primary)?.url || service.images?.[0]?.url;

                      return (
                        <div 
                          key={service.id} 
                          onClick={() => setViewingService(service)}
                          className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group ${
                            isSelected 
                              ? 'bg-[#FAF7F2]/60 border-[#9E5338] ring-1 ring-[#9E5338] shadow-sm' 
                              : 'bg-white border-[#E8E2D9] hover:border-[#9E5338]/50 hover:shadow-sm'
                          }`}
                        >
                           <div className="flex items-start gap-4 flex-1">
                              {/* Real service image thumbnail if present */}
                              {primaryImg && (
                                <div className="relative size-18 sm:size-20 rounded-xl overflow-hidden border border-[#E8E2D9] bg-stone-100 shrink-0">
                                  <Image
                                    src={primaryImg}
                                    alt={service.name}
                                    fill
                                    unoptimized
                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                  />
                                  {service.images && service.images.length > 1 && (
                                    <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-md bg-black/70 text-white text-[9px] font-semibold backdrop-blur-xs flex items-center gap-0.5">
                                      <Camera className="size-2.5" /> {service.images.length}
                                    </span>
                                  )}
                                </div>
                              )}

                              <div className="space-y-2 flex-1">
                                 <div className="flex flex-wrap items-center gap-2">
                                    <h3 className="font-serif font-bold text-[#221F1C] text-base hover:text-[#9E5338] transition-colors">
                                       {service.name}
                                    </h3>
                                    {categoryName && (
                                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#F3EADF] text-[#9E5338]">
                                        {categoryName}
                                      </span>
                                    )}
                                    {service.pricing_type && (
                                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-stone-100 text-[#6B6560] capitalize">
                                        {service.pricing_type}
                                      </span>
                                    )}
                                    {isSelected && (
                                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#9E5338] text-white flex items-center gap-1">
                                        <Check className="size-2.5" strokeWidth={3} /> Selected
                                      </span>
                                    )}
                                 </div>

                                 <p className="text-xs text-[#6B6560] font-normal max-w-xl line-clamp-2 leading-relaxed">
                                    {service.description}
                                 </p>

                                 <div className="flex items-center gap-3 pt-1">
                                 <button
                                   type="button"
                                   onClick={(e) => {
                                     e.stopPropagation();
                                     setViewingService(service);
                                   }}
                                   className="text-xs font-semibold text-[#9E5338] hover:underline inline-flex items-center gap-1.5 cursor-pointer"
                                 >
                                    <Eye className="size-3.5" />
                                    <span>View Service Details</span>
                                 </button>
                                 <span className="text-stone-300">•</span>
                                 <button
                                   type="button"
                                   onClick={(e) => {
                                     e.stopPropagation();
                                     setSelectedService(service);
                                   }}
                                   className={`text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                                     isSelected ? 'text-[#9E5338]' : 'text-[#6B6560] hover:text-[#221F1C]'
                                   }`}
                                 >
                                    {isSelected ? (
                                      <>
                                        <Check className="size-3.5 text-[#9E5338]" strokeWidth={2.5} />
                                        <span>Selected for Booking</span>
                                      </>
                                    ) : (
                                      <span>Select for Booking</span>
                                    )}
                                 </button>
                              </div>
                           </div>
                        </div>

                           <div className="sm:text-right shrink-0 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 border-[#E8E2D9]">
                              <div>
                                 <p className="text-[10px] font-bold text-[#6B6560] uppercase tracking-wider">
                                    {service.pricing_type === 'custom' ? 'Pricing' : 'Starting at'}
                                 </p>
                                 <p className="text-xl font-bold text-[#221F1C]">
                                    {service.pricing_type === 'custom'
                                      ? 'Custom Quote'
                                      : `₹${service.base_price?.toLocaleString() || '0'}${pricingLabel ? ` ${pricingLabel}` : ''}`}
                                 </p>
                              </div>
                              <div className="flex items-center gap-2 mt-2">
                                 <Button
                                   type="button"
                                   size="sm"
                                   variant="outline"
                                   onClick={(e) => {
                                     e.stopPropagation();
                                     setViewingService(service);
                                   }}
                                   className="h-8 px-3 rounded-full text-xs font-medium border-[#E8E2D9] text-[#221F1C] hover:bg-[#FAF7F2] hover:border-[#9E5338]"
                                 >
                                    <Eye className="size-3 mr-1" />
                                    Details
                                 </Button>
                                 <Button
                                   type="button"
                                   size="sm"
                                   onClick={(e) => {
                                     e.stopPropagation();
                                     setSelectedService(service);
                                   }}
                                   className={`h-8 px-3.5 rounded-full text-xs font-medium transition-all ${
                                     isSelected
                                       ? 'bg-[#9E5338] text-white hover:bg-[#85432B]'
                                       : 'bg-white border border-[#9E5338] text-[#9E5338] hover:bg-[#9E5338] hover:text-white'
                                   }`}
                                 >
                                    {isSelected ? 'Selected' : 'Select'}
                                 </Button>
                              </div>
                           </div>
                        </div>
                      );
                    })}
                 </div>
               )}
            </section>

            {/* Reviews Section */}
            <section className="p-6 rounded-2xl border border-[#E8E2D9] bg-white space-y-6">
              {hasGenuineReviews ? (
                <>
                  <div className="flex flex-col sm:flex-row justify-between gap-6 pb-6 border-b border-[#E8E2D9]">
                    <div>
                      <h2 className="text-3xl font-serif font-bold text-[#221F1C]">
                        {Number(vendor.average_rating).toFixed(1)}
                      </h2>
                      <div className="flex gap-1 my-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star
                            key={i}
                            className={`size-4 ${
                              i <= Math.round(Number(vendor.average_rating))
                                ? 'fill-[#D97706] text-[#D97706]'
                                : 'text-stone-300'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-[#6B6560] font-medium">
                        Based on {vendor.total_reviews} verified client {vendor.total_reviews === 1 ? 'review' : 'reviews'}
                      </p>
                    </div>
                  </div>

                  {reviews.length > 0 && (
                    <div className="space-y-4">
                    {reviews.slice(0, 5).map((review: any, i: number) => (
                      <div key={review.id || i} className="space-y-1.5 pb-4 border-b border-[#E8E2D9] last:border-b-0">
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
                            {review.created_at ? new Date(review.created_at).toLocaleDateString() : ''}
                          </span>
                        </div>
                        {review.comment && (
                          <p className="text-xs text-[#6B6560] italic font-normal">&ldquo;{review.comment}&rdquo;</p>
                        )}
                        {review.vendor_response && (
                          <div className="mt-2.5 p-3 rounded-xl bg-[#FAF7F2] border border-[#E8E2D9] space-y-1">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-bold text-[#9E5338] flex items-center gap-1.5">
                                <Store className="size-3 text-[#9E5338]" /> Response from {vendor.business_name}
                              </span>
                              {review.vendor_responded_at && (
                                <span className="text-[10px] text-[#6B6560]">
                                  {new Date(review.vendor_responded_at).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-[#221F1C]">
                              &ldquo;{review.vendor_response}&rdquo;
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-4 border-b border-[#E8E2D9]">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-serif font-bold text-[#221F1C]">Client Reviews &amp; Experiences</h3>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FAF7F2] text-[11px] font-medium text-[#6B6560] border border-[#E8E2D9]">
                          <Sparkles className="size-3 text-[#9E5338]" />
                          <span>New on Ayoj</span>
                        </span>
                      </div>
                      <p className="text-xs text-[#6B6560]">
                        All Ayoj reviews are written by confirmed hosts after an event booking is completed.
                      </p>
                    </div>
                  </div>

                  <div className="p-6 rounded-xl bg-[#FAF7F2] border border-[#E8E2D9] text-center space-y-2">
                    <div className="mx-auto size-10 rounded-full bg-white border border-[#E8E2D9] flex items-center justify-center text-[#9E5338]">
                      <Sparkles className="size-5" />
                    </div>
                    <h4 className="text-sm font-semibold text-[#221F1C]">No Client Reviews Yet</h4>
                    <p className="text-xs text-[#6B6560] max-w-md mx-auto leading-relaxed">
                      {vendor.business_name} is new on Ayoj. Genuine ratings and reviews will appear here once booked celebrations are completed and verified.
                    </p>
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-4">
            <div id="booking-sidebar" className="sticky top-20 space-y-4">
               <Card className="border border-[#E8E2D9] bg-white shadow-sm rounded-2xl overflow-hidden">
                  <div className="p-4 bg-[#F3EADF] border-b border-[#E8E2D9]">
                     <h3 className="text-xs font-bold text-[#9E5338] uppercase tracking-wider flex items-center gap-1.5">
                        <Zap className="size-3.5 fill-[#9E5338]" /> Quick Reservation
                     </h3>
                  </div>
                  <CardContent className="p-5 space-y-5">
                     
                     <div className="space-y-2">
                        <div className="flex items-center justify-between">
                           <label className="text-xs font-medium text-[#221F1C] flex items-center gap-1.5">
                              <CalendarIcon className="size-3.5 text-[#9E5338]" /> Select Event Date
                           </label>
                           {isDateInAvailableSlots === true && (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                                 <Check className="size-3" /> Slot Open
                              </span>
                           )}
                        </div>
                        <input 
                          type="date" 
                          value={bookingDate}
                          min={todayStr}
                          onChange={(e) => setBookingDate(e.target.value)}
                          className="w-full bg-[#FBF8F4] border border-[#E8E2D9] rounded-xl h-11 px-3 text-[#221F1C] focus:outline-none focus:border-[#9E5338] text-xs font-medium cursor-pointer" 
                        />
                        {isDateInAvailableSlots === false && bookingDate && (
                           <p className="text-[10px] text-amber-700 flex items-center gap-1 leading-snug">
                              <Info className="size-3 shrink-0" />
                              Custom date request: Vendor has not opened public slots for this date. You may still submit your inquiry.
                           </p>
                        )}
                        {upcomingAvailableSlots.length > 0 && !bookingDate && (
                           <div className="pt-1 space-y-1">
                              <p className="text-[10px] text-[#6B6560] font-medium">Upcoming open celebration dates:</p>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                 {upcomingAvailableSlots.map((slot: any) => (
                                    <button
                                       key={slot.id || slot.date}
                                       type="button"
                                       onClick={() => setBookingDate(slot.date)}
                                       className="px-2 py-0.5 rounded-lg bg-[#FAF7F2] hover:bg-[#F3EADF] border border-[#E8E2D9] text-[10px] font-semibold text-[#9E5338] transition-colors cursor-pointer"
                                    >
                                       {new Date(slot.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                                    </button>
                                 ))}
                              </div>
                           </div>
                        )}
                     </div>

                     <div className="p-3 rounded-xl bg-[#FBF8F4] border border-[#E8E2D9] space-y-2">
                        <div className="flex justify-between items-center">
                           <p className="text-[10px] font-bold text-[#6B6560] uppercase tracking-wider">Selected Package</p>
                           {selectedService && (
                             <button
                               type="button"
                               onClick={() => setViewingService(selectedService)}
                               className="text-[10px] font-semibold text-[#9E5338] hover:underline cursor-pointer flex items-center gap-1"
                             >
                                <Eye className="size-3" /> View Details
                             </button>
                           )}
                        </div>
                        <div className="flex justify-between items-center text-xs">
                           <span className="font-bold text-[#221F1C]">{selectedService?.name || 'No package selected'}</span>
                           <span className="font-bold text-[#221F1C]">
                             {selectedService?.pricing_type === 'custom'
                               ? 'Custom Quote'
                               : `₹${selectedService?.base_price?.toLocaleString() || '0'}`}
                           </span>
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

      {/* Service Details Modal */}
      <AnimatePresence>
        {viewingService && (
          <div 
            onClick={() => setViewingService(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#E8E2D9] overflow-hidden my-8 cursor-default"
            >
              {/* Header with decorative background banner */}
              <div className="relative bg-gradient-to-br from-[#FAF7F2] via-[#F3EADF] to-[#EBE2D5] p-6 sm:p-8 border-b border-[#E8E2D9]">
                <button
                  type="button"
                  onClick={() => setViewingService(null)}
                  className="absolute top-4 right-4 size-9 rounded-full bg-white/80 hover:bg-white text-[#221F1C] border border-[#E8E2D9] flex items-center justify-center transition-colors shadow-sm cursor-pointer z-10"
                  aria-label="Close details"
                >
                  <X className="size-4" />
                </button>

                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Category pill */}
                    {(viewingService.category?.name || (viewingService.categories && viewingService.categories[0]?.name)) && (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#9E5338] text-white shadow-xs">
                        {viewingService.category?.name || viewingService.categories?.[0]?.name}
                      </span>
                    )}

                    {/* Pricing style tag */}
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/80 text-[#221F1C] border border-[#E8E2D9] capitalize flex items-center gap-1">
                      <Sparkles className="size-3 text-[#9E5338]" />
                      {viewingService.pricing_type || 'Standard'} Pricing
                    </span>

                    {/* Vendor Name Badge */}
                    <span className="px-2.5 py-1 rounded-full text-xs text-[#6B6560] bg-white/60 border border-[#E8E2D9]/60">
                      By {vendor?.business_name}
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#221F1C] tracking-tight leading-tight">
                    {viewingService.name}
                  </h2>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 sm:p-8 space-y-6 max-h-[65vh] overflow-y-auto">
                {/* Price & Guarantee Card */}
                <div className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D9] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[11px] font-bold text-[#6B6560] uppercase tracking-wider block">
                      {viewingService.pricing_type === 'custom' ? 'Service Rate' : 'Investment'}
                    </span>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-3xl font-serif font-bold text-[#221F1C]">
                        {viewingService.pricing_type === 'custom'
                          ? 'Custom Quote'
                          : `₹${viewingService.base_price?.toLocaleString() || '0'}`}
                      </span>
                      {viewingService.pricing_type === 'hourly' && (
                        <span className="text-sm font-medium text-[#6B6560]">per hour</span>
                      )}
                      {viewingService.pricing_type === 'package' && (
                        <span className="text-sm font-medium text-[#6B6560]">per event / package</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-[#E8E2D9] text-xs text-[#221F1C] font-medium">
                    <ShieldCheck className="size-4 text-emerald-600 shrink-0" />
                    <span>Transparent Pricing & Jashnify Guarantee</span>
                  </div>
                </div>

                {/* Service Gallery Images (if available) */}
                {viewingService.images && viewingService.images.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-[#6B6560] uppercase tracking-wider">
                      Service Highlights & Photos
                    </h4>
                    <div className="grid grid-cols-3 gap-3">
                      {viewingService.images.map((img, idx) => (
                        <div key={img.id || idx} className="relative aspect-[4/3] rounded-xl overflow-hidden border border-[#E8E2D9] bg-stone-100">
                          <Image
                            src={img.url}
                            alt={`${viewingService.name} sample ${idx + 1}`}
                            fill
                            className="object-cover hover:scale-105 transition-transform duration-300"
                            unoptimized
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Description */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-[#6B6560] uppercase tracking-wider">
                    Full Description & Scope of Work
                  </h4>
                  <div className="text-sm text-[#221F1C] leading-relaxed whitespace-pre-line font-normal bg-stone-50/50 p-4 rounded-2xl border border-stone-100">
                    {viewingService.description}
                  </div>
                </div>

                {/* What's Included / Key Deliverables */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-[#6B6560] uppercase tracking-wider">
                    What This Service Includes
                  </h4>
                  <div className="grid sm:grid-cols-2 gap-2.5">
                    <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FAF7F2] border border-[#E8E2D9]/80 text-xs text-[#221F1C]">
                      <Check className="size-4 text-[#9E5338] shrink-0 mt-0.5" strokeWidth={2.5} />
                      <span>Direct consultation with {vendor?.business_name} prior to event date</span>
                    </div>
                    <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FAF7F2] border border-[#E8E2D9]/80 text-xs text-[#221F1C]">
                      <Check className="size-4 text-[#9E5338] shrink-0 mt-0.5" strokeWidth={2.5} />
                      <span>Professional execution adhering to verified marketplace standards</span>
                    </div>
                    <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FAF7F2] border border-[#E8E2D9]/80 text-xs text-[#221F1C]">
                      <Check className="size-4 text-[#9E5338] shrink-0 mt-0.5" strokeWidth={2.5} />
                      <span>Timely delivery of deliverables and high-resolution assets</span>
                    </div>
                    <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FAF7F2] border border-[#E8E2D9]/80 text-xs text-[#221F1C]">
                      <Check className="size-4 text-[#9E5338] shrink-0 mt-0.5" strokeWidth={2.5} />
                      <span>Dedicated client support and milestone timeline updates</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-5 sm:p-6 bg-stone-50 border-t border-[#E8E2D9] flex flex-col sm:flex-row items-center justify-between gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setViewingService(null)}
                  className="w-full sm:w-auto h-11 px-5 rounded-full border-[#E8E2D9] text-[#6B6560] hover:text-[#221F1C] text-xs font-medium"
                >
                  Close
                </Button>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Button
                    type="button"
                    onClick={() => {
                      setSelectedService(viewingService);
                      setViewingService(null);
                      toast.success(`Selected "${viewingService.name}" for your booking request!`);
                      const sidebar = document.getElementById('booking-sidebar');
                      if (sidebar && typeof sidebar.scrollIntoView === 'function') {
                        sidebar.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }}
                    className="w-full sm:w-auto h-11 px-6 rounded-full bg-[#9E5338] hover:bg-[#85432B] text-white text-xs font-medium shadow-sm flex items-center justify-center gap-2"
                  >
                    <span>{selectedService?.id === viewingService.id ? 'Package Already Selected' : 'Select & Reserve This Package'}</span>
                    <ArrowRight className="size-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
