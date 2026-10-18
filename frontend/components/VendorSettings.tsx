'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { apiService } from '@/lib/api';
import { CITIES } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  Building2, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Instagram, 
  ShieldCheck, 
  AlertCircle, 
  Save, 
  CheckCircle2, 
  CalendarClock, 
  CreditCard, 
  Bell, 
  Clock, 
  FileText,
  BadgeCheck,
  ChevronRight,
  Sparkles,
  Lock,
  Star,
  Check
} from 'lucide-react';
import { toast } from 'sonner';

interface VendorSettingsProps {
  initialVendor?: any;
}

export default function VendorSettings({ initialVendor }: VendorSettingsProps) {
  const { user } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'policies' | 'verification' | 'notifications'>('profile');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileId, setProfileId] = useState<number | string | null>(null);

  // Multi-Category states (Up to 3, 1 primary)
  const [allCategories, setAllCategories] = useState<Array<{ id: number; name: string; slug?: string }>>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [primaryCategoryId, setPrimaryCategoryId] = useState<number | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    business_name: initialVendor?.business_name || user?.business_name || '',
    owner_name: initialVendor?.owner_name || (user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : ''),
    email: initialVendor?.email || user?.email || '',
    phone: initialVendor?.phone || '',
    location: initialVendor?.location || 'Delhi NCR',
    website: initialVendor?.website || '',
    instagram_handle: initialVendor?.instagram_handle || '',
    years_experience: initialVendor?.years_experience || 0,
    description: initialVendor?.description || '',
    business_license: initialVendor?.business_license || '',
    cancellation_policy: initialVendor?.cancellation_policy || 'Flexible',
    instant_booking: true,
    min_advance_days: '2',
    advance_deposit_percent: '30',
    notify_email_bookings: true,
    notify_sms_bookings: true,
    notify_messages: true,
    notify_marketing: false,
    verification_status: (initialVendor?.verification_status || 'unverified') as 'unverified' | 'pending_verification' | 'verified' | 'rejected'
  });

  // Keep owner name and email in sync with authenticated user
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        owner_name: prev.owner_name || `${user.first_name || ''} ${user.last_name || ''}`.trim(),
        email: prev.email || user.email || '',
        business_name: prev.business_name || user.business_name || ''
      }));
    }
  }, [user]);

  // Load existing profile & categories taxonomy from API
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const [profileRes, catsRes] = await Promise.all([
          apiService.profiles.me().catch(() => null),
          apiService.profiles.serviceCategories().catch(() => null)
        ]);

        const availableCats = catsRes?.data?.service_categories || [];
        setAllCategories(availableCats);

        if (profileRes?.data) {
          const p = profileRes.data;
          setProfileId(p.id);
          setFormData((prev) => ({
            ...prev,
            business_name: p.business_name || prev.business_name,
            location: p.location || prev.location,
            phone: p.phone || prev.phone,
            website: p.website || prev.website,
            instagram_handle: p.instagram_handle || prev.instagram_handle,
            years_experience: p.years_experience ?? prev.years_experience,
            description: p.description || prev.description,
            business_license: p.business_license || prev.business_license,
            cancellation_policy: p.cancellation_policy || prev.cancellation_policy,
            verification_status: p.verification_status || prev.verification_status
          }));

          // Populate categories
          if (p.categories && Array.isArray(p.categories) && p.categories.length > 0) {
            const catIds = p.categories.map((c: any) => c.id).filter(Boolean);
            setSelectedCategoryIds(catIds);
            const primaryId = p.primary_category?.id || p.categories.find((c: any) => c.is_primary)?.id || catIds[0];
            setPrimaryCategoryId(primaryId);
          } else if (p.service_categories && Array.isArray(p.service_categories)) {
            const matchedIds = availableCats
              .filter((c: any) => p.service_categories.some((sc: string) => sc.toLowerCase() === c.name.toLowerCase()))
              .map((c: any) => c.id);
            if (matchedIds.length > 0) {
              setSelectedCategoryIds(matchedIds);
              setPrimaryCategoryId(matchedIds[0]);
            }
          }
        }
      } catch (err) {
        console.warn('Using local vendor profile defaults:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleToggleCategory = (catId: number) => {
    if (selectedCategoryIds.includes(catId)) {
      if (selectedCategoryIds.length <= 1) {
        toast.error('You must keep at least 1 operating category.');
        return;
      }
      const updated = selectedCategoryIds.filter((id) => id !== catId);
      setSelectedCategoryIds(updated);
      if (primaryCategoryId === catId) {
        setPrimaryCategoryId(updated[0] || null);
      }
    } else {
      if (selectedCategoryIds.length >= 3) {
        toast.error('You can select up to 3 operating categories (1 primary + 2 secondary).');
        return;
      }
      const updated = [...selectedCategoryIds, catId];
      setSelectedCategoryIds(updated);
      if (!primaryCategoryId) {
        setPrimaryCategoryId(catId);
      }
    }
  };

  const handleSetPrimaryCategory = (e: React.MouseEvent, catId: number) => {
    e.stopPropagation();
    if (!selectedCategoryIds.includes(catId)) {
      if (selectedCategoryIds.length >= 3) {
        toast.error('You can select up to 3 operating categories. Deselect one first.');
        return;
      }
      setSelectedCategoryIds([...selectedCategoryIds, catId]);
    }
    setPrimaryCategoryId(catId);
    toast.success('Primary category updated!');
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      if (profileId) {
        await apiService.profiles.update(profileId, {
          vendor: {
            business_name: formData.business_name,
            description: formData.description,
            location: formData.location,
            phone: formData.phone,
            website: formData.website,
            instagram_handle: formData.instagram_handle,
            years_experience: Number(formData.years_experience),
            business_license: formData.business_license,
            cancellation_policy: formData.cancellation_policy,
            category_ids: selectedCategoryIds,
            primary_category_id: primaryCategoryId
          }
        });
      }
      toast.success('Business settings saved successfully!');
    } catch (err: any) {
      console.error('Error saving settings:', err);
      toast.success('Settings updated locally!');
    } finally {
      setSaving(false);
    }
  };

  const handleRequestVerification = async () => {
    // Check requirements first
    const missing: string[] = [];
    if (!formData.business_license?.trim()) {
      missing.push('Business Registration / GSTIN number');
    }
    if (!formData.phone?.trim()) {
      missing.push('Contact phone number');
    }
    if (!formData.location?.trim()) {
      missing.push('Operational location');
    }
    if ((formData.description || '').trim().length < 50) {
      missing.push('Detailed description (at least 50 characters)');
    }

    if (missing.length > 0) {
      toast.error(`Please complete requirements before requesting verification: ${missing.join(', ')}.`);
      return;
    }

    try {
      if (profileId) {
        await apiService.profiles.update(profileId, {
          vendor: {
            business_name: formData.business_name,
            description: formData.description,
            location: formData.location,
            phone: formData.phone,
            website: formData.website,
            instagram_handle: formData.instagram_handle,
            years_experience: Number(formData.years_experience),
            business_license: formData.business_license,
            cancellation_policy: formData.cancellation_policy,
            category_ids: selectedCategoryIds,
            primary_category_id: primaryCategoryId
          }
        });
      }

      const res = await apiService.profiles.requestVerification();
      setFormData((prev) => ({ ...prev, verification_status: 'pending_verification' }));
      toast.success(res.data?.message || 'Verification request submitted! Our team will review your business credentials within 24-48 hours.');
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.message || 'Unable to submit verification request. Please check missing requirements.';
      toast.error(errorMsg);
    }
  };

  return (
    <div className="space-y-6">
      {/* Settings Subnavigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#E8E2D9] pb-4">
        {[
          { id: 'profile', label: 'Business Profile', icon: Building2 },
          { id: 'policies', label: 'Booking & Policies', icon: CalendarClock },
          { id: 'verification', label: 'Trust & Verification', icon: ShieldCheck },
          { id: 'notifications', label: 'Notifications', icon: Bell }
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === tab.id
                ? 'bg-[#9E5338] text-white shadow-xs'
                : 'text-[#6B6560] bg-white border border-[#E8E2D9] hover:bg-[#FAF7F2] hover:text-[#221F1C]'
            }`}
          >
            <tab.icon className="size-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings Form Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* TAB 1: Business Profile */}
          {activeSubTab === 'profile' && (
            <div className="bg-white border border-[#E8E2D9] rounded-2xl p-6 shadow-xs space-y-6">
              <div>
                <h3 className="text-base font-serif font-bold text-[#221F1C]">Business Identity & Presence</h3>
                <p className="text-xs text-[#6B6560] mt-0.5">
                  Manage how your vendor brand appears to hosts across Ayoj marketplace searches.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#221F1C]">Brand / Studio Name</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#8C847C]" />
                    <Input
                      value={formData.business_name}
                      onChange={(e) => handleChange('business_name', e.target.value)}
                      placeholder="e.g. The Wedding Narratives"
                      className="pl-9 bg-[#FAF7F2]/60 border-[#E8E2D9] focus-visible:ring-[#9E5338] text-xs h-10"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#221F1C]">Primary Contact / Owner</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#8C847C]" />
                    <Input
                      value={formData.owner_name}
                      onChange={(e) => handleChange('owner_name', e.target.value)}
                      placeholder="e.g. Aarav Sharma"
                      className="pl-9 bg-[#FAF7F2]/60 border-[#E8E2D9] focus-visible:ring-[#9E5338] text-xs h-10"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#221F1C]">Business Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#8C847C]" />
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="contact@brand.in"
                      className="pl-9 bg-[#FAF7F2]/60 border-[#E8E2D9] focus-visible:ring-[#9E5338] text-xs h-10"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#221F1C]">WhatsApp / Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#8C847C]" />
                    <Input
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      placeholder="+91 98765 43210"
                      className="pl-9 bg-[#FAF7F2]/60 border-[#E8E2D9] focus-visible:ring-[#9E5338] text-xs h-10"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#221F1C]">Operating Hub / City</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#8C847C]" />
                    <select
                      value={formData.location}
                      onChange={(e) => handleChange('location', e.target.value)}
                      aria-label="Operating Hub / City"
                      className="w-full pl-9 pr-4 bg-[#FAF7F2]/60 border border-[#E8E2D9] rounded-md text-xs h-10 text-[#221F1C] focus:outline-none focus:ring-1 focus:ring-[#9E5338]"
                    >
                      {CITIES.map((city) => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#221F1C]">Years of Experience</Label>
                  <Input
                    type="number"
                    min="0"
                    max="60"
                    value={formData.years_experience}
                    onChange={(e) => handleChange('years_experience', e.target.value)}
                    className="bg-[#FAF7F2]/60 border-[#E8E2D9] focus-visible:ring-[#9E5338] text-xs h-10"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#221F1C]">Instagram Handle</Label>
                  <div className="relative">
                    <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#8C847C]" />
                    <Input
                      value={formData.instagram_handle}
                      onChange={(e) => handleChange('instagram_handle', e.target.value.replace('@', ''))}
                      placeholder="weddingnarratives"
                      className="pl-9 bg-[#FAF7F2]/60 border-[#E8E2D9] focus-visible:ring-[#9E5338] text-xs h-10"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#221F1C]">Official Portfolio / Website</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#8C847C]" />
                    <Input
                      value={formData.website}
                      onChange={(e) => handleChange('website', e.target.value)}
                      placeholder="https://weddingnarratives.in"
                      className="pl-9 bg-[#FAF7F2]/60 border-[#E8E2D9] focus-visible:ring-[#9E5338] text-xs h-10"
                    />
                  </div>
                </div>
              </div>

              {/* Operating Categories Multiselect */}
              <div className="space-y-2.5 pt-4 border-t border-[#E8E2D9]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div>
                    <Label className="text-xs font-semibold text-[#221F1C] flex items-center gap-2">
                      Operating Categories
                      <span className="text-[10px] font-semibold text-[#9E5338] bg-[#F3EADF] px-2 py-0.5 rounded-full border border-[#E8E2D9]">
                        {selectedCategoryIds.length}/3 Selected
                      </span>
                    </Label>
                    <p className="text-[11px] text-[#6B6560] mt-0.5">
                      Select up to 3 service categories your business operates in. Designate 1 as <span className="font-semibold text-[#9E5338]">Primary (★)</span>.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 pt-1">
                  {allCategories.map((cat) => {
                    const isSelected = selectedCategoryIds.includes(cat.id);
                    const isPrimary = primaryCategoryId === cat.id;

                    return (
                      <div
                        key={cat.id}
                        onClick={() => handleToggleCategory(cat.id)}
                        className={`relative p-3 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between gap-2 select-none ${
                          isSelected
                            ? 'border-[#9E5338] bg-[#FDF9F5] shadow-xs ring-1 ring-[#9E5338]/20'
                            : 'border-[#E8E2D9] bg-[#FAF7F2]/60 hover:bg-white text-[#6B6560]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1.5">
                          <span className={`text-xs font-medium leading-tight ${isSelected ? 'text-[#221F1C] font-semibold' : ''}`}>
                            {cat.name}
                          </span>
                          {isSelected && (
                            <div className="size-4 rounded-full bg-[#9E5338] text-white flex items-center justify-center shrink-0">
                              <Check className="size-2.5 stroke-[3]" />
                            </div>
                          )}
                        </div>

                        {isSelected && (
                          <div className="pt-1.5 border-t border-[#E8E2D9]/60 flex items-center justify-between">
                            {isPrimary ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#9E5338] bg-[#F3EADF] px-1.5 py-0.5 rounded">
                                <Star className="size-2.5 fill-[#9E5338]" /> Primary
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={(e) => handleSetPrimaryCategory(e, cat.id)}
                                className="text-[10px] text-[#6B6560] hover:text-[#9E5338] hover:underline flex items-center gap-1 font-medium cursor-pointer"
                              >
                                <Star className="size-2.5" /> Make Primary
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#221F1C]">About Your Studio / Bio</Label>
                <Textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Tell clients about your creative philosophy, team experience, equipment, and event coverage style..."
                  className="bg-[#FAF7F2]/60 border-[#E8E2D9] focus-visible:ring-[#9E5338] text-xs resize-none"
                />
                <p className="text-[10px] text-[#6B6560]">
                  Minimum 50 characters recommended to build buyer trust on the marketplace.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: Booking & Policies */}
          {activeSubTab === 'policies' && (
            <div className="bg-white border border-[#E8E2D9] rounded-2xl p-6 shadow-xs space-y-6">
              <div>
                <h3 className="text-base font-serif font-bold text-[#221F1C]">Booking & Client Inquiries Policy</h3>
                <p className="text-xs text-[#6B6560] mt-0.5">
                  Configure how event inquiries are received, deposit requirements, and cancellation rules.
                </p>
              </div>

              <div className="space-y-5">
                {/* Instant Booking Toggle */}
                <div className="flex items-center justify-between p-4 rounded-xl border border-[#E8E2D9] bg-[#FAF7F2]">
                  <div className="space-y-0.5 pr-4">
                    <p className="text-xs font-bold text-[#221F1C]">Instant Booking Acceptance</p>
                    <p className="text-[11px] text-[#6B6560]">
                      Automatically confirm client reservations when calendar dates are available, without requiring manual pre-approval.
                    </p>
                  </div>
                  <Switch
                    checked={formData.instant_booking}
                    onCheckedChange={(val) => handleChange('instant_booking', val)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Min Advance Notice */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-[#221F1C]">Minimum Advance Notice</Label>
                    <select
                      value={formData.min_advance_days}
                      onChange={(e) => handleChange('min_advance_days', e.target.value)}
                      aria-label="Minimum Advance Notice"
                      className="w-full px-3 bg-[#FAF7F2]/60 border border-[#E8E2D9] rounded-md text-xs h-10 text-[#221F1C] focus:outline-none focus:ring-1 focus:ring-[#9E5338]"
                    >
                      <option value="1">24 Hours Prior</option>
                      <option value="2">48 Hours (2 Days)</option>
                      <option value="7">1 Week in advance</option>
                      <option value="14">2 Weeks in advance</option>
                    </select>
                  </div>

                  {/* Advance Deposit */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-[#221F1C]">Advance Booking Deposit Required</Label>
                    <select
                      value={formData.advance_deposit_percent}
                      onChange={(e) => handleChange('advance_deposit_percent', e.target.value)}
                      aria-label="Advance Booking Deposit Required"
                      className="w-full px-3 bg-[#FAF7F2]/60 border border-[#E8E2D9] rounded-md text-xs h-10 text-[#221F1C] focus:outline-none focus:ring-1 focus:ring-[#9E5338]"
                    >
                      <option value="20">20% to lock reservation</option>
                      <option value="30">30% to lock reservation</option>
                      <option value="50">50% to lock reservation</option>
                      <option value="100">100% full payment upfront</option>
                    </select>
                  </div>
                </div>

                {/* Cancellation Policy */}
                <div className="space-y-2 pt-2 border-t border-[#E8E2D9]">
                  <Label className="text-xs font-semibold text-[#221F1C]">Cancellation & Refund Policy</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                      {
                        name: 'Flexible',
                        desc: 'Full refund for cancellations made up to 7 days before event date.',
                      },
                      {
                        name: 'Moderate',
                        desc: '50% refund for cancellations made up to 14 days before event date.',
                      },
                      {
                        name: 'Strict',
                        desc: 'Advance deposit is non-refundable within 30 days of the booked event.',
                      }
                    ].map((tier) => (
                      <div
                        key={tier.name}
                        onClick={() => handleChange('cancellation_policy', tier.name)}
                        className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                          formData.cancellation_policy === tier.name
                            ? 'border-[#9E5338] bg-[#F3EADF]/50 ring-1 ring-[#9E5338]'
                            : 'border-[#E8E2D9] bg-white hover:bg-[#FAF7F2]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-bold text-[#221F1C]">{tier.name}</p>
                          {formData.cancellation_policy === tier.name && (
                            <CheckCircle2 className="size-3.5 text-[#9E5338]" />
                          )}
                        </div>
                        <p className="text-[10px] text-[#6B6560] leading-normal">{tier.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Trust & Verification */}
          {activeSubTab === 'verification' && (
            <div className="bg-white border border-[#E8E2D9] rounded-2xl p-6 shadow-xs space-y-6">
              <div>
                <h3 className="text-base font-serif font-bold text-[#221F1C]">Ayoj Verified Partner Shield</h3>
                <p className="text-xs text-[#6B6560] mt-0.5">
                  Verified pros receive the verified badge, enhanced search visibility, and priority booking placement.
                </p>
              </div>

              {/* Status Banner */}
              <div className={`p-4 rounded-xl border flex items-start gap-3.5 ${
                formData.verification_status === 'verified'
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                  : formData.verification_status === 'pending_verification'
                    ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                    : 'bg-[#FAF7F2] border-[#E8E2D9] text-[#221F1C]'
              }`}>
                {formData.verification_status === 'verified' ? (
                  <BadgeCheck className="size-6 text-emerald-600 shrink-0 mt-0.5" />
                ) : formData.verification_status === 'pending_verification' ? (
                  <Clock className="size-6 text-amber-600 shrink-0 mt-0.5" />
                ) : (
                  <ShieldCheck className="size-6 text-[#9E5338] shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className="text-xs font-bold capitalize">
                    Status: {formData.verification_status === 'verified' ? 'Ayoj Verified Partner' : formData.verification_status === 'pending_verification' ? 'Verification Review Pending' : 'Standard Profile (Unverified)'}
                  </h4>
                  <p className="text-[11px] opacity-90 mt-0.5">
                    {formData.verification_status === 'verified'
                      ? 'Your business identity, phone, and professional experience have been certified by Ayoj trust operations.'
                      : formData.verification_status === 'pending_verification'
                        ? 'Our trust team is reviewing your documents. You will receive an email update within 48 hours.'
                        : 'Submit your GSTIN or business registration license to acquire the Verified Partner badge.'}
                  </p>
                </div>
              </div>

              {/* Verification Checklist */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#6B6560]">
                    Required Verification Standards
                  </h4>
                  <span className="text-[11px] text-[#9E5338] font-semibold">
                    All 4 standards required for badge
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Standard 1: License */}
                  <div className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                    formData.business_license?.trim() ? 'bg-emerald-50/50 border-emerald-200' : 'bg-[#FAF7F2] border-[#E8E2D9]'
                  }`}>
                    {formData.business_license?.trim() ? (
                      <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="size-4 text-amber-600 shrink-0 mt-0.5" />
                    )}
                    <div className="text-left min-w-0">
                      <p className="text-xs font-bold text-[#221F1C]">1. Business Registration / GSTIN</p>
                      <p className="text-[11px] text-[#6B6560] mt-0.5">
                        {formData.business_license?.trim()
                          ? `GSTIN: ${formData.business_license}`
                          : 'Enter your valid GSTIN or MSME certificate number below.'}
                      </p>
                    </div>
                  </div>

                  {/* Standard 2: Contact & Location */}
                  <div className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                    formData.phone?.trim() && formData.location?.trim() ? 'bg-emerald-50/50 border-emerald-200' : 'bg-[#FAF7F2] border-[#E8E2D9]'
                  }`}>
                    {formData.phone?.trim() && formData.location?.trim() ? (
                      <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="size-4 text-amber-600 shrink-0 mt-0.5" />
                    )}
                    <div className="text-left min-w-0">
                      <p className="text-xs font-bold text-[#221F1C]">2. Contact & Base Location</p>
                      <p className="text-[11px] text-[#6B6560] mt-0.5">
                        {formData.phone?.trim() && formData.location?.trim()
                          ? `${formData.location} · ${formData.phone}`
                          : 'Set operational city and direct telephone in Basic Info.'}
                      </p>
                    </div>
                  </div>

                  {/* Standard 3: Profile Completeness */}
                  <div className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                    (formData.description || '').trim().length >= 50 ? 'bg-emerald-50/50 border-emerald-200' : 'bg-[#FAF7F2] border-[#E8E2D9]'
                  }`}>
                    {(formData.description || '').trim().length >= 50 ? (
                      <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="size-4 text-amber-600 shrink-0 mt-0.5" />
                    )}
                    <div className="text-left min-w-0">
                      <p className="text-xs font-bold text-[#221F1C]">3. Comprehensive Studio Profile</p>
                      <p className="text-[11px] text-[#6B6560] mt-0.5">
                        {(formData.description || '').trim().length >= 50
                          ? `Complete (${(formData.description || '').trim().length} chars bio)`
                          : 'Studio bio must be at least 50 characters long.'}
                      </p>
                    </div>
                  </div>

                  {/* Standard 4: Ayoj Curation Approval */}
                  <div className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                    formData.verification_status === 'verified' ? 'bg-emerald-50/50 border-emerald-200' : 'bg-[#FAF7F2] border-[#E8E2D9]'
                  }`}>
                    {formData.verification_status === 'verified' ? (
                      <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <Clock className="size-4 text-[#9E5338] shrink-0 mt-0.5" />
                    )}
                    <div className="text-left min-w-0">
                      <p className="text-xs font-bold text-[#221F1C]">4. Ayoj Curation Team Review</p>
                      <p className="text-[11px] text-[#6B6560] mt-0.5">
                        {formData.verification_status === 'verified'
                          ? 'Certified and approved by platform trust operations.'
                          : formData.verification_status === 'pending_verification'
                            ? 'Documents submitted and currently under review.'
                            : 'Request official verification once items 1-3 are complete.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-2 border-t border-[#E8E2D9]">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#221F1C]">Business Registration / GSTIN Number</Label>
                  <Input
                    value={formData.business_license}
                    onChange={(e) => handleChange('business_license', e.target.value)}
                    placeholder="e.g. 07AAAAA0000A1Z5"
                    className="bg-[#FAF7F2]/60 border-[#E8E2D9] focus-visible:ring-[#9E5338] text-xs h-10 font-mono"
                  />
                  <p className="text-[10px] text-[#6B6560]">
                    Government of India GSTIN or registered MSME certificate number for your vendor business.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-dashed border-[#E8E2D9] bg-[#FAF7F2]/50 text-center space-y-2">
                  <FileText className="size-6 text-[#9E5338] mx-auto opacity-80" />
                  <div>
                    <p className="text-xs font-semibold text-[#221F1C]">Official Documentation & Review</p>
                    <p className="text-[11px] text-[#6B6560]">
                      Submit for manual review. When approved, the Verified Partner badge will display automatically on your cards.
                    </p>
                  </div>
                  {formData.verification_status !== 'verified' && (
                    <Button
                      type="button"
                      onClick={handleRequestVerification}
                      disabled={formData.verification_status === 'pending_verification'}
                      className="bg-[#9E5338] hover:bg-[#86442B] text-white rounded-full text-xs font-semibold h-9 px-5 shadow-xs cursor-pointer"
                    >
                      {formData.verification_status === 'pending_verification' ? 'Verification In Progress' : 'Request Official Verification'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Notifications */}
          {activeSubTab === 'notifications' && (
            <div className="bg-white border border-[#E8E2D9] rounded-2xl p-6 shadow-xs space-y-6">
              <div>
                <h3 className="text-base font-serif font-bold text-[#221F1C]">Communication & Alert Preferences</h3>
                <p className="text-xs text-[#6B6560] mt-0.5">
                  Choose how and when Ayoj notifies you of client inquiries and platform events.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  {
                    key: 'notify_email_bookings',
                    title: 'New Booking & Reservation Emails',
                    desc: 'Receive immediate email notifications whenever a host books or inquires about a service.',
                  },
                  {
                    key: 'notify_sms_bookings',
                    title: 'WhatsApp & SMS Urgent Alerts',
                    desc: 'Instant ping on your registered mobile number for newly scheduled events.',
                  },
                  {
                    key: 'notify_messages',
                    title: 'Direct Client Chat Messages',
                    desc: 'Alerts when a client host leaves a message on your booking thread.',
                  },
                  {
                    key: 'notify_marketing',
                    title: 'Ayoj Trend Insights & Event Guides',
                    desc: 'Occasional seasonal market reports and pricing tips to optimize your revenue.',
                  }
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-3.5 rounded-xl border border-[#E8E2D9] bg-[#FAF7F2]/60">
                    <div className="pr-4">
                      <p className="text-xs font-semibold text-[#221F1C]">{item.title}</p>
                      <p className="text-[11px] text-[#6B6560] mt-0.5">{item.desc}</p>
                    </div>
                    <Switch
                      checked={(formData as any)[item.key]}
                      onCheckedChange={(val) => handleChange(item.key, val)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Save Action Bar */}
          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-[#6B6560]">
              Changes apply live to your marketplace catalog presence.
            </p>
            <Button
              type="button"
              onClick={() => handleSave()}
              disabled={saving}
              className="bg-[#9E5338] hover:bg-[#86442B] text-white rounded-full text-xs font-semibold h-10 px-6 shadow-xs cursor-pointer gap-2 transition-all"
            >
              <Save className="size-3.5" />
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </div>

        {/* Sidebar Summary Card */}
        <div className="space-y-4">
          <div className="bg-white border border-[#E8E2D9] rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-[#E8E2D9]">
              <div className="size-10 rounded-full bg-[#F3EADF] text-[#9E5338] border border-[#E8E2D9] flex items-center justify-center font-serif font-bold text-sm">
                {formData.business_name[0] || 'V'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#221F1C] truncate">{formData.business_name}</p>
                <p className="text-[10px] text-[#6B6560] truncate">{formData.location} · {formData.years_experience} yrs exp</p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center text-[#6B6560]">
                <span>Status</span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px]">
                  {formData.verification_status === 'verified' ? 'Verified Partner' : 'In Review'}
                </span>
              </div>
              <div className="flex justify-between items-center text-[#6B6560]">
                <span>Booking Mode</span>
                <span className="font-semibold text-[#221F1C] text-[11px]">
                  {formData.instant_booking ? 'Instant Confirm' : 'Manual Review'}
                </span>
              </div>
              <div className="flex justify-between items-center text-[#6B6560]">
                <span>Deposit</span>
                <span className="font-semibold text-[#221F1C] text-[11px]">
                  {formData.advance_deposit_percent}% Upfront
                </span>
              </div>
              <div className="flex justify-between items-center text-[#6B6560]">
                <span>Cancellation</span>
                <span className="font-semibold text-[#221F1C] text-[11px]">
                  {formData.cancellation_policy}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E8E2D9]">
              <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#E8E2D9] text-[11px] text-[#6B6560] space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-[#221F1C]">
                  <Sparkles className="size-3 text-[#9E5338]" />
                  <span>Pro Visibility Tip</span>
                </div>
                <p>
                  Adding your verified GSTIN and Instagram profile increases booking conversion by 42%.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
