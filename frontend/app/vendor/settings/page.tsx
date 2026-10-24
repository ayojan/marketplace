import { redirect } from 'next/navigation';

export default function VendorSettingsPage() {
  redirect('/vendor/dashboard?tab=settings');
}
