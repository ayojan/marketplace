export interface CustomerProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  avatarUrl: string;
  coupleName: string;
  hashtag: string;
  weddingDate: string;
  eventType: string;
  venueName: string;
  guestCount: string;
  budgetRange: string;
  totalBudget: number;
  vibeTags: string[];
  coHost: {
    name: string;
    email: string;
    relationship: string;
    status: 'invited' | 'active' | 'none';
  };
  notifications: {
    whatsapp: boolean;
    sms: boolean;
    email: boolean;
    marketing: boolean;
  };
}

export interface DreamTeamSlot {
  id: string;
  categoryName: string;
  categorySlug: string;
  iconName: string;
  description: string;
  booking?: {
    id: number | string;
    vendorName: string;
    vendorSlug?: string;
    vendorImage?: string;
    serviceName: string;
    amount: number;
    eventDate: string;
    status: string;
  };
}
