import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const isProduction = process.env.NODE_ENV === 'production';
  const defaultUrl = isProduction ? 'https://www.ayoj.in' : 'http://localhost:3000';
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || defaultUrl).replace(/\/+$/, '');
  const apiUrl = (process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/+$/, '');

  const now = new Date();

  // Core static marketplace landing pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/marketplace`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/vendors`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/register?role=vendor`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  // Dynamic vendor profile routes from API
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(`${apiUrl}/vendors?per_page=500`, {
      signal: controller.signal,
      next: { revalidate: 3600 }, // Revalidate hourly
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const vendors = data.vendors || (Array.isArray(data) ? data : []);

      const dynamicVendorRoutes: MetadataRoute.Sitemap = vendors
        .filter((v: any) => v && (v.id || v.slug))
        .map((v: any) => ({
          url: `${baseUrl}/vendors/${v.id}`,
          lastModified: v.updated_at ? new Date(v.updated_at) : now,
          changeFrequency: 'weekly' as const,
          priority: 0.8,
        }));

      return [...staticRoutes, ...dynamicVendorRoutes];
    }
  } catch (error) {
    // If backend is unreachable during static build, return core routes safely
    console.warn('[sitemap] Failed to fetch dynamic vendors:', error);
  }

  return staticRoutes;
}
