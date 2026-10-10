'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Compass, 
  Sparkles, 
  Heart, 
  CalendarDays, 
  User 
} from 'lucide-react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { tokenService } from '@/lib/tokenService';
import { apiService } from '@/lib/api';

export function MobileBottomNav() {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();
  const [favoritesCount, setFavoritesCount] = useState<number>(0);

  // Sync favorites badge count
  useEffect(() => {
    const loadFavorites = () => {
      if (tokenService.hasToken() && !tokenService.isTokenExpired()) {
        apiService.favorites.getAll()
          .then((res: any) => {
            const count = res.data?.favorites?.length || 0;
            setFavoritesCount(count);
          })
          .catch(() => {});
      } else {
        setFavoritesCount(0);
      }
    };

    loadFavorites();
    window.addEventListener('favorites-updated', loadFavorites);
    return () => window.removeEventListener('favorites-updated', loadFavorites);
  }, [user]);

  // Hide the global bottom nav on full-screen booking flow so the checkout CTA has 100% focus
  if (pathname?.startsWith('/booking')) {
    return null;
  }

  const isVendor = user?.role === 'vendor';

  const navItems = [
    {
      label: 'Explore',
      href: '/marketplace',
      icon: Compass,
      isActive: pathname === '/marketplace',
    },
    {
      label: 'Occasions',
      href: '/#occasions',
      icon: Sparkles,
      isActive: pathname === '/' && typeof window !== 'undefined' && window.location.hash === '#occasions',
    },
    {
      label: 'Saved',
      href: isAuthenticated ? '/customer/favorites' : '/login',
      icon: Heart,
      badge: favoritesCount > 0 ? favoritesCount : null,
      isActive: pathname === '/customer/favorites',
    },
    {
      label: isVendor ? 'Requests' : 'Bookings',
      href: isAuthenticated 
        ? (isVendor ? '/vendor/bookings' : '/customer/bookings') 
        : '/login',
      icon: CalendarDays,
      isActive: pathname?.includes('/bookings'),
    },
    {
      label: isAuthenticated ? (isVendor ? 'Vendor' : 'Profile') : 'Log In',
      href: isAuthenticated 
        ? (isVendor ? '/vendor' : '/customer') 
        : '/login',
      icon: User,
      isActive: pathname === '/customer' || pathname === '/vendor' || pathname === '/login',
    },
  ];

  return (
    <nav 
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-[#FAF7F2]/95 backdrop-blur-xl border-t border-[#E8E2D9] shadow-[0_-4px_20px_rgba(34,31,28,0.06)] pb-safe transition-transform duration-200"
    >
      <div className="flex items-center justify-around h-15 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.isActive;

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`relative flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-xl transition-all duration-150 active:scale-90 ${
                active 
                  ? 'text-[#9E5338] font-semibold' 
                  : 'text-[#6B6560] hover:text-[#221F1C]'
              }`}
            >
              <div className="relative">
                <Icon 
                  className={`size-5 transition-transform ${active ? 'scale-110 text-[#9E5338]' : ''}`} 
                  strokeWidth={active ? 2.5 : 1.75} 
                />
                {item.badge ? (
                  <span className="absolute -top-1.5 -right-2 size-4 bg-[#9E5338] text-white text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-[#FAF7F2]">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                ) : null}
              </div>
              <span className={`text-[10px] tracking-tight mt-1 leading-none ${active ? 'text-[#9E5338]' : 'text-[#6B6560]'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
export default MobileBottomNav;
