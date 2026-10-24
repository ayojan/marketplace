// Modular vendor features
export * from './onboarding';
export * from './portfolio';
export * from './settings';
export * from './services';
export * from './calendar';
export * from './bookings';

// Public vendor profile components
export { default as VendorProfileHeader } from './VendorProfileHeader';
export { default as VendorHeroMosaic } from './VendorHeroMosaic';
export { default as VendorSubNav } from './VendorSubNav';
export { default as VendorPortfolioSection } from './VendorPortfolioSection';
export { default as VendorPackagesSection } from './VendorPackagesSection';
export { default as VendorReviewsSection } from './VendorReviewsSection';
export { default as VendorFaqSection } from './VendorFaqSection';
export { default as VendorBookingSidebar } from './VendorBookingSidebar';
export { default as VendorServiceDetailsModal } from './VendorServiceDetailsModal';
export { default as VendorLightboxModal } from './VendorLightboxModal';
export { default as VendorStickyMobileBar } from './VendorStickyMobileBar';
export { default as VendorInquiryModal } from './VendorInquiryModal';
export { default as VendorCalendarPicker } from './VendorCalendarPicker';
export { default as VendorOnboardingWizard } from './VendorOnboardingWizard';
export type { PortfolioPhoto, Service as VendorProfileService } from './types';
