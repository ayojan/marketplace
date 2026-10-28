/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Camera,
  Trash2,
  Plus,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowLeft,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { OnboardingPortfolioItem, OnboardingPackage } from './types';

interface Step5PortfolioPackagesProps {
  portfolioItems: OnboardingPortfolioItem[];
  setPortfolioItems: React.Dispatch<React.SetStateAction<OnboardingPortfolioItem[]>>;
  customMediaTitle?: string;
  setCustomMediaTitle?: (val: string) => void;
  customMediaUrl?: string;
  setCustomMediaUrl?: (val: string) => void;
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
  customMediaTitle = '',
  setCustomMediaTitle,
  packages,
  setPackages,
  minBookingValue,
  setMinBookingValue,
  onPublish,
  isSubmitting,
  onBack
}: Step5PortfolioPackagesProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const processFiles = (files: File[]) => {
    const validImageFiles = files.filter((f) => f.type.startsWith('image/'));
    if (validImageFiles.length === 0) {
      toast.error('Please select valid image files (PNG, JPG, or WEBP)');
      return;
    }

    const oversizedFiles = validImageFiles.filter((f) => f.size > 10 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast.error(`${oversizedFiles.length} file(s) exceeded the 10MB limit`);
    }

    const eligibleFiles = validImageFiles.filter((f) => f.size <= 10 * 1024 * 1024);
    if (eligibleFiles.length === 0) return;

    const newItems: OnboardingPortfolioItem[] = eligibleFiles.map((file, idx) => {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      const title = customMediaTitle?.trim()
        ? (eligibleFiles.length === 1 ? customMediaTitle.trim() : `${customMediaTitle.trim()} ${idx + 1}`)
        : cleanName;
      return {
        title: title || 'Event Highlight',
        category: 'Portfolio',
        url: URL.createObjectURL(file),
        file
      };
    });

    setPortfolioItems((prev) => [...prev, ...newItems]);
    if (setCustomMediaTitle) setCustomMediaTitle('');
    toast.success(`Added ${eligibleFiles.length} photo(s) from device`);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    processFiles(Array.from(e.target.files));
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleRemoveItem = (indexToRemove: number) => {
    const itemToRemove = portfolioItems[indexToRemove];
    if (itemToRemove?.url?.startsWith('blob:')) {
      URL.revokeObjectURL(itemToRemove.url);
    }
    setPortfolioItems(portfolioItems.filter((_, i) => i !== indexToRemove));
  };
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
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-bold text-[#221F1C] flex items-center gap-1.5">
            <Camera className="size-4 text-[#9E5338]" />
            Featured Portfolio Highlights ({portfolioItems.length})
          </Label>
          <div className="flex items-center gap-2">
            {portfolioItems.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  portfolioItems.forEach((item) => {
                    if (item.url?.startsWith('blob:')) URL.revokeObjectURL(item.url);
                  });
                  setPortfolioItems([]);
                }}
                className="text-[11px] text-rose-600 hover:underline cursor-pointer font-medium"
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        {portfolioItems.length > 0 && (
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
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[#F3EADF]">
                      {item.category}
                    </span>
                    {item.file && (
                      <span className="text-[8px] bg-emerald-600/90 text-white font-medium px-1.5 py-0.5 rounded-full">
                        Device
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-semibold truncate leading-tight">
                    {item.title}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveItem(idx)}
                  className="absolute top-1.5 right-1.5 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-600 cursor-pointer"
                  title="Remove image"
                >
                  <Trash2 className="size-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Upload from Device Dropzone */}
        <div className="space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />

          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              value={customMediaTitle || ''}
              onChange={(e) => setCustomMediaTitle && setCustomMediaTitle(e.target.value)}
              placeholder="Optional title prefix (e.g. Royal Wedding Jaipur)"
              className="bg-[#FBF8F4] border-[#E8E2D9] text-xs h-10 sm:w-1/2 rounded-xl focus:border-[#9E5338]"
            />
            <Button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="bg-[#221F1C] hover:bg-[#332f2b] text-white rounded-xl text-xs h-10 px-5 font-bold flex-1 flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <Upload className="size-4 text-[#F3EADF]" />
              <span>Select Photos from Device</span>
            </Button>
          </div>

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-5 text-center transition-all cursor-pointer ${
              isDragging
                ? 'border-[#9E5338] bg-[#F3EADF]/40 scale-[1.005]'
                : 'border-[#E8E2D9] bg-[#FBF8F4] hover:border-[#9E5338]/60 hover:bg-[#F3EADF]/20'
            }`}
          >
            <div className="flex flex-col items-center justify-center gap-1.5">
              <div className="size-9 rounded-full bg-[#F3EADF] text-[#9E5338] flex items-center justify-center">
                <ImageIcon className="size-4" />
              </div>
              <p className="text-xs font-semibold text-[#221F1C]">
                Drag & drop high-resolution captures here, or click to browse
              </p>
              <p className="text-[11px] text-[#6B6560]">
                Upload multiple JPG, PNG, or WEBP photos (up to 10MB each) directly from your phone or computer.
              </p>
            </div>
          </div>
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
