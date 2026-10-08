'use client';

import { useAuth } from '@/lib/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Heart, MapPin, ChevronDown, LogOut, User, LayoutDashboard } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import AyojLogo from '@/components/AyojLogo';
import { NotificationDropdown } from '@/components/NotificationDropdown';

export default function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    router.push('/');
  };

  const dashboardLink = user?.role === 'vendor' ? '/vendor/dashboard' : '/customer/dashboard';

  return (
    <header className="sticky top-0 z-50 w-full bg-[#FBF8F4]/95 backdrop-blur-md border-b border-[#E8E2D9]">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        
        {/* Official Brand Logo with Tagline */}
        <Link href="/" className="flex items-center hover:opacity-95 transition-opacity">
          <AyojLogo size="lg" showTagline={false} />
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden lg:flex items-center gap-8">
          <Link href="/marketplace" className="text-xs font-medium text-[#221F1C] hover:text-[#9E5338] transition-colors">
            Explore
          </Link>
          <Link href="/vendors" className="text-xs font-medium text-[#221F1C] hover:text-[#9E5338] transition-colors">
            Vendors
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
          
          {/* Location Dropdown Pill */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#E8E2D9] bg-white text-xs font-medium text-[#221F1C] cursor-pointer hover:border-[#9E5338]/40 transition-colors">
            <MapPin className="size-3.5 text-[#221F1C]" />
            <span>Delhi NCR</span>
            <ChevronDown className="size-3 text-[#6B6560]" />
          </div>

          {/* Notification Dropdown */}
          {user && <NotificationDropdown />}

          {/* Heart Icon / Wishlist */}
          <Link href="/customer/dashboard?tab=saved">
            <button className="size-9 rounded-full border border-[#E8E2D9] bg-white flex items-center justify-center text-[#221F1C] hover:text-[#9E5338] hover:border-[#9E5338]/40 transition-all cursor-pointer">
              <Heart className="size-4" />
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
                  <LayoutDashboard className="size-3.5 text-[#9E5338]" />
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
