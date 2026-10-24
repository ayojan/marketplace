'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Calendar as CalendarIcon,
  Heart,
  ShoppingBag,
  Star,
} from 'lucide-react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { apiService } from '@/lib/api';
import Header from '@/components/Header';
import AyojLogo from '@/components/AyojLogo';
import { Skeleton } from '@/components/ui/skeleton';
import { ReviewFormModal } from '@/components/ReviewFormModal';
import { BookingMessageModal } from '@/components/BookingMessageModal';
import {
  CustomerProfileHeader,
  CustomerProfileView,
  CustomerOverviewTab,
  CustomerBookingsTab,
  CustomerSavedTab,
  CustomerReviewsTab,
  CustomerProfileData,
  DashboardStat,
  SavedVendor,
  RecommendedPro,
  ChecklistItem,
} from '@/components/customer';

export default function CustomerDashboard() {
  const { user, updateUser } = useAuth();
  const searchParams = useSearchParams();
  const tabParam = searchParams ? searchParams.get('tab') : null;
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(
    tabParam === 'settings' || tabParam === 'profile' ? 'profile' : (tabParam || 'overview')
  );

  // Sync tab from URL query params
  useEffect(() => {
    if (tabParam) {
      if (tabParam === 'settings' || tabParam === 'profile') {
        setActiveTab('profile');
      } else if (['overview', 'bookings', 'saved', 'checklist', 'reviews'].includes(tabParam)) {
        setActiveTab(tabParam);
      }
    } else {
      setActiveTab('overview');
    }
  }, [tabParam]);

  const [bookingFilter, setBookingFilter] = useState('all');
  const [bookings, setBookings] = useState<any[]>([]);
  const [savedVendors, setSavedVendors] = useState<SavedVendor[]>([]);
  const [recommendedPros, setRecommendedPros] = useState<RecommendedPro[]>([]);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [newChecklistTitle, setNewChecklistTitle] = useState('');
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedBookingForReview, setSelectedBookingForReview] = useState<any>(null);
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [selectedBookingForChat, setSelectedBookingForChat] = useState<any>(null);

  // Enriched Celebration Passport & Profile State
  const [profileForm, setProfileForm] = useState<CustomerProfileData>({
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    city: user?.location || 'Delhi NCR',
    avatarUrl: user?.avatar_url || '',
    coupleName: '',
    hashtag: '',
    weddingDate: '',
    eventType: 'Wedding',
    venueName: '',
    guestCount: '100_250',
    budgetRange: 'between_1000_2500',
    totalBudget: 300000,
    vibeTags: ['📸 Candid & Storytelling', '👑 Royal & Grand Heritage'],
    coHost: {
      name: '',
      email: '',
      relationship: 'Partner / Fiancé',
      status: 'none',
    },
    notifications: {
      whatsapp: true,
      sms: true,
      email: true,
      marketing: false,
    },
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // Gamified Profile Completion Gauge
  const completionPercentage = useMemo(() => {
    let score = 0;
    if (profileForm.firstName) score += 15;
    if (profileForm.lastName) score += 10;
    if (profileForm.email) score += 10;
    if (profileForm.phone) score += 15;
    if (profileForm.city) score += 10;
    if (profileForm.weddingDate) score += 15;
    if (profileForm.venueName) score += 10;
    if (profileForm.vibeTags && profileForm.vibeTags.length > 0) score += 10;
    if (profileForm.avatarUrl) score += 5;
    return Math.min(100, score);
  }, [profileForm]);

  // Sync user prop when auth finishes loading
  useEffect(() => {
    if (user) {
      setProfileForm(prev => ({
        ...prev,
        firstName: prev.firstName || user.first_name || '',
        lastName: prev.lastName || user.last_name || '',
        email: user.email || prev.email || '',
        phone: user.phone || prev.phone || '',
        city: prev.city || user.location || 'Delhi NCR',
        avatarUrl: prev.avatarUrl || user.avatar_url || '',
      }));
    }
  }, [user]);

  const isBookingUpcoming = (b: any) => {
    if (!b) return false;
    const s = String(b.status || '').toLowerCase();
    if (s === 'completed' || s === 'declined' || s === 'cancelled') {
      return false;
    }
    if (['confirmed', 'accepted', 'pending', 'counter_offered'].includes(s)) {
      return true;
    }
    if (b.event_date) {
      const eventTime = new Date(b.event_date).getTime();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return !isNaN(eventTime) && eventTime >= today.getTime();
    }
    return false;
  };

  const isBookingCompleted = (b: any) => {
    return String(b?.status || '').toLowerCase() === 'completed';
  };

  const fetchSavedVendors = async () => {
    try {
      const response = await apiService.favorites.getAll().catch(() => null);
      const fetchedFavs = response?.data?.favorites || [];
      const mapped = fetchedFavs.map((f: any) => ({
        id: String(f.vendor?.id || f.vendor_id),
        slug: f.vendor?.slug,
        favorite_id: f.id,
        name: f.vendor?.business_name || 'Creative Partner',
        category: Array.isArray(f.vendor?.service_categories) ? f.vendor?.service_categories[0] : (f.vendor?.service_categories || 'Creative Partner'),
        location: f.vendor?.location || 'Delhi NCR',
        rating: f.vendor?.average_rating ? Number(f.vendor.average_rating) : 0,
        reviewsCount: f.vendor?.total_reviews || 0,
        price: f.vendor?.base_price ? `₹${f.vendor.base_price.toLocaleString()}` : 'Price on request',
        image: f.vendor?.image || f.vendor?.profile_image_url || 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=600&q=80'
      }));
      setSavedVendors(mapped);
    } catch (err) {
      console.error('Failed to load favorites:', err);
      setSavedVendors([]);
    }
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await apiService.bookings.getAll().catch(() => null);
      const fetched = response?.data?.bookings || [];
      setBookings(fetched);
    } catch (error) {
      console.error('Failed to load bookings:', error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendedPros = async () => {
    try {
      const response = await apiService.vendors.getAll({ per_page: 4, min_rating: 4.5 }).catch(() => null);
      const rawData = response?.data?.vendors || (Array.isArray(response?.data) ? response.data : []);
      const mapped = rawData.map((v: any) => ({
        id: String(v.id),
        name: v.business_name || v.name || 'Creative Partner',
        category: Array.isArray(v.service_categories) ? v.service_categories[0] : (v.category || v.trade || 'Verified Pro'),
        location: v.location || 'Delhi NCR',
        rating: v.average_rating || v.rating || 5.0,
        reviewsCount: v.total_reviews || 0,
        price: v.base_price ? `₹${Number(v.base_price).toLocaleString('en-IN')}` : 'Price on request',
        image: v.image || v.profile_image_url || 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=600&q=80'
      }));
      setRecommendedPros(mapped);
    } catch (err) {
      setRecommendedPros([]);
    }
  };

  const fetchCustomer = async () => {
    try {
      const response = await apiService.customer.get().catch(() => null);
      const profile = response?.data?.customer;
      if (profile) {
        let extraPrefs: any = {};
        try {
          extraPrefs = typeof profile.preferences === 'string'
            ? JSON.parse(profile.preferences)
            : (profile.preferences || {});
        } catch (e) {}

        setProfileForm(prev => ({
          ...prev,
          firstName: profile.first_name || user?.first_name || prev.firstName,
          lastName: profile.last_name || user?.last_name || prev.lastName,
          email: profile.email || user?.email || prev.email,
          phone: profile.phone || prev.phone,
          city: profile.location || prev.city,
          avatarUrl: extraPrefs.avatarUrl || user?.avatar_url || prev.avatarUrl,
          coupleName: extraPrefs.coupleName || prev.coupleName,
          hashtag: extraPrefs.hashtag || prev.hashtag,
          weddingDate: extraPrefs.weddingDate || prev.weddingDate,
          eventType: profile.event_types || extraPrefs.eventType || prev.eventType,
          venueName: extraPrefs.venueName || prev.venueName,
          guestCount: extraPrefs.guestCount || prev.guestCount,
          budgetRange: profile.budget_range || extraPrefs.budgetRange || prev.budgetRange,
          totalBudget: extraPrefs.totalBudget || prev.totalBudget,
          vibeTags: Array.isArray(extraPrefs.vibeTags) ? extraPrefs.vibeTags : prev.vibeTags,
          coHost: extraPrefs.coHost || prev.coHost,
          notifications: extraPrefs.notifications || prev.notifications,
        }));
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    }
  };

  const fetchChecklist = async () => {
    try {
      const response = await apiService.checklists.getAll().catch(() => null);
      const fetched = response?.data?.checklist_items || [];
      setChecklist(fetched);
    } catch (err) {
      console.error('Failed to load checklist:', err);
      setChecklist([]);
    }
  };

  useEffect(() => {
    fetchBookings();
    fetchSavedVendors();
    fetchChecklist();
    fetchCustomer();
    fetchRecommendedPros();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleToggleChecklist = async (id: number | string) => {
    setChecklist(prev =>
      prev.map(item => item.id === id ? { ...item, completed: !item.completed } : item)
    );
    try {
      await apiService.checklists.toggle(id);
    } catch (err) {
      setChecklist(prev =>
        prev.map(item => item.id === id ? { ...item, completed: !item.completed } : item)
      );
      toast.error('Failed to update task');
    }
  };

  const handleAddChecklistTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistTitle.trim()) return;

    const tempTitle = newChecklistTitle.trim();
    setNewChecklistTitle('');

    try {
      const res = await apiService.checklists.create({ title: tempTitle });
      const createdItem = res.data?.checklist_item || { id: Date.now(), title: tempTitle, completed: false };
      setChecklist(prev => [...prev, createdItem]);
      toast.success('Task added to checklist');
    } catch (err) {
      toast.error('Failed to add task');
    }
  };

  const handleRemoveSavedVendor = async (id: string) => {
    setSavedVendors(prev => prev.filter(v => v.id !== id));
    try {
      await apiService.favorites.removeByVendor(id);
      toast.success('Removed from wishlist');
    } catch (err) {
      toast.error('Failed to remove from wishlist');
      fetchSavedVendors();
    }
  };

  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSavingProfile(true);
    try {
      const payload = {
        first_name: profileForm.firstName,
        last_name: profileForm.lastName,
        phone: profileForm.phone,
        location: profileForm.city,
        budget_range: profileForm.budgetRange,
        event_types: profileForm.eventType,
        preferences: JSON.stringify({
          weddingDate: profileForm.weddingDate,
          eventType: profileForm.eventType,
          budgetRange: profileForm.budgetRange,
          city: profileForm.city,
          avatarUrl: profileForm.avatarUrl,
          coupleName: profileForm.coupleName,
          hashtag: profileForm.hashtag,
          venueName: profileForm.venueName,
          guestCount: profileForm.guestCount,
          vibeTags: profileForm.vibeTags,
          totalBudget: profileForm.totalBudget,
          coHost: profileForm.coHost,
          notifications: profileForm.notifications,
        }),
      };

      await apiService.customer.update(payload);

      if (updateUser) {
        updateUser({
          first_name: profileForm.firstName,
          last_name: profileForm.lastName,
          phone: profileForm.phone,
          location: profileForm.city,
          avatar_url: profileForm.avatarUrl,
        });
      }

      toast.success('Celebration Passport and profile updated successfully!');
    } catch (err: any) {
      toast.error(err.extractedMessage || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const totalSpent = bookings.reduce((sum, b) => sum + (Number(b.total_amount) || 0), 0);
  const reviewedBookings = bookings.filter(b => b.review);

  const stats: DashboardStat[] = [
    { label: 'Total Reservations', value: bookings.length.toString(), icon: CalendarIcon, trend: `${bookings.filter(b => isBookingUpcoming(b)).length} Upcoming` },
    { label: 'Saved Pros', value: savedVendors.length.toString(), icon: Heart, trend: 'Wishlist' },
    { label: 'Total Investment', value: `₹${totalSpent.toLocaleString()}`, icon: ShoppingBag, trend: 'Lifetime' },
    { label: 'Verified Reviews', value: `${reviewedBookings.length} Given`, icon: Star, trend: reviewedBookings.length > 0 ? 'Verified' : 'None yet' }
  ];

  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      if (bookingFilter === 'upcoming') return isBookingUpcoming(b);
      if (bookingFilter === 'completed') return isBookingCompleted(b);
      return true;
    });
  }, [bookings, bookingFilter]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', `/customer/dashboard?tab=${tab}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF8F4] text-[#221F1C] font-sans selection:bg-[#F3EADF] selection:text-[#9E5338] flex flex-col justify-between">
      <div>
        <Header />

        <ReviewFormModal
          open={reviewModalOpen}
          onClose={() => {
            setReviewModalOpen(false);
            setSelectedBookingForReview(null);
          }}
          onSuccess={() => {
            fetchBookings();
            toast.success('Review submitted successfully!');
          }}
          bookingId={selectedBookingForReview?.id || 0}
          vendorName={selectedBookingForReview?.vendor?.business_name || ''}
          serviceName={selectedBookingForReview?.service?.name || ''}
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          
          {/* Interactive Host Banner & Navigation */}
          <CustomerProfileHeader
            user={user}
            profileData={profileForm}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            onAvatarSelect={(url) => {
              setProfileForm((prev) => ({ ...prev, avatarUrl: url }));
              if (updateUser) {
                updateUser({ avatar_url: url });
              }
            }}
            bookingsCount={bookings.length}
            savedCount={savedVendors.length}
            completionPercentage={completionPercentage}
          />

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div 
                key="loading" 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                className="space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-2xl bg-white" />)}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Skeleton className="lg:col-span-2 h-[320px] w-full rounded-2xl bg-white" />
                  <Skeleton className="h-[320px] w-full rounded-2xl bg-white" />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'overview' && (
                  <CustomerOverviewTab
                    stats={stats}
                    bookings={bookings}
                    savedVendors={savedVendors}
                    recommendedPros={recommendedPros}
                    checklist={checklist}
                    newChecklistTitle={newChecklistTitle}
                    setNewChecklistTitle={setNewChecklistTitle}
                    onToggleChecklist={handleToggleChecklist}
                    onAddChecklistTask={handleAddChecklistTask}
                    onOpenReviewModal={(booking) => {
                      setSelectedBookingForReview(booking);
                      setReviewModalOpen(true);
                    }}
                    onNavigateTab={handleTabChange}
                  />
                )}

                {activeTab === 'bookings' && (
                  <CustomerBookingsTab
                    bookings={bookings}
                    filteredBookings={filteredBookings}
                    bookingFilter={bookingFilter}
                    setBookingFilter={setBookingFilter}
                    upcomingCount={bookings.filter(b => isBookingUpcoming(b)).length}
                    completedCount={bookings.filter(b => isBookingCompleted(b)).length}
                    onOpenReviewModal={(booking) => {
                      setSelectedBookingForReview(booking);
                      setReviewModalOpen(true);
                    }}
                    onOpenChatModal={(booking) => {
                      setSelectedBookingForChat(booking);
                      setChatModalOpen(true);
                    }}
                  />
                )}

                {activeTab === 'saved' && (
                  <CustomerSavedTab
                    savedVendors={savedVendors}
                    onRemoveSavedVendor={handleRemoveSavedVendor}
                  />
                )}

                {activeTab === 'reviews' && (
                  <CustomerReviewsTab
                    bookings={bookings}
                  />
                )}

                {(activeTab === 'profile' || activeTab === 'settings') && (
                  <CustomerProfileView
                    data={profileForm}
                    onChange={(updated) => setProfileForm((prev) => ({ ...prev, ...updated }))}
                    onSave={handleSaveProfile}
                    saving={savingProfile}
                    bookings={bookings}
                    completionPercentage={completionPercentage}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>

        </main>
      </div>

      {/* Grounded Ayoj Footer */}
      <footer className="py-5 border-t border-[#E8E2D9] bg-white mt-8 mb-16 md:mb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link href="/" className="hover:opacity-90 transition-opacity">
              <AyojLogo size="sm" showTagline={false} />
            </Link>
            <p className="text-xs text-[#6B6560]">© 2026 Ayoj Marketplace. Customer Portal.</p>
          </div>
        </div>
      </footer>

      {/* Direct Messaging Chat Modal */}
      <BookingMessageModal
        isOpen={chatModalOpen}
        onClose={() => setChatModalOpen(false)}
        bookingId={selectedBookingForChat?.id || 'b1'}
        recipientName={selectedBookingForChat?.vendor?.business_name || 'Vendor Partner'}
        serviceTitle={selectedBookingForChat?.service?.name || 'Event Booking'}
      />
    </div>
  );
}
