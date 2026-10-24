'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { 
  Compass, 
  Heart, 
  CalendarDays, 
  User,
  LayoutDashboard,
  Inbox,
  Package,
  MoreHorizontal,
  Settings,
  Image as ImageIcon,
  Store,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { tokenService } from '@/lib/tokenService';
import { apiService } from '@/lib/api';
import MobileActionSheet, { MobileActionSheetOption } from './MobileActionSheet';

function MobileBottomNavInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const [favoritesCount, setFavoritesCount] = useState<number>(0);
  const [manualActive, setManualActive] = useState<string | null>(null);
  const [currentHash, setCurrentHash] = useState<string>('');
  const [isVendorMoreOpen, setIsVendorMoreOpen] = useState<boolean>(false);

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

  // Hide the global bottom nav on full-screen booking flow and vendor detail pages
  // so the dedicated checkout CTA or VendorStickyMobileBar has 100% focus without collision
  if (
    pathname?.startsWith('/booking') ||
    pathname?.startsWith('/vendors/') ||
    pathname?.startsWith('/photographer/')
  ) {
    return null;
  }

  const isVendor = isAuthenticated && user?.role === 'vendor';
  const tabParam = searchParams?.get('tab');

  // Compute active tab ID reliably based on role, route, params, and hash
  const computeActiveId = (): string => {
    if (manualActive) return manualActive;

    if (isVendor) {
      if (pathname?.startsWith('/vendor/dashboard')) return 'dashboard';
      if (pathname?.startsWith('/vendor/bookings')) return 'inquiries';
      if (pathname?.startsWith('/vendor/calendar')) return 'calendar';
      if (pathname?.startsWith('/vendor/services')) return 'services';
      if (pathname?.startsWith('/vendor/portfolio') || pathname?.startsWith('/vendor/settings')) {
        return 'more';
      }
      if (pathname?.startsWith('/vendor')) return 'dashboard';
    }

    if (
      pathname?.startsWith('/marketplace') ||
      pathname?.startsWith('/photographer') ||
      pathname?.startsWith('/services') ||
      pathname?.startsWith('/vendors') ||
      pathname === '/'
    ) {
      return 'explore';
    }

    if (pathname?.startsWith('/customer/dashboard')) {
      if (tabParam === 'saved') return 'saved';
      if (tabParam === 'bookings') return 'bookings';
      return 'profile';
    }

    if (pathname?.startsWith('/customer/favorites')) return 'saved';
    if (pathname?.startsWith('/customer/bookings')) return 'bookings';

    if (pathname === '/login' || pathname === '/register') {
      return 'profile';
    }

    return '';
  };

  const activeId = computeActiveId();

  // Vendor More Action Sheet Options
  const vendorId = user?.vendor?.id || user?.vendor_id || user?.id;
  const vendorMoreOptions: MobileActionSheetOption[] = [
    {
      id: 'portfolio',
      label: 'Portfolio & Media',
      description: 'Manage featured photos and albums',
      icon: ImageIcon,
      selected: pathname?.startsWith('/vendor/portfolio'),
      onClick: () => router.push('/vendor/portfolio'),
    },
    {
      id: 'settings',
      label: 'Business Settings',
      description: 'Profile details, pricing, and business info',
      icon: Settings,
      selected: pathname?.startsWith('/vendor/settings'),
      onClick: () => router.push('/vendor/settings'),
    },
    {
      id: 'storefront',
      label: 'View Public Storefront',
      description: 'See your profile as customers see it',
      icon: Store,
      onClick: () => router.push(`/vendors/${vendorId}`),
    },
    {
      id: 'marketplace',
      label: 'Explore Marketplace (Host View)',
      description: 'Browse other celebration pros & ideas',
      icon: Compass,
      onClick: () => router.push('/marketplace'),
    },
    {
      id: 'logout',
      label: 'Sign Out',
      description: 'Log out of your vendor account',
      icon: LogOut,
      destructive: true,
      onClick: () => {
        logout();
        router.push('/');
      },
    },
  ];

  // Customer Tab Bar: Explore · Saved · Bookings · Profile
  const customerNavItems = [
    {
      id: 'explore',
      label: 'Explore',
      href: '/marketplace',
      icon: Compass,
    },
    {
      id: 'saved',
      label: 'Saved',
      href: isAuthenticated ? '/customer/dashboard?tab=saved' : '/login?redirect=/customer/dashboard?tab=saved',
      icon: Heart,
      badge: favoritesCount > 0 ? favoritesCount : null,
    },
    {
      id: 'bookings',
      label: 'Bookings',
      href: isAuthenticated ? '/customer/dashboard?tab=bookings' : '/login?redirect=/customer/dashboard?tab=bookings',
      icon: CalendarDays,
    },
    {
      id: 'profile',
      label: isAuthenticated ? 'Profile' : 'Log In',
      href: isAuthenticated ? '/customer/dashboard?tab=profile' : '/login',
      icon: User,
    },
  ];

  // Vendor Tab Bar: Dashboard · Inquiries · Calendar · Services · More
  const vendorNavItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      href: '/vendor/dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'inquiries',
      label: 'Inquiries',
      href: '/vendor/bookings',
      icon: Inbox,
    },
    {
      id: 'calendar',
      label: 'Calendar',
      href: '/vendor/calendar',
      icon: CalendarDays,
    },
    {
      id: 'services',
      label: 'Services',
      href: '/vendor/services',
      icon: Package,
    },
    {
      id: 'more',
      label: 'More',
      href: '#more',
      icon: MoreHorizontal,
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        setIsVendorMoreOpen(true);
      },
    },
  ];

  const currentNavItems = isVendor ? vendorNavItems : customerNavItems;

  return (
    <nav 
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-[#FAF7F2]/95 backdrop-blur-xl border-t border-[#E8E2D9] shadow-[0_-4px_20px_rgba(34,31,28,0.06)] pb-safe transition-transform duration-200"
    >
      <div className="flex items-center justify-around h-16 px-1.5">
        {currentNavItems.map((item) => {
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

      {/* Vendor Quick Actions Bottom Sheet */}
      {isVendor && (
        <MobileActionSheet
          isOpen={isVendorMoreOpen}
          onClose={() => setIsVendorMoreOpen(false)}
          title="Vendor Portal & Tools"
          subtitle="Quickly navigate your storefront, portfolio, and settings"
          options={vendorMoreOptions}
        />
      )}
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
