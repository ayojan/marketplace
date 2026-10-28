export type UserRole = 'customer' | 'vendor' | 'admin';

export interface VendorUserSummary {
  id: number | string;
  slug?: string;
  business_name?: string;
  is_verified?: boolean;
}

export interface CustomerUserSummary {
  id: number | string;
  phone?: string;
  location?: string;
}

export interface User {
  id: number | string;
  email: string;
  role: UserRole;
  first_name?: string;
  last_name?: string;
  name?: string;
  business_name?: string;
  phone?: string;
  location?: string;
  avatar_url?: string;
  confirmed?: boolean;
  is_verified?: boolean;
  needs_mobile_onboarding?: boolean;
  has_google_identity?: boolean;
  created_at?: string;
  vendor_id?: number | string;
  vendor?: VendorUserSummary;
  customer_id?: number | string;
  customer?: CustomerUserSummary;
  [key: string]: any;
}

export interface TokenPayload {
  sub?: string | number;
  user_id?: string | number;
  role?: UserRole;
  exp: number;
  iat?: number;
  [key: string]: any;
}
