import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import RecentlyViewedStrip from '@/components/RecentlyViewedStrip';
import {
  HomeHero,
  HomeCategoryGrid,
  HomeOccasionsSection,
  HomeFeaturedVendors,
  HomeTrustPromise,
  HomeHowItWorks,
  HomeVendorCta,
} from '@/components/home';

// Lazy load below-the-fold 400+ line matchmaker wizard
const CelebrationMatchmaker = dynamic(
  () => import('@/components/CelebrationMatchmaker'),
  {
    loading: () => <div className="min-h-[200px]" />,
  }
);

const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/+$/, '');

async function fetchTopVendors() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(`${apiUrl}/vendors`, {
      signal: controller.signal,
      next: { revalidate: 300 }, // ISR cache for 5 minutes
    });
    clearTimeout(timeoutId);

    if (!res.ok) return [];
    const data = await res.json();
    return data?.vendors || (Array.isArray(data) ? data : []);
  } catch {
    return [];
  }
}

export default async function Landing() {
  const topVendors = await fetchTopVendors();

  return (
    <div className="min-h-screen bg-[#FBF8F4] text-[#221F1C] selection:bg-[#F3EADF] selection:text-[#9E5338]">
      {/* Accessible Skip Link for Keyboard Navigators */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-[100] px-4 py-2 bg-[#9E5338] text-white rounded-xl shadow-lg font-medium text-xs focus:outline-none focus:ring-2 focus:ring-[#9E5338] focus:ring-offset-2"
      >
        Skip to main content
      </a>

      <Header />

      <main id="main-content">
        {/* Main Hero Header and Search Capsule */}
        <HomeHero />

        {/* 8-Icon Circular Category Grid */}
        <HomeCategoryGrid />

        {/* Popular Occasions Section */}
        <HomeOccasionsSection />

        {/* Pick Up Where You Left Off Strip */}
        <RecentlyViewedStrip />

        {/* Top Rated Vendors in Selected City (SSR Hydrated) */}
        <HomeFeaturedVendors initialVendors={topVendors} />

        {/* 60-Second Celebration Matchmaker Wizard (Dynamic Import) */}
        <CelebrationMatchmaker />

        {/* How Ayoj Works 3-Step Journey */}
        <HomeHowItWorks />

        {/* Trust Guarantees & Host Testimonials */}
        <HomeTrustPromise />

        {/* Vendor Partner Onboarding CTA */}
        <HomeVendorCta />
      </main>

      {/* Modern Marketplace Footer */}
      <Footer />
    </div>
  );
}
