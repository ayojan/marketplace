'use client';

import { useState, useEffect } from 'react';
import { Star, MapPin, Heart, ShieldCheck, Clock } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { apiService } from '@/lib/api';
import { tokenService } from '@/lib/tokenService';
import { toast } from 'sonner';

interface Vendor {
  id: string;
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
  const name = photographer.name || photographer.business_name || 'The Wedding Narratives';
  const image = photographer.image || photographer.profile_image_url || 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=1000&auto=format&fit=crop';
  const rating = photographer.rating || photographer.average_rating || 4.9;
  const totalReviews = photographer.total_reviews || 320;
  const location = photographer.location || 'Delhi NCR';
  const priceRange = photographer.base_price ? `₹${photographer.base_price.toLocaleString()}` : '₹50,000';

  useEffect(() => {
    let isMounted = true;
    const isAuthed = tokenService.hasToken() && !tokenService.isTokenExpired();
    if (id && isAuthed && photographer.is_favorite === undefined) {
      apiService.favorites.check(id)
        .then(res => {
          if (isMounted && res.data?.is_favorite) {
            setIsLiked(true);
          }
        })
        .catch(() => {});
    }
    return () => { isMounted = false; };
  }, [id, photographer.is_favorite]);

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
        toast.error(err.extractedMessage || 'Unable to update favorites. Please try again.');
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
          href={`/vendors/${id}`}
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

          {/* Verified Partner Badge */}
          <div className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md border border-white/60 text-[11px] font-semibold text-[#8E4532] shadow-xs pointer-events-none">
            <ShieldCheck className="size-3.5 text-[#9E5338]" />
            <span>Verified Partner</span>
          </div>
        </Link>

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
        <Link href={`/vendors/${id}`} className="block">
          <h3 className="text-base font-serif font-bold text-[#221F1C] truncate tracking-tight group-hover:text-[#9E5338] transition-colors cursor-pointer">
            {name}
          </h3>
        </Link>

        {/* Rating Line & Response Metric */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-[#221F1C]">
            <Star className="size-3.5 fill-[#D97706] text-[#D97706]" />
            <span className="font-semibold">{Number(rating).toFixed(1)}</span>
            <span className="text-[#6B6560]">({totalReviews})</span>
          </div>

          <span className="inline-flex items-center gap-1 text-[11px] text-[#6B6560] bg-[#FAF7F2] px-2 py-0.5 rounded-md border border-[#E5DED6]">
            <Clock className="size-3 text-[#9E5338]" />
            <span>~2h response</span>
          </span>
        </div>

        {/* Location Line */}
        <div className="flex items-center gap-1.5 text-xs text-[#6B6560]">
          <MapPin className="size-3.5 text-[#6B6560] shrink-0" />
          <span className="truncate">{location}</span>
        </div>

        {/* Transparent Pricing & View Profile CTA */}
        <div className="pt-2.5 border-t border-[#E8E2D9] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] uppercase font-semibold tracking-wider text-[#6B6560]">Starting From</span>
              <span className="text-[9px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                Transparent
              </span>
            </div>
            <div className="text-sm font-bold text-[#221F1C]">
              {priceRange} <span className="text-[11px] text-[#6B6560] font-normal">/ event</span>
            </div>
          </div>

          <Link href={`/vendors/${id}`}>
            <button className="px-3.5 py-1.5 rounded-full border border-[#E8E2D9] text-xs font-medium text-[#221F1C] hover:bg-[#9E5338] hover:text-white hover:border-[#9E5338] transition-all cursor-pointer">
              View Profile
            </button>
          </Link>
        </div>

      </div>

    </div>
  );
}
