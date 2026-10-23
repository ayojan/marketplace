import { Metadata } from 'next';

const isProduction = process.env.NODE_ENV === 'production';
const defaultSiteUrl = isProduction ? 'https://www.ayoj.in' : 'http://localhost:3000';
export const SITE_URL = (process.env.NEXT_PUBLIC_APP_URL || defaultSiteUrl).replace(/\/+$/, '');

export interface DirectorySearchParams {
  category?: string | string[];
  city?: string | string[];
  location?: string | string[];
  search?: string | string[];
  occasion?: string | string[];
  budget?: string | string[];
  sort?: string | string[];
  [key: string]: string | string[] | undefined;
}

const CATEGORY_NAMES: Record<string, { title: string; plural: string; desc: string }> = {
  photographer: {
    title: 'Wedding & Event Photographers',
    plural: 'Photographers',
    desc: 'Hire top candid wedding photographers, traditional cinematographers, and drone pilots.',
  },
  photography: {
    title: 'Wedding & Event Photographers',
    plural: 'Photographers',
    desc: 'Hire top candid wedding photographers, traditional cinematographers, and drone pilots.',
  },
  'makeup-artist': {
    title: 'Bridal Makeup Artists',
    plural: 'Makeup Artists',
    desc: 'Book verified bridal makeup artists for HD, airbrush, and reception makeovers.',
  },
  decorator: {
    title: 'Stage & Event Decorators',
    plural: 'Decorators',
    desc: 'Discover luxury floral mandaps, thematic entrance decor, and fairy light setups.',
  },
  'event-planner': {
    title: 'Wedding & Landmark Event Planners',
    plural: 'Event Planners',
    desc: 'Partner with end-to-end luxury wedding coordinators and celebration managers.',
  },
  caterer: {
    title: 'Event Caterers & Fine Dining',
    plural: 'Caterers',
    desc: 'Taste gourmet catering menus, live counter setups, and festive banquets.',
  },
  dj: {
    title: 'DJs, Sound & Live Artists',
    plural: 'DJs & Music',
    desc: 'Book high-energy wedding DJs, sound rigs, and live band performers.',
  },
  venue: {
    title: 'Banquets, Farmhouses & Venues',
    plural: 'Venues',
    desc: 'Explore luxury banquet halls, sprawling heritage lawns, and farmhouse venues.',
  },
};

const OCCASION_NAMES: Record<string, string> = {
  wedding: 'Wedding & Reception',
  'pre-wedding': 'Pre-Wedding Shoot',
  engagement: 'Engagement & Roka',
  birthday: 'Birthday Party',
  corporate: 'Corporate Event',
  'baby-shower': 'Baby Shower',
  anniversary: 'Anniversary Celebration',
};

function getParam(param: string | string[] | undefined): string | null {
  if (!param) return null;
  const val = Array.isArray(param) ? param[0] : param;
  return val ? val.trim() : null;
}

export function generateDirectoryMetadata(
  searchParams: DirectorySearchParams,
  basePath: '/marketplace' | '/vendors' = '/marketplace'
): Metadata {
  const categoryKey = getParam(searchParams.category)?.toLowerCase();
  const cityKey = getParam(searchParams.city) || getParam(searchParams.location);
  const searchKey = getParam(searchParams.search);
  const occasionKey = getParam(searchParams.occasion)?.toLowerCase();

  const categoryInfo = categoryKey ? CATEGORY_NAMES[categoryKey] : null;
  const occasionName = occasionKey ? OCCASION_NAMES[occasionKey] : null;

  // Build high-intent SEO Title
  let title = 'Explore Top Photographers, Decorators & Event Planners';
  let description =
    'Discover and book verified wedding photographers, makeup artists, decorators, and event planners across India. Transparent pricing, client reviews, and direct booking on Ayoj.';

  if (categoryInfo && cityKey) {
    title = `Best ${categoryInfo.title} in ${cityKey} (2026 Pricing & Reviews)`;
    description = `Compare top-rated ${categoryInfo.plural.toLowerCase()} in ${cityKey}. ${categoryInfo.desc} Check verified reviews, transparent packages, and live availability on Ayoj.`;
  } else if (categoryInfo) {
    title = `Best ${categoryInfo.title} — Verified Portfolios & Pricing`;
    description = `Discover verified ${categoryInfo.plural.toLowerCase()} across top cities in India. ${categoryInfo.desc} Transparent pricing and direct booking on Ayoj.`;
  } else if (cityKey) {
    title = `Top Wedding Vendors & Event Specialists in ${cityKey}`;
    description = `Book top-rated photographers, decorators, makeup artists, and event planners in ${cityKey}. Verified reviews, portfolios, and instant booking on Ayoj.`;
  } else if (occasionName) {
    title = `Best ${occasionName} Vendors & Celebration Artists`;
    description = `Plan your perfect ${occasionName.toLowerCase()}. Compare verified photographers, venues, caterers, and decorators with upfront pricing on Ayoj.`;
  } else if (searchKey) {
    title = `Search Results for "${searchKey}" — Event Specialists`;
    description = `Browse celebration specialists and services matching "${searchKey}". Verified artist portfolios and direct booking on Ayoj.`;
  }

  // Canonical tag: strip away noisy ephemeral filters like sort, budget, page to consolidate authority
  const canonicalParams = new URLSearchParams();
  if (categoryKey) canonicalParams.set('category', categoryKey);
  if (cityKey) canonicalParams.set('city', cityKey);
  if (occasionKey) canonicalParams.set('occasion', occasionKey);

  const queryString = canonicalParams.toString();
  const canonicalUrl = queryString ? `${SITE_URL}${basePath}?${queryString}` : `${SITE_URL}${basePath}`;

  // Internal search queries shouldn't create crawl waste
  const shouldNoindex = Boolean(searchKey);

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: !shouldNoindex,
      follow: true,
      googleBot: {
        index: !shouldNoindex,
        follow: true,
        'max-image-preview': 'large',
      },
    },
    openGraph: {
      title: `${title} | Ayoj`,
      description,
      url: canonicalUrl,
      type: 'website',
      images: [
        {
          url: '/images/indian-bride-groom-hero.jpg',
          width: 1200,
          height: 630,
          alt: `${title} on Ayoj`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | Ayoj`,
      description,
      images: ['/images/indian-bride-groom-hero.jpg'],
    },
  };
}

export function generateDirectoryJsonLd(
  searchParams: DirectorySearchParams,
  basePath: '/marketplace' | '/vendors' = '/marketplace'
) {
  const categoryKey = getParam(searchParams.category)?.toLowerCase();
  const cityKey = getParam(searchParams.city) || getParam(searchParams.location);
  const categoryInfo = categoryKey ? CATEGORY_NAMES[categoryKey] : null;

  const breadcrumbs: Array<{ '@type': string; position: number; name: string; item: string }> = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: SITE_URL,
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: basePath === '/vendors' ? 'Vendors' : 'Marketplace',
      item: `${SITE_URL}${basePath}`,
    },
  ];

  let currentPos = 3;
  if (categoryInfo) {
    breadcrumbs.push({
      '@type': 'ListItem',
      position: currentPos++,
      name: categoryInfo.plural,
      item: `${SITE_URL}${basePath}?category=${categoryKey}`,
    });
  }

  if (cityKey) {
    breadcrumbs.push({
      '@type': 'ListItem',
      position: currentPos++,
      name: cityKey,
      item: categoryKey
        ? `${SITE_URL}${basePath}?category=${categoryKey}&city=${encodeURIComponent(cityKey)}`
        : `${SITE_URL}${basePath}?city=${encodeURIComponent(cityKey)}`,
    });
  }

  const directoryTitle = categoryInfo && cityKey
    ? `${categoryInfo.title} in ${cityKey}`
    : categoryInfo
      ? categoryInfo.title
      : cityKey
        ? `Wedding & Event Specialists in ${cityKey}`
        : 'Ayoj Marketplace Directory';

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs,
      },
      {
        '@type': 'CollectionPage',
        '@id': `${SITE_URL}${basePath}#directory`,
        name: directoryTitle,
        url: `${SITE_URL}${basePath}`,
        description: 'Curated directory of verified creative professionals, wedding artists, and event specialists.',
        isPartOf: {
          '@type': 'WebSite',
          '@id': `${SITE_URL}/#website`,
        },
      },
    ],
  };
}
