'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useLocation } from '@/lib/contexts/LocationContext';
import AyojLogo from '@/components/AyojLogo';
import { NotificationDropdown } from '@/components/NotificationDropdown';
import {
  HeaderCityPicker,
  HeaderUserMenu,
  HeaderMobileDrawer,
  HeaderNavLinks,
  CITIES,
  CATEGORIES_NAV,
  OCCASIONS_NAV
} from './header/index';

export { CITIES, CATEGORIES_NAV, OCCASIONS_NAV };

export default function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { 
    selectedCity, 
    setSelectedCity, 
    openLocationPrompt, 
    detectLocation, 
    isDetecting 
  } = useLocation();

  const [isLocationOpen, setIsLocationOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [openMenu, setOpenMenu] = useState<'categories' | 'occasions' | null>(null);

  const desktopNavRef = useRef<HTMLElement>(null);
  const locationDropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on route navigation
  useEffect(() => {
    setOpenMenu(null);
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Click outside listener for location dropdown and nav menus
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (locationDropdownRef.current && !locationDropdownRef.current.contains(e.target as Node)) {
        setIsLocationOpen(false);
      }
      if (desktopNavRef.current && !desktopNavRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard accessibility: Escape closes open menus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
        setIsLocationOpen(false);
        setOpenMenu(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Responsive cleanup: Auto-close mobile menu if resized to desktop breakpoint
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSelectCity = (city: string) => {
    setSelectedCity(city);
    setIsLocationOpen(false);
    setIsMobileMenuOpen(false);
    router.push(`/marketplace?location=${encodeURIComponent(city)}`);
  };

  const handleDetectLocation = async () => {
    setIsLocationOpen(false);
    setIsMobileMenuOpen(false);
    const res = await detectLocation();
    if (res.success && res.city) {
      router.push(`/marketplace?location=${encodeURIComponent(res.city)}`);
    }
  };

  const handleLogout = () => {
    setIsMobileMenuOpen(false);
    logout();
    toast.success('Logged out successfully');
    router.push('/');
  };

  const dashboardLink = user?.role === 'vendor' ? '/vendor/dashboard?tab=overview' : '/customer/dashboard?tab=overview';
  const userInitials = user 
    ? `${user.first_name?.charAt(0) || user.business_name?.charAt(0) || user.name?.charAt(0) || 'U'}${user.last_name?.charAt(0) || ''}`.toUpperCase() 
    : 'U';

  return (
    <header className="sticky top-0 z-50 w-full bg-[#FBF8F4]/95 backdrop-blur-md border-b border-[#E8E2D9]">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Official Brand Logo with Visible Tagline */}
        <Link 
          href="/" 
          onClick={() => setIsMobileMenuOpen(false)}
          className="flex items-center hover:opacity-95 transition-opacity"
        >
          <AyojLogo size="md" showTagline={true} taglinePosition="side" />
        </Link>

        {/* Center Nav Links - Desktop */}
        <HeaderNavLinks
          selectedCity={selectedCity}
          openMenu={openMenu}
          setOpenMenu={setOpenMenu}
          desktopNavRef={desktopNavRef}
        />

        {/* Right Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Interactive Location Dropdown Pill (Desktop & Tablets) */}
          <HeaderCityPicker
            selectedCity={selectedCity}
            isLocationOpen={isLocationOpen}
            setIsLocationOpen={setIsLocationOpen}
            isDetecting={isDetecting}
            onDetectLocation={handleDetectLocation}
            onSelectCity={handleSelectCity}
            onOpenPrompt={openLocationPrompt}
            locationDropdownRef={locationDropdownRef}
          />

          {/* Notification Dropdown */}
          {user && <NotificationDropdown />}

          {/* User Profile Avatar / Sign In CTA */}
          <HeaderUserMenu
            user={user}
            userInitials={userInitials}
            dashboardLink={dashboardLink}
            onLogout={handleLogout}
          />

          {/* Mobile Hamburger Toggle Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isMobileMenuOpen}
            className="lg:hidden size-9 rounded-full border border-[#E8E2D9] bg-white flex items-center justify-center text-[#221F1C] hover:text-[#9E5338] hover:border-[#9E5338]/40 transition-all cursor-pointer focus:outline-none"
          >
            {isMobileMenuOpen ? <X className="size-4.5" /> : <Menu className="size-4.5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer Overlay */}
      <HeaderMobileDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        selectedCity={selectedCity}
        isDetecting={isDetecting}
        onDetectLocation={handleDetectLocation}
        onSelectCity={handleSelectCity}
        onOpenPrompt={openLocationPrompt}
        user={user}
        userInitials={userInitials}
        dashboardLink={dashboardLink}
        onLogout={handleLogout}
        mobileMenuRef={mobileMenuRef}
      />
    </header>
  );
}
