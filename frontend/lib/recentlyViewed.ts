'use client';

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

const STORAGE_KEY = 'ayoj_recently_viewed_vendors';
const MAX_ITEMS = 8;

export function getRecentlyViewedVendors(): RecentlyViewedVendor[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveRecentlyViewedVendor(vendor: any): void {
  if (typeof window === 'undefined' || !vendor || !vendor.id) return;
  try {
    const current = getRecentlyViewedVendors();
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

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('ayoj-recently-viewed-updated'));
  } catch {
    // Ignore storage quota errors
  }
}

export function clearRecentlyViewedVendors(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('ayoj-recently-viewed-updated'));
  } catch {
    // Ignore
  }
}
