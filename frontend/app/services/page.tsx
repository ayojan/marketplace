import { Suspense } from 'react';
import ServiceSearch from '../../components/pages/ServiceSearch';

const isProduction = process.env.NODE_ENV === 'production';
const defaultSiteUrl = isProduction ? 'https://www.ayoj.in' : 'http://localhost:3000';
const siteUrl = (process.env.NEXT_PUBLIC_APP_URL || defaultSiteUrl).replace(/\/+$/, '');

export const metadata = {
  title: 'Event Services & Celebration Packages',
  description:
    'Browse verified photography, cinematography, decor, and catering services with upfront pricing and real reviews on Ayoj.',
  alternates: {
    canonical: `${siteUrl}/services`,
  },
  openGraph: {
    title: 'Event Services & Celebration Packages | Ayoj',
    description:
      'Browse verified photography, cinematography, decor, and catering services with upfront pricing and real reviews on Ayoj.',
    url: `${siteUrl}/services`,
  },
};

const servicesJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
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
          name: 'Services',
          item: `${siteUrl}/services`,
        },
      ],
    },
    {
      '@type': 'CollectionPage',
      '@id': `${siteUrl}/services#catalog`,
      name: 'Event Services & Celebration Packages',
      url: `${siteUrl}/services`,
      description: 'Directory of verified celebration services with upfront transparent pricing.',
      isPartOf: {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
      },
    },
  ],
};

export default function ServicesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(servicesJsonLd) }}
      />
      <Suspense fallback={<div className="container mx-auto px-4 py-8 text-center">Loading services...</div>}>
        <ServiceSearch />
      </Suspense>
    </>
  );
}