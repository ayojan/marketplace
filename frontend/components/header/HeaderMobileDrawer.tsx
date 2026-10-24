'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Grid, 
  ChevronDown, 
  ChevronRight, 
  Sparkles, 
  Star, 
  Store, 
  MapPin, 
  Navigation, 
  Loader2, 
  Check, 
  LogOut,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  CATEGORIES_NAV, 
  OCCASIONS_NAV, 
  CITIES 
} from './presets';
import { 
  getCategoryUrl, 
  getOccasionUrl 
} from './navigation';

interface HeaderMobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCity: string;
  isDetecting: boolean;
  onDetectLocation: () => void;
  onSelectCity: (city: string) => void;
  onOpenPrompt: () => void;
  user: any;
  userInitials: string;
  dashboardLink: string;
  onLogout: () => void;
  mobileMenuRef: React.Ref<HTMLDivElement>;
}

export default function HeaderMobileDrawer({
  isOpen,
  onClose,
  selectedCity,
  isDetecting,
  onDetectLocation,
  onSelectCity,
  onOpenPrompt,
  user,
  userInitials,
  dashboardLink,
  onLogout,
  mobileMenuRef
}: HeaderMobileDrawerProps) {
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false);
  const [mobileOccasionsOpen, setMobileOccasionsOpen] = useState(false);

  if (!isOpen) return null;

  return (
    <div 
      ref={mobileMenuRef}
      className="lg:hidden fixed inset-x-0 top-16 bg-[#FBF8F4]/98 backdrop-blur-xl border-b border-[#E8E2D9] shadow-xl z-50 max-h-[calc(100vh-4rem)] overflow-y-auto animate-in fade-in-0 slide-in-from-top-2 duration-200"
    >
      <div className="max-w-7xl mx-auto px-4 py-5 space-y-5">
        {/* Nav Links */}
        <nav className="flex flex-col space-y-1">
          {/* Categories Collapsible Accordion */}
          <div className="rounded-xl border border-[#E8E2D9]/80 overflow-hidden bg-white/60">
            <button
              type="button"
              onClick={() => setMobileCategoriesOpen(!mobileCategoriesOpen)}
              className="w-full flex items-center justify-between px-3.5 py-2.5 text-sm font-medium text-[#221F1C] hover:bg-[#F3EADF] hover:text-[#9E5338] transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-3">
                <Grid className="size-4 text-[#9E5338]" />
                <span>Categories</span>
              </span>
              <ChevronDown 
                className={`size-4 text-[#6B6560] transition-transform duration-200 ${
                  mobileCategoriesOpen ? 'rotate-180 text-[#9E5338]' : ''
                }`} 
              />
            </button>

            {mobileCategoriesOpen && (
              <div className="px-2 pt-1 pb-2 space-y-0.5 border-t border-[#E8E2D9]/60 bg-[#FAF7F2]/50 animate-in fade-in-0 duration-150">
                <Link
                  href={getCategoryUrl('all', selectedCity)}
                  onClick={onClose}
                  className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-[#9E5338] bg-[#F3EADF] transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Grid className="size-3.5" />
                    <span>All Categories & Vendors</span>
                  </span>
                  <ArrowRight className="size-3.5" />
                </Link>
                {CATEGORIES_NAV.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <Link
                      key={cat.slug}
                      href={getCategoryUrl(cat.slug, selectedCity)}
                      onClick={onClose}
                      className="flex items-center justify-between px-3 py-2 rounded-lg text-xs text-[#221F1C] hover:bg-[#F3EADF] hover:text-[#9E5338] transition-colors"
                    >
                      <span className="flex items-center gap-2.5">
                        <Icon className="size-3.5 text-[#9E5338]" />
                        <span className="font-medium">{cat.name}</span>
                      </span>
                      <ChevronRight className="size-3 text-[#6B6560]/60" />
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Occasions Collapsible Accordion */}
          <div className="rounded-xl border border-[#E8E2D9]/80 overflow-hidden bg-white/60">
            <button
              type="button"
              onClick={() => setMobileOccasionsOpen(!mobileOccasionsOpen)}
              className="w-full flex items-center justify-between px-3.5 py-2.5 text-sm font-medium text-[#221F1C] hover:bg-[#F3EADF] hover:text-[#9E5338] transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-3">
                <Sparkles className="size-4 text-[#9E5338]" />
                <span>Occasions</span>
              </span>
              <ChevronDown 
                className={`size-4 text-[#6B6560] transition-transform duration-200 ${
                  mobileOccasionsOpen ? 'rotate-180 text-[#9E5338]' : ''
                }`} 
              />
            </button>

            {mobileOccasionsOpen && (
              <div className="px-2 pt-1 pb-2 space-y-0.5 border-t border-[#E8E2D9]/60 bg-[#FAF7F2]/50 animate-in fade-in-0 duration-150">
                <Link
                  href={getOccasionUrl('all', selectedCity)}
                  onClick={onClose}
                  className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-[#9E5338] bg-[#F3EADF] transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="size-3.5" />
                    <span>All Celebrations & Packages</span>
                  </span>
                  <ArrowRight className="size-3.5" />
                </Link>
                {OCCASIONS_NAV.map((occ) => {
                  const Icon = occ.icon;
                  return (
                    <Link
                      key={occ.slug}
                      href={getOccasionUrl(occ.slug, selectedCity)}
                      onClick={onClose}
                      className="flex items-center justify-between px-3 py-2 rounded-lg text-xs text-[#221F1C] hover:bg-[#F3EADF] hover:text-[#9E5338] transition-colors"
                    >
                      <span className="flex items-center gap-2.5">
                        <Icon className="size-3.5 text-[#9E5338]" />
                        <span className="font-medium">{occ.name}</span>
                      </span>
                      <ChevronRight className="size-3 text-[#6B6560]/60" />
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          <Link
            href="/#reviews"
            onClick={onClose}
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-[#221F1C] hover:bg-[#F3EADF] hover:text-[#9E5338] transition-colors"
          >
            <span className="flex items-center gap-3">
              <Star className="size-4 text-[#9E5338]" />
              Real Reviews
            </span>
            <ChevronRight className="size-4 text-[#6B6560]/60" />
          </Link>

          <Link
            href="/register?role=vendor"
            onClick={onClose}
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-[#221F1C] hover:bg-[#F3EADF] hover:text-[#9E5338] transition-colors"
          >
            <span className="flex items-center gap-3">
              <Store className="size-4 text-[#9E5338]" />
              For Vendors / List Services
            </span>
            <ChevronRight className="size-4 text-[#6B6560]/60" />
          </Link>
        </nav>

        {/* Mobile City Selector */}
        <div className="pt-4 border-t border-[#E8E2D9]">
          <div className="flex items-center justify-between px-1 mb-2.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#6B6560]">
              <MapPin className="size-3.5 text-[#9E5338]" />
              <span>Select City</span>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenPrompt();
              }}
              className="text-[11px] font-medium text-[#9E5338] hover:underline"
            >
              More Hubs
            </button>
          </div>

          {/* Mobile Auto-detect GPS button */}
          <button
            type="button"
            disabled={isDetecting}
            onClick={onDetectLocation}
            className="w-full mb-2.5 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#9E5338] bg-[#F3EADF] border border-[#9E5338]/30 cursor-pointer hover:bg-[#9E5338] hover:text-white transition-colors"
          >
            {isDetecting ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Navigation className="size-3.5" />
            )}
            <span>{isDetecting ? 'Detecting Nearest Hub...' : 'Detect Current Location'}</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            {CITIES.map((city) => {
              const isSelected = selectedCity === city;
              return (
                <button
                  key={city}
                  type="button"
                  onClick={() => onSelectCity(city)}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-colors border ${
                    isSelected
                      ? 'bg-[#F3EADF] border-[#9E5338]/40 text-[#9E5338] font-semibold shadow-xs'
                      : 'bg-white border-[#E8E2D9] text-[#221F1C] hover:bg-[#FAF7F2]'
                  }`}
                >
                  <span>{city}</span>
                  {isSelected && <Check className="size-3.5 text-[#9E5338]" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Mobile Auth / Profile Action Area */}
        <div className="pt-4 border-t border-[#E8E2D9]">
          {user ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white border border-[#E8E2D9] rounded-2xl shadow-xs">
                <div className="flex items-center gap-3">
                  <Avatar className="size-10 ring-1 ring-[#E8E2D9]">
                    {user.avatar_url && <AvatarImage src={user.avatar_url} alt={user.first_name || 'Profile'} />}
                    <AvatarFallback className="bg-[#9E5338] text-white text-xs font-serif font-bold">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-xs font-bold text-[#221F1C] truncate max-w-[150px]">
                      {user.first_name ? `${user.first_name} ${user.last_name || ''}` : (user.business_name || user.email)}
                    </p>
                    <p className="text-[10px] text-[#6B6560] truncate max-w-[150px]">{user.email}</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F3EADF] text-[#9E5338] capitalize">
                  {user.role}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Link
                  href={dashboardLink}
                  onClick={onClose}
                >
                  <Button
                    className="w-full bg-[#9E5338] hover:bg-[#86442B] text-white rounded-full text-xs font-medium h-10 shadow-xs"
                  >
                    Dashboard
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  onClick={onLogout}
                  className="w-full border-rose-200 text-rose-700 bg-white hover:bg-rose-50 rounded-full text-xs font-medium h-10 gap-1.5"
                >
                  <LogOut className="size-3.5 text-rose-600" />
                  Sign Out
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Link href="/login" onClick={onClose}>
                <Button
                  variant="outline"
                  className="w-full border-[#E8E2D9] bg-white hover:bg-[#F3EADF] text-[#221F1C] rounded-full text-xs font-medium h-10"
                >
                  Log in
                </Button>
              </Link>
              <Link href="/register" onClick={onClose}>
                <Button
                  className="w-full bg-[#9E5338] hover:bg-[#86442B] text-white rounded-full text-xs font-medium h-10 shadow-xs"
                >
                  Sign up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
