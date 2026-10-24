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

export const POPULAR_LOCATIONS = ['Delhi NCR', 'Mumbai', 'Bengaluru', 'Jaipur', 'Goa', 'Chandigarh'];

export const COMMON_REQUIREMENTS = [
  'Full day candid coverage',
  'Pre-wedding video teaser',
  'Drone cinematography included',
  'Evening reception lighting',
  'Bridal makeup trial session'
];
