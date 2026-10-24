import type { LucideIcon } from 'lucide-react';

export interface TrendingSearch {
  label: string;
  category: string;
  icon: LucideIcon;
  tag: string;
}

export interface PopularSearchPill {
  label: string;
  slug: string;
}

export interface CategoryIconItem {
  name: string;
  icon: LucideIcon;
  slug: string;
}

export interface OccasionItem {
  name: string;
  image: string;
}

export interface VendorFilterTab {
  id: string;
  label: string;
}

export interface TestimonialStory {
  id: string;
  couple: string;
  occasion: string;
  image: string;
  quote: string;
  vendor: string;
  category: string;
}
