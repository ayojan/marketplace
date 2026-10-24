'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { apiService } from '@/lib/api';
import { tokenService } from '@/lib/tokenService';
import { toast } from 'sonner';
import { saveRecentlyViewedVendor } from '@/lib/recentlyViewed';
import { Spotlight } from '@/components/motion';
import {
  Vendor,
  VendorCardProps,
  CYCLE_INTERVAL,
  FALLBACK_IMAGE
} from './constants';
import VendorCardMedia from './VendorCardMedia';
import VendorCardBadges from './VendorCardBadges';
import VendorCardActions from './VendorCardActions';

export default function VendorCard({
  photographer,
  onFavoriteToggle,
  isCompared = false,
  onToggleCompare,
  onQuickInquire
}: VendorCardProps) {
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
  const hasBasePrice =
    photographer.base_price != null &&
    !isNaN(Number(photographer.base_price)) &&
    Number(photographer.base_price) > 0;
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
  const allImages = portfolioImages.length > 0 ? portfolioImages.slice(0, 5) : [defaultImage];
  const hasMultipleImages = allImages.length > 1;

  // Category resolution
  const categoriesList: string[] = [];
  if (photographer.primary_category) {
    const pName =
      typeof photographer.primary_category === 'string'
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
      category:
        primaryCategoryName ||
        (typeof photographer.category === 'string' ? photographer.category : undefined),
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
    }, 400);
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
    const isOwnProfile =
      currentUser?.role === 'vendor' &&
      ((currentUser.vendor_id && String(currentUser.vendor_id) === String(id)) ||
        (currentUser.vendor?.id && String(currentUser.vendor.id) === String(id)) ||
        (currentUser.vendor?.slug &&
          photographer.slug &&
          currentUser.vendor.slug === photographer.slug) ||
        (currentUser.id &&
          photographer.user_id &&
          String(currentUser.id) === String(photographer.user_id)));

    if (id && isAuthed && !isOwnProfile && photographer.is_favorite === undefined) {
      apiService.favorites
        .check(id)
        .then((res) => {
          if (isMounted && res.data?.is_favorite) {
            setIsLiked(true);
          }
        })
        .catch(() => {});
    }
    return () => {
      isMounted = false;
    };
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
          onClick: () => router.push('/login')
        }
      });
      return;
    }

    const currentUser = tokenService.getUser();
    const isOwnProfile =
      currentUser?.role === 'vendor' &&
      ((currentUser.vendor_id && String(currentUser.vendor_id) === String(id)) ||
        (currentUser.vendor?.id && String(currentUser.vendor.id) === String(id)) ||
        (currentUser.vendor?.slug &&
          photographer.slug &&
          currentUser.vendor.slug === photographer.slug) ||
        (currentUser.id &&
          photographer.user_id &&
          String(currentUser.id) === String(photographer.user_id)));

    if (isOwnProfile) {
      toast.info('You cannot favorite your own business profile');
      return;
    }

    setIsLiking(true);
    const nextState = !isLiked;
    setIsLiked(nextState);

    try {
      if (nextState) {
        await apiService.favorites.add(id);
        window.dispatchEvent(new Event('favorites-updated'));
        toast.success(`Saved ${name} to favorites`, {
          action: {
            label: 'View Favorites',
            onClick: () => router.push('/customer/dashboard?tab=saved')
          }
        });
      } else {
        await apiService.favorites.removeByVendor(id);
        window.dispatchEvent(new Event('favorites-updated'));
        toast.success(`Removed ${name} from favorites`);
      }
      onFavoriteToggle?.(id, nextState);
    } catch (err: any) {
      setIsLiked(!nextState);
      const isAuthError = err.response?.status === 401;
      if (isAuthError) {
        toast.error('Please sign in to save favorite vendors', {
          action: {
            label: 'Sign In',
            onClick: () => router.push('/login')
          }
        });
      } else {
        const errorMsg =
          err.response?.data?.error ||
          err.extractedMessage ||
          'Unable to update favorites. Please try again.';
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
      {/* Motion Primitives Cursor Spotlight */}
      {isHovered && (
        <Spotlight
          size={320}
          className="from-[#9E5338]/18 via-[#9E5338]/6 to-transparent"
        />
      )}

      {/* Photo carousel header */}
      <VendorCardMedia
        allImages={allImages}
        currentImageIndex={currentImageIndex}
        isTransitioning={isTransitioning}
        name={name}
        slugOrId={slugOrId}
        priceRange={priceRange}
        hasBasePrice={hasBasePrice}
        isVerified={isVerified}
        verificationChecks={photographer.verification_checks}
        isCompared={isCompared}
        onToggleCompare={onToggleCompare}
        vendor={photographer}
        isLiked={isLiked}
        isLiking={isLiking}
        onToggleFavorite={handleToggleFavorite}
        onGoToImage={goToImage}
        onRecordView={handleRecordView}
      />

      {/* Card Content Body */}
      <div className="p-4 space-y-2 bg-white">
        <VendorCardBadges
          name={name}
          slugOrId={slugOrId}
          rating={rating}
          totalReviews={totalReviews}
          primaryCategoryName={primaryCategoryName}
          additionalCategoriesCount={additionalCategoriesCount}
          additionalCategoriesNames={additionalCategoriesNames}
          location={location}
          onRecordView={handleRecordView}
        />

        <VendorCardActions
          vendor={photographer}
          slugOrId={slugOrId}
          isCompared={isCompared}
          onToggleCompare={onToggleCompare}
          onQuickInquire={onQuickInquire}
          onRecordView={handleRecordView}
        />
      </div>

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
