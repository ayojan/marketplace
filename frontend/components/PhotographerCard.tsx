'use client';

import { useState, useEffect } from 'react';
import { Star, MapPin, Heart } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { apiService } from '@/lib/api';
import { toast } from 'sonner';

interface PhotographerCardProps {
  photographer: any;
  onFavoriteToggle?: (vendorId: string, isFav: boolean) => void;
}

export default function PhotographerCard({ photographer, onFavoriteToggle }: PhotographerCardProps) {
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
    if (id && photographer.is_favorite === undefined) {
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

    setIsLiking(true);
    const nextState = !isLiked;
    setIsLiked(nextState); // Optimistic UI update

    try {
      if (nextState) {
        await apiService.favorites.add(id);
        toast.success(`Saved ${name} to favorites`);
      } else {
        await apiService.favorites.removeByVendor(id);
        toast.success(`Removed ${name} from favorites`);
      }
      onFavoriteToggle?.(id, nextState);
    } catch (err: any) {
      setIsLiked(!nextState); // Revert optimistic update
      toast.error(err.extractedMessage || 'Please sign in to save favorite vendors');
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <div className="bg-white border border-[#E8E2D9] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group">
      
      {/* Photo header with heart wishlist button */}
      <div className="relative aspect-[16/10] overflow-hidden bg-[#F3EADF]">
        <Image
          src={image}
          alt={name}
          fill
          unoptimized
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Favorite Heart Button */}
        <button 
          onClick={handleToggleFavorite}
          disabled={isLiking}
          title={isLiked ? "Remove from saved" : "Save to favorites"}
          className="absolute top-3 right-3 size-8 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-[#9E5338] transition-all cursor-pointer z-10"
        >
          <Heart className={`size-4 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>
      </div>

      {/* Card Content Body */}
      <div className="p-4 space-y-3 bg-white">
        
        {/* Vendor Title */}
        <h3 className="text-base font-serif font-bold text-[#221F1C] truncate tracking-tight group-hover:text-[#9E5338] transition-colors">
          {name}
        </h3>

        {/* Rating Line */}
        <div className="flex items-center gap-1.5 text-xs text-[#221F1C]">
          <Star className="size-3.5 fill-[#D97706] text-[#D97706]" />
          <span className="font-semibold">{Number(rating).toFixed(1)}</span>
          <span className="text-[#6B6560]">({totalReviews} reviews)</span>
        </div>

        {/* Location Line */}
        <div className="flex items-center gap-1.5 text-xs text-[#6B6560]">
          <MapPin className="size-3.5 text-[#6B6560] shrink-0" />
          <span className="truncate">{location}</span>
        </div>

        {/* Price & View Profile CTA */}
        <div className="pt-2 border-t border-[#E8E2D9] flex items-center justify-between">
          <div>
            <span className="text-[11px] text-[#6B6560] font-normal">From </span>
            <span className="text-sm font-bold text-[#221F1C]">{priceRange}</span>
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

function ChevronRight(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-9-6" />
    </svg>
  );
}
