import { 
  Camera, 
  Brush, 
  Flower2, 
  Sparkles, 
  Utensils, 
  Music, 
  Building2, 
  Heart, 
  Gift 
} from 'lucide-react';
import { CITIES } from '@/lib/contexts/LocationContext';
import type { HeaderCategoryItem, HeaderOccasionItem } from './types';

export { CITIES };

export const CATEGORIES_NAV: HeaderCategoryItem[] = [
  {
    name: 'Photographers',
    slug: 'photographer',
    icon: Camera,
    description: 'Candid wedding, portraits & event shoots',
  },
  {
    name: 'Makeup Artists',
    slug: 'makeup-artist',
    icon: Brush,
    description: 'Bridal makeover, hair styling & glam',
  },
  {
    name: 'Decorators',
    slug: 'decorator',
    icon: Flower2,
    description: 'Floral mandaps, stages & thematic decor',
  },
  {
    name: 'Event Planners',
    slug: 'event-planner',
    icon: Sparkles,
    description: 'Full-service management & coordination',
  },
  {
    name: 'Caterers',
    slug: 'caterer',
    icon: Utensils,
    description: 'Gourmet dining & personalized food counters',
  },
  {
    name: 'DJs & Entertainment',
    slug: 'dj',
    icon: Music,
    description: 'Sangeet DJs, live sound & performances',
  },
  {
    name: 'Venues',
    slug: 'venue',
    icon: Building2,
    description: 'Luxury banquets, lawns, villas & resorts',
  },
];

export const OCCASIONS_NAV: HeaderOccasionItem[] = [
  {
    name: 'Weddings',
    slug: 'wedding',
    icon: Heart,
    description: 'Grand shaadi celebrations & traditions',
  },
  {
    name: 'Pre-Wedding',
    slug: 'pre-wedding',
    icon: Camera,
    description: 'Haldi, Mehendi, Sangeet & couples shoots',
  },
  {
    name: 'Engagement',
    slug: 'engagement',
    icon: Sparkles,
    description: 'Roka ceremonies & ring exchange parties',
  },
  {
    name: 'Birthdays',
    slug: 'birthday',
    icon: Gift,
    description: 'Kids parties & milestone age celebrations',
  },
  {
    name: 'Corporate Events',
    slug: 'corporate',
    icon: Building2,
    description: 'Annual summits, galas & team offsites',
  },
  {
    name: 'Baby Shower',
    slug: 'baby-shower',
    icon: Heart,
    description: 'Godh bharai & family milestone ceremonies',
  },
  {
    name: 'Anniversaries',
    slug: 'anniversary',
    icon: Sparkles,
    description: 'Silver, golden & romantic celebration dates',
  },
];
