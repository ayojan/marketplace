import { redirect } from 'next/navigation';

export default function VendorCalendarPage() {
  redirect('/vendor/dashboard?tab=calendar');
}
