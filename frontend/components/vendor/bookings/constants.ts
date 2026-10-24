export interface BookingType {
  id: number | string;
  status: 'pending' | 'accepted' | 'declined' | 'completed' | 'cancelled' | 'counter_offered';
  event_date: string;
  event_end_date?: string;
  event_location: string;
  total_amount: number | string;
  requirements?: string;
  special_instructions?: string;
  event_duration?: string;
  duration_hours?: number;
  created_at: string;
  customer?: {
    id: number | string;
    name: string;
    email: string;
  };
  service?: {
    id: number | string;
    name: string;
    category?: string;
  };
}

export type BookingTabType = 'all' | 'pending' | 'accepted' | 'completed' | 'declined';

export const formatDate = (dateStr: string) => {
  if (!dateStr) return 'TBD';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};
