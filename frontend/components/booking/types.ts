export interface Service {
  id: string | number;
  name: string;
  description: string;
  base_price: number | string;
  formatted_price?: string;
  category?: {
    id: number;
    name: string;
  };
  vendor?: {
    id: string | number;
    business_name: string;
    location?: string;
    is_verified?: boolean;
  };
}

export interface AlternativeSlot {
  date: string;
  start_time: string;
}
