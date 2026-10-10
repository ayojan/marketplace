'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { apiService } from '@/lib/api';
import Header, { CITIES } from '@/components/Header';
import AyojLogo from '@/components/AyojLogo';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ReviewFormModal } from '@/components/ReviewFormModal';
import { BookingMessageModal } from '@/components/BookingMessageModal';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import {
  Calendar as CalendarIcon,
  Heart,
  ShoppingBag,
  Clock,
  Star,
  MapPin,
  ArrowRight,
  User,
  Settings,
  Bell,
  Search,
  Camera,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Check,
  Edit3,
  MessageSquare,
  FileText,
  Mail,
  Phone,
  Trash2,
  Filter,
  Plus,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

const RECOMMENDED_PROS = [
  {
    id: '4',
    name: 'The Wedding Narratives',
    category: 'Photographer',
    location: 'Delhi NCR',
    rating: 4.9,
    reviewsCount: 320,
    price: '₹50,000',
    image: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: '5',
    name: 'Meera Makeovers',
    category: 'Makeup Artist',
    location: 'Gurgaon',
    rating: 4.8,
    reviewsCount: 214,
    price: '₹15,000',
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=600&q=80'
  }
];

const CustomerDashboard = () => {
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
  const [savedVendors, setSavedVendors] = useState<any[]>([]);
  const [checklist, setChecklist] = useState<any[]>([]);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedBookingForReview, setSelectedBookingForReview] = useState<any>(null);
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [selectedBookingForChat, setSelectedBookingForChat] = useState<any>(null);

  // Editable Profile Settings Form State
  const [profileForm, setProfileForm] = useState({
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    email: user?.email || '',
    phone: '',
    city: 'Delhi NCR',
    weddingDate: '',
    eventType: 'Wedding',
    budgetRange: 'between_1000_2500'
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // Sync user prop when auth finishes loading
  useEffect(() => {
    if (user) {
      setProfileForm(prev => ({
        ...prev,
        firstName: prev.firstName || user.first_name || '',
        lastName: prev.lastName || user.last_name || '',
        email: user.email || prev.email || '',
      }));
    }
  }, [user]);

  const isBookingUpcoming = (b: any) => {
    if (!b) return false;
    const s = String(b.status || '').toLowerCase();
    if (s === 'completed' || s === 'cancelled' || s === 'declined') {
      return false;
    }
    // Any pending, accepted, confirmed, or in-progress booking is upcoming
    if (['confirmed', 'accepted', 'pending', 'counter_offered'].includes(s)) {
      return true;
    }
    // Fallback date check: if event is today or future
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

  const renderStatusBadge = (status: string) => {
    const s = String(status || '').toLowerCase();
    switch (s) {
      case 'completed':
        return (
          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-xs px-3 py-1 font-semibold">
            <CheckCircle2 size={12} className="mr-1" /> Completed
          </Badge>
        );
      case 'confirmed':
      case 'accepted':
        return (
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs px-3 py-1 font-semibold">
            <Sparkles size={12} className="mr-1" /> Confirmed
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-[#F3EADF] text-[#9E5338] border-[#E8E2D9] text-xs px-3 py-1 font-semibold">
            <Clock size={12} className="mr-1" /> Pending Approval
          </Badge>
        );
      case 'counter_offered':
        return (
          <Badge className="bg-amber-50 text-amber-800 border-amber-200 text-xs px-3 py-1 font-semibold">
            Counter Offer
          </Badge>
        );
      case 'declined':
      case 'cancelled':
        return (
          <Badge className="bg-rose-50 text-rose-700 border-rose-200 text-xs px-3 py-1 font-semibold capitalize">
            {s}
          </Badge>
        );
      default:
        return (
          <Badge className="bg-[#FBF8F4] text-[#6B6560] border-[#E8E2D9] text-xs px-3 py-1 font-semibold capitalize">
            {s}
          </Badge>
        );
    }
  };

  const fetchSavedVendors = async () => {
    try {
      const response = await apiService.favorites.getAll().catch(() => null);
      const fetchedFavs = response?.data?.favorites || [];
      const mapped = fetchedFavs.map((f: any) => ({
        id: String(f.vendor?.id || f.vendor_profile_id),
        favorite_id: f.id,
        name: f.vendor?.business_name || 'Creative Partner',
        category: Array.isArray(f.vendor?.service_categories) ? f.vendor?.service_categories[0] : (f.vendor?.service_categories || 'Creative Partner'),
        location: f.vendor?.location || 'Delhi NCR',
        rating: f.vendor?.average_rating || 4.9,
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

  const totalSpent = bookings.reduce((sum, b) => sum + (b.total_amount || 0), 0);
  const reviewedBookings = bookings.filter(b => b.review);

  const stats = [
    { label: 'Total Reservations', value: bookings.length.toString(), icon: CalendarIcon, trend: `${bookings.filter(b => isBookingUpcoming(b)).length} Upcoming` },
    { label: 'Saved Pros', value: savedVendors.length.toString(), icon: Heart, trend: 'Wishlist' },
    { label: 'Total Investment', value: `₹${totalSpent.toLocaleString()}`, icon: ShoppingBag, trend: 'Lifetime' },
    { label: 'Verified Reviews', value: `${reviewedBookings.length} Given`, icon: Star, trend: reviewedBookings.length > 0 ? 'Verified' : 'None yet' }
  ];

  const [newChecklistTitle, setNewChecklistTitle] = useState('');

  useEffect(() => {
    fetchBookings();
    fetchSavedVendors();
    fetchChecklist();
    fetchCustomerProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCustomerProfile = async () => {
    try {
      const response = await apiService.customerProfile.get().catch(() => null);
      const profile = response?.data?.customer_profile;
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
          weddingDate: extraPrefs.weddingDate || prev.weddingDate,
          eventType: profile.event_types || extraPrefs.eventType || prev.eventType,
          budgetRange: profile.budget_range || extraPrefs.budgetRange || prev.budgetRange,
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

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
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
        }),
      };

      await apiService.customerProfile.update(payload);

      // Immediately sync with client AuthContext & localStorage
      if (updateUser) {
        updateUser({
          first_name: profileForm.firstName,
          last_name: profileForm.lastName,
          phone: profileForm.phone,
          location: profileForm.city,
        });
      }

      toast.success('Profile and celebration preferences updated successfully!');
    } catch (err: any) {
      toast.error(err.extractedMessage || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      if (bookingFilter === 'upcoming') return isBookingUpcoming(b);
      if (bookingFilter === 'completed') return isBookingCompleted(b);
      return true;
    });
  }, [bookings, bookingFilter]);

  const renderOverview = () => (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="p-5 rounded-2xl border border-[#E8E2D9] bg-white shadow-sm hover:border-[#9E5338]/40 transition-all group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B6560]">{stat.label}</span>
              <stat.icon className="size-4 text-[#6B6560] group-hover:text-[#9E5338] transition-colors" />
            </div>
            <div className="flex items-end justify-between">
              <h4 className="text-2xl font-serif font-bold text-[#221F1C] tracking-tight">{stat.value}</h4>
              <span className="text-[10px] font-bold text-[#9E5338] bg-[#F3EADF] px-2.5 py-0.5 rounded-full">{stat.trend}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Feed Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active Bookings Card */}
          <div className="p-6 rounded-2xl border border-[#E8E2D9] bg-white shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-[#E8E2D9] pb-4">
              <div>
                <h3 className="text-base font-serif font-bold text-[#221F1C]">Your Event Bookings</h3>
                <p className="text-xs text-[#6B6560]">Manage upcoming reservations and review past sessions</p>
              </div>
              <Link href="/marketplace">
                <Button variant="ghost" size="sm" className="text-xs font-bold text-[#9E5338] hover:bg-[#F3EADF]">
                  + Book New Vendor
                </Button>
              </Link>
            </div>

            {bookings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center border border-dashed border-[#E8E2D9] rounded-xl bg-[#FBF8F4]">
                <div className="size-12 rounded-full bg-[#F3EADF] flex items-center justify-center mb-3 text-[#9E5338]">
                  <ShoppingBag className="size-5" />
                </div>
                <h4 className="text-sm font-bold text-[#221F1C] mb-1">No bookings found yet</h4>
                <p className="text-xs text-[#6B6560] mb-4 max-w-xs">
                  Discover verified photographers, makeup artists, and event pros for your occasion.
                </p>
                <Link href="/marketplace">
                  <Button size="sm" className="bg-[#9E5338] hover:bg-[#86442B] text-white rounded-full text-xs font-medium px-6 h-9">
                    Explore Marketplace
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="p-5 rounded-2xl border border-[#E8E2D9] bg-[#FBF8F4] hover:border-[#9E5338]/40 transition-all flex flex-col sm:flex-row gap-4 justify-between"
                  >
                    <div className="flex items-start gap-4">
                      {booking.vendor?.image && (
                        <Link href={`/vendors/${booking.vendor?.id || 4}`} className="relative size-16 rounded-xl overflow-hidden shrink-0 border border-[#E8E2D9] group/vimg cursor-pointer">
                          <ImageWithFallback
                            src={booking.vendor.image}
                            alt={booking.vendor.business_name}
                            fill
                            unoptimized
                            className="object-cover group-hover/vimg:scale-105 transition-transform duration-300"
                          />
                        </Link>
                      )}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-serif font-bold text-[#221F1C]">{booking.service?.name}</h4>
                          {renderStatusBadge(booking.status)}
                        </div>

                        <Link href={`/vendors/${booking.vendor?.id || 4}`} className="inline-block hover:text-[#9E5338] transition-colors cursor-pointer">
                          <p className="text-xs font-semibold text-[#6B6560]">
                            {booking.vendor?.business_name} • <span className="text-[#9E5338] font-normal">{booking.vendor?.location}</span>
                          </p>
                        </Link>
                        
                        <div className="flex items-center gap-4 text-xs text-[#6B6560] pt-1">
                          <span className="flex items-center gap-1 font-medium">
                            <CalendarIcon className="size-3.5 text-[#9E5338]" />
                            {new Date(booking.event_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                          </span>
                          <span className="font-bold text-[#221F1C]">₹{booking.total_amount?.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 sm:self-center">
                      {booking.review ? (
                        <span className="text-xs font-bold text-[#D97706] bg-amber-50 border border-amber-200 px-3 py-1 rounded-full flex items-center gap-1">
                          <Star className="size-3.5 fill-[#D97706]" /> Reviewed (5.0)
                        </span>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedBookingForReview(booking);
                            setReviewModalOpen(true);
                          }}
                          className="text-xs font-bold rounded-full border-[#E8E2D9] bg-white text-[#221F1C] hover:border-[#9E5338] hover:text-[#9E5338]"
                        >
                          Write Review
                        </Button>
                      )}
                      <Link href={`/vendors/${booking.vendor?.id || 1}`}>
                        <Button size="sm" variant="ghost" className="text-xs text-[#6B6560] hover:text-[#221F1C] rounded-full">
                          View Vendor
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Recommendations Bar */}
          <div className="p-6 rounded-2xl border border-[#E8E2D9] bg-white shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-serif font-bold text-[#221F1C]">Top Verified Pros For You</h3>
              <Link href="/vendors" className="text-xs font-bold text-[#9E5338] hover:underline flex items-center gap-1">
                View All <ChevronRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {RECOMMENDED_PROS.map((vendor) => (
                <Link
                  key={vendor.id}
                  href={`/vendors/${vendor.id}`}
                  className="p-4 rounded-xl border border-[#E8E2D9] bg-[#FBF8F4] flex gap-3.5 items-center hover:border-[#9E5338]/50 hover:bg-white hover:shadow-xs transition-all group cursor-pointer"
                >
                  <div className="relative size-14 rounded-lg overflow-hidden shrink-0 border border-[#E8E2D9]">
                    <ImageWithFallback 
                      src={vendor.image} 
                      alt={vendor.name} 
                      fill 
                      unoptimized 
                      className="object-cover group-hover:scale-105 transition-transform duration-300" 
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-[#221F1C] truncate group-hover:text-[#9E5338] transition-colors">
                      {vendor.name}
                    </h4>
                    <p className="text-[10px] text-[#6B6560] truncate">{vendor.category} • {vendor.location}</p>
                    <div className="flex items-center gap-1 mt-1 text-[11px] font-bold text-[#221F1C]">
                      <Star size={12} className="fill-[#D97706] text-[#D97706]" />
                      <span>{vendor.rating}</span>
                      <span className="text-[#6B6560] font-normal">({vendor.reviewsCount})</span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-[#9E5338] opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
                </Link>
              ))}
            </div>
          </div>

        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          
          {/* Wedding Planning Progress Checklist */}
          <div className="p-6 rounded-2xl border border-[#E8E2D9] bg-white shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8E2D9] pb-3">
              <h3 className="text-xs font-bold text-[#221F1C] uppercase tracking-wider">Event Milestone Checklist</h3>
              <span className="text-[10px] font-bold text-[#9E5338] bg-[#F3EADF] px-2 py-0.5 rounded-full">
                {checklist.filter(c => c.completed).length}/{checklist.length} Done
              </span>
            </div>

            <div className="space-y-2.5">
              {checklist.length === 0 ? (
                <div className="p-3.5 text-center border border-dashed border-[#E8E2D9] rounded-xl bg-[#FBF8F4]">
                  <p className="text-xs text-[#6B6560]">No tasks yet. Add a custom milestone below!</p>
                </div>
              ) : (
                checklist.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleToggleChecklist(item.id)}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      item.completed 
                        ? 'bg-emerald-50/60 border-emerald-200 text-[#221F1C]' 
                        : 'bg-[#FBF8F4] border-[#E8E2D9] text-[#6B6560] hover:border-[#9E5338]/40'
                    }`}
                  >
                    <div className={`size-5 rounded-full flex items-center justify-center border shrink-0 transition-colors ${
                      item.completed ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-[#E8E2D9] bg-white'
                    }`}>
                      {item.completed && <Check size={12} />}
                    </div>
                    <span className={`text-xs font-medium ${item.completed ? 'line-through opacity-75' : ''}`}>
                      {item.title}
                    </span>
                  </button>
                ))
              )}
            </div>

            <form onSubmit={handleAddChecklistTask} className="flex gap-2 pt-2 border-t border-[#E8E2D9]">
              <input
                type="text"
                placeholder="Add custom task..."
                value={newChecklistTitle}
                onChange={(e) => setNewChecklistTitle(e.target.value)}
                className="flex-1 bg-[#FBF8F4] border border-[#E8E2D9] rounded-lg px-3 py-1.5 text-xs text-[#221F1C] placeholder:text-[#6B6560] focus:outline-none focus:border-[#9E5338]"
              />
              <Button type="submit" size="sm" className="bg-[#9E5338] hover:bg-[#86442B] text-white rounded-lg text-xs font-medium px-3 h-8 shrink-0">
                <Plus size={14} />
              </Button>
            </form>
          </div>

          {/* Saved Pros Wishlist Widget */}
          <div className="p-6 rounded-2xl border border-[#E8E2D9] bg-white shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8E2D9] pb-3">
              <h3 className="text-xs font-bold text-[#221F1C] uppercase tracking-wider">Saved Wishlist</h3>
              <button onClick={() => setActiveTab('saved')} className="text-xs font-bold text-[#9E5338] hover:underline">
                See All
              </button>
            </div>

            <div className="space-y-3">
              {savedVendors.length === 0 ? (
                <div className="p-4 text-center border border-dashed border-[#E8E2D9] rounded-xl bg-[#FBF8F4]">
                  <p className="text-xs text-[#6B6560]">No saved vendors yet</p>
                  <Link href="/marketplace" className="text-[11px] font-bold text-[#9E5338] hover:underline mt-1 inline-block">
                    Explore vendors
                  </Link>
                </div>
              ) : (
                savedVendors.slice(0, 3).map((pro) => (
                  <Link 
                    key={pro.id} 
                    href={`/vendors/${pro.id}`}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#FBF8F4] border border-[#E8E2D9] hover:border-[#9E5338]/50 hover:bg-white hover:shadow-xs transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="relative size-10 rounded-lg overflow-hidden shrink-0 border border-[#E8E2D9]">
                        <ImageWithFallback src={pro.image} alt={pro.name} fill unoptimized className="object-cover group-hover:scale-105 transition-transform duration-300" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#221F1C] group-hover:text-[#9E5338] transition-colors truncate max-w-[130px]">{pro.name}</p>
                        <p className="text-[10px] text-[#6B6560] truncate">{pro.category}</p>
                      </div>
                    </div>
                    <div className="size-8 rounded-full flex items-center justify-center text-[#9E5338] group-hover:bg-[#F3EADF] transition-colors shrink-0">
                      <ChevronRight size={16} />
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Become a Partner Promo Card */}
          <div className="p-6 rounded-2xl bg-[#F3EADF] border border-[#E8E2D9] space-y-3 relative overflow-hidden">
            <div className="relative z-10">
              <Camera className="size-7 text-[#9E5338] mb-2" />
              <h4 className="text-base font-serif font-bold text-[#221F1C]">Are you an Event Vendor?</h4>
              <p className="text-xs text-[#6B6560] leading-relaxed mb-4">
                Join Ayoj to list your photography, makeup, decor, or catering packages and get booked by premium clients.
              </p>
              <Link href="/register?role=vendor">
                <Button size="sm" className="w-full bg-[#9E5338] hover:bg-[#86442B] text-white font-medium text-xs rounded-full h-9">
                  List Your Business
                </Button>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );

  const renderBookingsTab = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-[#E8E2D9]">
        <div>
          <h3 className="text-lg font-serif font-bold text-[#221F1C]">My Event Bookings</h3>
          <p className="text-xs text-[#6B6560]">Track reserved vendor sessions, payment status, and invoices</p>
        </div>

        <div className="flex items-center gap-2 bg-[#FBF8F4] p-1 rounded-xl border border-[#E8E2D9]">
          <button
            onClick={() => setBookingFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              bookingFilter === 'all' ? 'bg-[#9E5338] text-white shadow-sm' : 'text-[#6B6560] hover:text-[#221F1C]'
            }`}
          >
            All ({bookings.length})
          </button>
          <button
            onClick={() => setBookingFilter('upcoming')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              bookingFilter === 'upcoming' ? 'bg-[#9E5338] text-white shadow-sm' : 'text-[#6B6560] hover:text-[#221F1C]'
            }`}
          >
            Upcoming ({bookings.filter(b => isBookingUpcoming(b)).length})
          </button>
          <button
            onClick={() => setBookingFilter('completed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              bookingFilter === 'completed' ? 'bg-[#9E5338] text-white shadow-sm' : 'text-[#6B6560] hover:text-[#221F1C]'
            }`}
          >
            Completed ({bookings.filter(b => isBookingCompleted(b)).length})
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredBookings.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white rounded-2xl border border-dashed border-[#E8E2D9] space-y-3">
            <div className="size-12 rounded-full bg-[#F3EADF] text-[#9E5338] flex items-center justify-center mx-auto">
              <CalendarIcon className="size-6" />
            </div>
            <h4 className="font-serif font-bold text-base text-[#221F1C]">
              {bookingFilter === 'upcoming' 
                ? 'No Upcoming Bookings Found' 
                : bookingFilter === 'completed' 
                  ? 'No Completed Bookings Found' 
                  : 'No Event Bookings Found'}
            </h4>
            <p className="text-xs text-[#6B6560] max-w-sm mx-auto">
              {bookingFilter === 'upcoming'
                ? 'You do not have any upcoming bookings scheduled. Explore verified marketplace pros to book for your celebration!'
                : 'Browse our directory to reserve verified photographers, makeup artists, and event specialists.'}
            </p>
            <Link href="/vendors" className="inline-block mt-2">
              <Button size="sm" className="bg-[#9E5338] hover:bg-[#86442B] text-white rounded-full text-xs">
                Explore Verified Pros
              </Button>
            </Link>
          </div>
        ) : (
          filteredBookings.map((booking) => (
            <div key={booking.id} className="p-6 rounded-2xl border border-[#E8E2D9] bg-white shadow-sm hover:border-[#9E5338]/40 transition-all space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-[#E8E2D9]">
                <div className="flex items-center gap-4">
                  <Link href={`/vendors/${booking.vendor?.id || 4}`} className="relative size-16 rounded-xl overflow-hidden border border-[#E8E2D9] shrink-0 group/vimg cursor-pointer">
                    <ImageWithFallback src={booking.vendor?.image} alt={booking.vendor?.business_name} fill unoptimized className="object-cover group-hover/vimg:scale-105 transition-transform duration-300" />
                  </Link>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#9E5338] bg-[#F3EADF] px-2 py-0.5 rounded-md">
                      {booking.vendor?.category || 'Creative Partner'}
                    </span>
                    <h4 className="text-base font-serif font-bold text-[#221F1C] mt-1">{booking.service?.name}</h4>
                    <Link href={`/vendors/${booking.vendor?.id || 4}`} className="hover:text-[#9E5338] transition-colors cursor-pointer inline-block">
                      <p className="text-xs text-[#6B6560] font-medium">{booking.vendor?.business_name} • {booking.vendor?.location}</p>
                    </Link>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end md:self-center">
                  {renderStatusBadge(booking.status)}
                </div>
              </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs bg-[#FBF8F4] p-4 rounded-xl border border-[#E8E2D9]">
              <div>
                <span className="text-[#6B6560] block font-medium">Event Date</span>
                <span className="font-bold text-[#221F1C] flex items-center gap-1.5 mt-0.5">
                  <CalendarIcon size={14} className="text-[#9E5338]" />
                  {new Date(booking.event_date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                </span>
              </div>
              <div>
                <span className="text-[#6B6560] block font-medium">Payment Status</span>
                <span className="font-bold text-[#221F1C] flex items-center gap-1.5 mt-0.5">
                  <CheckCircle2 size={14} className="text-emerald-700" />
                  {booking.payment_status || 'Paid'}
                </span>
              </div>
              <div>
                <span className="text-[#6B6560] block font-medium">Total Package Investment</span>
                <span className="font-bold text-[#221F1C] text-sm mt-0.5 block">
                  ₹{booking.total_amount?.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" className="text-xs font-medium rounded-full border-[#E8E2D9] text-[#221F1C] hover:bg-[#F3EADF]">
                  <FileText size={14} className="mr-1.5 text-[#6B6560]" /> Receipt PDF
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => {
                    setSelectedBookingForChat(booking);
                    setChatModalOpen(true);
                  }}
                  className="text-xs font-medium rounded-full border-[#E8E2D9] text-[#221F1C] hover:bg-[#F3EADF] cursor-pointer"
                >
                  <MessageSquare size={14} className="mr-1.5 text-[#9E5338]" /> Contact Vendor
                </Button>
              </div>

              <div>
                {booking.review ? (
                  <span className="text-xs font-bold text-[#D97706] bg-amber-50 border border-amber-200 px-3 py-1 rounded-full flex items-center gap-1">
                    <Star className="size-3.5 fill-[#D97706]" /> Reviewed (5.0★)
                  </span>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedBookingForReview(booking);
                      setReviewModalOpen(true);
                    }}
                    className="bg-[#9E5338] hover:bg-[#86442B] text-white rounded-full text-xs font-medium px-5"
                  >
                    Write Verified Review
                  </Button>
                )}
              </div>
            </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderSavedTab = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-[#E8E2D9]">
        <div>
          <h3 className="text-lg font-serif font-bold text-[#221F1C]">Saved Professionals</h3>
          <p className="text-xs text-[#6B6560]">Your curated wishlist of top wedding creative partners</p>
        </div>
        <Link href="/vendors">
          <Button size="sm" className="bg-[#9E5338] hover:bg-[#86442B] text-white rounded-full text-xs font-medium px-5">
            + Explore More
          </Button>
        </Link>
      </div>

      {savedVendors.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-dashed border-[#E8E2D9]">
          <Heart size={36} className="mx-auto text-[#6B6560] mb-3" />
          <h4 className="text-sm font-bold text-[#221F1C] mb-1">Your Wishlist is Empty</h4>
          <p className="text-xs text-[#6B6560] mb-4">Save photographers, makeup artists, and planners as you explore.</p>
          <Link href="/vendors">
            <Button size="sm" className="bg-[#9E5338] hover:bg-[#86442B] text-white rounded-full text-xs font-medium px-6">
              Browse Directory
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedVendors.map((vendor) => (
            <div key={vendor.id} className="bg-white rounded-2xl border border-[#E8E2D9] overflow-hidden shadow-sm hover:border-[#9E5338]/40 transition-all group flex flex-col justify-between">
              <div>
                <div className="relative aspect-[16/10] w-full bg-[#FBF8F4]">
                  <Link href={`/vendors/${vendor.id}`} className="block w-full h-full cursor-pointer">
                    <ImageWithFallback src={vendor.image} alt={vendor.name} fill unoptimized className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    <span className="absolute bottom-3 left-3 text-[10px] font-bold uppercase tracking-wider text-white bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md pointer-events-none">
                      {vendor.category}
                    </span>
                  </Link>
                  <button
                    onClick={() => handleRemoveSavedVendor(vendor.id)}
                    className="absolute top-3 right-3 size-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-rose-500 hover:bg-rose-500 hover:text-white transition-colors cursor-pointer shadow-md z-10"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="p-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <Link href={`/vendors/${vendor.id}`}>
                      <h4 className="text-base font-serif font-bold text-[#221F1C] hover:text-[#9E5338] transition-colors cursor-pointer">{vendor.name}</h4>
                    </Link>
                    <div className="flex items-center gap-1 text-xs font-bold text-[#221F1C]">
                      <Star size={13} className="fill-[#D97706] text-[#D97706]" />
                      {vendor.rating}
                    </div>
                  </div>

                  <p className="text-xs text-[#6B6560] flex items-center gap-1">
                    <MapPin size={13} className="text-[#9E5338]" />
                    {vendor.location}
                  </p>

                  <div className="pt-2 flex items-center justify-between text-xs border-t border-[#E8E2D9] mt-3">
                    <span className="text-[#6B6560]">Starting Packages</span>
                    <span className="font-bold text-[#221F1C]">{vendor.price}</span>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0">
                <Link href={`/vendors/${vendor.id}`}>
                  <Button size="sm" className="w-full bg-[#F3EADF] hover:bg-[#9E5338] hover:text-white text-[#9E5338] font-bold text-xs rounded-full h-9 transition-colors">
                    View Vendor Profile
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderReviewsTab = () => {
    const reviewedBookings = bookings.filter(b => b.review);

    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="bg-white p-5 rounded-2xl border border-[#E8E2D9]">
          <h3 className="text-lg font-serif font-bold text-[#221F1C]">My Submitted Reviews</h3>
          <p className="text-xs text-[#6B6560]">Honest ratings and testimonials shared with the Ayoj community</p>
        </div>

        {reviewedBookings.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-2xl border border-dashed border-[#E8E2D9]">
            <Star size={36} className="mx-auto text-[#6B6560] mb-3" />
            <h4 className="text-sm font-bold text-[#221F1C] mb-1">No Reviews Submitted Yet</h4>
            <p className="text-xs text-[#6B6560] mb-4">Reviews will appear here after you complete bookings with verified vendors.</p>
            <Link href="/marketplace">
              <Button size="sm" className="bg-[#9E5338] hover:bg-[#86442B] text-white rounded-full text-xs font-medium px-6">
                Explore Marketplace
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {reviewedBookings.map((booking) => (
              <div key={booking.id} className="p-6 rounded-2xl border border-[#E8E2D9] bg-white shadow-sm space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="relative size-12 rounded-xl overflow-hidden border border-[#E8E2D9]">
                      <ImageWithFallback src={booking.vendor?.image} alt={booking.vendor?.business_name} fill unoptimized className="object-cover" />
                    </div>
                    <div>
                      <h4 className="text-sm font-serif font-bold text-[#221F1C]">{booking.vendor?.business_name}</h4>
                      <p className="text-xs text-[#6B6560]">{booking.service?.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-amber-500 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full text-xs font-bold">
                    {[...Array(booking.review.rating)].map((_, i) => (
                      <Star key={i} size={12} className="fill-[#D97706] text-[#D97706]" />
                    ))}
                    <span className="ml-1 text-[#221F1C]">{booking.review.rating}.0</span>
                  </div>
                </div>

                <p className="text-xs text-[#221F1C] bg-[#FBF8F4] p-4 rounded-xl border border-[#E8E2D9] italic leading-relaxed">
                  "{booking.review.comment}"
                </p>

                <div className="text-[11px] text-[#6B6560] flex items-center justify-between pt-1">
                  <span>Reviewed after event completion on {booking.event_date}</span>
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 size={12} /> Verified Review
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderSettingsTab = () => {
    return (
      <div className="space-y-6 animate-in fade-in duration-300 w-full">
        {/* Profile Edit Form */}
        <form onSubmit={handleSaveProfile} className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E8E2D9] shadow-sm space-y-8 w-full">
          
          {/* Section 1: Personal Details */}
          <div className="space-y-4">
            <div className="border-b border-[#E8E2D9] pb-3">
              <h4 className="text-sm font-serif font-bold text-[#221F1C] flex items-center gap-2">
                <User className="size-4 text-[#9E5338]" />
                Personal Information
              </h4>
              <p className="text-xs text-[#6B6560]">Your name and primary contact details visible to booked vendors</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#221F1C] block">
                  First Name <span className="text-[#9E5338]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={profileForm.firstName}
                  onChange={e => setProfileForm({ ...profileForm, firstName: e.target.value })}
                  placeholder="Enter first name"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E2D9] bg-[#FAF7F2] text-xs text-[#221F1C] focus:outline-none focus:border-[#9E5338] transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#221F1C] block">
                  Last Name <span className="text-[#9E5338]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={profileForm.lastName}
                  onChange={e => setProfileForm({ ...profileForm, lastName: e.target.value })}
                  placeholder="Enter last name"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E2D9] bg-[#FAF7F2] text-xs text-[#221F1C] focus:outline-none focus:border-[#9E5338] transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#221F1C] block">
                  Email Address
                </label>
                <input
                  type="email"
                  disabled
                  value={profileForm.email}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E2D9] bg-[#F3EADF]/60 text-xs text-[#6B6560] cursor-not-allowed"
                />
                <span className="text-[10px] text-[#6B6560]">Account primary login email (read-only)</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#221F1C] block">
                  Phone / WhatsApp Number
                </label>
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E2D9] bg-[#FAF7F2] text-xs text-[#221F1C] focus:outline-none focus:border-[#9E5338] transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Celebration & Event Preferences */}
          <div className="space-y-4">
            <div className="border-b border-[#E8E2D9] pb-3">
              <h4 className="text-sm font-serif font-bold text-[#221F1C] flex items-center gap-2">
                <Sparkles className="size-4 text-[#9E5338]" />
                Event & Celebration Preferences
              </h4>
              <p className="text-xs text-[#6B6560]">Helps recommended photographers and decorators tailor packages for you</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#221F1C] block">
                  Primary Location / City
                </label>
                <select
                  value={profileForm.city}
                  onChange={e => setProfileForm({ ...profileForm, city: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E2D9] bg-[#FAF7F2] text-xs text-[#221F1C] focus:outline-none focus:border-[#9E5338] transition-colors cursor-pointer"
                >
                  {CITIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#221F1C] block">
                  Target Event Date
                </label>
                <input
                  type="date"
                  value={profileForm.weddingDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => setProfileForm({ ...profileForm, weddingDate: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E2D9] bg-[#FAF7F2] text-xs text-[#221F1C] focus:outline-none focus:border-[#9E5338] transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#221F1C] block">
                  Celebration Type
                </label>
                <select
                  value={profileForm.eventType}
                  onChange={e => setProfileForm({ ...profileForm, eventType: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E2D9] bg-[#FAF7F2] text-xs text-[#221F1C] focus:outline-none focus:border-[#9E5338] transition-colors cursor-pointer"
                >
                  <option value="Wedding">Wedding / Shaadi</option>
                  <option value="Pre-Wedding">Pre-Wedding / Engagement</option>
                  <option value="Birthday">Birthday Celebration</option>
                  <option value="Corporate">Corporate / Summit</option>
                  <option value="Anniversary">Anniversary</option>
                  <option value="Baby Shower">Baby Shower / Godh Bharai</option>
                  <option value="Other">Other Event</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#221F1C] block">
                  Estimated Budget Preference
                </label>
                <select
                  value={profileForm.budgetRange}
                  onChange={e => setProfileForm({ ...profileForm, budgetRange: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E2D9] bg-[#FAF7F2] text-xs text-[#221F1C] focus:outline-none focus:border-[#9E5338] transition-colors cursor-pointer"
                >
                  <option value="under_500">Under ₹50,000</option>
                  <option value="between_500_1000">₹50,000 – ₹1,50,000</option>
                  <option value="between_1000_2500">₹1,50,000 – ₹3,00,000</option>
                  <option value="between_2500_5000">₹3,00,000 – ₹5,00,000</option>
                  <option value="above_5000">Above ₹5,00,000</option>
                </select>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-[#E8E2D9] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <span className="text-xs text-[#6B6560]">
              All details are secured under Ayoj privacy policy
            </span>

            <Button 
              type="submit" 
              disabled={savingProfile}
              className="bg-[#9E5338] hover:bg-[#86442B] text-white rounded-full text-xs font-semibold px-8 h-11 shadow-sm active:scale-95 transition-all cursor-pointer"
            >
              {savingProfile ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  Saving Changes...
                </>
              ) : (
                'Save Profile Changes'
              )}
            </Button>
          </div>
        </form>
      </div>
    );
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
          
          {/* Aligned Header Banner Card */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E8E2D9] shadow-sm mb-8 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative z-10">
              <div className="flex items-center gap-5">
                <div className="size-16 sm:size-20 rounded-full bg-[#F3EADF] border-2 border-[#9E5338]/30 flex items-center justify-center text-[#9E5338] font-serif font-bold text-2xl shadow-sm shrink-0">
                  {user?.first_name?.[0] || 'P'}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#9E5338] bg-[#F3EADF] px-2.5 py-0.5 rounded-full border border-[#E8E2D9]">
                      Verified Customer
                    </span>
                    <span className="text-[10px] text-[#6B6560] flex items-center gap-1">
                      <MapPin size={11} /> {profileForm.city}
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-[#221F1C]">
                    Welcome back, {user?.first_name || profileForm.firstName || 'Celebration'} {user?.last_name || profileForm.lastName || 'Host'}
                  </h1>
                  <p className="text-xs text-[#6B6560] mt-1">
                    Upcoming Celebration: <span className="font-semibold text-[#221F1C]">
                      {profileForm.weddingDate ? new Date(profileForm.weddingDate).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'Set Date'}
                    </span> • {profileForm.city || 'Delhi NCR'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Link href="/marketplace">
                  <Button size="sm" className="bg-[#9E5338] hover:bg-[#86442B] text-white rounded-full text-xs font-medium px-6 h-10 shadow-sm cursor-pointer">
                    Find Creative Partners
                  </Button>
                </Link>
              </div>
            </div>

            {/* Navigation Tabs Bar */}
            <div className="mt-8 pt-6 border-t border-[#E8E2D9] flex items-center gap-2 overflow-x-auto no-scrollbar">
              {[
                { id: 'overview', name: 'Overview', icon: CalendarIcon },
                { id: 'bookings', name: 'My Bookings', icon: ShoppingBag, badge: bookings.length > 0 ? bookings.length.toString() : undefined },
                { id: 'saved', name: 'Saved Pros', icon: Heart, badge: savedVendors.length > 0 ? savedVendors.length.toString() : undefined },
                { id: 'reviews', name: 'My Reviews', icon: Star },
                { id: 'profile', name: 'Profile & Settings', icon: User },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id || (tab.id === 'profile' && activeTab === 'settings');
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      if (typeof window !== 'undefined') {
                        window.history.replaceState(null, '', `/customer/dashboard?tab=${tab.id}`);
                      }
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'bg-[#F3EADF] text-[#9E5338] border border-[#E8E2D9]'
                        : 'text-[#6B6560] hover:text-[#221F1C] hover:bg-[#FBF8F4]'
                    }`}
                  >
                    <Icon size={15} />
                    <span>{tab.name}</span>
                    {tab.badge && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        isActive ? 'bg-[#9E5338] text-white' : 'bg-[#E8E2D9] text-[#6B6560]'
                      }`}>
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

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
                {activeTab === 'overview' && renderOverview()}
                {activeTab === 'bookings' && renderBookingsTab()}
                {activeTab === 'saved' && renderSavedTab()}
                {activeTab === 'reviews' && renderReviewsTab()}
                {(activeTab === 'profile' || activeTab === 'settings') && renderSettingsTab()}
              </motion.div>
            )}
          </AnimatePresence>

        </main>
      </div>

      {/* Grounded Ayoj Footer */}
      <footer className="py-5 border-t border-[#E8E2D9] bg-white mt-8 mb-16 md:mb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <AyojLogo size="sm" showTagline={false} />
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
};

export default CustomerDashboard;
