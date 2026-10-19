'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Send, 
  Calendar, 
  MessageSquare, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  IndianRupee, 
  Clock, 
  Phone, 
  User, 
  Loader2,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface VendorInquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendor: any;
  selectedService?: any;
  bookingDate?: string;
  totalPrice?: number;
  user?: any;
  mode?: 'inquire' | 'reservation';
}

const OCCASIONS = [
  'Wedding & Shaadi',
  'Pre-Wedding (Haldi, Mehendi, Sangeet)',
  'Engagement & Roka',
  'Birthday & Anniversary',
  'Corporate Gala / Event',
  'Other Celebration',
];

export default function VendorInquiryModal({
  isOpen,
  onClose,
  vendor,
  selectedService,
  bookingDate = '',
  totalPrice = 0,
  user,
  mode = 'inquire',
}: VendorInquiryModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [form, setForm] = useState({
    date: bookingDate || '',
    occasion: 'Wedding & Shaadi',
    city: vendor?.location || '',
    message: '',
    name: user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.name || '' : '',
    phone: user?.phone || '',
    email: user?.email || '',
  });

  useEffect(() => {
    if (bookingDate) {
      setForm((prev) => ({ ...prev, date: bookingDate }));
    }
  }, [bookingDate]);

  useEffect(() => {
    if (isOpen) {
      setIsSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen || !vendor) return null;

  const vendorName = vendor.business_name || vendor.name || 'Creative Partner';
  const vendorAvatar = vendor.profile_image_url || vendor.image || 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=600&auto=format&fit=crop';
  const responseTime = Math.round(vendor.response_time_hours || 2);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Please enter your full name');
      return;
    }
    if (!form.phone.trim() && !form.email.trim()) {
      toast.error('Please enter a phone number or email so the artist can respond');
      return;
    }

    setIsSubmitting(true);
    try {
      if (typeof window !== 'undefined') {
        const existing = JSON.parse(localStorage.getItem('ayoj_vendor_requests') || '[]');
        const newEntry = {
          id: `req_${Date.now()}_${vendor.id}`,
          vendorId: vendor.id,
          vendorName,
          vendorSlug: vendor.slug,
          service: selectedService?.name || 'Custom Consultation',
          serviceId: selectedService?.id,
          date: form.date,
          occasion: form.occasion,
          city: form.city,
          notes: form.message,
          totalPrice: totalPrice || selectedService?.base_price || 0,
          name: form.name,
          phone: form.phone,
          email: form.email,
          type: mode,
          submittedAt: new Date().toISOString(),
        };
        localStorage.setItem('ayoj_vendor_requests', JSON.stringify([newEntry, ...existing]));
      }

      setIsSuccess(true);
      toast.success(
        mode === 'reservation'
          ? `Reservation request submitted to ${vendorName}!`
          : `Inquiry sent to ${vendorName}!`
      );
    } catch {
      toast.error('Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ type: 'spring', damping: 26, stiffness: 260 }}
          className="relative w-full max-w-lg bg-white rounded-3xl border border-[#E8E2D9] shadow-2xl overflow-hidden z-10 flex flex-col max-h-[92vh]"
        >
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-[#E8E2D9] bg-[#FAF7F2] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative size-12 rounded-2xl overflow-hidden border border-[#E8E2D9] bg-stone-100 shrink-0">
                <Image src={vendorAvatar} alt={vendorName} fill unoptimized className="object-cover" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#9E5338] uppercase tracking-wider">
                  {mode === 'reservation' ? (
                    <>
                      <Calendar className="size-3" />
                      <span>Date Reservation Request</span>
                    </>
                  ) : (
                    <>
                      <MessageSquare className="size-3" />
                      <span>Direct Artist Inquiry</span>
                    </>
                  )}
                </div>
                <h3 className="text-base sm:text-lg font-serif font-bold text-[#221F1C] truncate max-w-[280px]">
                  {vendorName}
                </h3>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="size-8 rounded-full bg-white hover:bg-[#F3EADF] border border-[#E8E2D9] flex items-center justify-center text-[#221F1C] cursor-pointer"
              aria-label="Close modal"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 sm:p-6 overflow-y-auto">
            {isSuccess ? (
              /* Success Celebration State */
              <div className="text-center py-6 space-y-5 animate-in fade-in-50 duration-200">
                <div className="size-16 rounded-full bg-[#F3EADF] border border-[#E8E2D9] text-[#9E5338] flex items-center justify-center mx-auto shadow-xs">
                  <CheckCircle2 className="size-8 text-[#9E5338]" />
                </div>

                <div className="space-y-1.5">
                  <h4 className="text-lg font-serif font-bold text-[#221F1C]">
                    {mode === 'reservation' ? 'Reservation Request Received!' : 'Inquiry Sent to Artist!'}
                  </h4>
                  <p className="text-xs text-[#6B6560] max-w-sm mx-auto leading-relaxed">
                    {vendorName} usually responds in ~{responseTime} hours. They have received your celebration details and will reach out via call or WhatsApp.
                  </p>
                </div>

                {/* Summary Card */}
                <div className="bg-[#FAF7F2] border border-[#E8E2D9] rounded-2xl p-4 text-left max-w-sm mx-auto space-y-2 text-xs">
                  {selectedService && (
                    <div className="flex justify-between py-1 border-b border-[#E8E2D9]/60">
                      <span className="text-[#6B6560]">Package:</span>
                      <span className="font-bold text-[#221F1C]">{selectedService.name}</span>
                    </div>
                  )}
                  {form.date && (
                    <div className="flex justify-between py-1 border-b border-[#E8E2D9]/60">
                      <span className="text-[#6B6560]">Requested Date:</span>
                      <span className="font-bold text-[#221F1C]">{new Date(form.date).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</span>
                    </div>
                  )}
                  {totalPrice > 0 && (
                    <div className="flex justify-between py-1">
                      <span className="text-[#6B6560]">Estimated Total:</span>
                      <span className="font-bold text-[#9E5338]">₹{totalPrice.toLocaleString('en-IN')} (0% markup)</span>
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <Button
                    type="button"
                    onClick={onClose}
                    className="h-10 px-6 bg-[#9E5338] hover:bg-[#86442B] text-white text-xs font-semibold rounded-xl cursor-pointer"
                  >
                    Done &amp; Continue Browsing
                  </Button>
                </div>
              </div>
            ) : (
              /* Request / Inquiry Form */
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Package Context Card (if reservation mode or service selected) */}
                {selectedService && (
                  <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D9] flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold text-[#9E5338] uppercase tracking-wider block">
                        Selected Package
                      </span>
                      <p className="text-xs font-bold text-[#221F1C]">{selectedService.name}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-[#6B6560] block">Investment</span>
                      <p className="text-xs font-bold text-[#9E5338]">
                        {selectedService.pricing_type === 'custom'
                          ? 'Custom Quote'
                          : `₹${(totalPrice || selectedService.base_price || 0).toLocaleString('en-IN')}`}
                      </p>
                    </div>
                  </div>
                )}

                {/* Event Date & Occasion */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#221F1C] flex items-center gap-1.5">
                      <Calendar className="size-3.5 text-[#9E5338]" />
                      Celebration Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#E8E2D9] text-[#221F1C] focus:outline-none focus:border-[#9E5338]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#221F1C]">
                      Occasion Milestone
                    </label>
                    <select
                      value={form.occasion}
                      onChange={(e) => setForm({ ...form, occasion: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#E8E2D9] text-[#221F1C] focus:outline-none focus:border-[#9E5338] cursor-pointer"
                    >
                      {OCCASIONS.map((occ) => (
                        <option key={occ} value={occ}>{occ}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Message / Custom Requirements */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#221F1C] flex items-center justify-between">
                    <span>{mode === 'reservation' ? 'Celebration Notes / Venue Details' : 'What would you like to ask or customize?'}</span>
                    <span className="text-[10px] text-[#6B6560] font-normal">Optional</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder={
                      mode === 'reservation'
                        ? 'e.g., Venue location in South Delhi, event timings 6 PM to 11 PM, specific theme preferences...'
                        : 'e.g., Are you available for outstation travel? Can we add drone coverage or customize floral colors?'
                    }
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#E8E2D9] text-[#221F1C] focus:outline-none focus:border-[#9E5338] resize-none"
                  />
                </div>

                {/* Contact Information */}
                <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D9] space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#9E5338] block">
                    Your Contact Info (for artist to respond directly)
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-[#6B6560]">Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ananya Sharma"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#E8E2D9] text-[#221F1C] focus:outline-none focus:border-[#9E5338]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-[#6B6560]">Phone / WhatsApp *</label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98765 43210"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#E8E2D9] text-[#221F1C] focus:outline-none focus:border-[#9E5338]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-[#6B6560]">Email (Optional)</label>
                    <input
                      type="email"
                      placeholder="ananya@example.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#E8E2D9] text-[#221F1C] focus:outline-none focus:border-[#9E5338]"
                    />
                  </div>
                </div>

                {/* Trust guarantee badge */}
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8E2D9] text-[11px] text-[#6B6560]">
                  <ShieldCheck className="size-4 text-[#9E5338] shrink-0" />
                  <span>0% middleman markups. {vendorName} connects directly with you without platform commissions.</span>
                </div>

                {/* Actions */}
                <div className="pt-2 flex items-center justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
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
                        <span>Sending Request...</span>
                      </>
                    ) : (
                      <>
                        <Send className="size-3.5" />
                        <span>{mode === 'reservation' ? 'Submit Reservation Request' : 'Send Inquiry to Artist'}</span>
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
