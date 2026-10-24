export interface Slot {
  id: number;
  date: string;
  start_time: string;
  end_time: string;
  time_range?: string;
  duration_hours?: number;
  is_available: boolean;
  has_booking_conflict?: boolean;
}

export interface BookingCalendarProps {
  bookings?: any[];
}
