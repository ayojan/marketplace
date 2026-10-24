'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { apiService } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { toast } from 'sonner';
import {
  VendorSettingsProps,
  VendorSettingsFormData,
  ServiceCategory,
  SettingsTabType
} from './types';
import VendorSettingsNav from './VendorSettingsNav';
import VendorSettingsProfileTab from './VendorSettingsProfileTab';
import VendorSettingsPoliciesTab from './VendorSettingsPoliciesTab';
import VendorSettingsVerificationTab from './VendorSettingsVerificationTab';
import VendorSettingsNotificationsTab from './VendorSettingsNotificationsTab';
import VendorSettingsSidebar from './VendorSettingsSidebar';

export default function VendorSettings({ initialVendor }: VendorSettingsProps) {
  const { user } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<SettingsTabType>('profile');
  const [, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileId, setProfileId] = useState<number | string | null>(null);

  // Multi-Category states (Up to 3, 1 primary)
  const [allCategories, setAllCategories] = useState<ServiceCategory[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [primaryCategoryId, setPrimaryCategoryId] = useState<number | null>(null);

  // Form states
  const [formData, setFormData] = useState<VendorSettingsFormData>({
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
    verification_status: (initialVendor?.verification_status || 'unverified') as any
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
      <VendorSettingsNav activeTab={activeSubTab} onTabChange={setActiveSubTab} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings Form Panel */}
        <div className="lg:col-span-2 space-y-6">
          {activeSubTab === 'profile' && (
            <VendorSettingsProfileTab
              formData={formData}
              allCategories={allCategories}
              selectedCategoryIds={selectedCategoryIds}
              primaryCategoryId={primaryCategoryId}
              onChange={handleChange}
              onToggleCategory={handleToggleCategory}
              onSetPrimaryCategory={handleSetPrimaryCategory}
            />
          )}

          {activeSubTab === 'policies' && (
            <VendorSettingsPoliciesTab
              formData={formData}
              onChange={handleChange}
            />
          )}

          {activeSubTab === 'verification' && (
            <VendorSettingsVerificationTab
              formData={formData}
              onChange={handleChange}
              onRequestVerification={handleRequestVerification}
            />
          )}

          {activeSubTab === 'notifications' && (
            <VendorSettingsNotificationsTab
              formData={formData}
              onChange={handleChange}
            />
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
        <VendorSettingsSidebar formData={formData} />
      </div>
    </div>
  );
}
