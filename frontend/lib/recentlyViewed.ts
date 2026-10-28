'use client';

import { tokenService } from './tokenService';

export interface RecentlyViewedVendor {
  id: string | number;
  slug?: string;
  name: string;
  image?: string;
  category?: string;
  location?: string;
  base_price?: number | string;
  rating?: number;
  total_reviews?: number;
  viewedAt: number;
}

const STORAGE_PREFIX = 'ayoj_recently_viewed_vendors_';
const MAX_ITEMS = 8;

export function getRecentlyViewedVendors(userId?: string | number): RecentlyViewedVendor[] {
  if (typeof window === 'undefined') return [];
  const activeId = userId ?? tokenService.getUser()?.id;
  if (!activeId) return []; // User is logged out / no user signed in: Return empty array!
  try {
    const key = `${STORAGE_PREFIX}${activeId}`;
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveRecentlyViewedVendor(vendor: any, userId?: string | number): void {
  if (typeof window === 'undefined' || !vendor || !vendor.id) return;
  const activeId = userId ?? tokenService.getUser()?.id;
  if (!activeId) return; // Do not record history for unauthenticated/anonymous visitors!
  try {
    const key = `${STORAGE_PREFIX}${activeId}`;
    const current = getRecentlyViewedVendors(activeId);
    const name = vendor.name || vendor.business_name || 'Creative Partner';
    const image = vendor.image || vendor.profile_image_url || '';
    const rating = vendor.rating ?? vendor.average_rating;
    const category = vendor.primary_category 
      ? (typeof vendor.primary_category === 'string' ? vendor.primary_category : vendor.primary_category.name)
      : (vendor.category || vendor.service_categories?.[0] || 'Creative Partner');

    const newItem: RecentlyViewedVendor = {
      id: vendor.id,
      slug: vendor.slug || String(vendor.id),
      name,
      image,
      category,
      location: vendor.location || '',
      base_price: vendor.base_price,
      rating: rating ? Number(rating) : undefined,
      total_reviews: vendor.total_reviews ?? 0,
      viewedAt: Date.now(),
    };

    // Remove duplicates if already exists
    const filtered = current.filter((item) => String(item.id) !== String(vendor.id));
    const updated = [newItem, ...filtered].slice(0, MAX_ITEMS);

    localStorage.setItem(key, JSON.stringify(updated));
    // Also clean up any legacy un-scoped key from previous version
    localStorage.removeItem('ayoj_recently_viewed_vendors');
    window.dispatchEvent(new CustomEvent('ayoj-recently-viewed-updated'));
  } catch {
    // Ignore storage quota errors
  }
}

export function clearRecentlyViewedVendors(userId?: string | number): void {
  if (typeof window === 'undefined') return;
  try {
    const activeId = userId ?? tokenService.getUser()?.id;
    if (activeId) {
      localStorage.removeItem(`${STORAGE_PREFIX}${activeId}`);
    }
    // Also clean legacy un-scoped key if present
    localStorage.removeItem('ayoj_recently_viewed_vendors');
    window.dispatchEvent(new CustomEvent('ayoj-recently-viewed-updated'));
  } catch {
    // Ignore
  }
}
