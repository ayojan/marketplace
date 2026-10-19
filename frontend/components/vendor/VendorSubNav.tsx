'use client';

import React, { useState, useEffect } from 'react';

interface VendorSubNavProps {
  portfolioCount?: number;
  packagesCount?: number;
  reviewsCount?: number;
}

export default function VendorSubNav({
  portfolioCount = 0,
  packagesCount = 0,
  reviewsCount = 0,
}: VendorSubNavProps) {
  const [activeSection, setActiveSection] = useState('overview');

  const navItems = [
    { id: 'overview', label: 'Overview' },
    { id: 'portfolio', label: 'Portfolio', count: portfolioCount },
    { id: 'packages', label: 'Packages & Pricing', count: packagesCount },
    { id: 'reviews', label: 'Reviews', count: reviewsCount },
    { id: 'faqs', label: 'FAQs & Policies' },
  ];

  const handleScrollTo = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -90; // offset for sticky header
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const sectionIds = ['overview', 'portfolio', 'packages', 'reviews', 'faqs'];
      const scrollPosition = window.scrollY + 140;

      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const el = document.getElementById(sectionIds[i]);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveSection(sectionIds[i]);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav 
      aria-label="Vendor profile sections"
      className="sticky top-16 z-30 bg-[#FBF8F4]/95 backdrop-blur-md border-b border-[#E8E2D9] -mx-4 sm:-mx-6 px-4 sm:px-6 mb-8 transition-shadow"
    >
      <div className="max-w-7xl mx-auto flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar py-2.5">
        {navItems.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleScrollTo(item.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                isActive
                  ? 'bg-[#9E5338] text-white shadow-2xs'
                  : 'text-[#6B6560] hover:text-[#221F1C] hover:bg-[#FAF7F2]'
              }`}
            >
              <span>{item.label}</span>
              {typeof item.count === 'number' && item.count > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isActive ? 'bg-white/25 text-white' : 'bg-[#FAF7F2] text-[#6B6560] border border-[#E8E2D9]'
                }`}>
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
