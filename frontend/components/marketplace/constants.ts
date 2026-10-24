import { 
  Camera, 
  Brush, 
  Flower2, 
  Sparkles, 
  Utensils, 
  Music, 
  Building2, 
  Grid, 
  Heart, 
  Gift 
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface BudgetPreset {
  id: string;
  label: string;
  min: string;
  max: string;
}

export interface TradeCategory {
  id: string;
  name: string;
  slug: string;
  icon: LucideIcon;
  matchKeys: string[];
}

export interface Occasion {
  id: string;
  name: string;
  icon: LucideIcon;
  matchKeys: string[];
}

export interface SortOption {
  id: string;
  label: string;
}

// Quick Budget Presets for Instant 1-Tap Filtering
export const QUICK_BUDGET_PRESETS: BudgetPreset[] = [
  { id: 'all', label: 'All Budgets', min: '', max: '' },
  { id: 'under-25k', label: 'Under ₹25k', min: '', max: '25000' },
  { id: '25k-50k', label: '₹25k – ₹50k', min: '25000', max: '50000' },
  { id: '50k-100k', label: '₹50k – ₹1L', min: '50000', max: '100000' },
  { id: 'above-100k', label: '₹1L+', min: '100000', max: '' },
];

// Unified Trade Categories matching Home Page
export const TRADE_CATEGORIES: TradeCategory[] = [
  { id: 'all', name: 'All Categories', slug: 'all', icon: Grid, matchKeys: [] },
  { id: 'photographer', name: 'Photographers', slug: 'photographer', icon: Camera, matchKeys: ['photo', 'photographer', 'photography'] },
  { id: 'makeup-artist', name: 'Makeup Artists', slug: 'makeup-artist', icon: Brush, matchKeys: ['makeup', 'makeover', 'beauty', 'bridal makeup'] },
  { id: 'decorator', name: 'Decorators', slug: 'decorator', icon: Flower2, matchKeys: ['decor', 'decorator', 'decoration', 'mandap', 'floral'] },
  { id: 'event-planner', name: 'Event Planners', slug: 'event-planner', icon: Sparkles, matchKeys: ['planner', 'planning', 'event planning', 'wedding planner'] },
  { id: 'caterer', name: 'Caterers', slug: 'caterer', icon: Utensils, matchKeys: ['caterer', 'catering', 'food', 'buffet'] },
  { id: 'dj', name: 'DJs & Music', slug: 'dj', icon: Music, matchKeys: ['dj', 'music', 'sound', 'entertainment', 'beats'] },
  { id: 'venue', name: 'Venues', slug: 'venue', icon: Building2, matchKeys: ['venue', 'banquet', 'resort', 'lawn', 'hall'] },
];

// Occasions / Event Types with Elegant Icons
export const OCCASIONS: Occasion[] = [
  { id: 'all', name: 'All Occasions', icon: Sparkles, matchKeys: [] },
  { id: 'wedding', name: 'Weddings', icon: Heart, matchKeys: ['wedding', 'shaadi', 'bridal', 'vivah'] },
  { id: 'pre-wedding', name: 'Pre-Wedding', icon: Camera, matchKeys: ['pre-wedding', 'pre wedding', 'engagement', 'roka'] },
  { id: 'engagement', name: 'Engagement', icon: Sparkles, matchKeys: ['engagement', 'ring ceremony', 'roka'] },
  { id: 'birthday', name: 'Birthdays', icon: Gift, matchKeys: ['birthday', 'celebration', 'party'] },
  { id: 'corporate', name: 'Corporate Events', icon: Building2, matchKeys: ['corporate', 'conference', 'summit', 'office'] },
  { id: 'baby-shower', name: 'Baby Shower', icon: Heart, matchKeys: ['baby shower', 'maternity', 'godh bharai'] },
  { id: 'anniversary', name: 'Anniversaries', icon: Sparkles, matchKeys: ['anniversary', 'silver jubilee'] },
];

export const SORT_OPTIONS: SortOption[] = [
  { id: 'featured', label: 'Featured & Top Rated' },
  { id: 'rating', label: 'Highest Rated (★ 5.0)' },
  { id: 'reviews', label: 'Most Reviewed' },
  { id: 'price-low', label: 'Price: Low to High' },
  { id: 'price-high', label: 'Price: High to Low' },
];
