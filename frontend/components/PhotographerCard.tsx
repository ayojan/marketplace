'use client';

import { useState, useEffect } from 'react';
import { Star, MapPin, Heart, Clock, Sparkles } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { apiService } from '@/lib/api';
import { tokenService } from '@/lib/tokenService';
import { toast } from 'sonner';
import VerifiedPartnerBadge from './VerifiedPartnerBadge';

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
  base_price?: number;
  is_favorite?: boolean;
  user_id?: string | number;
  is_verified?: boolean;
  verification_status?: string;
  verification_checks?: Record<string, any>;
  primary_category?: { id?: number; name?: string; slug?: string } | string;
  categories?: Array<{ id?: number; name?: string; slug?: string; is_primary?: boolean } | string>;
  service_categories?: string[];
  category?: string;
}

interface PhotographerCardProps {
  photographer: Vendor;
  onFavoriteToggle?: (vendorId: string, isFav: boolean) => void;
}

export default function PhotographerCard({ photographer, onFavoriteToggle }: PhotographerCardProps) {
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(photographer.is_favorite || false);
  const [isLiking, setIsLiking] = useState(false);
  const id = photographer.id;
  const slugOrId = photographer.slug || photographer.id;
  const name = photographer.name || photographer.business_name || 'Creative Partner';
  const image = photographer.image || photographer.profile_image_url || 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=1000&auto=format&fit=crop';
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
  const hasBasePrice = typeof photographer.base_price === 'number' && Number(photographer.base_price) > 0;
  const priceRange = hasBasePrice
    ? `₹${Number(photographer.base_price).toLocaleString('en-IN')}`
    : 'Price on request';

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
    <div className="bg-white border border-[#E8E2D9] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group">
      
      {/* Photo header - Entire visible photo clickable to open vendor profile */}
      <div className="relative aspect-[16/10] overflow-hidden bg-[#F3EADF]">
        <Link 
          href={`/vendors/${slugOrId}`}
          className="block w-full h-full cursor-pointer relative"
          aria-label={`View ${name} profile`}
        >
          <Image
            src={image}
            alt={name}
            fill
            unoptimized
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />

        </Link>

        {/* Verified Partner Badge - Interactive overlay */}
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

        {/* Favorite Heart Button - Interactive overlay */}
        <button 
          type="button"
          onClick={handleToggleFavorite}
          disabled={isLiking}
          title={isLiked ? "Remove from saved" : "Save to favorites"}
          className="absolute top-3 right-3 size-8 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-[#9E5338] transition-all cursor-pointer z-20"
        >
          <Heart className={`size-4 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>
      </div>

      {/* Card Content Body */}
      <div className="p-4 space-y-2.5 bg-white">
        
        {/* Clickable Vendor Title */}
        <Link href={`/vendors/${slugOrId}`} className="block">
          <h3 className="text-base font-serif font-bold text-[#221F1C] truncate tracking-tight group-hover:text-[#9E5338] transition-colors cursor-pointer">
            {name}
          </h3>
        </Link>

        {/* Operating Categories Badges */}
        {primaryCategoryName && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#9E5338] bg-[#F3EADF] px-2 py-0.5 rounded-md border border-[#E8E2D9]">
              {primaryCategoryName}
            </span>
            {additionalCategoriesCount > 0 && (
              <span
                title={`Also operates in: ${additionalCategoriesNames}`}
                className="inline-flex items-center text-[10px] font-medium text-[#6B6560] bg-[#FAF7F2] px-1.5 py-0.5 rounded-md border border-[#E8E2D9] cursor-help"
              >
                +{additionalCategoriesCount} more
              </span>
            )}
          </div>
        )}

        {/* Rating Line & Response Metric */}
        <div className="flex items-center justify-between text-xs">
          {rating && rating > 0 && totalReviews > 0 ? (
            <div className="flex items-center gap-1.5 text-[#221F1C]">
              <Star className="size-3.5 fill-[#D97706] text-[#D97706]" />
              <span className="font-semibold">{rating.toFixed(1)}</span>
              <span className="text-[#6B6560]">({totalReviews})</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-[#6B6560]">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FAF7F2] text-[11px] font-medium text-[#6B6560] border border-[#E8E2D9]">
                <Sparkles className="size-3 text-[#9E5338]" />
                <span>New on Ayoj</span>
              </span>
            </div>
          )}

          <span className="inline-flex items-center gap-1 text-[11px] text-[#6B6560] bg-[#FAF7F2] px-2 py-0.5 rounded-md border border-[#E5DED6]">
            <Clock className="size-3 text-[#9E5338]" />
            <span>Fast Response</span>
          </span>
        </div>

        {/* Location Line */}
        {location && (
          <div className="flex items-center gap-1.5 text-xs text-[#6B6560]">
            <MapPin className="size-3.5 text-[#6B6560] shrink-0" />
            <span className="truncate">{location}</span>
          </div>
        )}

        {/* Transparent Pricing & View Profile CTA */}
        <div className="pt-2.5 border-t border-[#E8E2D9] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] uppercase font-semibold tracking-wider text-[#6B6560]">
                {hasBasePrice ? 'Starting From' : 'Pricing'}
              </span>
              {hasBasePrice && (
                <span className="text-[9px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                  Transparent
                </span>
              )}
            </div>
            <div className="text-sm font-bold text-[#221F1C]">
              {priceRange} {hasBasePrice && <span className="text-[11px] text-[#6B6560] font-normal">/ event</span>}
            </div>
          </div>

          <Link href={`/vendors/${slugOrId}`}>
            <span className="px-3.5 py-1.5 rounded-full border border-[#E8E2D9] text-xs font-medium text-[#221F1C] hover:bg-[#9E5338] hover:text-white hover:border-[#9E5338] transition-all inline-block cursor-pointer">
              View Profile
            </span>
          </Link>
        </div>

      </div>

    </div>
  );
}
