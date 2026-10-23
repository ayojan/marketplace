import type { Metadata } from 'next';

const isProduction = process.env.NODE_ENV === 'production';
const defaultSiteUrl = isProduction ? 'https://www.ayoj.in' : 'http://localhost:3000';
const siteUrl = (process.env.NEXT_PUBLIC_APP_URL || defaultSiteUrl).replace(/\/+$/, '');

export const metadata: Metadata = {
  title: 'Explore Top Photographers, Decorators & Event Planners',
  description:
    'Discover and book top-rated wedding photographers, cinematographers, makeup artists, and event organizers across India. Transparent pricing, verified reviews, and direct booking on Ayoj.',
  alternates: {
    canonical: `${siteUrl}/marketplace`,
  },
  openGraph: {
    title: 'Explore Top Photographers, Decorators & Event Planners | Ayoj',
    description:
      'Discover and book top-rated wedding photographers, cinematographers, makeup artists, and event organizers across India. Transparent pricing, verified reviews, and direct booking on Ayoj.',
    url: `${siteUrl}/marketplace`,
    type: 'website',
    images: [
      {
        url: '/images/indian-bride-groom-hero.jpg',
        width: 1200,
        height: 630,
        alt: 'Ayoj Marketplace - Event Professionals',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Explore Top Photographers, Decorators & Event Planners | Ayoj',
    description:
      'Discover and book top-rated wedding photographers, cinematographers, makeup artists, and event organizers across India.',
    images: ['/images/indian-bride-groom-hero.jpg'],
  },
};

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: siteUrl,
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Marketplace',
      item: `${siteUrl}/marketplace`,
    },
  ],
};

export default function MarketplaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {children}
    </>
  );
}
