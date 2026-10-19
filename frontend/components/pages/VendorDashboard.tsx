'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { apiService } from '@/lib/api';
import ServiceManagement from '../ServiceManagement';
import PortfolioManager from '../PortfolioManager';
import BookingCalendar from '../BookingCalendar';
import AyojLogo from '@/components/AyojLogo';
import Link from 'next/link';
import VendorSettings from '../VendorSettings';
import VendorBookings from '../VendorBookings';
import { NotificationDropdown } from '@/components/NotificationDropdown';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Briefcase, 
  Image as ImageIcon, 
  Calendar as CalendarIcon, 
  CalendarCheck,
  TrendingUp, 
  CheckCircle2, 
  IndianRupee,
  Plus,
  ShieldCheck,
  Star,
  ChevronRight,
  Settings,
  Bell,
  Search,
  LogOut,
  Menu,
  X,
  Camera,
  Store,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';

const VendorDashboard = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabFromUrl || 'overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
    } else {
      setActiveTab('overview');
    }
  }, [tabFromUrl]);
  const [dashboardData, setDashboardData] = useState<{
    services: any[];
    analytics: any | null;
    profile: any | null;
  }>({
    services: [],
    analytics: null,
    profile: null
  });

  const [loading, setLoading] = useState(false);

  const loadDashboardData = React.useCallback(async () => {
    try {
      setLoading(true);
      const [profileResponse, analyticsResponse] = await Promise.all([
        apiService.profiles.me().catch(() => null),
        apiService.analytics.dashboard().catch(() => null)
      ]);
      const fetchedProfile = profileResponse?.data || null;
      const vendorId = fetchedProfile?.id;

      const servicesResponse = await (vendorId
        ? apiService.vendors.getServices(vendorId).catch(() => null)
        : apiService.services.getAll({ scope: 'mine' }).catch(() => null));

      let fetchedServices = servicesResponse?.data?.services || [];
      if (vendorId) {
        fetchedServices = fetchedServices.filter((s: any) =>
          !s.vendor_id || String(s.vendor_id) === String(vendorId)
        );
      }
      const fetchedAnalytics = analyticsResponse?.data || null;

      setDashboardData({
        services: fetchedServices,
        analytics: fetchedAnalytics,
        profile: fetchedProfile
      });
    } catch (err) {
      setDashboardData({
        services: [],
        analytics: null,
        profile: null
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const navItems = [
    { id: 'overview', name: 'Overview', icon: LayoutDashboard },
    { id: 'bookings', name: 'Bookings', icon: CalendarCheck },
    { id: 'services', name: 'Services', icon: Briefcase },
    { id: 'portfolio', name: 'Portfolio', icon: ImageIcon },
    { id: 'calendar', name: 'Calendar', icon: CalendarIcon },
    { id: 'settings', name: 'Settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const [bannerDismissed, setBannerDismissed] = useState(false);

  const renderOverview = () => {
    const analytics = dashboardData.analytics;
    const revenue = analytics?.revenue_stats?.total_revenue ?? 0;
    const totalBookings = analytics?.overview?.total_bookings ?? 0;
    const activeServices = analytics?.overview?.active_services ?? dashboardData.services.length;
    const avgRating = analytics?.overview?.average_rating ? `${Number(analytics.overview.average_rating).toFixed(1)}` : 'New';
    const recentActivity = analytics?.recent_activity ?? [];

    const isProfileOnboarded = Boolean(
      dashboardData.profile?.metadata?.onboarding_completed ||
      String(dashboardData.profile?.metadata?.onboarding_completed) === 'true' ||
      (dashboardData.profile?.verification_status && dashboardData.profile?.verification_status !== 'unverified') ||
      (dashboardData.services.length > 0 && Number(dashboardData.profile?.metadata?.onboarding_step) >= 5)
    );

    const showIncompleteBanner = Boolean(
      dashboardData.profile &&
      !isProfileOnboarded &&
      !bannerDismissed
    );

    return (
      <div className="space-y-6">
        {/* Onboarding Incomplete Banner */}
        {showIncompleteBanner && (
          <div className="p-4 sm:p-5 rounded-2xl bg-[#F3EADF] border border-[#E8E2D9] text-[#221F1C] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs relative">
            <div className="flex items-center gap-3.5 pr-8 sm:pr-0">
              <div className="size-10 rounded-xl bg-[#9E5338] text-white flex items-center justify-center shrink-0 shadow-sm">
                <Sparkles className="size-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-[#221F1C]">Your Marketplace Listing is Incomplete</h4>
                <p className="text-[11px] text-[#6B6560] mt-0.5 max-w-xl">
                  Finish setting up your service offerings, travel radius, and portfolio packages to publish your profile and start receiving client inquiries.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
              <Button
                onClick={() => router.push('/vendor/onboarding')}
                className="bg-[#9E5338] hover:bg-[#85432c] text-white rounded-xl text-xs font-bold h-9 px-4 shadow-sm transition-all"
              >
                Resume Onboarding →
              </Button>
              <button
                onClick={() => setBannerDismissed(true)}
                className="size-8 rounded-lg text-[#6B6560] hover:text-[#221F1C] hover:bg-[#E8E2D9]/60 flex items-center justify-center transition-colors"
                title="Dismiss banner"
                aria-label="Dismiss banner"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>
        )}

        {/* Compact Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Revenue', value: `₹${revenue.toLocaleString('en-IN')}`, icon: IndianRupee, trend: 'All-time' },
            { label: 'Bookings', value: totalBookings, icon: CalendarIcon, trend: totalBookings > 0 ? 'Active' : 'No bookings' },
            { label: 'Active Services', value: activeServices, icon: Briefcase, trend: activeServices > 0 ? 'Live' : 'Pending' },
            { label: 'Rating', value: avgRating, icon: Star, trend: analytics?.overview?.average_rating ? 'Verified' : 'New partner' },
          ].map((stat, i) => (
            <div key={i} className="p-4 rounded-xl border border-[#E8E2D9] bg-white shadow-sm hover:border-[#9E5338]/40 transition-all group">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B6560]">{stat.label}</span>
                <stat.icon className="size-4 text-[#6B6560] group-hover:text-[#9E5338] transition-colors" />
              </div>
              <div className="flex items-end justify-between">
                <h4 className="text-xl font-bold text-[#221F1C] tracking-tight">{stat.value}</h4>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">{stat.trend}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Feed Area */}
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 rounded-2xl border border-[#E8E2D9] bg-white relative overflow-hidden">
               <div className="relative z-10">
                  <h3 className="text-base font-serif font-bold text-[#221F1C] mb-1">Growth Overview</h3>
                  <p className="text-xs text-[#6B6560] mb-6">Your profile performance over the last 30 days</p>
                  <div className="h-44 w-full flex items-end justify-between gap-2">
                     {[40, 70, 45, 90, 65, 80, 100, 55, 75, 60, 85, 95].map((h, i) => (
                        <div key={i} className="flex-1 bg-[#F3EADF] rounded-t-sm hover:bg-[#9E5338] transition-colors cursor-pointer relative group/bar" style={{ height: `${h}%` }}>
                           <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#221F1C] text-white text-[10px] font-medium py-0.5 px-2 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap">
                              {h}%
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="p-5 rounded-2xl border border-[#E8E2D9] bg-white space-y-4">
                  <h3 className="text-xs font-bold text-[#221F1C] uppercase tracking-wider">Active Services</h3>
                  <div className="space-y-3">
                     {dashboardData.services.length > 0 ? (
                       dashboardData.services.slice(0, 3).map((s: any) => (
                          <div key={s.id} className="flex items-center justify-between p-2.5 rounded-xl bg-[#FBF8F4] border border-[#E8E2D9]">
                             <div className="flex items-center gap-2.5">
                                <div className="size-8 rounded-lg bg-[#F3EADF] flex items-center justify-center text-[#9E5338]">
                                   <Briefcase size={16} />
                                </div>
                                <div>
                                   <p className="text-xs font-bold text-[#221F1C]">{s.name}</p>
                                   <p className="text-[10px] text-[#6B6560]">
                                     {s.formatted_price || (s.base_price ? `₹${Number(s.base_price).toLocaleString('en-IN')}` : 'Price on request')}
                                   </p>
                                </div>
                             </div>
                             <ChevronRight size={14} className="text-[#6B6560]" />
                          </div>
                       ))
                     ) : (
                       <p className="text-xs text-[#6B6560] py-4 text-center">No active services listed yet.</p>
                     )}
                  </div>
               </div>

               <div className="p-5 rounded-2xl border border-[#E8E2D9] bg-white space-y-4">
                  <h3 className="text-xs font-bold text-[#221F1C] uppercase tracking-wider">Quick Actions</h3>
                  <div className="grid grid-cols-3 gap-2.5">
                     <button onClick={() => setActiveTab('bookings')} className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E8E2D9] flex flex-col items-center gap-1.5 hover:bg-[#9E5338] hover:text-white transition-all group cursor-pointer text-center">
                        <CalendarCheck size={16} className="text-[#9E5338] group-hover:text-white" />
                        <span className="text-[10px] font-bold uppercase">Bookings</span>
                     </button>
                     <button onClick={() => setActiveTab('services')} className="p-3 rounded-xl bg-[#F3EADF] border border-[#E8E2D9] flex flex-col items-center gap-1.5 hover:bg-[#9E5338] hover:text-white transition-all group cursor-pointer text-center">
                        <Plus size={16} className="text-[#9E5338] group-hover:text-white" />
                        <span className="text-[10px] font-bold uppercase">Service</span>
                     </button>
                     <button onClick={() => setActiveTab('portfolio')} className="p-3 rounded-xl bg-[#F5ECE2] border border-[#E8E2D9] flex flex-col items-center gap-1.5 hover:bg-[#9E5338] hover:text-white transition-all group cursor-pointer text-center">
                        <Plus size={16} className="text-[#9E5338] group-hover:text-white" />
                        <span className="text-[10px] font-bold uppercase">Media</span>
                     </button>
                  </div>
               </div>
            </div>
          </div>

          {/* Sidebar Feed Area */}
          <div className="space-y-6">
             <div className="p-5 rounded-2xl border border-[#E8E2D9] bg-white space-y-4">
                <h3 className="text-xs font-bold text-[#221F1C] uppercase tracking-wider">Recent Activity</h3>
                <div className="space-y-4">
                   {recentActivity.length > 0 ? (
                     recentActivity.map((activity: any, idx: number) => (
                        <div key={idx} className="flex gap-3">
                           <div className={`size-7 rounded-full flex items-center justify-center shrink-0 ${
                              activity.type === 'booking' ? 'bg-amber-100 text-amber-700' : 'bg-[#F3EADF] text-[#9E5338]'
                           }`}>
                              {activity.type === 'booking' ? <CalendarIcon size={12} /> : <Star size={12} />}
                           </div>
                           <div className="space-y-0.5">
                              <p className="text-xs font-semibold text-[#221F1C]">{activity.customer}</p>
                              <p className="text-[11px] text-[#6B6560]">
                                 {activity.type === 'booking' ? 'Requested booking session' : 'Left a review'}
                              </p>
                           </div>
                        </div>
                     ))
                   ) : (
                     <p className="text-xs text-[#6B6560] py-4 text-center">No recent activity yet.</p>
                   )}
                </div>
             </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FBF8F4] flex text-[#221F1C] font-sans">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-[#E8E2D9] transition-transform duration-300 lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full p-6">
          <Link href="/" className="flex items-center gap-2 mb-10 hover:opacity-90 transition-opacity">
            <AyojLogo size="md" showTagline={false} />
          </Link>

          <nav className="flex-1 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (typeof window !== 'undefined') {
                    window.history.replaceState(null, '', `/vendor/dashboard?tab=${item.id}`);
                  }
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === item.id 
                    ? 'bg-[#F3EADF] text-[#9E5338] border border-[#E8E2D9]' 
                    : 'text-[#6B6560] hover:text-[#221F1C] hover:bg-[#FBF8F4]'
                }`}
              >
                <item.icon size={16} />
                {item.name}
              </button>
            ))}
          </nav>

          <div className="mt-auto space-y-3 pt-4 border-t border-[#E8E2D9]">
            <div className="flex items-center gap-3 px-2">
               <div className="size-8 rounded-full bg-[#F3EADF] border border-[#E8E2D9] flex items-center justify-center text-xs font-bold text-[#9E5338]">
                  {(user?.business_name || user?.first_name || 'V')[0].toUpperCase()}
               </div>
               <div className="min-w-0">
                  <p className="text-xs font-bold text-[#221F1C] truncate">
                    {user?.business_name || 'My Studio'}
                  </p>
                  <p className="text-[10px] text-[#6B6560]">
                    {user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : 'Vendor Partner'}
                  </p>
               </div>
            </div>
            <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[#6B6560] hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer">
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 overflow-auto max-h-screen">
        <header className="h-16 border-b border-[#E8E2D9] bg-[#FBF8F4]/90 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-8">
           <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 text-[#6B6560]">
                 {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#6B6560]">
                 {navItems.find(n => n.id === activeTab)?.name}
              </h2>
           </div>

           <div className="flex items-center gap-4">
              {/* Vendor Business Badge */}
              <div className="flex items-center gap-2 bg-[#F3EADF] border border-[#E8E2D9] px-3.5 py-1.5 rounded-full text-xs font-bold text-[#221F1C]">
                <Store size={14} className="text-[#9E5338]" />
                <span>{user?.business_name || 'Vendor Portal'}</span>
              </div>

              <NotificationDropdown />
           </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            {loading ? (
              <div key="loading" className="space-y-6 animate-pulse">
                <div className="grid grid-cols-4 gap-4">
                  {[1,2,3,4].map(i => <div key={i} className="h-20 bg-white rounded-xl border border-[#E8E2D9]" />)}
                </div>
                <div className="h-80 bg-white rounded-2xl border border-[#E8E2D9]" />
              </div>
            ) : (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'overview' && renderOverview()}
                {activeTab === 'bookings' && <VendorBookings />}
                {activeTab === 'services' && <ServiceManagement services={dashboardData.services} onServiceUpdate={loadDashboardData} />}
                {activeTab === 'portfolio' && <PortfolioManager />}
                {activeTab === 'calendar' && <BookingCalendar />}
                {activeTab === 'settings' && <VendorSettings />}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default VendorDashboard;
