'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, X, CheckCircle2, MapPin, Calendar, Send, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/contexts/AuthContext';
import { toast } from 'sonner';

export interface MarketplaceRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialService?: string;
  city?: string;
}

export function MarketplaceRequestModal({
  isOpen,
  onClose,
  initialService = 'Photography',
  city = '',
}: MarketplaceRequestModalProps) {
  const { user } = useAuth();
  const [requestSubmitted, setRequestSubmitted] = useState<boolean>(false);
  const [isSubmittingRequest, setIsSubmittingRequest] = useState<boolean>(false);

  const [requestForm, setRequestForm] = useState({
    service: 'Photography',
    city: '',
    date: '',
    notes: '',
    name: '',
    email: '',
    phone: '',
  });

  const prevIsOpen = useRef(false);

  useEffect(() => {
    if (isOpen && !prevIsOpen.current) {
      const defaultName = user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.name || '' : '';
      const serviceToSet = initialService === 'More' ? 'Other' : (initialService || 'Photography');
      setRequestForm({
        service: serviceToSet,
        city: city || '',
        date: '',
        notes: '',
        name: defaultName,
        email: user?.email || '',
        phone: user?.phone || '',
      });
      setRequestSubmitted(false);
    }
    prevIsOpen.current = isOpen;
  }, [isOpen, initialService, city]);

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestForm.name.trim()) {
      toast.error('Please enter your name');
      return;
    }
    if (!requestForm.email.trim() && !requestForm.phone.trim()) {
      toast.error('Please provide an email or phone number so we can contact you');
      return;
    }

    setIsSubmittingRequest(true);
    try {
      if (typeof window !== 'undefined') {
        const existing = JSON.parse(localStorage.getItem('ayoj_vendor_requests') || '[]');
        const newEntry = {
          ...requestForm,
          id: `req_${Date.now()}`,
          city: requestForm.city || city || 'Local City',
          submittedAt: new Date().toISOString()
        };
        localStorage.setItem('ayoj_vendor_requests', JSON.stringify([newEntry, ...existing]));
      }
      toast.success("Request received! We'll work to connect you with suitable local professionals.");
      setRequestSubmitted(true);
    } catch {
      toast.error('Failed to submit request. Please try again.');
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative w-full max-w-lg bg-white rounded-3xl border border-[#E8E2D9] shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
          >
            {/* Modal Header */}
            <div className="p-6 pb-4 border-b border-[#E8E2D9] bg-[#FAF7F2] flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#9E5338] uppercase tracking-wider">
                  <Sparkles className="size-3.5" />
                  <span>Ayoj Concierge</span>
                </div>
                <h3 className="text-xl font-serif font-bold text-[#221F1C]">
                  Request an Event Professional
                </h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="size-8 rounded-full bg-white hover:bg-[#F3EADF] border border-[#E8E2D9] flex items-center justify-center text-[#221F1C] cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5">
              {requestSubmitted ? (
                <div className="text-center py-8 space-y-4">
                  <div className="size-16 rounded-full bg-[#F3EADF] text-[#9E5338] flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 className="size-8" />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="text-xl font-serif font-bold text-[#221F1C]">
                      Request Submitted!
                    </h4>
                    <p className="text-xs text-[#6B6560] max-w-sm mx-auto leading-relaxed">
                      We&apos;ve recorded your request for <strong className="text-[#221F1C]">{requestForm.service}</strong> in <strong className="text-[#221F1C]">{requestForm.city || 'your city'}</strong>.
                    </p>
                    <p className="text-xs text-[#6B6560] max-w-sm mx-auto pt-1 leading-relaxed">
                      Our local team is actively scouting verified professionals and will contact you directly if a suitable match is available.
                    </p>
                  </div>
                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-6 py-2.5 rounded-full bg-[#9E5338] hover:bg-[#86442B] text-white text-xs font-semibold cursor-pointer shadow-xs active:scale-95 transition-all"
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleRequestSubmit} className="space-y-4">
                  <p className="text-xs text-[#6B6560] leading-relaxed">
                    Tell us what you&apos;re planning, and we&apos;ll work to connect you with suitable local event professionals.
                  </p>

                  {/* Service Selection */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#221F1C]">
                      What service do you need?
                    </label>
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {['Photography', 'Decoration', 'Makeup', 'Catering', 'DJs & Music', 'Event Planners', 'Venues', 'Other'].map((svc) => (
                        <button
                          key={svc}
                          type="button"
                          onClick={() => setRequestForm(prev => ({ ...prev, service: svc }))}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer border ${
                            requestForm.service === svc
                              ? 'bg-[#9E5338] text-white border-[#9E5338] shadow-xs'
                              : 'bg-[#FAF7F2] text-[#221F1C] border-[#E8E2D9] hover:bg-[#F3EADF]'
                          }`}
                        >
                          {svc}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* City / Location */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#221F1C]">
                      Location / City
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#9E5338]" />
                      <Input
                        type="text"
                        required
                        value={requestForm.city}
                        onChange={(e) => setRequestForm(prev => ({ ...prev, city: e.target.value }))}
                        placeholder="e.g. Mumbai, Jaipur, Delhi NCR, Pune..."
                        className="pl-9 text-xs rounded-xl border-[#E8E2D9] bg-white h-10"
                      />
                    </div>
                  </div>

                  {/* Event Date (optional) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#221F1C]">
                      Approximate Event Date (Optional)
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#6B6560]" />
                      <Input
                        type="text"
                        value={requestForm.date}
                        onChange={(e) => setRequestForm(prev => ({ ...prev, date: e.target.value }))}
                        placeholder="e.g. Nov 2026, or tentative dates"
                        className="pl-9 text-xs rounded-xl border-[#E8E2D9] bg-white h-10"
                      />
                    </div>
                  </div>

                  {/* Planning Notes */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#221F1C]">
                      Tell us what you&apos;re planning
                    </label>
                    <textarea
                      rows={3}
                      value={requestForm.notes}
                      onChange={(e) => setRequestForm(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Briefly describe your celebration style, guest count, or any specific requirements..."
                      className="w-full text-xs rounded-xl border border-[#E8E2D9] bg-white p-3 focus:outline-none focus:ring-1 focus:ring-[#9E5338] resize-none"
                    />
                  </div>

                  {/* Contact details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs font-bold text-[#221F1C]">
                        Your Name *
                      </label>
                      <Input
                        type="text"
                        required
                        value={requestForm.name}
                        onChange={(e) => setRequestForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Your full name"
                        className="text-xs rounded-xl border-[#E8E2D9] bg-white h-10"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#221F1C]">
                        Email Address
                      </label>
                      <Input
                        type="email"
                        value={requestForm.email}
                        onChange={(e) => setRequestForm(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="name@example.com"
                        className="text-xs rounded-xl border-[#E8E2D9] bg-white h-10"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#221F1C]">
                        Phone Number
                      </label>
                      <Input
                        type="tel"
                        value={requestForm.phone}
                        onChange={(e) => setRequestForm(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="+91 98765 43210"
                        className="text-xs rounded-xl border-[#E8E2D9] bg-white h-10"
                      />
                    </div>
                  </div>

                  {/* Disclaimer text */}
                  <p className="text-[11px] text-[#8A847E] italic pt-1 leading-normal">
                    No guarantee of a match. We&apos;ll contact you if we find a suitable provider.
                  </p>

                  {/* Actions */}
                  <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#E8E2D9]">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onClose}
                      className="rounded-full border-[#E8E2D9] text-xs font-semibold px-5 h-9"
                    >
                      Cancel
                    </Button>
                    <button
                      type="submit"
                      disabled={isSubmittingRequest}
                      className="inline-flex items-center gap-1.5 px-6 h-9 rounded-full bg-[#9E5338] hover:bg-[#86442B] active:scale-95 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isSubmittingRequest ? (
                        <>
                          <Loader2 className="size-3.5 animate-spin" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <Send className="size-3.5" />
                          <span>Submit Request</span>
                        </>
                      )}
                    </button>
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
