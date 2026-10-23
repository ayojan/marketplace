import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const isProduction = process.env.NODE_ENV === 'production';
  const defaultUrl = isProduction ? 'https://www.ayoj.in' : 'http://localhost:3000';
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || defaultUrl).replace(/\/+$/, '');

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/vendor/dashboard/',
          '/vendor/onboarding/',
          '/customer/',
          '/customer/dashboard/',
          '/booking/',
          '/api/',
          '/_next/',
          '/admin/',
        ],
      },
      {
        userAgent: 'Googlebot-Image',
        allow: ['/images/', '/uploads/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
