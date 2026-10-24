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
