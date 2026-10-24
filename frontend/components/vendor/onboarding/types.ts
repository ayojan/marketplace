export interface OnboardingAccountData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  password: string;
  passwordConfirmation: string;
}

export interface OnboardingProfileData {
  businessName: string;
  vendorType: string;
  description: string;
  profileImage: string;
  yearsExperience: number;
  city: string;
  state: string;
  pincode: string;
}

export interface OnboardingOffering {
  id: string;
  categorySlug: string;
  categoryName: string;
  name: string;
  description: string;
  pricingStyle: string;
  basePrice: number;
}

export interface OnboardingLocationData {
  baseCity: string;
  serviceableCities: string[];
  travelRadiusKm: number;
  panIndia: boolean;
  travelChargesType: string;
  travelChargesAmount: number;
  outOfAreaApproval: boolean;
}

export interface OnboardingPackage {
  id: string;
  title: string;
  price: number;
  inclusions: string;
  exclusions: string;
}

export interface OnboardingPortfolioItem {
  title: string;
  category: string;
  url: string;
}
