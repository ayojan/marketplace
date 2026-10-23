import type { Metadata } from 'next';

const isProduction = process.env.NODE_ENV === 'production';
const defaultSiteUrl = isProduction ? 'https://www.ayoj.in' : 'http://localhost:3000';
const siteUrl = (process.env.NEXT_PUBLIC_APP_URL || defaultSiteUrl).replace(/\/+$/, '');

export const metadata: Metadata = {
  title: 'Top Verified Vendors & Event Creative Specialists',
  description:
    'Discover curated vendors across photography, cinematography, styling, and decor. Check real customer reviews and book directly on Ayoj.',
  alternates: {
    canonical: `${siteUrl}/vendors`,
  },
  openGraph: {
    title: 'Top Verified Vendors & Event Creative Specialists | Ayoj',
    description:
      'Discover curated vendors across photography, cinematography, styling, and decor. Check real customer reviews and book directly on Ayoj.',
    url: `${siteUrl}/vendors`,
  },
};

export default function VendorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
