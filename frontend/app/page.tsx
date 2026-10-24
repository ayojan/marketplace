'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiService } from '@/lib/api';
import { useLocation } from '@/lib/contexts/LocationContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import RecentlyViewedStrip from '@/components/RecentlyViewedStrip';
import CelebrationMatchmaker from '@/components/CelebrationMatchmaker';
import {
  HomeHero,
  HomeCategoryGrid,
  HomeOccasionsSection,
  HomeFeaturedVendors,
  HomeTrustPromise,
  HomeHowItWorks,
  HomeVendorCta,
} from '@/components/home';

export default function Landing() {
  const router = useRouter();
  const { selectedCity, setSelectedCity } = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [topVendors, setTopVendors] = useState<any[]>([]);
  const [loadingVendors, setLoadingVendors] = useState<boolean>(true);
  const [activeVendorTab, setActiveVendorTab] = useState<string>('all');

  useEffect(() => {
    const fetchTopVendors = async () => {
      try {
        setLoadingVendors(true);
        const res = await apiService.vendors.getAll();
        const rawData = res.data?.vendors || (Array.isArray(res.data) ? res.data : []);
        setTopVendors(Array.isArray(rawData) ? rawData : []);
      } catch (err) {
        setTopVendors([]);
      } finally {
        setLoadingVendors(false);
      }
    };
    fetchTopVendors();

    // Scroll to anchor on load if hash is present (e.g. /#reviews or /#occasions)
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash.substring(1);
      setTimeout(() => {
        const el = document.getElementById(hash);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 150);
    }
  }, []);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim();
    const params = new URLSearchParams();
    if (query) params.set('search', query);
    if (selectedCity && selectedCity !== 'All Cities') params.set('location', selectedCity);
    const qs = params.toString();
    router.push(qs ? `/marketplace?${qs}` : '/marketplace');
  };

  const handleDirectSearch = (query?: string, categorySlug?: string) => {
    const params = new URLSearchParams();
    if (query) params.set('search', query);
    if (categorySlug && categorySlug !== 'all') params.set('category', categorySlug);
    if (selectedCity && selectedCity !== 'All Cities') params.set('location', selectedCity);
    const qs = params.toString();
    router.push(qs ? `/marketplace?${qs}` : '/marketplace');
  };

  const getTabCount = (tabId: string) => {
    const list = Array.isArray(topVendors) ? topVendors : [];
    if (tabId === 'all') return list.length;
    return list.filter((v: any) => {
      const cat = (v.category || v.service_category || '').toLowerCase();
      const name = (v.name || v.business_name || '').toLowerCase();
      if (tabId === 'photographer') return cat.includes('photo') || name.includes('narrative') || name.includes('photo') || name.includes('shutter');
      if (tabId === 'makeup-artist') return cat.includes('makeup') || name.includes('makeover') || name.includes('glam') || name.includes('glow');
      if (tabId === 'decorator') return cat.includes('decor') || name.includes('eventica') || name.includes('floral');
      if (tabId === 'dj') return cat.includes('dj') || cat.includes('music') || name.includes('beat') || name.includes('aryan');
      if (tabId === 'venue') return cat.includes('venue') || name.includes('palm') || name.includes('haveli') || name.includes('heritage');
      return true;
    }).length;
  };

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
        <HomeHero
          selectedCity={selectedCity}
          setSelectedCity={setSelectedCity}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSearchSubmit={handleSearchSubmit}
          onDirectSearch={handleDirectSearch}
        />

        {/* 8-Icon Circular Category Grid */}
        <HomeCategoryGrid
          onSelectCategory={(slug) => router.push(`/marketplace?category=${encodeURIComponent(slug)}`)}
        />

        {/* Popular Occasions Section */}
        <HomeOccasionsSection
          onSelectOccasion={(slug) => router.push(`/marketplace?occasion=${encodeURIComponent(slug)}`)}
        />

        {/* Pick Up Where You Left Off Strip */}
        <RecentlyViewedStrip />

        {/* Top Rated Vendors in Selected City */}
        <HomeFeaturedVendors
          selectedCity={selectedCity}
          vendors={topVendors}
          loading={loadingVendors}
          activeTab={activeVendorTab}
          setActiveTab={setActiveVendorTab}
          getTabCount={getTabCount}
        />

        {/* 60-Second Celebration Matchmaker Wizard */}
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
