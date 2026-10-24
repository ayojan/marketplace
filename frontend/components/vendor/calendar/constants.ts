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

export const formatDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
