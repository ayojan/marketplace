import { redirect } from 'next/navigation';

export default function VendorServicesPage() {
  redirect('/vendor/dashboard?tab=services');
}
