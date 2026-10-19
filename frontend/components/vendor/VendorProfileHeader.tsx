'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Star, 
  Sparkles, 
  Heart, 
  Share2, 
  User, 
  LayoutDashboard, 
  Settings, 
  CalendarDays, 
  LogOut 
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { 
  Avatar, 
  AvatarImage, 
  AvatarFallback 
} from '@/components/ui/avatar';

interface VendorProfileHeaderProps {
  vendor: any;
  hasGenuineReviews: boolean;
  isFavorite: boolean;
  favoriteLoading: boolean;
  onToggleFavorite: () => void;
  onShareProfile: () => void;
  user: any;
  userInitials: string;
  profileLink: string;
  dashboardLink: string;
  bookingsLink: string;
  onLogout: () => void;
  onBack: () => void;
  vendorId: string | number;
}

export default function VendorProfileHeader({
  vendor,
  hasGenuineReviews,
  isFavorite,
  favoriteLoading,
  onToggleFavorite,
  onShareProfile,
  user,
  userInitials,
  profileLink,
  dashboardLink,
  bookingsLink,
  onLogout,
  onBack,
  vendorId,
}: VendorProfileHeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-[#FBF8F4]/95 backdrop-blur-md border-b border-[#E8E2D9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <button 
          type="button"
          onClick={onBack} 
          className="flex items-center gap-1.5 text-[#6B6560] hover:text-[#9E5338] transition-colors text-xs font-medium cursor-pointer"
        >
          <ArrowLeft className="size-4" /> Back to Search
        </button>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-sm font-serif font-bold text-[#221F1C]">
            {vendor.business_name}
          </span>

          {hasGenuineReviews ? (
            <div className="hidden sm:flex items-center gap-1">
              <Star className="size-3.5 fill-[#D97706] text-[#D97706]" />
              <span className="text-xs font-bold text-[#221F1C]">
                {Number(vendor.average_rating).toFixed(1)}
              </span>
              <span className="text-[11px] text-[#6B6560]">
                ({vendor.total_reviews})
              </span>
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
            onClick={onToggleFavorite}
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
            onClick={onShareProfile}
            aria-label="Share vendor profile"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white text-[#221F1C] border border-[#E8E2D9] hover:border-[#9E5338] hover:text-[#9E5338] transition-all cursor-pointer shadow-xs"
          >
            <Share2 className="size-3.5" />
            <span>Share</span>
          </button>

          <div className="h-4 w-px bg-[#E8E2D9]" />

          {/* Top Right User Profile Navigation Icon / Dropdown */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="User account menu"
                  title={user.first_name ? `${user.first_name}'s account` : 'Account menu'}
                  className="flex items-center justify-center size-8 sm:size-9 rounded-full border border-[#E8E2D9] hover:border-[#9E5338]/60 bg-white hover:bg-[#FAF7F2] transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#9E5338]/20 group p-0.5 shadow-2xs"
                >
                  <Avatar className="size-7 sm:size-8 ring-1 ring-[#E8E2D9]/60 transition-transform duration-150 group-hover:scale-105">
                    {user.avatar_url && <AvatarImage src={user.avatar_url} alt={user.first_name || 'User avatar'} />}
                    <AvatarFallback className="bg-[#9E5338] text-white text-[11px] font-serif font-bold">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56 p-1.5 rounded-2xl bg-white border border-[#E8E2D9] shadow-xl z-50 animate-in fade-in-0 zoom-in-95 duration-150">
                <div className="px-3 py-2.5 border-b border-[#E8E2D9]/80 bg-[#FAF7F2] rounded-xl mb-1">
                  <p className="text-xs font-bold text-[#221F1C] truncate">
                    {user.first_name ? `${user.first_name} ${user.last_name || ''}` : (user.business_name || user.email)}
                  </p>
                  <p className="text-[10px] text-[#6B6560] truncate">{user.email}</p>
                  <div className="mt-1">
                    <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-[#F3EADF] text-[#9E5338]">
                      {user.role === 'vendor' ? (user.vendor?.is_verified || user.is_verified ? 'Verified Partner' : 'Creative Partner') : 'Customer Host'}
                    </span>
                  </div>
                </div>

                <DropdownMenuItem asChild className="rounded-xl px-3 py-2 text-xs font-medium text-[#221F1C] hover:bg-[#F3EADF] hover:text-[#9E5338] cursor-pointer">
                  <Link href={profileLink} className="flex items-center gap-2.5 w-full">
                    <User className="size-3.5 text-[#9E5338]" />
                    <span>{user.role === 'vendor' ? 'Business Settings' : 'My Profile & Details'}</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild className="rounded-xl px-3 py-2 text-xs font-medium text-[#221F1C] hover:bg-[#F3EADF] hover:text-[#9E5338] cursor-pointer">
                  <Link href={dashboardLink} className="flex items-center gap-2.5 w-full">
                    <LayoutDashboard className="size-3.5 text-[#9E5338]" />
                    <span>{user.role === 'vendor' ? 'Vendor Portal' : 'Main Dashboard'}</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild className="rounded-xl px-3 py-2 text-xs font-medium text-[#221F1C] hover:bg-[#F3EADF] hover:text-[#9E5338] cursor-pointer">
                  <Link href={bookingsLink} className="flex items-center gap-2.5 w-full">
                    <CalendarDays className="size-3.5 text-[#9E5338]" />
                    <span>{user.role === 'vendor' ? 'Booking Calendar' : 'My Bookings'}</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild className="rounded-xl px-3 py-2 text-xs font-medium text-[#221F1C] hover:bg-[#F3EADF] hover:text-[#9E5338] cursor-pointer">
                  <Link href="/customer/dashboard?tab=saved" className="flex items-center gap-2.5 w-full">
                    <Heart className="size-3.5 text-[#9E5338]" />
                    <span>Saved Pros</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="my-1 border-t border-[#E8E2D9]" />

                <DropdownMenuItem 
                  onClick={onLogout}
                  className="rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 w-full">
                    <LogOut className="size-3.5 text-rose-600" />
                    <span>Sign Out</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              href={`/login?redirect=/vendors/${vendorId}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#FAF7F2] text-[#221F1C] border border-[#E8E2D9] hover:border-[#9E5338] hover:text-[#9E5338] hover:bg-[#F3EADF] transition-all cursor-pointer shadow-2xs"
              title="Sign in to your account"
            >
              <User className="size-3.5 text-[#9E5338]" />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
