'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Star, MapPin, Heart, Sparkles, ChevronRight, Images, ArrowLeftRight, Check } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { apiService } from '@/lib/api';
import { tokenService } from '@/lib/tokenService';
import { toast } from 'sonner';
import VerifiedPartnerBadge from './VerifiedPartnerBadge';
import { saveRecentlyViewedVendor } from '@/lib/recentlyViewed';
import { Spotlight } from '@/components/motion';

interface PortfolioImage {
  id: number;
  url: string;
  title?: string;
}

interface PortfolioItem {
  id: number;
  title?: string;
  description?: string;
  category?: string;
  is_featured?: boolean;
  image_count?: number;
  primary_image_url?: string;
  images?: PortfolioImage[];
}

interface Vendor {
  id: string;
  slug?: string;
  name?: string;
  business_name?: string;
  image?: string;
  profile_image_url?: string;
  rating?: number;
  average_rating?: number;
  total_reviews?: number;
  location?: string;
  base_price?: number | string;
  is_favorite?: boolean;
  user_id?: string | number;
  is_verified?: boolean;
  verification_status?: string;
  verification_checks?: Record<string, any>;
  primary_category?: { id?: number; name?: string; slug?: string } | string;
  categories?: Array<{ id?: number; name?: string; slug?: string; is_primary?: boolean } | string>;
  service_categories?: string[];
  category?: string;
  featured_portfolio?: PortfolioItem[];
  years_experience?: number;
  service_images?: string[];
}

interface PhotographerCardProps {
  photographer: Vendor;
  onFavoriteToggle?: (vendorId: string, isFav: boolean) => void;
  isCompared?: boolean;
  onToggleCompare?: (vendor: Vendor) => void;
  onQuickInquire?: (vendor: Vendor) => void;
}

const CYCLE_INTERVAL = 4000; // 4 seconds per image
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=1000&auto=format&fit=crop';

export default function PhotographerCard({ 
  photographer, 
  onFavoriteToggle,
  isCompared = false,
  onToggleCompare,
  onQuickInquire
}: PhotographerCardProps) {
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(photographer.is_favorite || false);
  const [isLiking, setIsLiking] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const id = photographer.id;
  const slugOrId = photographer.slug || photographer.id;
  const name = photographer.name || photographer.business_name || 'Creative Partner';
  const defaultImage = photographer.image || photographer.profile_image_url || FALLBACK_IMAGE;
  const rawRating = photographer.rating ?? photographer.average_rating;
  const rating = rawRating ? Number(rawRating) : null;
  const totalReviews = photographer.total_reviews ?? 0;
  const location = photographer.location || '';
  // Verified Partner check: Vendor must have completed all verification standards
  const checksCompleted = photographer.verification_checks
    ? Object.values(photographer.verification_checks).every((c: any) => c.completed !== false)
    : true;
  const isVerified = Boolean(
    checksCompleted &&
    (photographer.is_verified === true || photographer.verification_status === 'verified')
  );
  const hasBasePrice = photographer.base_price != null && !isNaN(Number(photographer.base_price)) && Number(photographer.base_price) > 0;
  const priceRange = hasBasePrice
    ? `₹${Number(photographer.base_price).toLocaleString('en-IN')}`
    : 'Price on request';

  // Build portfolio image gallery from featured_portfolio and service images
  const portfolioImages: string[] = [];
  if (photographer.featured_portfolio && Array.isArray(photographer.featured_portfolio)) {
    photographer.featured_portfolio.forEach((item) => {
      if (item.images && Array.isArray(item.images)) {
        item.images.forEach((img) => {
          if (img.url && !portfolioImages.includes(img.url)) {
            portfolioImages.push(img.url);
          }
        });
      } else if (item.primary_image_url) {
        if (!portfolioImages.includes(item.primary_image_url)) {
          portfolioImages.push(item.primary_image_url);
        }
      }
    });
  }

  // Include any supplementary service images
  if (photographer.service_images && Array.isArray(photographer.service_images)) {
    photographer.service_images.forEach((imgUrl: string) => {
      if (imgUrl && !portfolioImages.includes(imgUrl)) {
        portfolioImages.push(imgUrl);
      }
    });
  }

  // Include primary profile/featured image if valid and not already included
  const primaryImg = photographer.image || photographer.profile_image_url;
  if (primaryImg && !portfolioImages.includes(primaryImg)) {
    portfolioImages.unshift(primaryImg);
  }

  // Ensure we always have at least the default image, cap at 5 for performance
  const allImages = portfolioImages.length > 0
    ? portfolioImages.slice(0, 5)
    : [defaultImage];
  const hasMultipleImages = allImages.length > 1;

  // Category resolution
  const categoriesList: string[] = [];
  if (photographer.primary_category) {
    const pName = typeof photographer.primary_category === 'string'
      ? photographer.primary_category
      : photographer.primary_category.name;
    if (pName) categoriesList.push(pName);
  }
  if (photographer.categories && Array.isArray(photographer.categories)) {
    photographer.categories.forEach((cat: any) => {
      const cName = typeof cat === 'string' ? cat : cat.name;
      if (cName && !categoriesList.includes(cName)) {
        categoriesList.push(cName);
      }
    });
  } else if (photographer.service_categories && Array.isArray(photographer.service_categories)) {
    photographer.service_categories.forEach((cat: string) => {
      if (cat && !categoriesList.includes(cat)) {
        categoriesList.push(cat);
      }
    });
  } else if (photographer.category && !categoriesList.includes(photographer.category)) {
    categoriesList.push(photographer.category);
  }

  const primaryCategoryName = categoriesList[0] || null;
  const additionalCategoriesCount = Math.max(0, categoriesList.length - 1);
  const additionalCategoriesNames = categoriesList.slice(1).join(', ');

  const handleRecordView = () => {
    saveRecentlyViewedVendor({
      id: photographer.id,
      slug: photographer.slug,
      name: name,
      category: primaryCategoryName || (typeof photographer.category === 'string' ? photographer.category : undefined),
      image: defaultImage,
      rating: rating || undefined,
      base_price: photographer.base_price,
      location: location || undefined
    });
  };

  // Auto-cycle portfolio images
  const goToNextImage = useCallback(() => {
    if (!hasMultipleImages) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
      setIsTransitioning(false);
    }, 400); // transition duration
  }, [hasMultipleImages, allImages.length]);

  // Auto-cycle portfolio images (pauses smoothly when card is hovered)
  useEffect(() => {
    if (!hasMultipleImages || isHovered) return;

    intervalRef.current = setInterval(goToNextImage, CYCLE_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [goToNextImage, hasMultipleImages, isHovered]);

  // Manual dot navigation
  const goToImage = (index: number) => {
    if (index === currentImageIndex) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentImageIndex(index);
      setIsTransitioning(false);
    }, 400);
  };

  useEffect(() => {
    let isMounted = true;
    const isAuthed = tokenService.hasToken() && !tokenService.isTokenExpired();
    const currentUser = tokenService.getUser();
    const isOwnProfile = currentUser?.role === 'vendor' && (
      (currentUser.vendor_id && String(currentUser.vendor_id) === String(id)) ||
      (currentUser.vendor?.id && String(currentUser.vendor.id) === String(id)) ||
      (currentUser.vendor?.slug && photographer.slug && currentUser.vendor.slug === photographer.slug) ||
      (currentUser.id && photographer.user_id && String(currentUser.id) === String(photographer.user_id))
    );

    if (id && isAuthed && !isOwnProfile && photographer.is_favorite === undefined) {
      apiService.favorites.check(id)
        .then(res => {
          if (isMounted && res.data?.is_favorite) {
            setIsLiked(true);
          }
        })
        .catch(() => {});
    }
    return () => { isMounted = false; };
  }, [id, photographer.is_favorite, photographer.slug, photographer.user_id]);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isLiking) return;

    const isAuthed = tokenService.hasToken() && !tokenService.isTokenExpired();
    if (!isAuthed) {
      toast.error('Please sign in to save favorite vendors', {
        action: {
          label: 'Sign In',
          onClick: () => router.push('/login'),
        },
      });
      return;
    }

    const currentUser = tokenService.getUser();
    const isOwnProfile = currentUser?.role === 'vendor' && (
      (currentUser.vendor_id && String(currentUser.vendor_id) === String(id)) ||
      (currentUser.vendor?.id && String(currentUser.vendor.id) === String(id)) ||
      (currentUser.vendor?.slug && photographer.slug && currentUser.vendor.slug === photographer.slug) ||
      (currentUser.id && photographer.user_id && String(currentUser.id) === String(photographer.user_id))
    );

    if (isOwnProfile) {
      toast.info('You cannot favorite your own business profile');
      return;
    }

    setIsLiking(true);
    const nextState = !isLiked;
    setIsLiked(nextState); // Optimistic UI update

    try {
      if (nextState) {
        await apiService.favorites.add(id);
        window.dispatchEvent(new Event('favorites-updated'));
        toast.success(`Saved ${name} to favorites`, {
          action: {
            label: 'View Favorites',
            onClick: () => router.push('/customer/dashboard?tab=saved'),
          },
        });
      } else {
        await apiService.favorites.removeByVendor(id);
        window.dispatchEvent(new Event('favorites-updated'));
        toast.success(`Removed ${name} from favorites`);
      }
      onFavoriteToggle?.(id, nextState);
    } catch (err: any) {
      setIsLiked(!nextState); // Revert optimistic update
      const isAuthError = err.response?.status === 401;
      if (isAuthError) {
        toast.error('Please sign in to save favorite vendors', {
          action: {
            label: 'Sign In',
            onClick: () => router.push('/login'),
          },
        });
      } else {
        const errorMsg = err.response?.data?.error || err.extractedMessage || 'Unable to update favorites. Please try again.';
        toast.error(errorMsg);
      }
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <div
      className="vendor-card-root bg-white border border-[#E8E2D9] rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:border-[#9E5338]/30 transition-[box-shadow,border-color] duration-200 group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Motion Primitives Cursor Spotlight (only active on hover for peak scroll performance) */}
      {isHovered && (
        <Spotlight
          size={320}
          className="from-[#9E5338]/18 via-[#9E5338]/6 to-transparent"
        />
      )}
      
      {/* Photo carousel header */}
      <div className="relative aspect-[4/3] overflow-hidden bg-[#F3EADF]">
        <Link 
          href={`/vendors/${slugOrId}`}
          onClick={handleRecordView}
          className="block w-full h-full cursor-pointer relative"
          aria-label={`View ${name} profile`}
        >
          {/* All images rendered, only active one visible via opacity */}
          {allImages.map((imgUrl, idx) => (
            <Image
              key={imgUrl + idx}
              src={imgUrl}
              alt={`${name} portfolio ${idx + 1}`}
              fill
              unoptimized
              className={`object-cover transition-all duration-700 ease-in-out absolute inset-0 ${
                idx === currentImageIndex
                  ? isTransitioning
                    ? 'opacity-0 scale-105'
                    : 'opacity-100 scale-100'
                  : 'opacity-0 scale-100'
              } group-hover:scale-[1.03]`}
            />
          ))}

          {/* Bottom gradient overlay for readability */}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/50 via-black/20 to-transparent z-10 pointer-events-none" />

          {/* Inline price badge - bottom left, over image */}
          <div className="absolute bottom-3 left-3 z-20">
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold backdrop-blur-md ${
              hasBasePrice
                ? 'bg-white/90 text-[#221F1C] shadow-sm'
                : 'bg-black/40 text-white/90'
            }`}>
              {priceRange}
              {hasBasePrice && <span className="text-[10px] font-normal text-[#6B6560]">onwards</span>}
            </span>
          </div>
        </Link>

        {/* Dot indicators for portfolio cycling */}
        {hasMultipleImages && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
            {allImages.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); goToImage(idx); }}
                className={`rounded-full transition-all duration-300 ${
                  idx === currentImageIndex
                    ? 'w-4 h-1.5 bg-white shadow-sm'
                    : 'w-1.5 h-1.5 bg-white/50 hover:bg-white/80'
                }`}
                aria-label={`Go to image ${idx + 1}`}
              />
            ))}
          </div>
        )}

        {/* Portfolio count indicator - top right area */}
        {hasMultipleImages && (
          <div className="absolute top-3 right-14 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-black/40 backdrop-blur-md text-white text-[10px] font-medium">
              <Images className="size-3" />
              {allImages.length}
            </span>
          </div>
        )}

        {/* Verified Partner Badge */}
        {isVerified && (
          <div className="absolute top-3 left-3 z-20">
            <VerifiedPartnerBadge
              vendorName={name}
              verificationChecks={photographer.verification_checks}
              isVerified={isVerified}
              size="sm"
            />
          </div>
        )}

        {/* Compare Toggle Button */}
        {onToggleCompare && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleCompare(photographer);
            }}
            title={isCompared ? "Remove from comparison" : "Add to comparison"}
            className={`absolute top-3 right-13 size-9 rounded-full flex items-center justify-center transition-all cursor-pointer z-20 ${
              isCompared
                ? 'bg-[#9E5338] text-white shadow-md ring-2 ring-white/60'
                : 'bg-black/30 backdrop-blur-md text-white hover:bg-white hover:text-[#9E5338] hover:shadow-md'
            }`}
          >
            {isCompared ? (
              <Check className="size-4 stroke-[3]" />
            ) : (
              <ArrowLeftRight className="size-3.5" />
            )}
          </button>
        )}

        {/* Favorite Heart Button */}
        <button 
          type="button"
          onClick={handleToggleFavorite}
          disabled={isLiking}
          title={isLiked ? "Remove from saved" : "Save to favorites"}
          className={`absolute top-3 right-3 size-9 rounded-full flex items-center justify-center transition-all cursor-pointer z-20 ${
            isLiked
              ? 'bg-white text-rose-500 shadow-md'
              : 'bg-black/30 backdrop-blur-md text-white hover:bg-white hover:text-[#9E5338] hover:shadow-md'
          }`}
        >
          <Heart className={`size-4 transition-transform duration-200 ${isLiked ? 'fill-rose-500 scale-110' : ''} ${isLiking ? 'animate-pulse' : ''}`} />
        </button>
      </div>

      {/* Card Content Body */}
      <div className="p-4 space-y-2 bg-white">
        
        {/* Top row: Name + Rating */}
        <div className="flex items-start justify-between gap-2">
          <Link href={`/vendors/${slugOrId}`} onClick={handleRecordView} className="block min-w-0 flex-1">
            <h3 className="text-[15px] font-serif font-bold text-[#221F1C] truncate tracking-tight group-hover:text-[#9E5338] transition-colors cursor-pointer leading-snug">
              {name}
            </h3>
          </Link>

          {/* Compact rating */}
          {rating && rating > 0 && totalReviews > 0 ? (
            <div className="flex items-center gap-1 shrink-0 px-1.5 py-0.5 rounded-md bg-[#FEF9EE] border border-amber-100">
              <Star className="size-3 fill-[#D97706] text-[#D97706]" />
              <span className="text-xs font-bold text-[#221F1C]">{rating.toFixed(1)}</span>
              <span className="text-[10px] text-[#6B6560]">({totalReviews})</span>
            </div>
          ) : (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[#FAF7F2] text-[10px] font-medium text-[#9E5338] border border-[#E8E2D9] shrink-0">
              <Sparkles className="size-2.5" />
              New
            </span>
          )}
        </div>

        {/* Category + Location row */}
        <div className="flex items-center gap-1.5 text-xs text-[#6B6560] flex-wrap">
          {primaryCategoryName && (
            <span className="inline-flex items-center text-[11px] font-semibold text-[#9E5338] bg-[#F3EADF] px-2 py-0.5 rounded-md border border-[#E8E2D9]">
              {primaryCategoryName}
            </span>
          )}
          {additionalCategoriesCount > 0 && (
            <span
              title={`Also operates in: ${additionalCategoriesNames}`}
              className="inline-flex items-center text-[10px] font-medium text-[#6B6560] bg-[#FAF7F2] px-1.5 py-0.5 rounded-md border border-[#E8E2D9] cursor-help"
            >
              +{additionalCategoriesCount} more
            </span>
          )}
          {location && (
            <>
              <span className="text-[#D5CFC8]">·</span>
              <span className="inline-flex items-center gap-1 truncate">
                <MapPin className="size-3 text-[#9E5338] shrink-0" />
                <span className="truncate">{location}</span>
              </span>
            </>
          )}
        </div>

        {/* Actions CTA Bar */}
        <div className="pt-2 flex items-center gap-2">
          <Link href={`/vendors/${slugOrId}`} onClick={handleRecordView} className="flex-1 block">
            <span className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-[#9E5338] bg-[#FAF7F2] border border-[#E8E2D9] hover:bg-[#9E5338] hover:text-white hover:border-[#9E5338] transition-all duration-300 cursor-pointer group/btn">
              <span>View Profile</span>
              <ChevronRight className="size-3.5 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
            </span>
          </Link>

          {onToggleCompare && (
            <button
              type="button"
              onClick={() => onToggleCompare(photographer)}
              title={isCompared ? "Remove from inquiry basket & comparison" : "Add to inquiry basket & comparison"}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                isCompared
                  ? 'bg-[#9E5338] text-white border-[#9E5338] shadow-2xs'
                  : 'bg-white text-[#6B6560] border-[#E8E2D9] hover:text-[#9E5338] hover:border-[#9E5338]/40 hover:bg-[#FAF7F2]'
              }`}
            >
              {isCompared ? <Check className="size-3.5 stroke-[2.5]" /> : <ArrowLeftRight className="size-3.5" />}
              <span className="hidden sm:inline">{isCompared ? 'In Basket' : 'Compare / Inquire'}</span>
            </button>
          )}
        </div>

      </div>

      {/* CSS for the card */}
      <style jsx>{`
        .vendor-card-root {
          will-change: transform, box-shadow;
        }
        .vendor-card-root:hover {
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
}
