/* eslint-disable @next/next/no-img-element */
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Camera, Trash2, Plus, CheckCircle2, AlertCircle, Sparkles, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { OnboardingPortfolioItem, OnboardingPackage } from './types';

interface Step5PortfolioPackagesProps {
  portfolioItems: OnboardingPortfolioItem[];
  setPortfolioItems: React.Dispatch<React.SetStateAction<OnboardingPortfolioItem[]>>;
  customMediaTitle: string;
  setCustomMediaTitle: (val: string) => void;
  customMediaUrl: string;
  setCustomMediaUrl: (val: string) => void;
  packages: OnboardingPackage[];
  setPackages: React.Dispatch<React.SetStateAction<OnboardingPackage[]>>;
  minBookingValue: number;
  setMinBookingValue: (val: number) => void;
  onPublish: () => void;
  isSubmitting: boolean;
  onBack: () => void;
}

export default function Step5PortfolioPackages({
  portfolioItems,
  setPortfolioItems,
  customMediaTitle,
  setCustomMediaTitle,
  customMediaUrl,
  setCustomMediaUrl,
  packages,
  setPackages,
  minBookingValue,
  setMinBookingValue,
  onPublish,
  isSubmitting,
  onBack
}: Step5PortfolioPackagesProps) {
  return (
    <motion.div
      key="step-5"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="bg-white border border-[#E8E2D9] rounded-2xl p-6 sm:p-9 shadow-sm space-y-7"
    >
      <div>
        <Badge variant="outline" className="bg-[#F3EADF] text-[#9E5338] border-[#E8E2D9] mb-2 font-semibold text-[11px]">
          Step 5 — Recommended to Maximize Bookings
        </Badge>
        <h2 className="text-2xl sm:text-3xl font-serif font-normal text-[#221F1C]">
          Portfolio Gallery & Service Packages
        </h2>
        <p className="text-xs sm:text-sm text-[#6B6560] mt-1">
          Give couples and event hosts the visual proof and transparent packages they need to choose you over others.
        </p>
      </div>

      {/* Portfolio Media Showcase */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-bold text-[#221F1C] flex items-center gap-1.5">
            <Camera className="size-4 text-[#9E5338]" />
            Featured Portfolio Highlights ({portfolioItems.length})
          </Label>
          <span className="text-[11px] text-[#6B6560]">High-resolution wedding and event captures</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {portfolioItems.map((item, idx) => (
            <div
              key={idx}
              className="group relative h-32 rounded-xl overflow-hidden border border-[#E8E2D9] bg-slate-100"
            >
              <img
                src={item.url}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-2 text-white">
                <span className="text-[9px] font-bold uppercase tracking-wider text-[#F3EADF]">
                  {item.category}
                </span>
                <span className="text-[11px] font-semibold truncate leading-tight">
                  {item.title}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPortfolioItems(portfolioItems.filter((_, i) => i !== idx))}
                className="absolute top-1.5 right-1.5 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-600"
              >
                <Trash2 className="size-3" />
              </button>
            </div>
          ))}
        </div>

        {/* Add Custom Media URL */}
        <div className="p-3.5 rounded-xl border border-[#E8E2D9] bg-[#FBF8F4] flex flex-col sm:flex-row gap-2 items-center">
          <Input
            value={customMediaTitle}
            onChange={(e) => setCustomMediaTitle(e.target.value)}
            placeholder="Work title e.g. Royal Jaipur Sangeet"
            className="bg-white border-[#E8E2D9] text-xs h-9 sm:w-1/3"
          />
          <Input
            value={customMediaUrl}
            onChange={(e) => setCustomMediaUrl(e.target.value)}
            placeholder="https://images.unsplash... (Image URL)"
            className="bg-white border-[#E8E2D9] text-xs h-9 flex-1"
          />
          <Button
            type="button"
            onClick={() => {
              if (!customMediaUrl.trim()) return;
              setPortfolioItems([
                ...portfolioItems,
                {
                  title: customMediaTitle.trim() || 'Event Highlight',
                  category: 'Portfolio',
                  url: customMediaUrl.trim()
                }
              ]);
              setCustomMediaTitle('');
              setCustomMediaUrl('');
            }}
            className="bg-[#221F1C] hover:bg-[#332f2b] text-white rounded-xl text-xs h-9 px-4 font-bold shrink-0"
          >
            + Add Image
          </Button>
        </div>
      </div>

      {/* Service Packages and Pricing Inclusions/Exclusions */}
      <div className="space-y-4 pt-3 border-t border-[#E8E2D9]">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-xs font-bold text-[#221F1C]">
              Service Packages & Clear Deliverables ({packages.length})
            </Label>
            <p className="text-[11px] text-[#6B6560]">
              Specify what is included and excluded so clients know exactly what they are booking
            </p>
          </div>

          <Button
            type="button"
            size="sm"
            onClick={() => {
              setPackages([
                ...packages,
                {
                  id: `pkg-${Date.now()}`,
                  title: 'Custom Event Tier',
                  price: 45000,
                  inclusions: 'Complete coverage, edited output, dedicated lead pro',
                  exclusions: 'Travel costs beyond city limit'
                }
              ]);
            }}
            className="bg-[#F3EADF] text-[#9E5338] hover:bg-[#9E5338] hover:text-white rounded-xl text-xs font-bold border border-[#E8E2D9]"
          >
            <Plus className="size-3.5 mr-1" /> Add Package
          </Button>
        </div>

        <div className="space-y-3">
          {packages.map((pkg, idx) => (
            <div
              key={pkg.id}
              className="p-4 rounded-xl border border-[#E8E2D9] bg-[#FBF8F4] space-y-3"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-[10px] font-bold text-[#6B6560] uppercase">Package Name</Label>
                    <Input
                      value={pkg.title}
                      onChange={(e) => {
                        const updated = [...packages];
                        updated[idx].title = e.target.value;
                        setPackages(updated);
                      }}
                      className="bg-white border-[#E8E2D9] rounded-lg text-xs h-9 mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-[10px] font-bold text-[#6B6560] uppercase">Package Price (₹ INR)</Label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-2 text-xs text-[#6B6560]">₹</span>
                      <Input
                        type="number"
                        min={0}
                        value={pkg.price}
                        onChange={(e) => {
                          const updated = [...packages];
                          updated[idx].price = Number(e.target.value) || 0;
                          setPackages(updated);
                        }}
                        className="pl-7 bg-white border-[#E8E2D9] rounded-lg text-xs h-9"
                      />
                    </div>
                  </div>
                </div>

                {packages.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setPackages(packages.filter((p) => p.id !== pkg.id))}
                    className="text-rose-400 hover:text-rose-600 p-1 mt-4"
                  >
                    <Trash2 className="size-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-[10px] font-bold text-emerald-700 uppercase flex items-center gap-1">
                    <CheckCircle2 className="size-3" /> Package Inclusions
                  </Label>
                  <Textarea
                    rows={2}
                    value={pkg.inclusions}
                    onChange={(e) => {
                      const updated = [...packages];
                      updated[idx].inclusions = e.target.value;
                      setPackages(updated);
                    }}
                    placeholder="e.g. 2 Photographers, 1 Videographer, 300 Edited Photos, Teaser Reel"
                    className="bg-white border-[#E8E2D9] rounded-lg text-xs p-2 mt-1 resize-none"
                  />
                </div>

                <div>
                  <Label className="text-[10px] font-bold text-rose-700 uppercase flex items-center gap-1">
                    <AlertCircle className="size-3" /> Package Exclusions
                  </Label>
                  <Textarea
                    rows={2}
                    value={pkg.exclusions}
                    onChange={(e) => {
                      const updated = [...packages];
                      updated[idx].exclusions = e.target.value;
                      setPackages(updated);
                    }}
                    placeholder="e.g. Raw footage, outstation travel expenses, drone permit fees"
                    className="bg-white border-[#E8E2D9] rounded-lg text-xs p-2 mt-1 resize-none"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Minimum Booking Value */}
      <div className="p-4 rounded-xl border border-[#E8E2D9] bg-[#FBF8F4] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <h4 className="text-xs font-bold text-[#221F1C]">Minimum Booking Value (₹ INR)</h4>
          <p className="text-[11px] text-[#6B6560]">
            Inquiries below this amount will be automatically marked as below your studio threshold.
          </p>
        </div>
        <div className="relative w-full sm:w-44">
          <span className="absolute left-3 top-2.5 text-xs text-[#6B6560]">₹</span>
          <Input
            type="number"
            min={0}
            value={minBookingValue}
            onChange={(e) => setMinBookingValue(Number(e.target.value) || 0)}
            className="pl-7 bg-white border-[#E8E2D9] rounded-xl text-xs h-10 font-bold"
          />
        </div>
      </div>

      {/* Step 5 Navigation & Publish Button */}
      <div className="pt-4 flex items-center justify-between border-t border-[#E8E2D9]">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="border-[#E8E2D9] text-[#6B6560] hover:text-[#221F1C] rounded-xl text-xs h-10 px-4"
        >
          <ArrowLeft className="size-3.5 mr-1.5" /> Back
        </Button>

        <Button
          type="button"
          onClick={onPublish}
          disabled={isSubmitting}
          className="bg-[#9E5338] hover:bg-[#85432c] text-white rounded-xl px-9 py-6 font-bold text-sm sm:text-base flex items-center gap-2 shadow-lg shadow-[#9E5338]/25 transform hover:scale-[1.01] active:scale-98 transition-all"
        >
          {isSubmitting ? (
            'Publishing Listing...'
          ) : (
            <>
              <Sparkles className="size-4" />
              <span>Publish Vendor Listing</span>
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
}
