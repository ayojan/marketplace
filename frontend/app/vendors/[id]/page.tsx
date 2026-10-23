import { Metadata } from 'next';
import VendorProfile from '../../../components/pages/VendorProfile';

const isProduction = process.env.NODE_ENV === 'production';
const defaultSiteUrl = isProduction ? 'https://www.ayoj.in' : 'http://localhost:3000';
const siteUrl = (process.env.NEXT_PUBLIC_APP_URL || defaultSiteUrl).replace(/\/+$/, '');
const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/+$/, '');

async function fetchVendor(id: string) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(`${apiUrl}/vendors/${id}`, {
      signal: controller.signal,
      next: { revalidate: 3600 },
    });
    clearTimeout(timeoutId);

    if (!res.ok) return null;
    const data = await res.json();
    return data.vendor || null;
  } catch (error) {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const vendor = await fetchVendor(params.id);

  if (!vendor) {
    return {
      title: 'Vendor Profile | Ayoj',
      description: 'View vendor profile and services on Ayoj.',
      robots: { index: false, follow: true },
    };
  }

  const vendorName = vendor.business_name || 'Creative Partner';
  const categoryName = vendor.primary_category?.name || (typeof vendor.primary_category === 'string' ? vendor.primary_category : vendor.category) || 'Event Specialist';
  const locationName = vendor.location || 'India';
  const ratingNum = Number(vendor.average_rating) || 0;
  const ratingText = ratingNum > 0 ? ` (${ratingNum.toFixed(1)}★)` : '';

  const title = `${vendorName}${ratingText} — ${categoryName} in ${locationName}`;
  const cleanDescription = vendor.description
    ? vendor.description.slice(0, 155).replace(/\s+/g, ' ').trim()
    : `Book ${vendorName} on Ayoj. Verified ${categoryName} serving ${locationName}. View transparent pricing, verified reviews, and portfolio.`;

  const ogImage = vendor.profile_image_url || vendor.image || `${siteUrl}/images/indian-bride-groom-hero.jpg`;
  const canonicalUrl = `${siteUrl}/vendors/${params.id}`;

  return {
    title,
    description: cleanDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${title} | Ayoj`,
      description: cleanDescription,
      url: canonicalUrl,
      type: 'profile',
      images: [
        {
          url: ogImage,
          width: 800,
          height: 800,
          alt: `${vendorName} on Ayoj`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | Ayoj`,
      description: cleanDescription,
      images: [ogImage],
    },
  };
}

export default async function VendorProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const vendor = await fetchVendor(params.id);

  const vendorName = vendor?.business_name || 'Creative Partner';
  const categoryName = vendor?.primary_category?.name || 'Event Specialist';
  const locationName = vendor?.location || 'India';
  const ratingVal = Number(vendor?.average_rating) || 0;
  const reviewCount = Number(vendor?.total_reviews) || 0;

  const packages = Array.isArray(vendor?.metadata?.packages) ? vendor.metadata.packages : [];
  const socialProfiles = [
    vendor?.website,
    vendor?.instagram_handle
      ? vendor.instagram_handle.startsWith('http')
        ? vendor.instagram_handle
        : `https://instagram.com/${vendor.instagram_handle.replace(/^@/, '')}`
      : null,
    vendor?.facebook_url,
  ].filter(Boolean);

  const vendorFaqs = [
    {
      q: `What is the payment milestone schedule for booking ${vendorName}?`,
      a: `Typically, reservations require a 25% date-lock advance to guarantee slot availability in the studio's calendar. 50% is scheduled one week prior to event execution, and the remaining 25% upon final delivery of work. Direct invoicing has zero platform commission or hidden markups.`,
    },
    {
      q: `Does the team travel for outstation or destination celebrations?`,
      a: `Yes! ${vendorName} regularly undertakes destination weddings and milestone events across India. Travel (flights/trains) and basic on-site accommodation for the operating crew are coordinated directly prior to event confirmation.`,
    },
    {
      q: `What happens if our event date needs to be rescheduled?`,
      a: `If notified at least 30 days in advance, the date-lock advance can be transferred to an open alternate slot within 12 months at no penalty, subject to studio calendar availability.`,
    },
    {
      q: `What equipment and team size will be deployed on-site?`,
      a: `The deployed crew matches the chosen package deliverables. For candid photography and film, this typically includes senior camera artists, 4K full-frame cinema bodies, drone operators, and backup sound equipment.`,
    },
    {
      q: `How does the Ayoj 0% Middleman Guarantee protect hosts?`,
      a: `Ayoj operates on direct artist-to-host connectivity. You receive authentic published rates with zero platform surcharges, verified identity authentication, and direct telephone/WhatsApp communication with the lead artist.`,
    },
  ];

  const vendorJsonLd = vendor
    ? {
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
                name: 'Marketplace',
                item: `${siteUrl}/marketplace`,
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: vendorName,
                item: `${siteUrl}/vendors/${params.id}`,
              },
            ],
          },
          {
            '@type': 'ProfessionalService',
            '@id': `${siteUrl}/vendors/${params.id}#profile`,
            name: vendorName,
            description: vendor.description || `${vendorName} — ${categoryName} in ${locationName}`,
            image: vendor.profile_image_url || vendor.image || `${siteUrl}/images/indian-bride-groom-hero.jpg`,
            url: `${siteUrl}/vendors/${params.id}`,
            telephone: vendor.phone || undefined,
            priceRange: vendor.base_price ? `₹${vendor.base_price}+` : '₹₹',
            address: {
              '@type': 'PostalAddress',
              addressLocality: locationName,
              addressCountry: 'IN',
            },
            ...(socialProfiles.length > 0 ? { sameAs: socialProfiles } : {}),
            ...(vendor.coordinates?.latitude && vendor.coordinates?.longitude
              ? {
                  geo: {
                    '@type': 'GeoCoordinates',
                    latitude: vendor.coordinates.latitude,
                    longitude: vendor.coordinates.longitude,
                  },
                }
              : {}),
            ...(packages.length > 0
              ? {
                  hasOfferCatalog: {
                    '@type': 'OfferCatalog',
                    name: `${vendorName} Service Packages`,
                    itemListElement: packages.map((pkg: any) => ({
                      '@type': 'Offer',
                      name: pkg.title || 'Celebration Package',
                      price: pkg.price || vendor.base_price,
                      priceCurrency: 'INR',
                      description: pkg.inclusions || pkg.description || undefined,
                    })),
                  },
                }
              : {}),
            ...(reviewCount > 0 && ratingVal > 0
              ? {
                  aggregateRating: {
                    '@type': 'AggregateRating',
                    ratingValue: ratingVal.toFixed(1),
                    reviewCount: reviewCount,
                    bestRating: '5',
                    worstRating: '1',
                  },
                }
              : {}),
          },
          {
            '@type': 'FAQPage',
            '@id': `${siteUrl}/vendors/${params.id}#faqs`,
            mainEntity: vendorFaqs.map((faq) => ({
              '@type': 'Question',
              name: faq.q,
              acceptedAnswer: {
                '@type': 'Answer',
                text: faq.a,
              },
            })),
          },
        ],
      }
    : null;

  return (
    <>
      {vendorJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(vendorJsonLd) }}
        />
      )}
      <VendorProfile params={params} />
    </>
  );
}