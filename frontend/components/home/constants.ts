import { 
  Camera, 
  Brush, 
  Flower2, 
  Building2, 
  Music, 
  Sparkles, 
  Utensils, 
  Grid,
  IndianRupee,
  MessageSquare,
  CalendarCheck
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface TrendingSearch {
  label: string;
  category: string;
  icon: LucideIcon;
  tag: string;
}

export interface PopularSearchPill {
  label: string;
  slug: string;
}

export interface CategoryIconItem {
  name: string;
  icon: LucideIcon;
  slug: string;
}

export interface OccasionItem {
  name: string;
  image: string;
}

export interface VendorFilterTab {
  id: string;
  label: string;
}

export interface TestimonialStory {
  id: string;
  couple: string;
  occasion: string;
  image: string;
  quote: string;
  vendor: string;
  category: string;
}

export const TRENDING_SEARCHES: TrendingSearch[] = [
  { label: 'Candid Wedding Photographers', category: 'photographer', icon: Camera, tag: 'High Demand' },
  { label: 'Bridal Makeup & Hair Artists', category: 'makeup-artist', icon: Brush, tag: 'Trending' },
  { label: 'Luxury Floral & Stage Decor', category: 'decorator', icon: Flower2, tag: 'Popular' },
  { label: 'Destination Farmhouses & Venues', category: 'venue', icon: Building2, tag: 'Top Rated' },
  { label: 'Sangeet DJs & Sound Setup', category: 'dj', icon: Music, tag: 'Party' },
  { label: 'Full Event Planners & Management', category: 'event-planner', icon: Sparkles, tag: 'Full Service' },
];

export const POPULAR_SEARCH_PILLS: PopularSearchPill[] = [
  { label: 'Photographers', slug: 'photographer' },
  { label: 'Bridal Makeup', slug: 'makeup-artist' },
  { label: 'Wedding Decor', slug: 'decorator' },
  { label: 'Banquet Venues', slug: 'venue' },
  { label: 'Sangeet DJs', slug: 'dj' },
];

export const CATEGORY_ICONS: CategoryIconItem[] = [
  { name: 'Photographers', icon: Camera, slug: 'photographer' },
  { name: 'Makeup Artists', icon: Brush, slug: 'makeup-artist' },
  { name: 'Decorators', icon: Flower2, slug: 'decorator' },
  { name: 'Event Planners', icon: Sparkles, slug: 'event-planner' },
  { name: 'Caterers', icon: Utensils, slug: 'caterer' },
  { name: 'DJs & Entertainment', icon: Music, slug: 'dj' },
  { name: 'Venues', icon: Building2, slug: 'venue' },
  { name: 'More', icon: Grid, slug: 'all' },
];

export const POPULAR_OCCASIONS: OccasionItem[] = [
  {
    name: 'Wedding',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Pre-Wedding',
    image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Engagement',
    image: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Birthday',
    image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Corporate Events',
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Baby Shower',
    image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Anniversary',
    image: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=600&q=80',
  },
];

export const VENDOR_FILTER_TABS: VendorFilterTab[] = [
  { id: 'all', label: 'All Verified Pros' },
  { id: 'photographer', label: 'Photographers' },
  { id: 'makeup-artist', label: 'Makeup Artists' },
  { id: 'decorator', label: 'Decorators' },
  { id: 'dj', label: 'DJs & Music' },
  { id: 'venue', label: 'Venues' }
];

export const CORE_GUARANTEES = [
  {
    title: '0% Middleman Markups',
    subtitle: 'Direct artist-to-host pricing',
    icon: IndianRupee
  },
  {
    title: '100% Real Portfolios',
    subtitle: 'Verified celebration photos',
    icon: Camera
  },
  {
    title: 'Direct Host Chat',
    subtitle: 'Talk directly with artists',
    icon: MessageSquare
  },
  {
    title: 'Live Slot Checking',
    subtitle: 'Real-time date availability',
    icon: CalendarCheck
  }
];

export const HOW_IT_WORKS_STEPS = [
  {
    step: '01',
    badge: 'Discover & Shortlist',
    title: 'Curated Portfolios & Verified Reviews',
    desc: 'Explore authentic high-resolution galleries, equipment gear, and real celebration work directly from creative studios.',
    icon: Camera,
    features: ['Real client galleries & albums', 'Verified host reviews & ratings', 'Multi-category creative talent'],
    highlight: 'Explore authentic portfolios'
  },
  {
    step: '02',
    badge: 'Connect & Align',
    title: 'Transparent Pricing & Direct Chat',
    desc: 'View published starting rates with zero hidden markups. Chat directly with artists to customize deliverables and quotes.',
    icon: IndianRupee,
    features: ['Published upfront package rates', 'Direct artist-to-host chat', 'Customizable celebration quotes'],
    highlight: 'Direct host-to-artist messaging'
  },
  {
    step: '03',
    badge: 'Reserve & Celebrate',
    title: 'Live Slot Availability & Dashboard Booking',
    desc: 'Check open dates on vendor profiles. Submit your date reservation request and manage celebration status directly.',
    icon: CalendarCheck,
    features: ['Live calendar slot checking', 'Host dashboard status tracking', 'Direct date reservation coordination'],
    highlight: 'Seamless celebration coordination'
  }
];

export const TESTIMONIAL_STORIES: TestimonialStory[] = [
  {
    id: 't1',
    couple: 'Aanya & Rohan Kapoor',
    occasion: 'Grand Wedding in Jaipur',
    image: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=600&q=80',
    quote: 'Finding our wedding photographer on Ayoj was effortless. We could browse their full portfolio, check open dates directly, and coordinate every detail in one place.',
    vendor: 'The Wedding Narratives',
    category: 'Wedding Photography'
  },
  {
    id: 't2',
    couple: 'Pooja & Sameer Verma',
    occasion: 'Bridal Makeover & Sangeet',
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=600&q=80',
    quote: 'Meera did my bridal makeover and she was absolutely magical. Seeing transparent packages and reading genuine host reviews gave me full confidence for my big day.',
    vendor: 'Meera Makeovers',
    category: 'Bridal Makeup'
  },
  {
    id: 't3',
    couple: 'Vikram & Sneha Singhal',
    occasion: '25th Anniversary Celebration',
    image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=600&q=80',
    quote: 'Eventica Decor turned our banquet into a floral paradise. The quote was completely transparent from day one — zero hidden markups. Highly recommended!',
    vendor: 'Eventica Decor',
    category: 'Stage & Floral Decor'
  }
];
