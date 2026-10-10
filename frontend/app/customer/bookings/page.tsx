import { redirect } from 'next/navigation';

export default function CustomerBookingsPage() {
  redirect('/customer/dashboard?tab=bookings');
}
