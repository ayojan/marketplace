'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  Heart, 
  MapPin, 
  ChevronDown, 
  LogOut, 
  Check, 
  Menu, 
  X, 
  Compass, 
  Sparkles, 
  Star, 
  Store, 
  ChevronRight,
  LayoutDashboard,
  User,
  CalendarDays,
  Briefcase,
  Settings,
  Navigation,
  Loader2,
  Camera,
  Brush,
  Flower2,
  Utensils,
  Music,
  Building2,
  Gift,
  Grid,
  ArrowRight
} from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import AyojLogo from '@/components/AyojLogo';
import { NotificationDropdown } from '@/components/NotificationDropdown';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useLocation, CITIES } from '@/lib/contexts/LocationContext';

export { CITIES };

export const CATEGORIES_NAV = [
  {
    name: 'Photographers',
    slug: 'photographer',
    icon: Camera,
    description: 'Candid wedding, portraits & event shoots',
  },
  {
    name: 'Makeup Artists',
    slug: 'makeup-artist',
    icon: Brush,
    description: 'Bridal makeover, hair styling & glam',
  },
  {
    name: 'Decorators',
    slug: 'decorator',
    icon: Flower2,
    description: 'Floral mandaps, stages & thematic decor',
  },
  {
    name: 'Event Planners',
    slug: 'event-planner',
    icon: Sparkles,
    description: 'Full-service management & coordination',
  },
  {
    name: 'Caterers',
    slug: 'caterer',
    icon: Utensils,
    description: 'Gourmet dining & personalized food counters',
  },
  {
    name: 'DJs & Entertainment',
    slug: 'dj',
    icon: Music,
    description: 'Sangeet DJs, live sound & performances',
  },
  {
    name: 'Venues',
    slug: 'venue',
    icon: Building2,
    description: 'Luxury banquets, lawns, villas & resorts',
  },
];

export const OCCASIONS_NAV = [
  {
    name: 'Weddings',
    slug: 'wedding',
    icon: Heart,
    description: 'Grand shaadi celebrations & traditions',
  },
  {
    name: 'Pre-Wedding',
    slug: 'pre-wedding',
    icon: Camera,
    description: 'Haldi, Mehendi, Sangeet & couples shoots',
  },
  {
    name: 'Engagement',
    slug: 'engagement',
    icon: Sparkles,
    description: 'Roka ceremonies & ring exchange parties',
  },
  {
    name: 'Birthdays',
    slug: 'birthday',
    icon: Gift,
    description: 'Kids parties & milestone age celebrations',
  },
  {
    name: 'Corporate Events',
    slug: 'corporate',
    icon: Building2,
    description: 'Annual summits, galas & team offsites',
  },
  {
    name: 'Baby Shower',
    slug: 'baby-shower',
    icon: Heart,
    description: 'Godh bharai & family milestone ceremonies',
  },
  {
    name: 'Anniversaries',
    slug: 'anniversary',
    icon: Sparkles,
    description: 'Silver, golden & romantic celebration dates',
  },
];

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
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState<boolean>(false);
  const [mobileOccasionsOpen, setMobileOccasionsOpen] = useState<boolean>(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const desktopNavRef = useRef<HTMLDivElement>(null);
  const locationDropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const getCategoryUrl = (slug: string) => {
    const params = new URLSearchParams();
    if (slug && slug !== 'all') params.set('category', slug);
    if (selectedCity && selectedCity !== 'All Cities') params.set('location', selectedCity);
    const qs = params.toString();
    return qs ? `/marketplace?${qs}` : '/marketplace';
  };

  const getOccasionUrl = (slug: string) => {
    const params = new URLSearchParams();
    if (slug && slug !== 'all') params.set('occasion', slug);
    if (selectedCity && selectedCity !== 'All Cities') params.set('location', selectedCity);
    const qs = params.toString();
    return qs ? `/marketplace?${qs}` : '/marketplace';
  };

  const handleMouseEnter = (menu: 'categories' | 'occasions') => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setOpenMenu(menu);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setOpenMenu(null);
    }, 180);
  };

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
        <nav ref={desktopNavRef} className="hidden lg:flex items-center gap-7">
          
          {/* Categories Dropdown with Smooth Hover */}
          <div 
            className="relative"
            onMouseEnter={() => handleMouseEnter('categories')}
            onMouseLeave={handleMouseLeave}
          >
            <Link 
              href={getCategoryUrl('all')}
              onClick={() => setOpenMenu(null)}
              className={`flex items-center gap-1.5 text-xs font-medium py-2 transition-colors cursor-pointer group ${
                openMenu === 'categories' ? 'text-[#9E5338]' : 'text-[#221F1C] hover:text-[#9E5338]'
              }`}
            >
              <span>Categories</span>
              <ChevronDown 
                className={`size-3 transition-transform duration-200 ${
                  openMenu === 'categories' ? 'rotate-180 text-[#9E5338]' : 'text-[#6B6560] group-hover:text-[#9E5338]'
                }`} 
              />
            </Link>

            {/* Categories Dropdown Menu List */}
            {openMenu === 'categories' && (
              <div 
                className="absolute top-full left-0 pt-2 z-50 w-80 animate-in fade-in-0 zoom-in-95 duration-150"
                onMouseEnter={() => handleMouseEnter('categories')}
                onMouseLeave={handleMouseLeave}
              >
                <div className="rounded-2xl bg-white/98 backdrop-blur-xl border border-[#E8E2D9] shadow-2xl p-2">
                  <div className="px-3 pt-1.5 pb-2 border-b border-[#E8E2D9]/60 flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B6560]">
                      All Categories
                    </span>
                    <span className="text-[10px] text-[#9E5338] font-semibold bg-[#F3EADF] px-2 py-0.5 rounded-full">
                      Verified Pros
                    </span>
                  </div>

                  <div className="py-1 space-y-0.5">
                    {CATEGORIES_NAV.map((cat) => {
                      const Icon = cat.icon;
                      return (
                        <Link
                          key={cat.slug}
                          href={getCategoryUrl(cat.slug)}
                          onClick={() => setOpenMenu(null)}
                          className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[#F3EADF]/60 group transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="size-8 rounded-xl bg-[#FAF7F2] border border-[#E8E2D9] flex items-center justify-center text-[#9E5338] group-hover:bg-white group-hover:border-[#9E5338]/40 group-hover:shadow-2xs transition-all shrink-0">
                              <Icon className="size-4" />
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-[#221F1C] group-hover:text-[#9E5338] transition-colors leading-tight">
                                {cat.name}
                              </p>
                              <p className="text-[10px] text-[#6B6560] leading-tight mt-0.5">
                                {cat.description}
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="size-3.5 text-[#6B6560]/40 group-hover:text-[#9E5338] group-hover:translate-x-0.5 transition-all opacity-0 group-hover:opacity-100 shrink-0" />
                        </Link>
                      );
                    })}
                  </div>

                  <div className="pt-1.5 mt-0.5 border-t border-[#E8E2D9]/60">
                    <Link
                      href={getCategoryUrl('all')}
                      onClick={() => setOpenMenu(null)}
                      className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-[#9E5338] hover:bg-[#F3EADF]/60 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <Grid className="size-3.5" />
                        <span>Explore all categories & talent</span>
                      </span>
                      <ArrowRight className="size-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Occasions Dropdown with Smooth Hover */}
          <div 
            className="relative"
            onMouseEnter={() => handleMouseEnter('occasions')}
            onMouseLeave={handleMouseLeave}
          >
            <Link 
              href={getOccasionUrl('all')}
              onClick={() => setOpenMenu(null)}
              className={`flex items-center gap-1.5 text-xs font-medium py-2 transition-colors cursor-pointer group ${
                openMenu === 'occasions' ? 'text-[#9E5338]' : 'text-[#221F1C] hover:text-[#9E5338]'
              }`}
            >
              <span>Occasions</span>
              <ChevronDown 
                className={`size-3 transition-transform duration-200 ${
                  openMenu === 'occasions' ? 'rotate-180 text-[#9E5338]' : 'text-[#6B6560] group-hover:text-[#9E5338]'
                }`} 
              />
            </Link>

            {/* Occasions Dropdown Menu List */}
            {openMenu === 'occasions' && (
              <div 
                className="absolute top-full left-0 pt-2 z-50 w-80 animate-in fade-in-0 zoom-in-95 duration-150"
                onMouseEnter={() => handleMouseEnter('occasions')}
                onMouseLeave={handleMouseLeave}
              >
                <div className="rounded-2xl bg-white/98 backdrop-blur-xl border border-[#E8E2D9] shadow-2xl p-2">
                  <div className="px-3 pt-1.5 pb-2 border-b border-[#E8E2D9]/60 flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B6560]">
                      Celebration Occasions
                    </span>
                    <span className="text-[10px] text-[#9E5338] font-semibold bg-[#F3EADF] px-2 py-0.5 rounded-full">
                      Milestones
                    </span>
                  </div>

                  <div className="py-1 space-y-0.5">
                    {OCCASIONS_NAV.map((occ) => {
                      const Icon = occ.icon;
                      return (
                        <Link
                          key={occ.slug}
                          href={getOccasionUrl(occ.slug)}
                          onClick={() => setOpenMenu(null)}
                          className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[#F3EADF]/60 group transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="size-8 rounded-xl bg-[#FAF7F2] border border-[#E8E2D9] flex items-center justify-center text-[#9E5338] group-hover:bg-white group-hover:border-[#9E5338]/40 group-hover:shadow-2xs transition-all shrink-0">
                              <Icon className="size-4" />
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-[#221F1C] group-hover:text-[#9E5338] transition-colors leading-tight">
                                {occ.name}
                              </p>
                              <p className="text-[10px] text-[#6B6560] leading-tight mt-0.5">
                                {occ.description}
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="size-3.5 text-[#6B6560]/40 group-hover:text-[#9E5338] group-hover:translate-x-0.5 transition-all opacity-0 group-hover:opacity-100 shrink-0" />
                        </Link>
                      );
                    })}
                  </div>

                  <div className="pt-1.5 mt-0.5 border-t border-[#E8E2D9]/60">
                    <Link
                      href={getOccasionUrl('all')}
                      onClick={() => setOpenMenu(null)}
                      className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-[#9E5338] hover:bg-[#F3EADF]/60 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <Sparkles className="size-3.5" />
                        <span>Explore all celebrations & packages</span>
                      </span>
                      <ArrowRight className="size-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Link href="/#reviews" className="text-xs font-medium text-[#221F1C] hover:text-[#9E5338] transition-colors">
            Real Reviews
          </Link>
          <Link href="/register?role=vendor" className="text-xs font-medium text-[#221F1C] hover:text-[#9E5338] transition-colors">
            For Vendors
          </Link>
        </nav>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Interactive Location Dropdown Pill (Desktop & Tablets) */}
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
              <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-white border border-[#E8E2D9] shadow-xl py-1.5 z-50 overflow-hidden">
                <button
                  type="button"
                  disabled={isDetecting}
                  onClick={handleDetectLocation}
                  className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-[#9E5338] hover:bg-[#F3EADF] border-b border-[#E8E2D9] cursor-pointer transition-colors"
                >
                  {isDetecting ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Navigation className="size-3.5" />
                  )}
                  <span>{isDetecting ? 'Detecting Hub...' : 'Detect My Location'}</span>
                </button>

                <div className="px-3.5 pt-2 pb-1 text-[10px] font-bold text-[#6B6560] uppercase tracking-wider">
                  Select City
                </div>
                {CITIES.map((city) => {
                  const isSelected = selectedCity === city;
                  return (
                    <button
                      key={city}
                      type="button"
                      onClick={() => handleSelectCity(city)}
                      className={`w-full flex items-center justify-between px-3.5 py-1.5 text-xs text-left cursor-pointer transition-colors ${
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

                <div className="pt-1 mt-1 border-t border-[#E8E2D9]/80">
                  <button
                    type="button"
                    onClick={() => {
                      setIsLocationOpen(false);
                      openLocationPrompt();
                    }}
                    className="w-full px-3.5 py-1.5 text-[11px] font-medium text-[#6B6560] hover:text-[#9E5338] hover:bg-[#FAF7F2] text-left cursor-pointer transition-colors"
                  >
                    Change celebration hub...
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Notification Dropdown */}
          {user && <NotificationDropdown />}

          {/* Desktop Auth Controls: Simple Profile Photo / Avatar with Dropdown */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="User account menu"
                  title={user.first_name ? `${user.first_name}'s account` : 'Account menu'}
                  className="hidden sm:flex items-center justify-center size-9 rounded-full border border-[#E8E2D9] hover:border-[#9E5338]/60 bg-white hover:bg-[#FAF7F2] transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#9E5338]/20 group p-0.5 shadow-xs"
                >
                  <Avatar className="size-8 ring-1 ring-[#E8E2D9]/60 transition-transform duration-150 group-hover:scale-105">
                    {user.avatar_url && <AvatarImage src={user.avatar_url} alt={user.first_name || 'User avatar'} />}
                    <AvatarFallback className="bg-[#9E5338] text-white text-xs font-serif font-bold">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56 p-1.5 rounded-2xl bg-white border border-[#E8E2D9] shadow-xl animate-in fade-in-0 zoom-in-95 duration-150">
                {/* Account Details Header */}
                <div className="px-3 py-2.5 border-b border-[#E8E2D9]/80 bg-[#FAF7F2] rounded-xl mb-1">
                  <p className="text-xs font-bold text-[#221F1C] truncate">
                    {user.first_name ? `${user.first_name} ${user.last_name || ''}` : (user.business_name || user.email)}
                  </p>
                  <p className="text-[11px] text-[#6B6560] truncate">{user.email}</p>
                  <div className="mt-1.5">
                    <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-[#F3EADF] text-[#9E5338]">
                      {user.role === 'vendor' ? 'Verified Partner' : 'Customer Host'}
                    </span>
                  </div>
                </div>

                {/* Dashboard (Linked directly to profile logo) */}
                {/* Main Dashboard / Overview */}
                <DropdownMenuItem asChild className="rounded-xl px-3 py-2 text-xs font-medium text-[#221F1C] hover:bg-[#F3EADF] hover:text-[#9E5338] cursor-pointer">
                  <Link href={dashboardLink} className="flex items-center gap-2.5 w-full">
                    <LayoutDashboard className="size-4 text-[#9E5338]" />
                    <span>{user.role === 'vendor' ? 'Vendor Portal (Overview)' : 'Main Dashboard'}</span>
                  </Link>
                </DropdownMenuItem>

                {/* Profile & Settings / Business Settings */}
                <DropdownMenuItem asChild className="rounded-xl px-3 py-2 text-xs font-medium text-[#221F1C] hover:bg-[#F3EADF] hover:text-[#9E5338] cursor-pointer">
                  <Link 
                    href={user.role === 'vendor' ? '/vendor/dashboard?tab=settings' : '/customer/dashboard?tab=profile'} 
                    className="flex items-center gap-2.5 w-full"
                  >
                    <Settings className="size-4 text-[#9E5338]" />
                    <span>{user.role === 'vendor' ? 'Business Settings' : 'Profile & Settings'}</span>
                  </Link>
                </DropdownMenuItem>

                {/* Calendar / Bookings */}
                <DropdownMenuItem asChild className="rounded-xl px-3 py-2 text-xs font-medium text-[#221F1C] hover:bg-[#F3EADF] hover:text-[#9E5338] cursor-pointer">
                  <Link 
                    href={user.role === 'vendor' ? '/vendor/dashboard?tab=calendar' : '/customer/dashboard?tab=bookings'} 
                    className="flex items-center gap-2.5 w-full"
                  >
                    <CalendarDays className="size-4 text-[#9E5338]" />
                    <span>{user.role === 'vendor' ? 'Booking Calendar' : 'My Bookings'}</span>
                  </Link>
                </DropdownMenuItem>

                {/* Manage Services (if vendor) */}
                {user.role === 'vendor' && (
                  <DropdownMenuItem asChild className="rounded-xl px-3 py-2 text-xs font-medium text-[#221F1C] hover:bg-[#F3EADF] hover:text-[#9E5338] cursor-pointer">
                    <Link href="/vendor/dashboard?tab=services" className="flex items-center gap-2.5 w-full">
                      <Briefcase className="size-4 text-[#9E5338]" />
                      <span>Manage Services</span>
                    </Link>
                  </DropdownMenuItem>
                )}

                {/* Saved Favorites */}
                <DropdownMenuItem asChild className="rounded-xl px-3 py-2 text-xs font-medium text-[#221F1C] hover:bg-[#F3EADF] hover:text-[#9E5338] cursor-pointer">
                  <Link href="/customer/dashboard?tab=saved" className="flex items-center gap-2.5 w-full">
                    <Heart className="size-4 text-[#9E5338]" />
                    <span>Saved Pros</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="my-1 border-t border-[#E8E2D9]" />

                {/* Relocated Logout Option */}
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="rounded-xl px-3 py-2 text-xs font-medium text-rose-700 hover:bg-rose-50 hover:text-rose-800 cursor-pointer flex items-center gap-2.5"
                >
                  <LogOut className="size-4 text-rose-600" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
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
      {isMobileMenuOpen && (
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
                      href={getCategoryUrl('all')}
                      onClick={() => setIsMobileMenuOpen(false)}
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
                          href={getCategoryUrl(cat.slug)}
                          onClick={() => setIsMobileMenuOpen(false)}
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
                      href={getOccasionUrl('all')}
                      onClick={() => setIsMobileMenuOpen(false)}
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
                          href={getOccasionUrl(occ.slug)}
                          onClick={() => setIsMobileMenuOpen(false)}
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
                onClick={() => setIsMobileMenuOpen(false)}
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
                onClick={() => setIsMobileMenuOpen(false)}
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
                    setIsMobileMenuOpen(false);
                    openLocationPrompt();
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
                onClick={handleDetectLocation}
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
                      onClick={() => handleSelectCity(city)}
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
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Button
                        className="w-full bg-[#9E5338] hover:bg-[#86442B] text-white rounded-full text-xs font-medium h-10 shadow-xs"
                      >
                        Dashboard
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      onClick={handleLogout}
                      className="w-full border-rose-200 text-rose-700 bg-white hover:bg-rose-50 rounded-full text-xs font-medium h-10 gap-1.5"
                    >
                      <LogOut className="size-3.5 text-rose-600" />
                      Sign Out
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button
                      variant="outline"
                      className="w-full border-[#E8E2D9] bg-white hover:bg-[#F3EADF] text-[#221F1C] rounded-full text-xs font-medium h-10"
                    >
                      Log in
                    </Button>
                  </Link>
                  <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
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
      )}
    </header>
  );
}
