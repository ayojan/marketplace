export interface Service {
  id: string | number;
  name: string;
  description: string;
  base_price?: number;
  formatted_price?: string;
  pricing_type?: string;
  category?: { id?: number | string; name: string; slug?: string };
  categories?: Array<{ id?: number | string; name: string; slug?: string }>;
  service_category?: { id?: number | string; name: string; slug?: string };
  images?: Array<{ id: number; url: string; is_primary?: boolean }>;
}

export interface PortfolioPhoto {
  id: string | number;
  url: string;
  title: string;
  category: string;
  isFeatured?: boolean;
}
