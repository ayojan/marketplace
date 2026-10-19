'use client';

import Link from 'next/link';
import { 
  Instagram, 
  Linkedin, 
  Youtube, 
  Twitter, 
  Facebook, 
  ShieldCheck, 
  Sparkles, 
  Heart,
  ArrowRight
} from 'lucide-react';
import AyojLogo from '@/components/AyojLogo';
import { CITIES } from '@/lib/contexts/LocationContext';

const SOCIAL_LINKS = [
  { name: 'Instagram', href: 'https://instagram.com/ayoj.official', icon: Instagram },
  { name: 'LinkedIn', href: 'https://linkedin.com/company/ayoj', icon: Linkedin },
  { name: 'YouTube', href: 'https://youtube.com/@ayojofficial', icon: Youtube },
  { name: 'X', href: 'https://x.com/ayojofficial', icon: Twitter },
  { name: 'Facebook', href: 'https://facebook.com/ayojofficial', icon: Facebook },
];

const POPULAR_SERVICES = [
  { name: 'Candid Wedding Photographers', href: '/marketplace?category=photographer' },
  { name: 'Bridal Makeup Artists', href: '/marketplace?category=makeup-artist' },
  { name: 'Stage & Floral Decorators', href: '/marketplace?category=decorator' },
  { name: 'Full Event Planners', href: '/marketplace?category=event-planner' },
  { name: 'Gourmet Event Caterers', href: '/marketplace?category=caterer' },
  { name: 'Sangeet DJs & Sound', href: '/marketplace?category=dj' },
  { name: 'Banquet Halls & Resorts', href: '/marketplace?category=venue' },
];

const POPULAR_OCCASIONS = [
  { name: 'Weddings & Shaadi', href: '/marketplace?occasion=wedding' },
  { name: 'Pre-Wedding & Roka', href: '/marketplace?occasion=pre-wedding' },
  { name: 'Engagement Ceremonies', href: '/marketplace?occasion=engagement' },
  { name: 'Birthday Celebrations', href: '/marketplace?occasion=birthday' },
  { name: 'Corporate Galas & Summits', href: '/marketplace?occasion=corporate' },
  { name: 'Anniversary Parties', href: '/marketplace?occasion=anniversary' },
];

export default function Footer() {
  return (
    <footer className="border-t border-[#E8E2D9] bg-[#FAF7F2] text-[#221F1C] pt-12 pb-20 md:pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          
          {/* Brand Column */}
          <div className="sm:col-span-2 space-y-4">
            <AyojLogo size="md" showTagline={true} />
            <p className="text-xs text-[#6B6560] max-w-sm leading-relaxed">
              India&apos;s trusted creative &amp; event marketplace. Connect directly with handpicked, verified photographers, makeup artists, decorators, and venues for landmark celebrations.
            </p>

            <div className="flex items-center gap-2 pt-1">
              {SOCIAL_LINKS.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Follow Ayoj on ${social.name}`}
                    className="size-8 rounded-full border border-[#E8E2D9] bg-white flex items-center justify-center text-[#6B6560] hover:text-[#9E5338] hover:border-[#9E5338]/40 hover:bg-[#F3EADF] transition-all cursor-pointer shadow-2xs group"
                  >
                    <Icon className="size-3.5 transition-transform duration-150 group-hover:scale-110" />
                  </a>
                );
              })}
            </div>

            {/* Platform Trust Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-white border border-[#E8E2D9] text-[11px] font-medium text-[#4A4540] shadow-2xs">
              <ShieldCheck className="size-3.5 text-[#9E5338]" />
              <span>Direct Vendor Pricing · 0% Middleman Markup</span>
            </div>
          </div>

          {/* Popular Services Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-serif font-bold uppercase tracking-wider text-[#221F1C]">
              Creative Services
            </h4>
            <ul className="space-y-2 text-xs">
              {POPULAR_SERVICES.map((service) => (
                <li key={service.name}>
                  <Link 
                    href={service.href}
                    className="text-[#6B6560] hover:text-[#9E5338] transition-colors leading-relaxed block"
                  >
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Celebrations & Occasions Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-serif font-bold uppercase tracking-wider text-[#221F1C]">
              Milestone Occasions
            </h4>
            <ul className="space-y-2 text-xs">
              {POPULAR_OCCASIONS.map((occ) => (
                <li key={occ.name}>
                  <Link 
                    href={occ.href}
                    className="text-[#6B6560] hover:text-[#9E5338] transition-colors leading-relaxed block"
                  >
                    {occ.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Celebration Hubs & For Pros Column */}
          <div className="space-y-4">
            <div className="space-y-3">
              <h4 className="text-xs font-serif font-bold uppercase tracking-wider text-[#221F1C]">
                Top Celebration Hubs
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {CITIES.slice(0, 8).map((city) => (
                  <Link
                    key={city}
                    href={`/marketplace?location=${encodeURIComponent(city)}`}
                    className="px-2.5 py-0.5 rounded-full bg-white border border-[#E8E2D9] text-[#6B6560] hover:text-[#9E5338] hover:border-[#9E5338]/40 text-[11px] font-medium transition-colors"
                  >
                    {city}
                  </Link>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-[#E8E2D9]">
              <h4 className="text-xs font-serif font-bold uppercase tracking-wider text-[#221F1C]">
                For Creative Pros
              </h4>
              <ul className="space-y-1.5 text-xs">
                <li>
                  <Link 
                    href="/register?role=vendor" 
                    className="font-semibold text-[#9E5338] hover:underline flex items-center gap-1"
                  >
                    <span>List your business</span>
                    <ArrowRight className="size-3" />
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="text-[#6B6560] hover:text-[#221F1C] transition-colors">
                    Partner Sign In
                  </Link>
                </li>
              </ul>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-[#E8E2D9] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6B6560]">
          <p>© {new Date().getFullYear()} Ayoj Marketplace. Handcrafted for unforgettable celebrations.</p>
          
          <div className="flex items-center gap-4 text-xs">
            <Link href="/marketplace" className="hover:text-[#9E5338] transition-colors">
              Explore Catalog
            </Link>
            <span>·</span>
            <span className="text-[#8A847E]">Verified Partner Program</span>
            <span>·</span>
            <span className="text-[#8A847E]">Privacy &amp; Terms</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
