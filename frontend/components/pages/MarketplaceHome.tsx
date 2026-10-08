'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  MapPin,
  Camera,
  Video,
  Music,
  Utensils,
  Palette,
  Calendar,
  Star,
  ArrowRight,
  CheckCircle2,
  Users,
  Trophy,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import Header from '@/components/Header';

const MarketplaceHome = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const categories = [
    { name: 'Photography', icon: <Camera className="size-5" />, count: '1,200+', price: '₹15k+', color: 'text-primary' },
    { name: 'Videography', icon: <Video className="size-5" />, count: '850+', price: '₹25k+', color: 'text-blue-400' },
    { name: 'Event Planning', icon: <Calendar className="size-5" />, count: '650+', price: '₹50k+', color: 'text-emerald-400' },
    { name: 'Catering', icon: <Utensils className="size-5" />, count: '420+', price: '₹1k/plate', color: 'text-orange-400' },
    { name: 'Music & DJ', icon: <Music className="size-5" />, count: '380+', price: '₹20k+', color: 'text-purple-400' },
    { name: 'Decoration', icon: <Palette className="size-5" />, count: '290+', price: '₹30k+', color: 'text-pink-400' }
  ];

  const featuredProviders = [
    {
      id: 1,
      name: 'Sarah Johnson',
      specialty: 'Wedding Photography',
      rating: 4.9,
      reviews: 127,
      price: 'From ₹45,000',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?q=80&w=150&auto=format&fit=crop',
      portfolio: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=800&auto=format&fit=crop',
      verified: true
    },
    {
      id: 2,
      name: 'Marcus Chen',
      specialty: 'Corporate Videography',
      rating: 4.8,
      reviews: 89,
      price: 'From ₹60,000',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop',
      portfolio: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=800&auto=format&fit=crop',
      verified: true
    },
    {
      id: 3,
      name: 'Elena Rodriguez',
      specialty: 'Event Planning',
      rating: 4.9,
      reviews: 156,
      price: 'From ₹100,000',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop',
      portfolio: 'https://images.unsplash.com/photo-1520975916090-3105956dac38?q=80&w=800&auto=format&fit=crop',
      verified: true
    },
    {
      id: 4,
      name: 'David Kim',
      specialty: 'Portrait Photography',
      rating: 4.7,
      reviews: 210,
      price: 'From ₹15,000',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop',
      portfolio: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop',
      verified: true
    }
  ];

  return (
    <div className="min-h-screen bg-[#0f1115] text-foreground font-sans selection:bg-primary/30">
      <Header />
      {/* Hero Section - Compact Linear Style */}
      <section className="relative pt-24 pb-16 px-6 overflow-hidden border-b border-white/[0.03]">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.05] text-slate-300 text-xs font-bold mb-6">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="uppercase tracking-widest">Premium Vendor Network</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight leading-tight">
            Discover the perfect <br className="hidden md:block" />
            talent for your event.
          </h1>

          <p className="text-sm md:text-base text-slate-400 mb-10 max-w-2xl mx-auto font-light">
            Connect with top-tier professionals. Browse portfolios, compare pricing, and book seamlessly.
          </p>

          {/* Linear Search Bar */}
          <div className="max-w-3xl mx-auto mb-12">
            <div className="flex flex-col md:flex-row gap-0 p-1 bg-[#16191e] rounded-xl border border-white/[0.05] shadow-xl">
              <div className="flex-1 flex items-center px-4 relative">
                <Search className="w-4 h-4 text-slate-500 mr-3" />
                <input
                  type="text"
                  placeholder="What are you looking for?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-none text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-0 py-3 text-sm font-medium"
                />
              </div>

              <div className="h-px md:h-8 w-full md:w-px bg-white/[0.05] my-auto"></div>

              <div className="flex-1 flex items-center px-4 relative">
                <MapPin className="w-4 h-4 text-slate-500 mr-3" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-transparent border-none text-slate-300 focus:outline-none focus:ring-0 py-3 text-sm font-medium appearance-none cursor-pointer pr-8"
                >
                  <option value="" className="bg-[#1a1d23]">Any Category</option>
                  {categories.map((cat) => (
                    <option key={cat.name} value={cat.name.toLowerCase()} className="bg-[#1a1d23]">{cat.name}</option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-600 absolute right-4 pointer-events-none" />
              </div>

              <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-2.5 rounded-lg text-sm font-bold transition-all md:w-auto w-full mt-2 md:mt-0">
                Search
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 pt-6">
            {[
              { label: 'Professionals', value: '2.7k+', icon: Users },
              { label: 'Projects', value: '15k+', icon: CheckCircle2 },
              { label: 'Satisfaction', value: '98%', icon: Trophy },
            ].map((stat, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <stat.icon className="w-4 h-4 text-slate-500" strokeWidth={2} />
                <div className="text-left">
                  <div className="text-sm font-bold text-white">{stat.value}</div>
                  <div className="text-[10px] uppercase tracking-widest text-slate-500">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Linear Grid */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-end mb-8">
            <h2 className="text-xl font-bold text-white uppercase tracking-widest">Browse Categories</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category, index) => (
              <div key={index} className="group p-4 rounded-xl border border-white/[0.03] bg-[#16191e] hover:border-white/[0.1] transition-all cursor-pointer">
                <div className={`mb-4 p-2.5 rounded-lg bg-white/[0.02] inline-block ${category.color} group-hover:scale-110 transition-transform`}>
                  {category.icon}
                </div>
                <h3 className="text-sm font-bold text-white mb-1">{category.name}</h3>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{category.count} pros</span>
                  <span className="text-[10px] text-slate-400 font-bold">{category.price}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Gallery */}
      <section className="py-16 px-6 border-t border-white/[0.03]">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-xl font-bold text-white uppercase tracking-widest mb-1">Featured Talent</h2>
              <p className="text-xs text-slate-500">Handpicked professionals for exceptional quality</p>
            </div>
            <Link href="/services" className="text-xs font-bold text-primary hover:text-primary/80 transition-colors flex items-center gap-1 uppercase tracking-widest">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProviders.map((provider) => (
              <Link href={`/photographer/${provider.id}`} key={provider.id}>
                <div className="group relative aspect-[3/4] overflow-hidden rounded-xl border border-white/[0.03] bg-[#16191e] transition-all duration-500">
                  {/* Imagery as Hero */}
                  <ImageWithFallback
                    src={provider.portfolio}
                    alt={provider.specialty}
                    fill
                    unoptimized
                    className="object-cover transition-transform duration-700 group-hover:scale-110 grayscale-[20%] group-hover:grayscale-0"
                  />
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f1115] via-[#0f1115]/40 to-transparent opacity-80" />

                  {/* Top Floating Badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded bg-black/40 backdrop-blur-md border border-white/5">
                    <Star className="size-2.5 fill-primary text-primary" />
                    <span className="text-[9px] font-bold text-white">{provider.rating}</span>
                  </div>

                  {/* Bottom Info */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center gap-2 mb-2">
                       <div className="relative size-6 rounded-full overflow-hidden border border-white/20">
                          <ImageWithFallback src={provider.image} alt={provider.name} fill unoptimized className="object-cover" />
                       </div>
                       <h3 className="text-sm font-bold text-white truncate">{provider.name}</h3>
                       {provider.verified && <CheckCircle2 className="size-3 text-blue-400 ml-auto shrink-0" />}
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mb-2">{provider.specialty}</p>
                  </div>

                  {/* Hover Reveal Details */}
                  <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-[2px] flex flex-col justify-end p-4">
                     <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        <div className="flex items-center justify-between border-t border-white/10 pt-3">
                           <span className="text-[10px] font-bold text-white">{provider.price}</span>
                           <span className="text-[9px] uppercase tracking-widest text-slate-300 border border-white/20 px-2 py-0.5 rounded">Book</span>
                        </div>
                     </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Minimal CTA */}
      <section className="py-24 px-6 border-t border-white/[0.03]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Join the community
          </h2>
          <p className="text-sm text-slate-400 mb-8 font-light">
            Whether you're hosting an event or offering your creative services, Ayoj makes the connection seamless.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link
              href="/register?role=customer"
              className="w-full sm:w-auto bg-primary text-primary-foreground px-8 py-3 rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors"
            >
              Hire Professionals
            </Link>
            <Link
              href="/register?role=vendor"
              className="w-full sm:w-auto bg-[#16191e] text-white border border-white/[0.05] px-8 py-3 rounded-lg text-sm font-bold hover:bg-white/[0.02] transition-colors"
            >
              List Your Services
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MarketplaceHome;
