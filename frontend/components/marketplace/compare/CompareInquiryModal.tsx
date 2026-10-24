'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  X,
  Check,
  CheckCircle2,
  Calendar,
  Users,
  MapPin,
  ShieldCheck,
  Loader2,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  CompareVendor,
  FALLBACK_IMAGE,
  OCCASIONS_LIST,
  GUEST_SCALES_LIST,
  InquiryFormData
} from './constants';

interface CompareInquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendors: CompareVendor[];
}

export default function CompareInquiryModal({
  isOpen,
  onClose,
  vendors
}: CompareInquiryModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [form, setForm] = useState<InquiryFormData>({
    celebrationDate: '',
    occasion: 'Wedding & Shaadi',
    guests: 'Classic (50 – 150 guests)',
    city: '',
    notes: '',
    hostName: '',
    hostPhone: '',
    hostEmail: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.hostName.trim()) {
      toast.error('Please enter your name');
      return;
    }
    if (!form.hostPhone.trim() && !form.hostEmail.trim()) {
      toast.error('Please provide a phone number or email so pros can reply');
      return;
    }

    setIsSubmitting(true);
    try {
      if (typeof window !== 'undefined') {
        const existing = JSON.parse(localStorage.getItem('ayoj_vendor_requests') || '[]');
        const newEntries =
          vendors.length > 0
            ? vendors.map((v) => ({
                id: `broadcast_${Date.now()}_${v.id}`,
                vendorId: v.id,
                vendorName: v.name || v.business_name || 'Vendor',
                vendorCategory: v.primary_category?.name || v.category || 'Creative Partner',
                service: v.primary_category?.name || v.category || 'Celebration Pro',
                city: form.city || v.location || 'Local Hub',
                date: form.celebrationDate,
                occasion: form.occasion,
                guests: form.guests,
                notes: form.notes,
                name: form.hostName,
                email: form.hostEmail,
                phone: form.hostPhone,
                isBroadcast: true,
                submittedAt: new Date().toISOString()
              }))
            : [
                {
                  id: `broadcast_${Date.now()}_general`,
                  vendorId: 'open_broadcast',
                  vendorName: 'Top Verified Pros',
                  vendorCategory: 'Multi-Service Creative Partners',
                  service: 'General Celebration Request',
                  city: form.city || 'Local Hub',
                  date: form.celebrationDate,
                  occasion: form.occasion,
                  guests: form.guests,
                  notes: form.notes,
                  name: form.hostName,
                  email: form.hostEmail,
                  phone: form.hostPhone,
                  isBroadcast: true,
                  submittedAt: new Date().toISOString()
                }
              ];

        localStorage.setItem('ayoj_vendor_requests', JSON.stringify([...newEntries, ...existing]));
      }

      setIsSubmitted(true);
      toast.success(
        vendors.length > 0
          ? `Inquiries sent to ${vendors.length} pros!`
          : 'Broadcast request submitted to verified pros!'
      );
    } catch {
      toast.error('Could not submit inquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    onClose();
    setTimeout(() => setIsSubmitted(false), 300);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleModalClose}
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
                onClick={handleModalClose}
                className="size-8 rounded-full bg-white hover:bg-[#F3EADF] border border-[#E8E2D9] flex items-center justify-center text-[#221F1C] cursor-pointer"
                aria-label="Close inquiry modal"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 sm:p-6 overflow-y-auto">
              {isSubmitted ? (
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
                        <div
                          key={v.id}
                          className="flex items-center justify-between text-xs py-1 border-b border-[#E8E2D9]/60 last:border-0"
                        >
                          <span className="font-semibold text-[#221F1C]">
                            {v.name || v.business_name}
                          </span>
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
                      onClick={handleModalClose}
                      className="h-10 px-6 bg-[#9E5338] hover:bg-[#86442B] text-white text-xs font-semibold rounded-xl"
                    >
                      Done &amp; Continue Browsing
                    </Button>
                  </div>
                </div>
              ) : (
                /* Broadcast Form */
                <form onSubmit={handleSubmit} className="space-y-4">
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
                                <Image
                                  src={img}
                                  alt={name}
                                  fill
                                  unoptimized
                                  className="object-cover"
                                />
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
                        You can click{' '}
                        <strong className="text-[#221F1C] font-semibold">
                          &ldquo;Compare / Inquire&rdquo;
                        </strong>{' '}
                        on any vendor card to add up to 3 pros to your basket, or submit your
                        celebration details below to send a broadcast inquiry to top verified pros
                        in your city!
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
                        value={form.celebrationDate}
                        onChange={(e) => setForm({ ...form, celebrationDate: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#E8E2D9] text-[#221F1C] focus:outline-none focus:border-[#9E5338]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#221F1C]">
                        Occasion / Milestone
                      </label>
                      <select
                        value={form.occasion}
                        onChange={(e) => setForm({ ...form, occasion: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#E8E2D9] text-[#221F1C] focus:outline-none focus:border-[#9E5338] cursor-pointer"
                      >
                        {OCCASIONS_LIST.map((occ) => (
                          <option key={occ} value={occ}>
                            {occ}
                          </option>
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
                        value={form.guests}
                        onChange={(e) => setForm({ ...form, guests: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#E8E2D9] text-[#221F1C] focus:outline-none focus:border-[#9E5338] cursor-pointer"
                      >
                        {GUEST_SCALES_LIST.map((scale) => (
                          <option key={scale} value={scale}>
                            {scale}
                          </option>
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
                        value={form.city}
                        onChange={(e) => setForm({ ...form, city: e.target.value })}
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
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
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
                          value={form.hostName}
                          onChange={(e) => setForm({ ...form, hostName: e.target.value })}
                          className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#E8E2D9] text-[#221F1C] focus:outline-none focus:border-[#9E5338]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-[#6B6560]">
                          Phone / WhatsApp *
                        </label>
                        <input
                          type="tel"
                          placeholder="+91 98765 43210"
                          value={form.hostPhone}
                          onChange={(e) => setForm({ ...form, hostPhone: e.target.value })}
                          className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#E8E2D9] text-[#221F1C] focus:outline-none focus:border-[#9E5338]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-[#6B6560]">
                        Email (Optional)
                      </label>
                      <input
                        type="email"
                        placeholder="ananya@example.com"
                        value={form.hostEmail}
                        onChange={(e) => setForm({ ...form, hostEmail: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#E8E2D9] text-[#221F1C] focus:outline-none focus:border-[#9E5338]"
                      />
                    </div>
                  </div>

                  {/* Trust guarantee badge */}
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8E2D9] text-[11px] text-[#6B6560]">
                    <ShieldCheck className="size-4 text-[#9E5338] shrink-0" />
                    <span>
                      Zero middleman commission. Artists respond directly to your inquiry with
                      transparent quotes.
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex items-center justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleModalClose}
                      className="h-10 text-xs rounded-xl border-[#E8E2D9]"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="h-10 px-5 bg-[#9E5338] hover:bg-[#86442B] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="size-3.5 animate-spin" />
                          <span>Sending Inquiries...</span>
                        </>
                      ) : (
                        <>
                          <Send className="size-3.5" />
                          <span>
                            {vendors.length > 0
                              ? `Send Inquiry to ${vendors.length} ${vendors.length === 1 ? 'Pro' : 'Pros'}`
                              : 'Send Broadcast Inquiry'}
                          </span>
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
  );
}
