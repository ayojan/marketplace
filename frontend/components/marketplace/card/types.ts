export interface PortfolioImage {
  id: number;
  url: string;
  title?: string;
}

export interface PortfolioItem {
  id: number;
  title?: string;
  description?: string;
  category?: string;
  is_featured?: boolean;
  image_count?: number;
  primary_image_url?: string;
  images?: PortfolioImage[];
}

export interface Vendor {
  id: string;
  slug?: string;
  name?: string;
  business_name?: string;
  image?: string;
  profile_image_url?: string;
  rating?: number;
  average_rating?: number;
  total_reviews?: number;
  location?: string;
  base_price?: number | string;
  is_favorite?: boolean;
  user_id?: string | number;
  is_verified?: boolean;
  verification_status?: string;
  verification_checks?: Record<string, any>;
  primary_category?: { id?: number; name?: string; slug?: string } | string;
  categories?: Array<{ id?: number; name?: string; slug?: string; is_primary?: boolean } | string>;
  service_categories?: string[];
  category?: string;
  featured_portfolio?: PortfolioItem[];
  years_experience?: number;
  service_images?: string[];
}

export interface VendorCardProps {
  photographer: Vendor;
  onFavoriteToggle?: (vendorId: string, isFav: boolean) => void;
  isCompared?: boolean;
  onToggleCompare?: (vendor: Vendor) => void;
  onQuickInquire?: (vendor: Vendor) => void;
}

export type PhotographerCardProps = VendorCardProps;
