'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
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

function MobileBottomNavInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuth();
  const [favoritesCount, setFavoritesCount] = useState<number>(0);
  const [manualActive, setManualActive] = useState<string | null>(null);
  const [currentHash, setCurrentHash] = useState<string>('');

  // Track hash on client
  useEffect(() => {
    const handleHash = () => {
      if (typeof window !== 'undefined') {
        setCurrentHash(window.location.hash);
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Reset manual override whenever pathname or searchParams change
  useEffect(() => {
    setManualActive(null);
  }, [pathname, searchParams]);

  // Sync favorites badge count only when user is actively logged in
  useEffect(() => {
    const loadFavorites = () => {
      if (isAuthenticated && tokenService.hasToken() && !tokenService.isTokenExpired()) {
        apiService.favorites.getAll()
          .then((res: any) => {
            const count = res.data?.favorites?.length || 0;
            setFavoritesCount(count);
          })
          .catch(() => {
            setFavoritesCount(0);
          });
      } else {
        setFavoritesCount(0);
      }
    };

    loadFavorites();
    window.addEventListener('favorites-updated', loadFavorites);
    return () => window.removeEventListener('favorites-updated', loadFavorites);
  }, [user, isAuthenticated]);

  // Hide the global bottom nav on full-screen booking flow so checkout CTA has 100% focus
  if (pathname?.startsWith('/booking')) {
    return null;
  }

  const isVendor = user?.role === 'vendor';
  const tabParam = searchParams?.get('tab');

  // Compute active tab ID reliably based on route, params, hash, and manual selection
  const computeActiveId = (): string => {
    if (manualActive) return manualActive;

    if (
      pathname?.startsWith('/marketplace') ||
      pathname?.startsWith('/photographer') ||
      pathname?.startsWith('/services') ||
      pathname?.startsWith('/vendors')
    ) {
      return 'explore';
    }

    if (pathname === '/') {
      if (currentHash === '#occasions') return 'occasions';
      return 'explore';
    }

    if (pathname?.startsWith('/customer/dashboard')) {
      if (tabParam === 'saved') return 'saved';
      if (tabParam === 'bookings') return 'bookings';
      return 'profile';
    }

    if (pathname?.startsWith('/vendor')) {
      return 'bookings';
    }

    if (pathname === '/login' || pathname === '/register') {
      return 'profile';
    }

    return '';
  };

  const activeId = computeActiveId();

  const navItems = [
    {
      id: 'explore',
      label: 'Explore',
      href: '/marketplace',
      icon: Compass,
    },
    {
      id: 'occasions',
      label: 'Occasions',
      href: '/#occasions',
      icon: Sparkles,
      onClick: (e: React.MouseEvent) => {
        setManualActive('occasions');
        if (pathname === '/') {
          e.preventDefault();
          const el = document.getElementById('occasions');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
            window.history.pushState(null, '', '/#occasions');
            setCurrentHash('#occasions');
          }
        }
      },
    },
    {
      id: 'saved',
      label: 'Saved',
      href: isAuthenticated ? '/customer/dashboard?tab=saved' : '/login',
      icon: Heart,
      badge: favoritesCount > 0 ? favoritesCount : null,
    },
    {
      id: 'bookings',
      label: isVendor ? 'Requests' : 'Bookings',
      href: isAuthenticated 
        ? (isVendor ? '/vendor/dashboard' : '/customer/dashboard?tab=bookings') 
        : '/login',
      icon: CalendarDays,
    },
    {
      id: 'profile',
      label: isAuthenticated ? (isVendor ? 'Vendor' : 'Profile') : 'Log In',
      href: isAuthenticated 
        ? (isVendor ? '/vendor/dashboard' : '/customer/dashboard?tab=profile') 
        : '/login',
      icon: User,
    },
  ];

  return (
    <nav 
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-[#FAF7F2]/95 backdrop-blur-xl border-t border-[#E8E2D9] shadow-[0_-4px_20px_rgba(34,31,28,0.06)] pb-safe transition-transform duration-200"
    >
      <div className="flex items-center justify-around h-16 px-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeId === item.id;

          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={(e) => {
                setManualActive(item.id);
                if (item.onClick) {
                  item.onClick(e);
                }
              }}
              className={`relative flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all duration-150 active:scale-95 ${
                isActive ? 'text-[#9E5338]' : 'text-[#6B6560] hover:text-[#221F1C]'
              }`}
            >
              {/* Highlight pill container around icon */}
              <div 
                className={`relative px-3 py-1 rounded-full flex items-center justify-center transition-all duration-200 ${
                  isActive ? 'bg-[#F3EADF] shadow-xs' : 'bg-transparent'
                }`}
              >
                <Icon 
                  className={`size-5 transition-transform duration-200 ${
                    isActive ? 'scale-110 text-[#9E5338]' : 'text-[#6B6560]'
                  }`} 
                  strokeWidth={isActive ? 2.5 : 1.75} 
                />
                {item.badge ? (
                  <span className="absolute -top-1 -right-1 size-4 bg-[#9E5338] text-white text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-[#FAF7F2]">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                ) : null}
              </div>

              {/* Label */}
              <span 
                className={`text-[10px] tracking-tight mt-0.5 leading-none transition-colors duration-150 ${
                  isActive ? 'font-bold text-[#9E5338]' : 'font-medium text-[#6B6560]'
                }`}
              >
                {item.label}
              </span>

              {/* Active Dot Indicator */}
              {isActive && (
                <span className="size-1 bg-[#9E5338] rounded-full mt-0.5 animate-in fade-in zoom-in-50 duration-200" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function MobileBottomNav() {
  return (
    <Suspense fallback={null}>
      <MobileBottomNavInner />
    </Suspense>
  );
}

export default MobileBottomNav;
