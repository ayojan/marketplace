'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
import { Button } from '@/components/ui/button';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { motion } from 'framer-motion';

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const categories = [
    { name: 'Photography', icon: <Camera className="size-5" />, count: '1.2k', color: 'text-primary' },
    { name: 'Videography', icon: <Video className="size-5" />, count: '850', color: 'text-blue-400' },
    { name: 'Events', icon: <Calendar className="size-5" />, count: '650', color: 'text-emerald-400' },
    { name: 'Catering', icon: <Utensils className="size-5" />, count: '420', color: 'text-orange-400' },
    { name: 'Music', icon: <Music className="size-5" />, count: '380', color: 'text-purple-400' },
    { name: 'Decor', icon: <Palette className="size-5" />, count: '290', color: 'text-pink-400' }
  ];

  return (
    <div className="min-h-screen bg-[#0f1115] text-foreground font-sans selection:bg-primary/30">
      
      {/* Compact Pro Hero */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden border-b border-white/[0.03]">
        <div className="absolute inset-0 z-0">
           <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-primary/10 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.05] text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-8"
          >
            <Sparkles className="size-3 text-primary" />
            <span>Premium Creative Network</span>
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight leading-[1.1]">
            Elevate your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">visual story.</span>
          </h1>

          <p className="text-base md:text-lg text-slate-400 mb-12 max-w-xl mx-auto font-light leading-relaxed">
            A high-density marketplace connecting world-class photographers with premium clients. 
          </p>

          {/* Linear Search */}
          <div className="max-w-3xl mx-auto mb-16">
            <div className="flex flex-col md:flex-row p-1 bg-[#16191e] rounded-xl border border-white/[0.05] shadow-2xl">
              <div className="flex-1 flex items-center px-4">
                <Search className="size-4 text-slate-500 mr-3" />
                <input
                  type="text"
                  placeholder="Search by style or name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-none text-white placeholder-slate-600 focus:outline-none focus:ring-0 py-3 text-sm font-medium"
                />
              </div>
              <div className="h-px md:h-8 w-full md:w-px bg-white/[0.05] my-auto" />
              <div className="flex-1 flex items-center px-4 relative">
                <MapPin className="size-4 text-slate-500 mr-3" />
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-transparent border-none text-slate-300 focus:outline-none focus:ring-0 py-3 text-sm font-medium appearance-none cursor-pointer"
                >
                  <option value="" className="bg-[#1a1d23]">All Categories</option>
                  {categories.map(c => <option key={c.name} value={c.name.toLowerCase()} className="bg-[#1a1d23]">{c.name}</option>)}
                </select>
                <ChevronDown className="size-3.5 text-slate-600 absolute right-4 pointer-events-none" />
              </div>
              <Button className="h-11 px-8 rounded-lg font-bold text-sm">Find Pros</Button>
            </div>
          </div>

          {/* Minimal Stats */}
          <div className="flex flex-wrap justify-center gap-12 border-t border-white/[0.03] pt-10">
            {[
              { label: 'Professionals', value: '2.7k+', icon: Users },
              { label: 'Completed', value: '15k+', icon: CheckCircle2 },
              { label: 'Rating', value: '4.9/5', icon: Star },
            ].map((stat, i) => (
              <div key={i} className="flex items-center gap-3">
                <stat.icon className="size-4 text-slate-600" />
                <div className="text-left">
                  <p className="text-sm font-bold text-white leading-none mb-1">{stat.value}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* High Density Grid */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat, i) => (
            <div key={i} className="p-5 rounded-xl border border-white/[0.03] bg-[#16191e] hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer group">
              <div className={`size-10 rounded-lg bg-white/[0.02] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${cat.color}`}>
                {cat.icon}
              </div>
              <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-1">{cat.name}</h3>
              <p className="text-[10px] font-medium text-slate-500">{cat.count} Professionals</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Linear Section */}
      <section className="py-20 px-6 border-t border-white/[0.03] bg-[#0a0a0a]/30">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-sm font-bold text-primary uppercase tracking-[0.3em] mb-2">Editor's Choice</h2>
              <h3 className="text-2xl font-bold text-white tracking-tight">Featured Portfolio</h3>
            </div>
            <Link href="/marketplace" className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-primary transition-colors flex items-center gap-2">
              Explore All <ArrowRight className="size-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             {[
               { name: 'Studio A', type: 'Fashion', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop' },
               { name: 'Capture Bloom', type: 'Wedding', img: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=800&auto=format&fit=crop' },
               { name: 'Motion Pro', type: 'Cinematic', img: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=800&auto=format&fit=crop' }
             ].map((pro, i) => (
               <div key={i} className="group relative aspect-[16/10] rounded-xl overflow-hidden border border-white/[0.05] bg-[#16191e]">
                  <Image src={pro.img} alt={pro.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105 grayscale-[30%] group-hover:grayscale-0" unoptimized />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-80" />
                  <div className="absolute bottom-4 left-4">
                     <p className="text-[9px] font-bold text-primary uppercase tracking-widest mb-1">{pro.type}</p>
                     <h4 className="text-sm font-bold text-white">{pro.name}</h4>
                  </div>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* Simplified CTA */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto p-12 rounded-[2rem] border border-white/[0.03] bg-[#16191e] text-center relative overflow-hidden group">
           <div className="absolute top-0 right-0 size-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />
           <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">Ready to start your project?</h2>
              <p className="text-slate-400 text-sm mb-10 max-w-sm mx-auto font-light">Join the network of elite photographers and premium clients today.</p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                 <Button className="h-12 px-10 rounded-xl font-bold shadow-xl shadow-primary/10">Get Started</Button>
                 <Button variant="outline" className="h-12 px-10 rounded-xl font-bold border-white/[0.05] text-slate-300 hover:bg-white/[0.02]">Learn More</Button>
              </div>
           </div>
        </div>
      </section>

      <footer className="py-12 border-t border-white/[0.03] text-center">
         <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-600">&copy; 2026 Ayoj Collective</p>
      </footer>
    </div>
  );
};

export default Home;
