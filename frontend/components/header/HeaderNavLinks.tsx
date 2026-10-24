'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronRight, Grid, ArrowRight, Sparkles } from 'lucide-react';
import { CATEGORIES_NAV, OCCASIONS_NAV, getCategoryUrl, getOccasionUrl } from './constants';

interface HeaderNavLinksProps {
  selectedCity: string;
  openMenu: 'categories' | 'occasions' | null;
  setOpenMenu: (menu: 'categories' | 'occasions' | null) => void;
  desktopNavRef: React.Ref<HTMLElement>;
}

export default function HeaderNavLinks({
  selectedCity,
  openMenu,
  setOpenMenu,
  desktopNavRef
}: HeaderNavLinksProps) {
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = (menu: 'categories' | 'occasions') => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setOpenMenu(menu);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setOpenMenu(null);
    }, 180);
  };

  return (
    <nav ref={desktopNavRef} className="hidden lg:flex items-center gap-7">
      {/* Categories Dropdown with Smooth Hover */}
      <div
        className="relative"
        onMouseEnter={() => handleMouseEnter('categories')}
        onMouseLeave={handleMouseLeave}
      >
        <Link
          href={getCategoryUrl('all', selectedCity)}
          onClick={() => setOpenMenu(null)}
          className={`flex items-center gap-1.5 text-xs font-medium py-2 transition-colors cursor-pointer group ${
            openMenu === 'categories' ? 'text-[#9E5338]' : 'text-[#221F1C] hover:text-[#9E5338]'
          }`}
        >
          <span>Categories</span>
          <ChevronDown
            className={`size-3 transition-transform duration-200 ${
              openMenu === 'categories' ? 'rotate-180 text-[#9E5338]' : 'text-[#6B6560] group-hover:text-[#9E5338]'
            }`}
          />
        </Link>

        {/* Categories Dropdown Menu List */}
        {openMenu === 'categories' && (
          <div
            className="absolute top-full left-0 pt-2 z-50 w-80 animate-in fade-in-0 zoom-in-95 duration-150"
            onMouseEnter={() => handleMouseEnter('categories')}
            onMouseLeave={handleMouseLeave}
          >
            <div className="rounded-2xl bg-white/98 backdrop-blur-xl border border-[#E8E2D9] shadow-2xl p-2">
              <div className="px-3 pt-1.5 pb-2 border-b border-[#E8E2D9]/60 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B6560]">
                  All Categories
                </span>
                <span className="text-[10px] text-[#9E5338] font-semibold bg-[#F3EADF] px-2 py-0.5 rounded-full">
                  Verified Pros
                </span>
              </div>

              <div className="py-1 space-y-0.5">
                {CATEGORIES_NAV.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <Link
                      key={cat.slug}
                      href={getCategoryUrl(cat.slug, selectedCity)}
                      onClick={() => setOpenMenu(null)}
                      className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[#F3EADF]/60 group transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="size-8 rounded-xl bg-[#FAF7F2] border border-[#E8E2D9] flex items-center justify-center text-[#9E5338] group-hover:bg-white group-hover:border-[#9E5338]/40 group-hover:shadow-2xs transition-all shrink-0">
                          <Icon className="size-4" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-[#221F1C] group-hover:text-[#9E5338] transition-colors leading-tight">
                            {cat.name}
                          </p>
                          <p className="text-[10px] text-[#6B6560] leading-tight mt-0.5">
                            {cat.description}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="size-3.5 text-[#6B6560]/40 group-hover:text-[#9E5338] group-hover:translate-x-0.5 transition-all opacity-0 group-hover:opacity-100 shrink-0" />
                    </Link>
                  );
                })}
              </div>

              <div className="pt-1.5 mt-0.5 border-t border-[#E8E2D9]/60">
                <Link
                  href={getCategoryUrl('all', selectedCity)}
                  onClick={() => setOpenMenu(null)}
                  className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-[#9E5338] hover:bg-[#F3EADF]/60 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Grid className="size-3.5" />
                    <span>Explore all categories & talent</span>
                  </span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Occasions Dropdown with Smooth Hover */}
      <div
        className="relative"
        onMouseEnter={() => handleMouseEnter('occasions')}
        onMouseLeave={handleMouseLeave}
      >
        <Link
          href={getOccasionUrl('all', selectedCity)}
          onClick={() => setOpenMenu(null)}
          className={`flex items-center gap-1.5 text-xs font-medium py-2 transition-colors cursor-pointer group ${
            openMenu === 'occasions' ? 'text-[#9E5338]' : 'text-[#221F1C] hover:text-[#9E5338]'
          }`}
        >
          <span>Occasions</span>
          <ChevronDown
            className={`size-3 transition-transform duration-200 ${
              openMenu === 'occasions' ? 'rotate-180 text-[#9E5338]' : 'text-[#6B6560] group-hover:text-[#9E5338]'
            }`}
          />
        </Link>

        {/* Occasions Dropdown Menu List */}
        {openMenu === 'occasions' && (
          <div
            className="absolute top-full left-0 pt-2 z-50 w-80 animate-in fade-in-0 zoom-in-95 duration-150"
            onMouseEnter={() => handleMouseEnter('occasions')}
            onMouseLeave={handleMouseLeave}
          >
            <div className="rounded-2xl bg-white/98 backdrop-blur-xl border border-[#E8E2D9] shadow-2xl p-2">
              <div className="px-3 pt-1.5 pb-2 border-b border-[#E8E2D9]/60 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B6560]">
                  Celebration Occasions
                </span>
                <span className="text-[10px] text-[#9E5338] font-semibold bg-[#F3EADF] px-2 py-0.5 rounded-full">
                  Milestones
                </span>
              </div>

              <div className="py-1 space-y-0.5">
                {OCCASIONS_NAV.map((occ) => {
                  const Icon = occ.icon;
                  return (
                    <Link
                      key={occ.slug}
                      href={getOccasionUrl(occ.slug, selectedCity)}
                      onClick={() => setOpenMenu(null)}
                      className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[#F3EADF]/60 group transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="size-8 rounded-xl bg-[#FAF7F2] border border-[#E8E2D9] flex items-center justify-center text-[#9E5338] group-hover:bg-white group-hover:border-[#9E5338]/40 group-hover:shadow-2xs transition-all shrink-0">
                          <Icon className="size-4" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-[#221F1C] group-hover:text-[#9E5338] transition-colors leading-tight">
                            {occ.name}
                          </p>
                          <p className="text-[10px] text-[#6B6560] leading-tight mt-0.5">
                            {occ.description}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="size-3.5 text-[#6B6560]/40 group-hover:text-[#9E5338] group-hover:translate-x-0.5 transition-all opacity-0 group-hover:opacity-100 shrink-0" />
                    </Link>
                  );
                })}
              </div>

              <div className="pt-1.5 mt-0.5 border-t border-[#E8E2D9]/60">
                <Link
                  href={getOccasionUrl('all', selectedCity)}
                  onClick={() => setOpenMenu(null)}
                  className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-[#9E5338] hover:bg-[#F3EADF]/60 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="size-3.5" />
                    <span>Explore all celebrations & packages</span>
                  </span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      <Link href="/#reviews" className="text-xs font-medium text-[#221F1C] hover:text-[#9E5338] transition-colors">
        Real Reviews
      </Link>
      <Link href="/register?role=vendor" className="text-xs font-medium text-[#221F1C] hover:text-[#9E5338] transition-colors">
        For Vendors
      </Link>
    </nav>
  );
}
