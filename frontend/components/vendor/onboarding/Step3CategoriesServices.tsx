'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check, Plus, Trash2, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CATEGORY_PRESETS, OnboardingOffering } from './constants';

interface Step3CategoriesServicesProps {
  selectedCategories: string[];
  onToggleCategory: (slug: string, name: string) => void;
  offerings: OnboardingOffering[];
  setOfferings: React.Dispatch<React.SetStateAction<OnboardingOffering[]>>;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  onBack: () => void;
}

export default function Step3CategoriesServices({
  selectedCategories,
  onToggleCategory,
  offerings,
  setOfferings,
  onSubmit,
  isSubmitting,
  onBack
}: Step3CategoriesServicesProps) {
  return (
    <motion.div
      key="step-3"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="bg-white border border-[#E8E2D9] rounded-2xl p-6 sm:p-9 shadow-sm"
    >
      <div className="mb-6">
        <Badge variant="outline" className="bg-[#F3EADF] text-[#9E5338] border-[#E8E2D9] mb-2 font-semibold text-[11px]">
          Step 3 — Required to Publish Listing
        </Badge>
        <h2 className="text-2xl sm:text-3xl font-serif font-normal text-[#221F1C]">
          Categories & Service Offerings
        </h2>
        <p className="text-xs sm:text-sm text-[#6B6560] mt-1">
          Select all categories that apply to your expertise, then detail specific offerings and pricing models.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        {/* Category Selection Grid */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-bold text-[#221F1C] block">
              1. Select Operating Categories (Max 3)
            </Label>
            <span className="text-[10px] font-semibold text-[#9E5338] bg-[#F3EADF] px-2 py-0.5 rounded-full border border-[#E8E2D9]">
              {selectedCategories.length}/3 Selected
            </span>
          </div>
          <p className="text-[11px] text-[#6B6560]">
            First selected category will serve as your Primary anchor trade on the marketplace.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
            {Object.entries(CATEGORY_PRESETS).map(([slug, data]) => {
              const isSelected = selectedCategories.includes(slug);
              const isPrimary = selectedCategories[0] === slug;
              return (
                <div
                  key={slug}
                  onClick={() => onToggleCategory(slug, data.name)}
                  className={`p-3 rounded-xl border text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5 select-none ${
                    isSelected
                      ? 'border-[#9E5338] bg-[#F3EADF] text-[#9E5338] font-bold shadow-xs'
                      : 'border-[#E8E2D9] bg-[#FBF8F4] text-[#6B6560] hover:bg-white'
                  }`}
                >
                  <span className="text-xs">{data.name}</span>
                  {isSelected && (
                    <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-wider font-bold">
                      <Check className="size-3 text-[#9E5338]" />
                      {isPrimary ? 'Primary ★' : 'Secondary'}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Offerings Under Selected Categories */}
        <div className="space-y-4 pt-2 border-t border-[#E8E2D9]">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-xs font-bold text-[#221F1C]">
                2. Detailed Service Offerings ({offerings.length})
              </Label>
              <p className="text-[11px] text-[#6B6560]">
                Define the packages and standalone services clients can book
              </p>
            </div>

            <Button
              type="button"
              size="sm"
              onClick={() => {
                const firstCat = selectedCategories[0] || 'photography';
                const preset = CATEGORY_PRESETS[firstCat];
                setOfferings([
                  ...offerings,
                  {
                    id: `off-${Date.now()}`,
                    categorySlug: firstCat,
                    categoryName: preset?.name || 'Photography',
                    name: 'New Custom Package',
                    description: 'Professional event coverage with high-end equipment, edited deliverables, and dedicated client service.',
                    pricingStyle: 'package',
                    basePrice: 20000
                  }
                ]);
              }}
              className="bg-[#F3EADF] text-[#9E5338] hover:bg-[#9E5338] hover:text-white rounded-xl text-xs font-bold border border-[#E8E2D9]"
            >
              <Plus className="size-3.5 mr-1" /> Add Offering
            </Button>
          </div>

          <div className="space-y-3">
            {offerings.map((offering, idx) => (
              <div
                key={offering.id}
                className="p-4 rounded-xl border border-[#E8E2D9] bg-[#FBF8F4] space-y-3 relative group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-[10px] font-bold text-[#6B6560] uppercase">
                        Offering Title
                      </Label>
                      <Input
                        required
                        value={offering.name}
                        onChange={(e) => {
                          const updated = [...offerings];
                          updated[idx].name = e.target.value;
                          setOfferings(updated);
                        }}
                        placeholder="e.g. Candid Wedding Photography"
                        className="bg-white border-[#E8E2D9] rounded-lg text-xs h-9 mt-1"
                      />
                    </div>

                    <div>
                      <Label className="text-[10px] font-bold text-[#6B6560] uppercase">
                        Category Tag
                      </Label>
                      <select
                        value={offering.categorySlug}
                        onChange={(e) => {
                          const updated = [...offerings];
                          updated[idx].categorySlug = e.target.value;
                          updated[idx].categoryName = CATEGORY_PRESETS[e.target.value]?.name || 'Service';
                          setOfferings(updated);
                        }}
                        className="w-full bg-white border border-[#E8E2D9] rounded-lg text-xs h-9 px-2.5 mt-1 focus:outline-none"
                      >
                        {selectedCategories.map((catSlug) => (
                          <option key={catSlug} value={catSlug}>
                            {CATEGORY_PRESETS[catSlug]?.name || catSlug}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {offerings.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setOfferings(offerings.filter((o) => o.id !== offering.id))}
                      className="text-rose-400 hover:text-rose-600 p-1 mt-5"
                      title="Delete offering"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  )}
                </div>

                {/* Description */}
                <div>
                  <Label className="text-[10px] font-bold text-[#6B6560] uppercase">
                    Description of Offering
                  </Label>
                  <Textarea
                    rows={2}
                    value={offering.description}
                    onChange={(e) => {
                      const updated = [...offerings];
                      updated[idx].description = e.target.value;
                      setOfferings(updated);
                    }}
                    placeholder="What does this service include? (deliverables, hours, crew, equipment...)"
                    className="bg-white border-[#E8E2D9] rounded-lg text-xs p-2.5 mt-1 resize-none"
                  />
                </div>

                {/* Pricing Style & Base Price */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <Label className="text-[10px] font-bold text-[#6B6560] uppercase">
                      Pricing Style
                    </Label>
                    <select
                      value={offering.pricingStyle}
                      onChange={(e) => {
                        const updated = [...offerings];
                        updated[idx].pricingStyle = e.target.value;
                        setOfferings(updated);
                      }}
                      className="w-full bg-white border border-[#E8E2D9] rounded-lg text-xs h-9 px-2.5 mt-1 focus:outline-none"
                    >
                      <option value="fixed">Fixed Price</option>
                      <option value="starting">Starting Price (From ₹)</option>
                      <option value="package">Package-based</option>
                      <option value="custom">Custom Quote / Variable</option>
                    </select>
                  </div>

                  <div>
                    <Label className="text-[10px] font-bold text-[#6B6560] uppercase">
                      {offering.pricingStyle === 'custom' ? 'Quote Note' : 'Base Price (₹ INR)'}
                    </Label>
                    {offering.pricingStyle === 'custom' ? (
                      <div className="h-9 flex items-center px-3 bg-white border border-[#E8E2D9] rounded-lg text-xs text-[#6B6560] mt-1">
                        Provided upon client consultation
                      </div>
                    ) : (
                      <div className="relative mt-1">
                        <span className="absolute left-3 top-2.5 text-xs text-[#6B6560]">₹</span>
                        <Input
                          type="number"
                          min={0}
                          value={offering.basePrice}
                          onChange={(e) => {
                            const updated = [...offerings];
                            updated[idx].basePrice = Number(e.target.value) || 0;
                            setOfferings(updated);
                          }}
                          placeholder="25000"
                          className="pl-7 bg-white border-[#E8E2D9] rounded-lg text-xs h-9"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Step 3 Navigation */}
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
            type="submit"
            disabled={isSubmitting}
            className="bg-[#9E5338] hover:bg-[#85432c] text-white rounded-xl px-7 py-5 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-[#9E5338]/15"
          >
            {isSubmitting ? (
              'Saving Services...'
            ) : (
              <>
                <span>Save & Configure Locations</span>
                <ArrowRight className="size-4" />
              </>
            )}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
