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
