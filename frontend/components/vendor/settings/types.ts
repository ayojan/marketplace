export interface VendorSettingsProps {
  initialVendor?: any;
}

export interface VendorSettingsFormData {
  business_name: string;
  owner_name: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  instagram_handle: string;
  years_experience: number | string;
  description: string;
  business_license: string;
  cancellation_policy: string;
  instant_booking: boolean;
  min_advance_days: string;
  advance_deposit_percent: string;
  notify_email_bookings: boolean;
  notify_sms_bookings: boolean;
  notify_messages: boolean;
  notify_marketing: boolean;
  verification_status: 'unverified' | 'pending_verification' | 'verified' | 'rejected';
}

export interface ServiceCategory {
  id: number;
  name: string;
  slug?: string;
  is_primary?: boolean;
}

export type SettingsTabType = 'profile' | 'policies' | 'verification' | 'notifications';
