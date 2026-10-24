'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ShoppingBag, 
  Calendar as CalendarIcon, 
  Star, 
  Sparkles, 
  ChevronRight, 
  Check, 
  Plus, 
  Camera 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import CustomerDreamTeamTracker from './CustomerDreamTeamTracker';
import { BookingStatusBadge } from './BookingStatusBadge';
import { DashboardStat, SavedVendor, RecommendedPro, ChecklistItem } from './types';

interface CustomerOverviewTabProps {
  stats: DashboardStat[];
  bookings: any[];
  savedVendors: SavedVendor[];
  recommendedPros: RecommendedPro[];
  checklist: ChecklistItem[];
  newChecklistTitle: string;
  setNewChecklistTitle: (val: string) => void;
  onToggleChecklist: (id: number | string) => void;
  onAddChecklistTask: (e: React.FormEvent) => void;
  onOpenReviewModal: (booking: any) => void;
  onNavigateTab: (tab: string) => void;
}

export function CustomerOverviewTab({
  stats,
  bookings,
  savedVendors,
  recommendedPros,
  checklist,
  newChecklistTitle,
  setNewChecklistTitle,
  onToggleChecklist,
  onAddChecklistTask,
  onOpenReviewModal,
  onNavigateTab,
}: CustomerOverviewTabProps) {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="p-5 rounded-2xl border border-[#E8E2D9] bg-white shadow-sm hover:border-[#9E5338]/40 transition-all group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B6560]">{stat.label}</span>
              <stat.icon className="size-4 text-[#6B6560] group-hover:text-[#9E5338] transition-colors" />
            </div>
            <div className="flex items-end justify-between">
              <h4 className="text-2xl font-serif font-bold text-[#221F1C] tracking-tight">{stat.value}</h4>
              <span className="text-[10px] font-bold text-[#9E5338] bg-[#F3EADF] px-2.5 py-0.5 rounded-full">{stat.trend}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Feed Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Celebration Dream Team Lineup Matrix */}
          <CustomerDreamTeamTracker bookings={bookings} />

          {/* Active Bookings Card */}
          <div className="p-6 rounded-2xl border border-[#E8E2D9] bg-white shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-[#E8E2D9] pb-4">
              <div>
                <h3 className="text-base font-serif font-bold text-[#221F1C]">Your Event Bookings</h3>
                <p className="text-xs text-[#6B6560]">Manage upcoming reservations and review past sessions</p>
              </div>
              <Link href="/marketplace">
                <Button variant="ghost" size="sm" className="text-xs font-bold text-[#9E5338] hover:bg-[#F3EADF]">
                  + Book New Vendor
                </Button>
              </Link>
            </div>

            {bookings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center border border-dashed border-[#E8E2D9] rounded-xl bg-[#FBF8F4]">
                <div className="size-12 rounded-full bg-[#F3EADF] flex items-center justify-center mb-3 text-[#9E5338]">
                  <ShoppingBag className="size-5" />
                </div>
                <h4 className="text-sm font-bold text-[#221F1C] mb-1">No bookings found yet</h4>
                <p className="text-xs text-[#6B6560] mb-4 max-w-xs">
                  Discover verified photographers, makeup artists, and event pros for your occasion.
                </p>
                <Link href="/marketplace">
                  <Button size="sm" className="bg-[#9E5338] hover:bg-[#86442B] text-white rounded-full text-xs font-medium px-6 h-9">
                    Explore Marketplace
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="p-5 rounded-2xl border border-[#E8E2D9] bg-[#FBF8F4] hover:border-[#9E5338]/40 transition-all flex flex-col sm:flex-row gap-4 justify-between"
                  >
                    <div className="flex items-start gap-4">
                      <Link href={`/vendors/${booking.vendor?.slug || booking.vendor?.id || 4}`} className="relative size-16 rounded-xl overflow-hidden shrink-0 border border-[#E8E2D9] group/vimg cursor-pointer">
                        <ImageWithFallback
                          src={booking.vendor?.image || 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=600&q=80'}
                          alt={booking.vendor?.business_name || 'Vendor'}
                          fill
                          unoptimized
                          className="object-cover group-hover/vimg:scale-105 transition-transform duration-300"
                        />
                      </Link>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-serif font-bold text-[#221F1C]">{booking.service?.name}</h4>
                          <BookingStatusBadge status={booking.status} />
                        </div>

                        <Link href={`/vendors/${booking.vendor?.slug || booking.vendor?.id || 4}`} className="inline-block hover:text-[#9E5338] transition-colors cursor-pointer">
                          <p className="text-xs font-semibold text-[#6B6560]">
                            {booking.vendor?.business_name} • <span className="text-[#9E5338] font-normal">{booking.vendor?.location}</span>
                          </p>
                        </Link>
                        
                        <div className="flex items-center gap-4 text-xs text-[#6B6560] pt-1">
                          <span className="flex items-center gap-1 font-medium">
                            <CalendarIcon className="size-3.5 text-[#9E5338]" />
                            {new Date(booking.event_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                          </span>
                          <span className="font-bold text-[#221F1C]">₹{booking.total_amount?.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 sm:self-center">
                      {booking.review ? (
                        <span className="text-xs font-bold text-[#D97706] bg-amber-50 border border-amber-200 px-3 py-1 rounded-full flex items-center gap-1">
                          <Star className="size-3.5 fill-[#D97706]" /> Reviewed (5.0)
                        </span>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onOpenReviewModal(booking)}
                          className="text-xs font-bold rounded-full border-[#E8E2D9] bg-white text-[#221F1C] hover:border-[#9E5338] hover:text-[#9E5338]"
                        >
                          Write Review
                        </Button>
                      )}
                      <Link href={`/vendors/${booking.vendor?.slug || booking.vendor?.id || 1}`}>
                        <Button size="sm" variant="ghost" className="text-xs text-[#6B6560] hover:text-[#221F1C] rounded-full">
                          View Vendor
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Recommendations Bar */}
          {recommendedPros.length > 0 && (
            <div className="p-6 rounded-2xl border border-[#E8E2D9] bg-white shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-serif font-bold text-[#221F1C]">Top Verified Pros For You</h3>
                <Link href="/marketplace" className="text-xs font-bold text-[#9E5338] hover:underline flex items-center gap-1">
                  View All <ChevronRight size={14} />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {recommendedPros.map((vendor) => (
                  <Link
                    key={vendor.id}
                    href={`/vendors/${vendor.slug || vendor.id}`}
                    className="p-4 rounded-xl border border-[#E8E2D9] bg-[#FBF8F4] flex gap-3.5 items-center hover:border-[#9E5338]/50 hover:bg-white hover:shadow-xs transition-all group cursor-pointer"
                  >
                    <div className="relative size-14 rounded-lg overflow-hidden shrink-0 border border-[#E8E2D9]">
                      <ImageWithFallback 
                        src={vendor.image} 
                        alt={vendor.name} 
                        fill 
                        unoptimized 
                        className="object-cover group-hover:scale-105 transition-transform duration-300" 
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-[#221F1C] truncate group-hover:text-[#9E5338] transition-colors">
                        {vendor.name}
                      </h4>
                      {vendor.reviewsCount > 0 && Number(vendor.rating) > 0 ? (
                        <div className="flex items-center gap-1 mt-1 text-[11px] font-bold text-[#221F1C]">
                          <Star size={12} className="fill-[#D97706] text-[#D97706]" />
                          <span>{Number(vendor.rating).toFixed(1)}</span>
                          <span className="text-[#6B6560] font-normal">({vendor.reviewsCount})</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 mt-1 text-[10px] text-[#6B6560]">
                          <Sparkles size={11} className="text-[#9E5338]" />
                          <span className="font-medium">New on Ayoj</span>
                        </div>
                      )}
                    </div>
                    <ChevronRight size={16} className="text-[#9E5338] opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          
          {/* Wedding Planning Progress Checklist */}
          <div className="p-6 rounded-2xl border border-[#E8E2D9] bg-white shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8E2D9] pb-3">
              <h3 className="text-xs font-bold text-[#221F1C] uppercase tracking-wider">Event Milestone Checklist</h3>
              <span className="text-[10px] font-bold text-[#9E5338] bg-[#F3EADF] px-2 py-0.5 rounded-full">
                {checklist.filter(c => c.completed).length}/{checklist.length} Done
              </span>
            </div>

            <div className="space-y-2.5">
              {checklist.length === 0 ? (
                <div className="p-3.5 text-center border border-dashed border-[#E8E2D9] rounded-xl bg-[#FBF8F4]">
                  <p className="text-xs text-[#6B6560]">No tasks yet. Add a custom milestone below!</p>
                </div>
              ) : (
                checklist.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onToggleChecklist(item.id)}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      item.completed 
                        ? 'bg-emerald-50/60 border-emerald-200 text-[#221F1C]' 
                        : 'bg-[#FBF8F4] border-[#E8E2D9] text-[#6B6560] hover:border-[#9E5338]/40'
                    }`}
                  >
                    <div className={`size-5 rounded-full flex items-center justify-center border shrink-0 transition-colors ${
                      item.completed ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-[#E8E2D9] bg-white'
                    }`}>
                      {item.completed && <Check size={12} />}
                    </div>
                    <span className={`text-xs font-medium ${item.completed ? 'line-through opacity-75' : ''}`}>
                      {item.title}
                    </span>
                  </button>
                ))
              )}
            </div>

            <form onSubmit={onAddChecklistTask} className="flex gap-2 pt-2 border-t border-[#E8E2D9]">
              <input
                type="text"
                placeholder="Add custom task..."
                value={newChecklistTitle}
                onChange={(e) => setNewChecklistTitle(e.target.value)}
                className="flex-1 bg-[#FBF8F4] border border-[#E8E2D9] rounded-lg px-3 py-1.5 text-xs text-[#221F1C] placeholder:text-[#6B6560] focus:outline-none focus:border-[#9E5338]"
              />
              <Button type="submit" size="sm" className="bg-[#9E5338] hover:bg-[#86442B] text-white rounded-lg text-xs font-medium px-3 h-8 shrink-0">
                <Plus size={14} />
              </Button>
            </form>
          </div>

          {/* Saved Pros Wishlist Widget */}
          <div className="p-6 rounded-2xl border border-[#E8E2D9] bg-white shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8E2D9] pb-3">
              <h3 className="text-xs font-bold text-[#221F1C] uppercase tracking-wider">Saved Wishlist</h3>
              <button onClick={() => onNavigateTab('saved')} className="text-xs font-bold text-[#9E5338] hover:underline cursor-pointer">
                See All
              </button>
            </div>

            <div className="space-y-3">
              {savedVendors.length === 0 ? (
                <div className="p-4 text-center border border-dashed border-[#E8E2D9] rounded-xl bg-[#FBF8F4]">
                  <p className="text-xs text-[#6B6560]">No saved vendors yet</p>
                  <Link href="/marketplace" className="text-[11px] font-bold text-[#9E5338] hover:underline mt-1 inline-block">
                    Explore vendors
                  </Link>
                </div>
              ) : (
                savedVendors.slice(0, 3).map((pro) => (
                  <Link 
                    key={pro.id} 
                    href={`/vendors/${pro.slug || pro.id}`}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#FBF8F4] border border-[#E8E2D9] hover:border-[#9E5338]/50 hover:bg-white hover:shadow-xs transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="relative size-10 rounded-lg overflow-hidden shrink-0 border border-[#E8E2D9]">
                        <ImageWithFallback src={pro.image} alt={pro.name} fill unoptimized className="object-cover group-hover:scale-105 transition-transform duration-300" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#221F1C] group-hover:text-[#9E5338] transition-colors truncate max-w-[130px]">{pro.name}</p>
                        <p className="text-[10px] text-[#6B6560] truncate">{pro.category}</p>
                      </div>
                    </div>
                    <div className="size-8 rounded-full flex items-center justify-center text-[#9E5338] group-hover:bg-[#F3EADF] transition-colors shrink-0">
                      <ChevronRight size={16} />
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Become a Partner Promo Card */}
          <div className="p-6 rounded-2xl bg-[#F3EADF] border border-[#E8E2D9] space-y-3 relative overflow-hidden">
            <div className="relative z-10">
              <Camera className="size-7 text-[#9E5338] mb-2" />
              <h4 className="text-base font-serif font-bold text-[#221F1C]">Are you an Event Vendor?</h4>
              <p className="text-xs text-[#6B6560] leading-relaxed mb-4">
                Join Ayoj to list your photography, makeup, decor, or catering packages and get booked by premium clients.
              </p>
              <Link href="/register?role=vendor">
                <Button size="sm" className="w-full bg-[#9E5338] hover:bg-[#86442B] text-white font-medium text-xs rounded-full h-9">
                  List Your Business
                </Button>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
