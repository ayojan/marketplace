'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Heart, MapPin, ChevronDown, LogOut, Check } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import AyojLogo from '@/components/AyojLogo';
import { NotificationDropdown } from '@/components/NotificationDropdown';
import { apiService } from '@/lib/api';
import { tokenService } from '@/lib/tokenService';

export const CITIES = ['Delhi NCR', 'Mumbai', 'Bengaluru', 'Jaipur', 'Goa', 'Chandigarh'];

export default function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [favoritesCount, setFavoritesCount] = useState<number>(0);
  const [selectedCity, setSelectedCity] = useState<string>('Delhi NCR');
  const [isLocationOpen, setIsLocationOpen] = useState<boolean>(false);
  const locationDropdownRef = useRef<HTMLDivElement>(null);

  // Sync favorites count
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

  // Click outside listener for location dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (locationDropdownRef.current && !locationDropdownRef.current.contains(e.target as Node)) {
        setIsLocationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectCity = (city: string) => {
    setSelectedCity(city);
    setIsLocationOpen(false);
    router.push(`/marketplace?location=${encodeURIComponent(city)}`);
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    router.push('/');
  };

  const dashboardLink = user?.role === 'vendor' ? '/vendor/dashboard' : '/customer/dashboard';

  return (
    <header className="sticky top-0 z-50 w-full bg-[#FBF8F4]/95 backdrop-blur-md border-b border-[#E8E2D9]">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        
        {/* Official Brand Logo with Visible Tagline */}
        <Link href="/" className="flex items-center hover:opacity-95 transition-opacity">
          <AyojLogo size="md" showTagline={true} taglinePosition="side" />
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden lg:flex items-center gap-8">
          <Link href="/marketplace" className="text-xs font-medium text-[#221F1C] hover:text-[#9E5338] transition-colors">
            Marketplace
          </Link>
          <Link href="/#occasions" className="text-xs font-medium text-[#221F1C] hover:text-[#9E5338] transition-colors">
            Occasions
          </Link>
          <Link href="/#reviews" className="text-xs font-medium text-[#221F1C] hover:text-[#9E5338] transition-colors">
            Real Reviews
          </Link>
          <Link href="/register?role=vendor" className="text-xs font-medium text-[#221F1C] hover:text-[#9E5338] transition-colors">
            For Vendors
          </Link>
        </nav>

        {/* Right Action Controls */}
        <div className="flex items-center gap-3">
          
          {/* Interactive Location Dropdown Pill */}
          <div className="relative hidden sm:block" ref={locationDropdownRef}>
            <button
              type="button"
              onClick={() => setIsLocationOpen(!isLocationOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#E8E2D9] bg-white text-xs font-medium text-[#221F1C] cursor-pointer hover:border-[#9E5338]/40 transition-colors"
            >
              <MapPin className="size-3.5 text-[#9E5338]" />
              <span>{selectedCity}</span>
              <ChevronDown className="size-3 text-[#6B6560]" />
            </button>

            {isLocationOpen && (
              <div className="absolute right-0 mt-2 w-44 rounded-2xl bg-white border border-[#E8E2D9] shadow-lg py-1.5 z-50">
                <div className="px-3 py-1 text-[10px] font-bold text-[#6B6560] uppercase tracking-wider">
                  Select City
                </div>
                {CITIES.map((city) => {
                  const isSelected = selectedCity === city;
                  return (
                    <button
                      key={city}
                      type="button"
                      onClick={() => handleSelectCity(city)}
                      className={`w-full flex items-center justify-between px-3 py-1.5 text-xs text-left cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-[#F3EADF] text-[#9E5338] font-semibold'
                          : 'text-[#221F1C] hover:bg-[#FAF7F2]'
                      }`}
                    >
                      <span>{city}</span>
                      {isSelected && <Check className="size-3 text-[#9E5338]" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Notification Dropdown */}
          {user && <NotificationDropdown />}

          {/* Heart Icon / Wishlist with Active Count Badge */}
          <Link href="/customer/dashboard?tab=saved">
            <button 
              title="Saved Favorites"
              className="relative size-9 rounded-full border border-[#E8E2D9] bg-white flex items-center justify-center text-[#221F1C] hover:text-[#9E5338] hover:border-[#9E5338]/40 transition-all cursor-pointer"
            >
              <Heart className="size-4" />
              {favoritesCount > 0 && (
                <span className="absolute -top-1 -right-1 size-4 bg-[#9E5338] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
                  {favoritesCount > 9 ? '9+' : favoritesCount}
                </span>
              )}
            </button>
          </Link>

          {user ? (
            <>
              <Link href={dashboardLink}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2 h-9 rounded-full text-xs font-medium text-[#221F1C] hover:bg-[#F3EADF]"
                >
                  <span className="hidden sm:inline">Dashboard</span>
                </Button>
              </Link>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="h-9 px-3 rounded-full text-xs font-medium text-[#6B6560] hover:text-[#9E5338] hover:bg-[#F3EADF] transition-all cursor-pointer"
              >
                <LogOut className="size-3.5" />
                <span className="hidden sm:inline ml-1">Logout</span>
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="rounded-full text-xs font-medium text-[#221F1C] hover:bg-[#F3EADF] h-9 px-4">
                  Log in
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="bg-[#9E5338] hover:bg-[#86442B] text-white rounded-full text-xs font-medium h-9 px-5 transition-colors">
                  Sign up
                </Button>
              </Link>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
