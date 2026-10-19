'use client';

import React from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, ShieldCheck, Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Service } from './types';

interface VendorServiceDetailsModalProps {
  viewingService: Service | null;
  onClose: () => void;
  vendor: any;
  selectedService: Service | null;
  onSelectService: (service: Service) => void;
}

export default function VendorServiceDetailsModal({
  viewingService,
  onClose,
  vendor,
  selectedService,
  onSelectService,
}: VendorServiceDetailsModalProps) {
  return (
    <AnimatePresence>
      {viewingService && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#E8E2D9] overflow-hidden my-8 cursor-default"
          >
            {/* Header with decorative background banner */}
            <div className="relative bg-gradient-to-br from-[#FAF7F2] via-[#F3EADF] to-[#EBE2D5] p-6 sm:p-8 border-b border-[#E8E2D9]">
              <button
                type="button"
                onClick={onClose}
                className="absolute top-4 right-4 size-9 rounded-full bg-white/80 hover:bg-white text-[#221F1C] border border-[#E8E2D9] flex items-center justify-center transition-colors shadow-sm cursor-pointer z-10"
                aria-label="Close details"
              >
                <X className="size-4" />
              </button>

              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Category pill */}
                  {(viewingService.category?.name || (viewingService.categories && viewingService.categories[0]?.name)) && (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#9E5338] text-white shadow-xs">
                      {viewingService.category?.name || viewingService.categories?.[0]?.name}
                    </span>
                  )}

                  {/* Pricing style tag */}
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/80 text-[#221F1C] border border-[#E8E2D9] capitalize flex items-center gap-1">
                    <Sparkles className="size-3 text-[#9E5338]" />
                    {viewingService.pricing_type || 'Standard'} Pricing
                  </span>

                  {/* Vendor Name Badge */}
                  <span className="px-2.5 py-1 rounded-full text-xs text-[#6B6560] bg-white/60 border border-[#E8E2D9]/60">
                    By {vendor?.business_name}
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#221F1C] tracking-tight leading-tight">
                  {viewingService.name}
                </h2>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 space-y-6 max-h-[65vh] overflow-y-auto">
              {/* Price & Guarantee Card */}
              <div className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D9] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] font-bold text-[#6B6560] uppercase tracking-wider block">
                    {viewingService.pricing_type === 'custom' ? 'Service Rate' : 'Investment'}
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-3xl font-serif font-bold text-[#221F1C]">
                      {viewingService.pricing_type === 'custom'
                        ? 'Custom Quote'
                        : `₹${viewingService.base_price?.toLocaleString() || '0'}`}
                    </span>
                    {viewingService.pricing_type === 'hourly' && (
                      <span className="text-sm font-medium text-[#6B6560]">per hour</span>
                    )}
                    {viewingService.pricing_type === 'package' && (
                      <span className="text-sm font-medium text-[#6B6560]">per event / package</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-[#E8E2D9] text-xs text-[#221F1C] font-medium">
                  <ShieldCheck className="size-4 text-emerald-600 shrink-0" />
                  <span>Transparent Pricing & Jashnify Guarantee</span>
                </div>
              </div>

              {/* Service Gallery Images (if available) */}
              {viewingService.images && viewingService.images.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-[#6B6560] uppercase tracking-wider">
                    Service Highlights & Photos
                  </h4>
                  <div className="grid grid-cols-3 gap-3">
                    {viewingService.images.map((img, idx) => (
                      <div key={img.id || idx} className="relative aspect-[4/3] rounded-xl overflow-hidden border border-[#E8E2D9] bg-stone-100">
                        <Image
                          src={img.url}
                          alt={`${viewingService.name} sample ${idx + 1}`}
                          fill
                          className="object-cover hover:scale-105 transition-transform duration-300"
                          unoptimized
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#6B6560] uppercase tracking-wider">
                  Full Description & Scope of Work
                </h4>
                <div className="text-sm text-[#221F1C] leading-relaxed whitespace-pre-line font-normal bg-stone-50/50 p-4 rounded-2xl border border-stone-100">
                  {viewingService.description}
                </div>
              </div>

              {/* What's Included / Key Deliverables */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-[#6B6560] uppercase tracking-wider">
                  What This Service Includes
                </h4>
                <div className="grid sm:grid-cols-2 gap-2.5">
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FAF7F2] border border-[#E8E2D9]/80 text-xs text-[#221F1C]">
                    <Check className="size-4 text-[#9E5338] shrink-0 mt-0.5" strokeWidth={2.5} />
                    <span>Direct consultation with {vendor?.business_name} prior to event date</span>
                  </div>
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FAF7F2] border border-[#E8E2D9]/80 text-xs text-[#221F1C]">
                    <Check className="size-4 text-[#9E5338] shrink-0 mt-0.5" strokeWidth={2.5} />
                    <span>Professional execution adhering to verified marketplace standards</span>
                  </div>
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FAF7F2] border border-[#E8E2D9]/80 text-xs text-[#221F1C]">
                    <Check className="size-4 text-[#9E5338] shrink-0 mt-0.5" strokeWidth={2.5} />
                    <span>Timely delivery of deliverables and high-resolution assets</span>
                  </div>
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FAF7F2] border border-[#E8E2D9]/80 text-xs text-[#221F1C]">
                    <Check className="size-4 text-[#9E5338] shrink-0 mt-0.5" strokeWidth={2.5} />
                    <span>Dedicated client support and milestone timeline updates</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 sm:p-6 bg-stone-50 border-t border-[#E8E2D9] flex flex-col sm:flex-row items-center justify-between gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="w-full sm:w-auto h-11 px-5 rounded-full border-[#E8E2D9] text-[#6B6560] hover:text-[#221F1C] text-xs font-medium"
              >
                Close
              </Button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  type="button"
                  onClick={() => {
                    onSelectService(viewingService);
                    onClose();
                    toast.success(`Selected "${viewingService.name}" for your booking request!`);
                    const sidebar = document.getElementById('booking-sidebar');
                    if (sidebar && typeof sidebar.scrollIntoView === 'function') {
                      sidebar.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }}
                  className="w-full sm:w-auto h-11 px-6 rounded-full bg-[#9E5338] hover:bg-[#85432B] text-white text-xs font-medium shadow-sm flex items-center justify-center gap-2"
                >
                  <span>{selectedService?.id === viewingService.id ? 'Package Already Selected' : 'Select & Reserve This Package'}</span>
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
