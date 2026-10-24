// Centralized Textual Content / Copy Dictionaries for Marketplace
export const MARKETPLACE_HERO_COPY = {
  badge: 'Discover · Trust · Celebrate',
  titlePrefix: 'Find & Book Top',
  loopWords: [
    'Photographers',
    'Cinematographers',
    'Bridal Artists',
    'Live DJs',
    'Decorators',
    'Mehendi Pros',
  ],
  subtitle:
    'Explore authentic portfolios, transparent pricing, and live availability across verified celebration artists.',
  searchPlaceholder: 'Search by pro name, style, or occasion...',
  allCitiesOption: '📍 All Cities',
} as const;

export const MARKETPLACE_EMPTY_STATE_COPY = {
  filterRecovery: {
    title: 'No exact matches for your active filters',
    description:
      'Try relaxing your budget, location, or occasion to find available creative partners.',
    clearBudget: 'Clear Budget Filter',
    showAllLocations: 'Show All Locations',
    showAllCategories: 'Show All Categories',
    resetFilters: 'Reset All Filters',
  },
  networkBuilding: {
    titleTemplate: (city: string) => `We're building Ayoj in ${city || 'your city'}`,
    description:
      "Tell us what you're planning, and we'll work to connect you with suitable local event professionals.",
    servicesPrompt: 'What service do you need?',
    servicesList: ['Photography', 'Decoration', 'Makeup', 'Catering', 'More'],
    ctaButton: 'Request a vendor',
    disclaimer: "No guarantee of a match. We'll contact you if we find a suitable provider.",
  },
  recommendations: {
    title: 'Recommended Creative Partners You Might Like',
    subtitle: 'Explore top-rated partners across popular categories',
    viewAllAction: 'View all partners',
  },
} as const;

export const MARKETPLACE_REQUEST_MODAL_COPY = {
  badge: 'Custom Matchmaking',
  title: 'Request an Event Professional',
  subtitle: 'Tell us what you need and our concierge will connect you with verified local talent.',
  trustBadge: '100% Free Service · Verified Providers Only · No Spam Guarantee',
  submitButton: 'Submit Request',
  submittingButton: 'Submitting Request...',
  successTitle: 'Request Received!',
  successSubtitle: 'Thank you! We will review your requirements and connect you with suitable vendors soon.',
  doneButton: 'Done',
} as const;
