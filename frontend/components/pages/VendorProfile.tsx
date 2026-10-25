'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { apiService } from '../../lib/api';
import { useAuth } from '@/lib/contexts/AuthContext';
import { saveRecentlyViewedVendor } from '@/lib/recentlyViewed';

// Modular vendor components
import { Service, PortfolioPhoto } from '@/components/vendor/types';
import VendorProfileHeader from '@/components/vendor/VendorProfileHeader';
import VendorHeroMosaic from '@/components/vendor/VendorHeroMosaic';
import VendorSubNav from '@/components/vendor/VendorSubNav';
import VendorPortfolioSection from '@/components/vendor/VendorPortfolioSection';
import VendorPackagesSection from '@/components/vendor/VendorPackagesSection';
import VendorReviewsSection from '@/components/vendor/VendorReviewsSection';
import VendorFaqSection from '@/components/vendor/VendorFaqSection';
import VendorBookingSidebar from '@/components/vendor/VendorBookingSidebar';
import VendorServiceDetailsModal from '@/components/vendor/VendorServiceDetailsModal';
import VendorLightboxModal from '@/components/vendor/VendorLightboxModal';
import VendorStickyMobileBar from '@/components/vendor/VendorStickyMobileBar';
import VendorInquiryModal from '@/components/vendor/VendorInquiryModal';

interface VendorProfileProps {
  params: { id: string };
  initialVendor?: any;
}

const VendorProfile = ({ params, initialVendor }: VendorProfileProps) => {
  const router = useRouter();
  const { user, logout } = useAuth();

  const userInitials = useMemo(() => {
    if (!user) return 'U';
    if (user.first_name) {
      return `${user.first_name[0]}${user.last_name ? user.last_name[0] : ''}`.toUpperCase();
    }
    if (user.business_name) {
      return user.business_name.substring(0, 2).toUpperCase();
    }
    if (user.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return 'U';
  }, [user]);

  const dashboardLink = user?.role === 'vendor' ? '/vendor/dashboard?tab=overview' : '/customer/dashboard?tab=overview';
  const profileLink = user?.role === 'vendor' ? '/vendor/dashboard?tab=settings' : '/customer/dashboard?tab=profile';
  const bookingsLink = user?.role === 'vendor' ? '/vendor/dashboard?tab=calendar' : '/customer/dashboard?tab=bookings';

  const [vendor, setVendor] = useState<any>(initialVendor || null);
  const [services, setServices] = useState<Service[]>([]);
  const [portfolio, setPortfolio] = useState<any[]>(
    initialVendor?.featured_portfolio || []
  );
  const [reviews, setReviews] = useState<any[]>([]);
  const [availabilitySlots, setAvailabilitySlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(!initialVendor);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  const isOwner = user?.id === vendor?.user?.id;

  // Interactive Booking & Inquiry State
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [viewingService, setViewingService] = useState<Service | null>(null);
  const [addons, setAddons] = useState<string[]>([]);
  const [bookingDate, setBookingDate] = useState('');
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
  const [inquiryModalMode, setInquiryModalMode] = useState<'inquire' | 'reservation'>('inquire');

  // Category filter & Lightbox states
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const loadVendorData = useCallback(async () => {
    if (!initialVendor) {
      setLoading(true);
    }

    try {
      const fetchVendorPromise = (initialVendor && String(initialVendor.id) === String(params.id))
        ? Promise.resolve({ data: { vendor: initialVendor } })
        : apiService.vendors.getById(params.id).catch(() => null);

      const [vendorRes, servicesRes, portfolioRes, reviewsRes, availabilityRes] = await Promise.all([
        fetchVendorPromise,
        apiService.vendors.getServices(params.id).catch(() => null),
        apiService.vendors.getPortfolio(params.id).catch(() => null),
        apiService.vendors.getReviews(params.id).catch(() => null),
        apiService.vendors.getAvailability(params.id).catch(() => null)
      ]);

      if (vendorRes?.data?.vendor) {
        const vendorData = vendorRes.data.vendor;
        setVendor(vendorData);

        // Record in Recently Viewed history
        try {
          saveRecentlyViewedVendor({
            id: String(vendorData.id),
            slug: vendorData.slug,
            name: vendorData.business_name || vendorData.name || 'Creative Partner',
            category: vendorData.primary_category?.name || (typeof vendorData.primary_category === 'string' ? vendorData.primary_category : vendorData.category),
            image: vendorData.profile_image_url || vendorData.image,
            rating: vendorData.average_rating ? Number(vendorData.average_rating) : (vendorData.rating ? Number(vendorData.rating) : undefined),
            base_price: vendorData.base_price,
            location: vendorData.location || vendorData.city
          });
        } catch {
          // Ignore storage errors
        }

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
    } catch {
      setVendor(null);
      setPortfolio([]);
      setServices([]);
      setSelectedService(null);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [params?.id, initialVendor]);

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
      } catch {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      toast.success('Profile link copied to clipboard!');
    } catch {
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
  const allPhotos: PortfolioPhoto[] = useMemo(() => {
    const list: PortfolioPhoto[] = [];

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

  const nextPhoto = useCallback(() => {
    setLightboxIndex(prev => (prev !== null && filteredPhotos.length > 0 ? (prev + 1) % filteredPhotos.length : null));
  }, [filteredPhotos.length]);

  const prevPhoto = useCallback(() => {
    setLightboxIndex(prev => (prev !== null && filteredPhotos.length > 0 ? (prev - 1 + filteredPhotos.length) % filteredPhotos.length : null));
  }, [filteredPhotos.length]);

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
      toast.error('Please select an event date first');
      return;
    }
    if (bookingDate < todayStr) {
      toast.error('Booking date cannot be in the past');
      return;
    }

    // If user is logged in as a customer and a service is selected, proceed to checkout
    if (user && user.role === 'customer' && selectedService?.id) {
      toast.success('Proceeding to booking checkout for ' + bookingDate);
      router.push(`/booking/${selectedService.id}?date=${bookingDate}`);
      return;
    }

    // Otherwise, seamlessly open the reservation modal without bouncing to /unauthorized
    setInquiryModalMode('reservation');
    setIsInquiryModalOpen(true);
  };

  const handleOpenCustomInquiry = () => {
    setInquiryModalMode('inquire');
    setIsInquiryModalOpen(true);
  };

  const handleLogout = async () => {
    await logout?.();
    toast.success('Signed out successfully');
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
      <VendorProfileHeader
        vendor={vendor}
        hasGenuineReviews={hasGenuineReviews}
        isFavorite={isFavorite}
        favoriteLoading={favoriteLoading}
        onToggleFavorite={handleToggleFavorite}
        onShareProfile={handleShareProfile}
        user={user}
        userInitials={userInitials}
        profileLink={profileLink}
        dashboardLink={dashboardLink}
        bookingsLink={bookingsLink}
        onLogout={handleLogout}
        onBack={() => router.back()}
        vendorId={params.id}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
        {/* Editorial Photo Mosaic Hero & Studio Identity */}
        <div id="overview" className="scroll-mt-24 space-y-6">
          <VendorHeroMosaic
            vendor={vendor}
            photos={allPhotos}
            onOpenLightbox={openLightbox}
            isOwner={isOwner}
          />

          {/* Sticky In-Page Sub Navigation */}
          <VendorSubNav
            portfolioCount={allPhotos.length}
            packagesCount={services.length}
            reviewsCount={Number(vendor.total_reviews) || reviews.length}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Content Column */}
          <div className="lg:col-span-8 space-y-12">
            {/* Gallery Preview & Uploaded Works */}
            <VendorPortfolioSection
              allPhotos={allPhotos}
              filteredPhotos={filteredPhotos}
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              onOpenLightbox={openLightbox}
              isOwner={isOwner}
            />

            {/* Service Packages */}
            <VendorPackagesSection
              services={services}
              selectedService={selectedService}
              onSelectService={setSelectedService}
              onViewService={setViewingService}
            />

            {/* Client Reviews Section */}
            <VendorReviewsSection
              vendor={vendor}
              hasGenuineReviews={hasGenuineReviews}
              reviews={reviews}
            />

            {/* FAQs & Studio Policies */}
            <VendorFaqSection
              vendorName={vendor.business_name}
              category={vendor.primary_category?.name || 'Celebration Specialist'}
            />
          </div>

          {/* Sticky Quick Reservation Booking Sidebar */}
          <VendorBookingSidebar
            bookingDate={bookingDate}
            onSelectDate={setBookingDate}
            availabilitySlots={availabilitySlots}
            todayStr={todayStr}
            upcomingAvailableSlots={upcomingAvailableSlots}
            isDateInAvailableSlots={isDateInAvailableSlots}
            selectedService={selectedService}
            onViewService={setViewingService}
            addons={addons}
            onToggleAddon={toggleAddon}
            totalPrice={totalPrice}
            onBookingRequest={handleBookingRequest}
            onOpenCustomInquiry={handleOpenCustomInquiry}
          />
        </div>
      </main>

      {/* Service Details Modal */}
      <VendorServiceDetailsModal
        viewingService={viewingService}
        onClose={() => setViewingService(null)}
        vendor={vendor}
        selectedService={selectedService}
        onSelectService={setSelectedService}
      />

      {/* Full-Screen High-Resolution Lightbox */}
      <VendorLightboxModal
        lightboxIndex={lightboxIndex}
        photos={filteredPhotos}
        onClose={closeLightbox}
        onPrev={prevPhoto}
        onNext={nextPhoto}
      />

      {/* Sticky Mobile Action Bar */}
      <VendorStickyMobileBar
        selectedService={selectedService}
        basePrice={vendor?.base_price}
        bookingDate={bookingDate}
        totalPrice={totalPrice}
        onOpenInquire={handleOpenCustomInquiry}
        onOpenReservation={handleBookingRequest}
      />

      {/* Friction-Free Custom Inquiry & Reservation Modal */}
      <VendorInquiryModal
        isOpen={isInquiryModalOpen}
        onClose={() => setIsInquiryModalOpen(false)}
        vendor={vendor}
        selectedService={selectedService}
        bookingDate={bookingDate}
        totalPrice={totalPrice}
        user={user}
        mode={inquiryModalMode}
      />
    </div>
  );
};

export default VendorProfile;
