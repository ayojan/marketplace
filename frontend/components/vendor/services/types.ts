export interface ServiceImageItem {
  id: number;
  url?: string;
  thumbnail_url?: string;
  medium_url?: string;
  is_primary?: boolean;
  title?: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  formatted_price: string;
  base_price?: number;
  pricing_type: string;
  status: string;
  category: {
    id: number;
    name: string;
  };
  images?: ServiceImageItem[];
}

export interface ServiceFormData {
  name: string;
  description: string;
  service_category_id: string;
  base_price: string;
  pricing_type: string;
  status: string;
}

export interface ServiceManagementProps {
  services?: Service[];
  onServiceUpdate?: () => void;
}
