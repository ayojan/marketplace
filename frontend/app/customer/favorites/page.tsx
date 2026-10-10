import { redirect } from 'next/navigation';

export default function FavoritesPage() {
  redirect('/customer/dashboard?tab=saved');
}
