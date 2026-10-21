'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, MapPin, IndianRupee, Calendar, Award, ArrowLeft, Check, AlertCircle, Camera } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { apiService } from '@/lib/api';
import Image from 'next/image';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';

export default function PhotographerDetail() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();
  
  const [photographer, setPhotographer] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    if (id) {
      const vendorId = Array.isArray(id) ? id[0] : id;
      router.replace(`/vendors/${vendorId}`);
    }
  }, [id, router]);

  const handleBooking = async () => {
    setIsBooking(true);
    try {
      toast.success('Booking request sent! The photographer will contact you soon.');
    } catch (err) {
      toast.error('Failed to send booking request. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f1115]">
        <Header />
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="space-y-8 animate-pulse">
            <Skeleton className="h-10 w-40 rounded-full bg-white/[0.02]" />
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Skeleton className="aspect-[16/9] w-full rounded-2xl bg-white/[0.02]" />
                <Skeleton className="h-32 w-full rounded-xl bg-white/[0.02]" />
              </div>
              <div className="lg:col-span-1">
                <Skeleton className="h-[400px] w-full rounded-2xl bg-white/[0.02]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !photographer) {
    return (
      <div className="min-h-screen bg-[#0f1115]">
        <Header />
        <div className="container mx-auto px-6 py-32 text-center max-w-md">
          <AlertCircle className="size-12 text-destructive mx-auto mb-4 opacity-50" />
          <h2 className="text-xl font-bold mb-2 text-white">{error || 'Photographer not found'}</h2>
          <p className="text-slate-400 text-sm mb-6">The professional you're looking for might have moved or is no longer available.</p>
          <Button onClick={() => router.push('/marketplace')} className="rounded-lg font-bold">
            Back to Marketplace
          </Button>
        </div>
      </div>
    );
  }

  const name = photographer.business_name || photographer.name || 'Anonymous Photographer';
  const image = photographer.profile_image_url || photographer.image_url || photographer.image || 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=1000&auto=format&fit=crop';
  const rating = photographer.average_rating || photographer.rating || 0;
  const reviewCount = photographer.total_reviews || photographer.reviewCount || photographer.reviews_count || 0;
  const location = photographer.location || photographer.city || 'Location not specified';
  const bio = photographer.description || photographer.bio || 'No bio available.';
  const categories = photographer.service_categories || photographer.categories || (photographer.service_category ? [photographer.service_category] : []);
  const priceRange = photographer.base_price ? `₹${photographer.base_price}` : (photographer.priceRange || 'Price on request');
  const yearsOfExperience = photographer.years_experience || photographer.yearsOfExperience || photographer.experience_years || 0;
  const availableSlots = photographer.availableSlots ?? 10;
  const portfolio = photographer.featured_portfolio || photographer.portfolio || photographer.portfolio_images || [];
  const services = photographer.service_categories || photographer.services || (photographer.offered_services ? photographer.offered_services.map((s: any) => s.name) : ['Photography', 'Editing', 'High-res images']);

  return (
    <div className="min-h-screen bg-[#0f1115] text-foreground font-sans">
      <Header />
      
      <main className="max-w-6xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <button
            onClick={() => router.push('/marketplace')}
            className="mb-8 flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest"
          >
            <ArrowLeft className="size-3.5" /> Back to Search
          </button>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Profile Header */}
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                 <div className="size-24 rounded-2xl overflow-hidden relative border border-white/[0.05] shrink-0">
                    <ImageWithFallback src={image} alt={name} fill unoptimized className="object-cover" />
                 </div>
                 <div>
                    <div className="flex items-center gap-3 mb-2">
                       <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight leading-none">{name}</h1>
                       {photographer.verification_status === 'verified' && (
                          <div className="bg-blue-500/10 text-blue-400 p-1 rounded-full border border-blue-500/20">
                             <Check className="size-4" strokeWidth={3} />
                          </div>
                       )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
                       <span className="flex items-center gap-1">
                          <MapPin className="size-3.5 text-primary" /> {location}
                       </span>
                       <span className="w-1 h-1 rounded-full bg-slate-700" />
                       <span className="flex items-center gap-1 text-white">
                          <Star className="size-3.5 text-primary fill-primary" /> {Number(rating).toFixed(1)} <span className="text-slate-500">({reviewCount})</span>
                       </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                       {categories.map((cat: string) => (
                          <Badge key={cat} variant="secondary" className="bg-white/[0.03] border-white/[0.05] text-[10px] text-slate-300 uppercase tracking-widest px-2.5 py-0.5 rounded">
                             {cat}
                          </Badge>
                       ))}
                    </div>
                 </div>
              </div>

              {/* Bio */}
              <div className="p-6 rounded-2xl border border-white/[0.03] bg-[#16191e] shadow-2xl">
                 <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">About</h2>
                 <p className="text-sm text-slate-300 leading-relaxed font-light whitespace-pre-wrap">{bio}</p>
              </div>

              {/* Highlights */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-5 rounded-xl border border-white/[0.03] bg-[#16191e] text-center">
                  <Award className="size-6 mx-auto mb-2 text-primary" />
                  <div className="text-xl font-bold text-white mb-0.5">{yearsOfExperience}</div>
                  <div className="text-[9px] uppercase tracking-widest text-slate-500">Years Exp</div>
                </div>
                <div className="p-5 rounded-xl border border-white/[0.03] bg-[#16191e] text-center">
                  <Calendar className="size-6 mx-auto mb-2 text-blue-400" />
                  <div className="text-xl font-bold text-white mb-0.5">{availableSlots}</div>
                  <div className="text-[9px] uppercase tracking-widest text-slate-500">Open Slots</div>
                </div>
                <div className="p-5 rounded-xl border border-white/[0.03] bg-[#16191e] text-center">
                  <Star className="size-6 mx-auto mb-2 text-orange-400" />
                  <div className="text-xl font-bold text-white mb-0.5">{reviewCount}</div>
                  <div className="text-[9px] uppercase tracking-widest text-slate-500">Reviews</div>
                </div>
              </div>

              {/* Portfolio Grid */}
              {portfolio.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                     <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">Portfolio Highlights</h2>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {portfolio.slice(0, 6).map((img: any, index: number) => (
                      <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-white/[0.05] group cursor-pointer">
                        <ImageWithFallback
                          src={typeof img === 'string' ? img : (img.url || img.primary_image_url)}
                          alt={`Portfolio ${index + 1}`}
                          fill
                          unoptimized
                          className="object-cover group-hover:scale-110 transition-transform duration-700 grayscale-[20%] group-hover:grayscale-0"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                           <Camera className="size-6 text-white" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Services List */}
              <div className="p-6 rounded-2xl border border-white/[0.03] bg-[#16191e]">
                 <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-6">Services Included</h2>
                 <div className="grid sm:grid-cols-2 gap-4">
                   {services.map((service: string, index: number) => (
                     <div key={index} className="flex items-start gap-3">
                       <div className="size-5 rounded bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                         <Check className="size-3 text-primary" strokeWidth={3} />
                       </div>
                       <span className="text-sm text-slate-300 font-medium">{service}</span>
                     </div>
                   ))}
                 </div>
              </div>
            </div>

            {/* Booking Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <Card className="border-white/[0.03] bg-[#16191e] shadow-2xl">
                  <CardContent className="p-6">
                    <div className="mb-6 pb-6 border-b border-white/[0.05]">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Starting from</div>
                      <div className="flex items-center gap-1.5 text-white">
                        <IndianRupee className="size-5 text-primary" strokeWidth={2.5} />
                        <span className="text-3xl font-bold tracking-tight">{priceRange.replace('₹', '')}</span>
                      </div>
                      <div className="text-[10px] font-medium text-slate-500 mt-1">per session / event</div>
                    </div>

                    <Button
                      onClick={() => router.push(`/booking/${photographer.id}`)}
                      className="w-full h-12 rounded-xl font-bold mb-4 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20"
                    >
                      Check Availability
                    </Button>
                    <Button variant="outline" className="w-full h-12 rounded-xl font-bold border-white/[0.05] hover:bg-white/[0.02] text-white">
                       Message Vendor
                    </Button>

                    <div className="space-y-4 pt-6 mt-6 border-t border-white/[0.05]">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-400">Response time</span>
                        <span className="text-xs font-bold text-white">Within 24 hours</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-400">Availability</span>
                        <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">
                          {availableSlots > 0 ? 'Accepting Bookings' : 'Fully Booked'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
