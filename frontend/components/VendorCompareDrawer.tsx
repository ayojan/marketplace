'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeftRight, 
  X, 
  Check, 
  Star, 
  MapPin, 
  IndianRupee, 
  ShieldCheck, 
  ArrowRight,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Send,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import VerifiedPartnerBadge from '@/components/VerifiedPartnerBadge';
import { toast } from 'sonner';

export interface CompareVendor {
  id: string | number;
  slug?: string;
  name?: string;
  business_name?: string;
  image?: string;
  profile_image_url?: string;
  rating?: number;
  average_rating?: number;
  total_reviews?: number;
  location?: string;
  base_price?: number | string;
  is_verified?: boolean;
  verification_status?: string;
  primary_category?: any;
  categories?: any[];
  service_categories?: string[];
  category?: string;
  occasions?: string[];
}

interface VendorCompareDrawerProps {
  vendors: CompareVendor[];
  onRemove: (vendorId: string | number) => void;
  onClear: () => void;
  onOpenInquire?: (vendor: CompareVendor) => void;
  isOpenInquireModal?: boolean;
  onToggleInquireModal?: (open: boolean) => void;
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=600&auto=format&fit=crop';

const OCCASIONS_LIST = [
  'Wedding & Shaadi',
  'Pre-Wedding (Haldi, Mehendi, Sangeet)',
  'Engagement & Roka',
  'Birthday & Anniversary',
  'Corporate Event / Gala',
  'Other Celebration',
];

const GUEST_SCALES_LIST = [
  'Intimate (< 50 guests)',
  'Classic (50 – 150 guests)',
  'Grand (150 – 400 guests)',
  'Royal (400+ guests)',
];

export default function VendorCompareDrawer({
  vendors = [],
  onRemove,
  onClear,
  onOpenInquire,
  isOpenInquireModal,
  onToggleInquireModal,
}: VendorCompareDrawerProps) {
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [internalInquireOpen, setInternalInquireOpen] = useState(false);
  const [isSubmittingInquiry, setIsSubmittingInquiry] = useState(false);
  const [isInquirySubmitted, setIsInquirySubmitted] = useState(false);

  const isInquireModalOpen = isOpenInquireModal !== undefined ? isOpenInquireModal : internalInquireOpen;

  const [inquiryForm, setInquiryForm] = useState({
    celebrationDate: '',
    occasion: 'Wedding & Shaadi',
    guests: 'Classic (50 – 150 guests)',
    city: '',
    notes: '',
    hostName: '',
    hostPhone: '',
    hostEmail: '',
  });

  const handleOpenInquire = () => {
    setIsInquirySubmitted(false);
    if (onToggleInquireModal) onToggleInquireModal(true);
    setInternalInquireOpen(true);
  };

  const handleCloseInquire = () => {
    if (onToggleInquireModal) onToggleInquireModal(false);
    setInternalInquireOpen(false);
  };

  const handleBroadcastInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryForm.hostName.trim()) {
      toast.error('Please enter your name');
      return;
    }
    if (!inquiryForm.hostPhone.trim() && !inquiryForm.hostEmail.trim()) {
      toast.error('Please provide a phone number or email so pros can reply');
      return;
    }

    setIsSubmittingInquiry(true);
    try {
      if (typeof window !== 'undefined') {
        const existing = JSON.parse(localStorage.getItem('ayoj_vendor_requests') || '[]');
        const newEntries = vendors.length > 0 
          ? vendors.map((v) => ({
              id: `broadcast_${Date.now()}_${v.id}`,
              vendorId: v.id,
              vendorName: v.name || v.business_name || 'Vendor',
              vendorCategory: v.primary_category?.name || v.category || 'Creative Partner',
              service: v.primary_category?.name || v.category || 'Celebration Pro',
              city: inquiryForm.city || v.location || 'Local Hub',
              date: inquiryForm.celebrationDate,
              occasion: inquiryForm.occasion,
              guests: inquiryForm.guests,
              notes: inquiryForm.notes,
              name: inquiryForm.hostName,
              email: inquiryForm.hostEmail,
              phone: inquiryForm.hostPhone,
              isBroadcast: true,
              submittedAt: new Date().toISOString(),
            }))
          : [{
              id: `broadcast_${Date.now()}_general`,
              vendorId: 'open_broadcast',
              vendorName: 'Top Verified Pros',
              vendorCategory: 'Multi-Service Creative Partners',
              service: 'General Celebration Request',
              city: inquiryForm.city || 'Local Hub',
              date: inquiryForm.celebrationDate,
              occasion: inquiryForm.occasion,
              guests: inquiryForm.guests,
              notes: inquiryForm.notes,
              name: inquiryForm.hostName,
              email: inquiryForm.hostEmail,
              phone: inquiryForm.hostPhone,
              isBroadcast: true,
              submittedAt: new Date().toISOString(),
            }];

        localStorage.setItem('ayoj_vendor_requests', JSON.stringify([...newEntries, ...existing]));
      }

      setIsInquirySubmitted(true);
      toast.success(vendors.length > 0 ? `Inquiries sent to ${vendors.length} pros!` : 'Broadcast request submitted to verified pros!');
    } catch {
      toast.error('Could not submit inquiry. Please try again.');
    } finally {
      setIsSubmittingInquiry(false);
    }
  };

  // If both tray and inquiry modal have nothing to show, return null
  if ((!vendors || vendors.length === 0) && !isInquireModalOpen && !isOpenModal) {
    return null;
  }

  return (
    <>
      {/* Floating Bottom Bar (shown when at least 1 vendor is added) */}
      <AnimatePresence>
        {vendors && vendors.length > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 280 }}
            className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-2xl bg-white/95 backdrop-blur-md border border-[#E8E2D9] shadow-2xl rounded-2xl p-3 sm:px-5 sm:py-3.5 flex items-center justify-between gap-3"
          >
            {/* Left: Indicator & Thumbnails */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="size-8 rounded-xl bg-[#F3EADF] border border-[#E8E2D9] flex items-center justify-center text-[#9E5338] shrink-0">
                <Send className="size-4" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#221F1C]">
                    Inquiry Basket ({vendors.length}/3)
                  </span>
                  <button
                    type="button"
                    onClick={onClear}
                    className="text-[11px] text-[#6B6560] hover:text-[#9E5338] underline cursor-pointer"
                  >
                    Clear all
                  </button>
                </div>

                {/* Avatars */}
                <div className="flex items-center gap-1.5 pt-1">
                  {vendors.map((v) => {
                    const name = v.name || v.business_name || 'Vendor';
                    const img = v.image || v.profile_image_url || FALLBACK_IMAGE;
                    return (
                      <div 
                        key={v.id} 
                        className="group/thumb relative size-7 rounded-full border border-white ring-1 ring-[#E8E2D9] overflow-hidden shrink-0 shadow-2xs"
                        title={name}
                      >
                        <Image 
                          src={img} 
                          alt={name} 
                          fill 
                          unoptimized 
                          className="object-cover" 
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemove(v.id);
                          }}
                          aria-label={`Remove ${name} from basket`}
                          className="absolute inset-0 bg-black/60 flex items-center justify-center text-white opacity-0 group-hover/thumb:opacity-100 transition-opacity cursor-pointer"
                        >
                          <X className="size-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right: Primary Inquire All & Secondary Compare Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <Button
                type="button"
                onClick={handleOpenInquire}
                className="h-9 px-3.5 sm:px-4 bg-[#9E5338] hover:bg-[#86442B] text-white text-xs font-semibold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer shrink-0 gap-1.5"
              >
                <Send className="size-3" />
                <span className="hidden sm:inline">Inquire All ({vendors.length})</span>
                <span className="sm:hidden">Inquire ({vendors.length})</span>
              </Button>

              <button
                type="button"
                onClick={() => setIsOpenModal(true)}
                className="h-9 px-3 bg-[#FAF7F2] hover:bg-[#F3EADF] text-[#221F1C] border border-[#E8E2D9] text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 shrink-0"
              >
                <ArrowLeftRight className="size-3 text-[#9E5338]" />
                <span className="hidden sm:inline">Compare</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Side-by-Side Comparison Modal */}
      <AnimatePresence>
        {isOpenModal && vendors && vendors.length > 0 && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpenModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              transition={{ type: 'spring', damping: 26, stiffness: 260 }}
              className="relative w-full max-w-4xl bg-white rounded-3xl border border-[#E8E2D9] shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-5 sm:p-6 border-b border-[#E8E2D9] bg-[#FAF7F2] flex items-center justify-between">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#9E5338] uppercase tracking-wider mb-0.5">
                    <ArrowLeftRight className="size-3.5" />
                    <span>Side-by-Side Comparison</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-serif font-bold text-[#221F1C]">
                    Comparing {vendors.length} Creative {vendors.length === 1 ? 'Partner' : 'Partners'}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClear}
                    className="text-xs text-[#6B6560] hover:text-[#9E5338] underline px-2 py-1 cursor-pointer"
                  >
                    Clear selection
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsOpenModal(false)}
                    className="size-8 rounded-full bg-white hover:bg-[#F3EADF] border border-[#E8E2D9] flex items-center justify-center text-[#221F1C] cursor-pointer"
                    aria-label="Close comparison"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              </div>

              {/* Comparison Table / Grid Body */}
              <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
                <div className={`grid grid-cols-${vendors.length} gap-4 sm:gap-6`}>
                  {vendors.map((vendor) => {
                    const name = vendor.name || vendor.business_name || 'Vendor';
                    const img = vendor.image || vendor.profile_image_url || FALLBACK_IMAGE;
                    const rating = vendor.rating ?? vendor.average_rating;
                    const totalReviews = vendor.total_reviews ?? 0;
                    const hasBasePrice = vendor.base_price != null && !isNaN(Number(vendor.base_price)) && Number(vendor.base_price) > 0;
                    const priceFormatted = hasBasePrice
                      ? `₹${Number(vendor.base_price).toLocaleString('en-IN')}`
                      : 'On request';

                    const primaryCat = vendor.primary_category?.name || 
                      (typeof vendor.primary_category === 'string' ? vendor.primary_category : null) || 
                      vendor.category || 
                      'Creative Partner';

                    const slugOrId = vendor.slug || vendor.id;

                    return (
                      <div
                        key={vendor.id}
                        className="bg-[#FAF7F2] border border-[#E8E2D9] rounded-2xl p-4 flex flex-col justify-between space-y-4 relative"
                      >
                        {/* Remove pro pill */}
                        <button
                          type="button"
                          onClick={() => onRemove(vendor.id)}
                          className="absolute top-3 right-3 z-10 size-6 rounded-full bg-white/90 border border-[#E8E2D9] text-[#6B6560] hover:text-[#9E5338] flex items-center justify-center cursor-pointer shadow-xs"
                          title="Remove from comparison"
                        >
                          <X className="size-3" />
                        </button>

                        <div className="space-y-3">
                          {/* Photo + Name */}
                          <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-[#E8E2D9] bg-white">
                            <Image
                              src={img}
                              alt={name}
                              fill
                              unoptimized
                              className="object-cover"
                            />
                            {vendor.is_verified && (
                              <div className="absolute top-2 left-2 z-10">
                                <VerifiedPartnerBadge isVerified={true} size="sm" vendorName={name} />
                              </div>
                            )}
                          </div>

                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#9E5338]">
                              {primaryCat}
                            </span>
                            <h4 className="font-serif font-bold text-sm sm:text-base text-[#221F1C] truncate">
                              {name}
                            </h4>
                          </div>

                          {/* Attribute 1: Rating */}
                          <div className="p-3 rounded-xl bg-white border border-[#E8E2D9]/80 space-y-0.5">
                            <span className="text-[10px] text-[#6B6560] uppercase font-bold tracking-wider block">
                              Client Rating
                            </span>
                            <div className="flex items-center gap-1.5 text-xs font-bold text-[#221F1C]">
                              {rating && rating > 0 ? (
                                <>
                                  <Star className="size-3.5 fill-amber-400 text-amber-400" />
                                  <span>{Number(rating).toFixed(1)}</span>
                                  <span className="text-[11px] font-normal text-[#6B6560]">
                                    ({totalReviews} reviews)
                                  </span>
                                </>
                              ) : (
                                <span className="text-[#6B6560] font-normal">New partner</span>
                              )}
                            </div>
                          </div>

                          {/* Attribute 2: Starting Price */}
                          <div className="p-3 rounded-xl bg-white border border-[#E8E2D9]/80 space-y-0.5">
                            <span className="text-[10px] text-[#6B6560] uppercase font-bold tracking-wider block">
                              Starting Package
                            </span>
                            <div className="flex items-center gap-1 text-xs font-bold text-[#9E5338]">
                              <IndianRupee className="size-3.5" />
                              <span>{priceFormatted}</span>
                            </div>
                          </div>

                          {/* Attribute 3: Location */}
                          <div className="p-3 rounded-xl bg-white border border-[#E8E2D9]/80 space-y-0.5">
                            <span className="text-[10px] text-[#6B6560] uppercase font-bold tracking-wider block">
                              Location Hub
                            </span>
                            <div className="flex items-center gap-1.5 text-xs text-[#221F1C]">
                              <MapPin className="size-3.5 text-[#9E5338] shrink-0" />
                              <span className="truncate">{vendor.location || 'Multiple Cities / Nationwide'}</span>
                            </div>
                          </div>

                          {/* Attribute 4: Guarantee */}
                          <div className="p-3 rounded-xl bg-white border border-[#E8E2D9]/80 space-y-0.5">
                            <span className="text-[10px] text-[#6B6560] uppercase font-bold tracking-wider block">
                              The Ayoj Standard
                            </span>
                            <div className="flex items-center gap-1.5 text-xs text-[#221F1C]">
                              <ShieldCheck className="size-3.5 text-[#9E5338] shrink-0" />
                              <span className="text-[11px]">0% Markup · Direct Chat</span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="space-y-2 pt-2 border-t border-[#E8E2D9]">
                          <Link 
                            href={`/vendors/${slugOrId}`}
                            onClick={() => setIsOpenModal(false)}
                            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-white bg-[#9E5338] hover:bg-[#86442B] transition-colors shadow-xs"
                          >
                            <span>View Full Profile</span>
                            <ArrowRight className="size-3" />
                          </Link>

                          {onOpenInquire && (
                            <button
                              type="button"
                              onClick={() => {
                                setIsOpenModal(false);
                                onOpenInquire(vendor);
                              }}
                              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-[#221F1C] bg-white border border-[#E8E2D9] hover:bg-[#F3EADF] transition-colors cursor-pointer"
                            >
                              <MessageSquare className="size-3 text-[#9E5338]" />
                              <span>Direct Inquiry</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-[#E8E2D9] bg-[#FAF7F2] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#6B6560]">
                <span>Tip: Compare verified reviews, published pricing, and portfolios before sending an inquiry.</span>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Button
                    type="button"
                    onClick={() => {
                      setIsOpenModal(false);
                      handleOpenInquire();
                    }}
                    className="flex-1 sm:flex-none h-8 px-4 bg-[#9E5338] hover:bg-[#86442B] text-white text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="size-3" />
                    <span>Inquire All ({vendors.length})</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsOpenModal(false)}
                    className="h-8 text-xs rounded-xl border-[#E8E2D9]"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Broadcast Multi-Vendor Inquiry Basket Modal */}
      <AnimatePresence>
        {isInquireModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseInquire}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              transition={{ type: 'spring', damping: 26, stiffness: 260 }}
              className="relative w-full max-w-xl bg-white rounded-3xl border border-[#E8E2D9] shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="p-5 sm:p-6 border-b border-[#E8E2D9] bg-[#FAF7F2] flex items-center justify-between">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#9E5338] uppercase tracking-wider mb-0.5">
                    <Send className="size-3.5" />
                    <span>Multi-Vendor Inquiry Basket</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-serif font-bold text-[#221F1C]">
                    {vendors.length > 0 
                      ? `Inquire ${vendors.length} Shortlisted ${vendors.length === 1 ? 'Pro' : 'Pros'}`
                      : 'Broadcast Celebration Inquiry'}
                  </h3>
                  <p className="text-xs text-[#6B6560] mt-0.5">
                    Send your celebration requirements once to get personalized quotes with 0% markup.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCloseInquire}
                  className="size-8 rounded-full bg-white hover:bg-[#F3EADF] border border-[#E8E2D9] flex items-center justify-center text-[#221F1C] cursor-pointer"
                  aria-label="Close inquiry modal"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 sm:p-6 overflow-y-auto">
                {isInquirySubmitted ? (
                  /* Success Confirmation Screen */
                  <div className="text-center py-6 space-y-5 animate-in fade-in-50 duration-200">
                    <div className="size-16 rounded-full bg-[#F3EADF] border border-[#E8E2D9] text-[#9E5338] flex items-center justify-center mx-auto shadow-xs">
                      <CheckCircle2 className="size-8 text-[#9E5338]" />
                    </div>

                    <div className="space-y-1.5">
                      <h4 className="text-lg font-serif font-bold text-[#221F1C]">
                        Inquiries Sent Successfully!
                      </h4>
                      <p className="text-xs text-[#6B6560] max-w-sm mx-auto">
                        {vendors.length > 0 
                          ? `Your celebration details have been shared directly with ${vendors.length} creative partners. They will contact you shortly with customized proposals.`
                          : 'Your celebration details have been broadcast to top verified partners in your area. They will reach out shortly with customized proposals.'}
                      </p>
                    </div>

                    {/* Recipient Pros */}
                    {vendors.length > 0 && (
                      <div className="bg-[#FAF7F2] border border-[#E8E2D9] rounded-2xl p-4 text-left max-w-md mx-auto space-y-2">
                        <span className="text-[10px] font-bold text-[#6B6560] uppercase tracking-wider block">
                          Contacted Pros:
                        </span>
                        {vendors.map((v) => (
                          <div key={v.id} className="flex items-center justify-between text-xs py-1 border-b border-[#E8E2D9]/60 last:border-0">
                            <span className="font-semibold text-[#221F1C]">{v.name || v.business_name}</span>
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              <Check className="size-2.5" /> Sent
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="pt-2">
                      <Button
                        type="button"
                        onClick={() => {
                          handleCloseInquire();
                          setIsInquirySubmitted(false);
                        }}
                        className="h-10 px-6 bg-[#9E5338] hover:bg-[#86442B] text-white text-xs font-semibold rounded-xl"
                      >
                        Done &amp; Continue Browsing
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* Broadcast Form */
                  <form onSubmit={handleBroadcastInquiry} className="space-y-4">
                    {/* Recipient Pro Pill Badges OR Empty Basket Helper */}
                    {vendors.length > 0 ? (
                      <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D9] space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B6560] block">
                          Sending inquiry to:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {vendors.map((v) => {
                            const name = v.name || v.business_name || 'Vendor';
                            const img = v.image || v.profile_image_url || FALLBACK_IMAGE;
                            return (
                              <div 
                                key={v.id}
                                className="inline-flex items-center gap-2 bg-white border border-[#E8E2D9] rounded-full pl-1.5 pr-3 py-1 shadow-2xs"
                              >
                                <div className="relative size-5 rounded-full overflow-hidden border border-[#E8E2D9] shrink-0">
                                  <Image src={img} alt={name} fill unoptimized className="object-cover" />
                                </div>
                                <span className="text-xs font-bold text-[#221F1C]">{name}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D9] space-y-1.5">
                        <div className="flex items-center gap-2 text-xs font-bold text-[#9E5338]">
                          <Sparkles className="size-3.5" />
                          <span>No specific pros selected yet</span>
                        </div>
                        <p className="text-xs text-[#6B6560] leading-relaxed">
                          You can click <strong className="text-[#221F1C] font-semibold">&ldquo;Compare / Inquire&rdquo;</strong> on any vendor card to add up to 3 pros to your basket, or submit your celebration details below to send a broadcast inquiry to top verified pros in your city!
                        </p>
                      </div>
                    )}

                    {/* Celebration Date & Occasion */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-[#221F1C] flex items-center gap-1.5">
                          <Calendar className="size-3.5 text-[#9E5338]" />
                          Celebration Date
                        </label>
                        <input
                          type="date"
                          value={inquiryForm.celebrationDate}
                          onChange={(e) => setInquiryForm({ ...inquiryForm, celebrationDate: e.target.value })}
                          className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#E8E2D9] text-[#221F1C] focus:outline-none focus:border-[#9E5338]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-[#221F1C]">
                          Occasion / Milestone
                        </label>
                        <select
                          value={inquiryForm.occasion}
                          onChange={(e) => setInquiryForm({ ...inquiryForm, occasion: e.target.value })}
                          className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#E8E2D9] text-[#221F1C] focus:outline-none focus:border-[#9E5338] cursor-pointer"
                        >
                          {OCCASIONS_LIST.map((occ) => (
                            <option key={occ} value={occ}>{occ}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Guest Count & City */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-[#221F1C] flex items-center gap-1.5">
                          <Users className="size-3.5 text-[#9E5338]" />
                          Expected Guests
                        </label>
                        <select
                          value={inquiryForm.guests}
                          onChange={(e) => setInquiryForm({ ...inquiryForm, guests: e.target.value })}
                          className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#E8E2D9] text-[#221F1C] focus:outline-none focus:border-[#9E5338] cursor-pointer"
                        >
                          {GUEST_SCALES_LIST.map((scale) => (
                            <option key={scale} value={scale}>{scale}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-[#221F1C] flex items-center gap-1.5">
                          <MapPin className="size-3.5 text-[#9E5338]" />
                          City / Venue Area
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. South Delhi, Gurgaon, Mumbai"
                          value={inquiryForm.city}
                          onChange={(e) => setInquiryForm({ ...inquiryForm, city: e.target.value })}
                          className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#E8E2D9] text-[#221F1C] focus:outline-none focus:border-[#9E5338]"
                        />
                      </div>
                    </div>

                    {/* Specific Requirements / Notes */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#221F1C]">
                        Your Vision / Special Deliverables
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Tell the pros about your schedule, style preferences (e.g. candid only, drone coverage, 2 day events)..."
                        value={inquiryForm.notes}
                        onChange={(e) => setInquiryForm({ ...inquiryForm, notes: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#E8E2D9] text-[#221F1C] focus:outline-none focus:border-[#9E5338] resize-none"
                      />
                    </div>

                    {/* Host Contact Details */}
                    <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D9] space-y-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#9E5338] block">
                        Your Contact Information (for direct reply)
                      </span>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[11px] font-medium text-[#6B6560]">Full Name *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Ananya Sharma"
                            value={inquiryForm.hostName}
                            onChange={(e) => setInquiryForm({ ...inquiryForm, hostName: e.target.value })}
                            className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#E8E2D9] text-[#221F1C] focus:outline-none focus:border-[#9E5338]"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-medium text-[#6B6560]">Phone / WhatsApp *</label>
                          <input
                            type="tel"
                            placeholder="+91 98765 43210"
                            value={inquiryForm.hostPhone}
                            onChange={(e) => setInquiryForm({ ...inquiryForm, hostPhone: e.target.value })}
                            className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#E8E2D9] text-[#221F1C] focus:outline-none focus:border-[#9E5338]"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-[#6B6560]">Email (Optional)</label>
                        <input
                          type="email"
                          placeholder="ananya@example.com"
                          value={inquiryForm.hostEmail}
                          onChange={(e) => setInquiryForm({ ...inquiryForm, hostEmail: e.target.value })}
                          className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#E8E2D9] text-[#221F1C] focus:outline-none focus:border-[#9E5338]"
                        />
                      </div>
                    </div>

                    {/* Trust guarantee badge */}
                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8E2D9] text-[11px] text-[#6B6560]">
                      <ShieldCheck className="size-4 text-[#9E5338] shrink-0" />
                      <span>Zero middleman commission. Artists respond directly to your inquiry with transparent quotes.</span>
                    </div>

                    {/* Actions */}
                    <div className="pt-2 flex items-center justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCloseInquire}
                        className="h-10 text-xs rounded-xl border-[#E8E2D9]"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmittingInquiry}
                        className="h-10 px-5 bg-[#9E5338] hover:bg-[#86442B] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                      >
                        {isSubmittingInquiry ? (
                          <>
                            <Loader2 className="size-3.5 animate-spin" />
                            <span>Sending Inquiries...</span>
                          </>
                        ) : (
                          <>
                            <Send className="size-3.5" />
                            <span>{vendors.length > 0 ? `Send Inquiry to ${vendors.length} ${vendors.length === 1 ? 'Pro' : 'Pros'}` : 'Send Broadcast Inquiry'}</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
