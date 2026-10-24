export interface CompareVendor {
  id: string | number;
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
  is_verified?: boolean;
  verification_status?: string;
  primary_category?: any;
  categories?: any[];
  service_categories?: string[];
  category?: string;
  occasions?: string[];
}

export interface VendorCompareDrawerProps {
  vendors: CompareVendor[];
  onRemove: (vendorId: string | number) => void;
  onClear: () => void;
  onOpenInquire?: (vendor: CompareVendor) => void;
  isOpenInquireModal?: boolean;
  onToggleInquireModal?: (open: boolean) => void;
}

export interface InquiryFormData {
  celebrationDate: string;
  occasion: string;
  guests: string;
  city: string;
  notes: string;
  hostName: string;
  hostPhone: string;
  hostEmail: string;
}

export const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=600&auto=format&fit=crop';

export const OCCASIONS_LIST = [
  'Wedding & Shaadi',
  'Pre-Wedding (Haldi, Mehendi, Sangeet)',
  'Engagement & Roka',
  'Birthday & Anniversary',
  'Corporate Event / Gala',
  'Other Celebration'
];

export const GUEST_SCALES_LIST = [
  'Intimate (< 50 guests)',
  'Classic (50 – 150 guests)',
  'Grand (150 – 400 guests)',
  'Royal (400+ guests)'
];
