import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { AuthProvider } from '@/lib/contexts/AuthContext';
import { AppProvider } from '@/lib/contexts/AppContext';
import { LocationProvider } from '@/lib/contexts/LocationContext';
import LocationPromptModal from '@/components/LocationPromptModal';
import { Toaster } from '@/components/ui/sonner';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import '../styles/globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-plus-jakarta',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: '#FAF7F2',
};

const isProduction = process.env.NODE_ENV === 'production';
const defaultSiteUrl = isProduction ? 'https://www.ayoj.in' : 'http://localhost:3000';
const siteUrl = (process.env.NEXT_PUBLIC_APP_URL || defaultSiteUrl).replace(/\/+$/, '');

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Ayoj — Premium Creative & Event Marketplace',
    template: '%s | Ayoj',
  },
  description: 'Connect with verified photographers, videographers, and event managers for landmark celebrations across India.',
  keywords: [
    'ayoj',
    'event marketplace',
    'wedding photographers',
    'cinematographers',
    'event management',
    'wedding decor',
    'makeup artists',
    'event planning India',
  ],
  authors: [{ name: 'Ayoj' }],
  creator: 'Ayoj',
  publisher: 'Ayoj',
  icons: {
    icon: '/images/ayoj-icon.svg',
    apple: '/images/ayoj-icon.png',
  },
  manifest: '/manifest.webmanifest',
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: siteUrl,
    siteName: 'Ayoj',
    title: 'Ayoj — Premium Creative & Event Marketplace',
    description: 'Connect with verified photographers, videographers, and event managers for landmark celebrations across India.',
    images: [
      {
        url: '/images/indian-bride-groom-hero.jpg',
        width: 1200,
        height: 630,
        alt: 'Ayoj — Premium Creative & Event Marketplace',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ayoj — Premium Creative & Event Marketplace',
    description: 'Connect with verified photographers, videographers, and event managers for landmark celebrations across India.',
    images: ['/images/indian-bride-groom-hero.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Ayoj',
  },
  formatDetection: {
    telephone: false,
  },
};

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      name: 'Ayoj',
      url: siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/images/ayoj-icon.png`,
      },
      description: 'India\'s curated marketplace for verified event photographers, videographers, decorators, and planners.',
      sameAs: [
        'https://instagram.com/ayoj.in',
        'https://twitter.com/ayoj_in',
        'https://linkedin.com/company/ayoj',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      url: siteUrl,
      name: 'Ayoj',
      description: 'Premium Creative & Event Marketplace',
      publisher: {
        '@id': `${siteUrl}/#organization`,
      },
      potentialAction: {
        '@type': 'SearchAction',
        target: `${siteUrl}/marketplace?search={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body className={`${plusJakartaSans.className} antialiased min-h-screen bg-[#FAF7F2] text-[#1C1B19] pb-16 md:pb-0`}>
        <AuthProvider>
          <AppProvider>
            <LocationProvider>
              {children}
              <MobileBottomNav />
              <LocationPromptModal />
            </LocationProvider>
          </AppProvider>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}