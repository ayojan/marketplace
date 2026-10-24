import type { OnboardingPortfolioItem } from './types';

export const CITIES_PRESETS = [
  'Delhi NCR',
  'Mumbai',
  'Bengaluru',
  'Jaipur',
  'Goa',
  'Chandigarh',
  'Hyderabad',
  'Pune',
  'Udaipur',
  'Kolkata',
  'Ahmedabad',
  'Chennai'
];

export const CATEGORY_PRESETS: { [key: string]: { name: string; services: string[] } } = {
  photography: {
    name: 'Photography',
    services: [
      'Candid Wedding Photography',
      'Traditional Wedding Photography',
      'Pre-Wedding Couple Shoot',
      'Engagement & Roka Coverage',
      'Drone Aerial Cinematography'
    ]
  },
  videography: {
    name: 'Videography',
    services: [
      'Cinematic Wedding Film & Teaser',
      'Traditional HD Video Coverage',
      'Instagram Reels & Same-Day Edit',
      'Pre-Wedding Concept Film'
    ]
  },
  'makeup-artist': {
    name: 'Makeup Artist',
    services: [
      'Bridal HD & Airbrush Makeup',
      'Sangeet & Cocktail Glam Look',
      'Engagement & Reception Makeup',
      'Party Makeup for Family & Friends'
    ]
  },
  decorator: {
    name: 'Decorator',
    services: [
      'Floral Mandap & Stage Setup',
      'Grand Entrance & Royal Walkway',
      'Haldi & Mehendi Boho Decor',
      'Ambient Fairy & Truss Lighting'
    ]
  },
  'event-planner': {
    name: 'Event Planner',
    services: [
      'End-to-End Wedding Planning',
      'Day-of Event Coordination & Logistics',
      'Vendor Curation & Guest Hospitality',
      'Theme & Production Management'
    ]
  },
  caterer: {
    name: 'Catering',
    services: [
      'Live Chaat & Multi-Cuisine Counters',
      'Royal Indian Feast Buffet',
      'Cocktail Bar & Mocktail Mixology',
      'Gourmet Dessert & Mithai Spread'
    ]
  },
  dj: {
    name: 'DJ & Sound',
    services: [
      'Sangeet Night Bollywood DJ Console',
      'Live Dhol & Percussion Band',
      'JBL Line-Array Sound & Laser Setup',
      'Baraat Mobile Sound Truck'
    ]
  },
  venue: {
    name: 'Venues',
    services: [
      'Luxury Banquet Hall',
      'Open-Air Farmhouse & Lawn',
      'Heritage Palace / Resort Space',
      'Intimate Poolside Party Area'
    ]
  }
};

export const SAMPLE_PORTFOLIO_IMAGES: OnboardingPortfolioItem[] = [
  {
    title: 'Royal Mandap & Evening Lighting',
    category: 'Decorator',
    url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80'
  },
  {
    title: 'Candid Sangeet Dance Performance',
    category: 'Photography',
    url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80'
  },
  {
    title: 'Bridal Airbrush Glow & Hair Updo',
    category: 'Makeup Artist',
    url: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80'
  },
  {
    title: 'Gourmet Live Counter & Cocktail Styling',
    category: 'Catering',
    url: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80'
  }
];

export const ONBOARDING_STEPS = (isVendorAuthenticated: boolean) => [
  { number: 1, title: 'Account', subtitle: isVendorAuthenticated ? 'Completed' : 'Login credentials' },
  { number: 2, title: 'Business Profile', subtitle: 'Identity & Bio' },
  { number: 3, title: 'Categories & Services', subtitle: 'Offerings & Pricing' },
  { number: 4, title: 'Service Locations', subtitle: 'Coverage & Travel' },
  { number: 5, title: 'Portfolio & Pricing', subtitle: 'Showcase & Packages' }
];
