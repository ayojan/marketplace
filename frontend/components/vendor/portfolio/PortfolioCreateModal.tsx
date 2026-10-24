'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Camera, Star, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DEFAULT_CATEGORIES } from './presets';

interface PortfolioCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  newTitle: string;
  setNewTitle: (val: string) => void;
  newCategory: string;
  setNewCategory: (val: string) => void;
  newDescription: string;
  setNewDescription: (val: string) => void;
  newIsFeatured: boolean;
  setNewIsFeatured: (val: boolean) => void;
  stagedFiles: { file: File; previewUrl: string }[];
  onFilesSelected: (files: FileList | File[]) => void;
  onRemoveStagedPhoto: (index: number) => void;
  onSubmit: (e: React.FormEvent) => void;
  isUploading: boolean;
}

export default function PortfolioCreateModal({
  isOpen,
  onClose,
  newTitle,
  setNewTitle,
  newCategory,
  setNewCategory,
  newDescription,
  setNewDescription,
  newIsFeatured,
  setNewIsFeatured,
  stagedFiles,
  onFilesSelected,
  onRemoveStagedPhoto,
  onSubmit,
  isUploading
}: PortfolioCreateModalProps) {
  const modalFileInputRef = useRef<HTMLInputElement>(null);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="bg-white rounded-3xl border border-[#E8E2D9] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E2D9]">
              <div>
                <h2 className="text-xl font-serif font-bold text-[#221F1C]">
                  Create New Showcase
                </h2>
                <p className="text-xs text-[#6B6560] mt-0.5">
                  Add title, category, and review photos before publishing to your profile.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="size-8 rounded-full border border-[#E8E2D9] flex items-center justify-center text-[#6B6560] hover:text-[#221F1C] hover:bg-[#FAF7F2] transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Form Content */}
            <form onSubmit={onSubmit} className="space-y-5">
              {/* Showcase Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#221F1C] block">
                  Showcase Title <span className="text-[#9E5338]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Royal Destination Wedding at Rambagh Palace"
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E8E2D9] rounded-xl text-xs text-[#221F1C] placeholder:text-[#6B6560] focus:outline-none focus:border-[#9E5338] transition-colors"
                />
              </div>

              {/* Category Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#221F1C] block">
                  Category <span className="text-[#9E5338]">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {DEFAULT_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setNewCategory(cat)}
                      className={`px-3 py-2 rounded-xl text-xs font-medium text-left transition-all border ${
                        newCategory === cat
                          ? 'bg-[#F5ECE2] border-[#9E5338] text-[#9E5338] font-bold shadow-xs'
                          : 'bg-[#FAF7F2] border-[#E8E2D9] text-[#221F1C] hover:bg-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Story / Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#221F1C] block">
                  Story & Client Vision <span className="text-xs font-normal text-[#6B6560]">(Optional)</span>
                </label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Highlight the ceremony venue, lighting conditions, or unique couple requirements..."
                  className="w-full p-3 bg-[#FAF7F2] border border-[#E8E2D9] rounded-xl text-xs text-[#221F1C] placeholder:text-[#6B6560] focus:outline-none focus:border-[#9E5338] transition-colors resize-none"
                />
              </div>

              {/* Staged Photos Preview Grid */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#221F1C]">
                    Photos Selected ({stagedFiles.length}/10)
                  </label>
                  <button
                    type="button"
                    onClick={() => modalFileInputRef.current?.click()}
                    className="text-xs font-semibold text-[#9E5338] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="size-3.5" /> Add More Photos
                  </button>
                  <input
                    ref={modalFileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files && onFilesSelected(e.target.files)}
                  />
                </div>

                {stagedFiles.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 p-3 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D9] max-h-56 overflow-y-auto">
                    {stagedFiles.map((item, idx) => (
                      <div
                        key={idx}
                        className="relative aspect-square rounded-xl overflow-hidden border border-[#E8E2D9] bg-white group"
                      >
                        <Image
                          src={item.previewUrl}
                          alt="preview"
                          fill
                          unoptimized
                          className="object-cover"
                        />
                        {idx === 0 && (
                          <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[8px] font-bold bg-[#9E5338] text-white">
                            Cover
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => onRemoveStagedPhoto(idx)}
                          className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white hover:bg-red-600 transition-colors cursor-pointer"
                        >
                          <X className="size-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    onClick={() => modalFileInputRef.current?.click()}
                    className="p-6 text-center border border-dashed border-[#E8E2D9] rounded-2xl bg-[#FAF7F2] cursor-pointer hover:border-[#9E5338]"
                  >
                    <Camera className="size-6 text-[#9E5338] mx-auto mb-1" />
                    <p className="text-xs text-[#221F1C] font-semibold">Click to select photos for this showcase</p>
                    <p className="text-[10px] text-[#6B6560]">JPEG, PNG, WebP up to 10MB</p>
                  </div>
                )}
              </div>

              {/* Featured Switch */}
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-[#E8E2D9] bg-[#FAF7F2]">
                <div>
                  <h4 className="text-xs font-bold text-[#221F1C] flex items-center gap-1.5">
                    <Star className="size-3.5 text-amber-500 fill-amber-500" />
                    Highlight as Featured Showcase
                  </h4>
                  <p className="text-[11px] text-[#6B6560] mt-0.5">
                    Pins this collection to the top banner of your public vendor storefront.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={newIsFeatured}
                  onChange={(e) => setNewIsFeatured(e.target.checked)}
                  className="size-4 accent-[#9E5338] cursor-pointer rounded"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E8E2D9]">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="rounded-full border-[#E8E2D9] text-xs h-9 px-5"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isUploading}
                  className="bg-[#9E5338] hover:bg-[#86442B] text-white rounded-full text-xs font-semibold h-9 px-6 shadow-xs gap-1.5"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" />
                      Uploading Media...
                    </>
                  ) : (
                    <>
                      <Check className="size-3.5" />
                      Publish Showcase
                    </>
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
