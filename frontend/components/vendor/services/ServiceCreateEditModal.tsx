'use client';

import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Sparkles,
  X,
  Camera,
  Upload,
  Star,
  Trash2,
  Loader2,
  ShieldCheck
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Service, ServiceImageItem, ServiceFormData } from './constants';

interface ServiceCreateEditModalProps {
  editingService: Service | null;
  formData: ServiceFormData;
  categories: any[];
  vendorCategories: any[];
  error: string | null;
  loading: boolean;
  uploadingImages: boolean;
  existingImages: ServiceImageItem[];
  filePreviews: { file: File; previewUrl: string }[];
  onInputChange: (e: any) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveSelectedFile: (index: number) => void;
  onDeleteExistingImage: (serviceId: string | number, imageId: number) => void;
  onSetPrimaryImage: (serviceId: string | number, imageId: number) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export default function ServiceCreateEditModal({
  editingService,
  formData,
  categories,
  vendorCategories,
  error,
  loading,
  uploadingImages,
  existingImages,
  filePreviews,
  onInputChange,
  onFileSelect,
  onRemoveSelectedFile,
  onDeleteExistingImage,
  onSetPrimaryImage,
  onSubmit,
  onClose
}: ServiceCreateEditModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <div className="border border-[#E8E2D9] shadow-xl bg-[#FBF8F4] rounded-3xl p-6 sm:p-8">
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#E8E2D9]">
          <div className="flex items-center gap-2">
            <span className="size-8 rounded-full bg-[#F3EADF] flex items-center justify-center text-[#9E5338]">
              <Sparkles className="size-4" />
            </span>
            <div>
              <h3 className="text-xl font-serif text-[#221F1C]">
                {editingService ? 'Edit Service Listing' : 'Create New Service Listing'}
              </h3>
              <p className="text-xs text-[#6B6560] font-normal">
                Provide clear details to attract clients across the Ayoj marketplace
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full hover:bg-[#F3EADF] text-[#6B6560] cursor-pointer"
          >
            <X className="size-4" />
          </Button>
        </div>

        {error && (
          <div className="mb-6 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl flex items-center gap-2 font-medium">
            <X className="size-4 shrink-0 text-red-500" /> {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-5">
          {/* Name & Category Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <Label className="font-bold text-xs uppercase tracking-wider text-[#221F1C]">
                Service Name <span className="text-[#9E5338]">*</span>
              </Label>
              <Input
                name="name"
                value={formData.name}
                onChange={onInputChange}
                required
                className="h-11 rounded-2xl bg-white border-[#E8E2D9] text-[#221F1C] text-xs placeholder:text-[#6B6560]/50 focus-visible:ring-[#9E5338]"
                placeholder="e.g. Candid Wedding Photography (Full Day)"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="font-bold text-xs uppercase tracking-wider text-[#221F1C]">
                Category <span className="text-[#9E5338]">*</span>
              </Label>
              <select
                name="service_category_id"
                value={formData.service_category_id}
                onChange={onInputChange}
                required
                className="w-full h-11 rounded-2xl border border-[#E8E2D9] bg-white px-3.5 text-xs text-[#221F1C] focus:outline-none focus:ring-1 focus:ring-[#9E5338] cursor-pointer"
              >
                <option value="">Select a service category</option>
                {vendorCategories.length > 0 ? (
                  <>
                    <optgroup label="Your Operating Categories">
                      {vendorCategories.map((vc: any) => (
                        <option key={`vc-${vc.id}`} value={vc.id}>
                          {vc.name} {vc.is_primary ? '★ (Primary Trade)' : ''}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Other Categories">
                      {categories
                        .filter((c: any) => !vendorCategories.some((vc: any) => vc.id === c.id))
                        .map((cat: any) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                    </optgroup>
                  </>
                ) : (
                  categories.map((cat: any) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <Label className="font-bold text-xs uppercase tracking-wider text-[#221F1C]">
                Description <span className="text-[#9E5338]">*</span>
              </Label>
              <span
                className={`text-[11px] font-medium ${
                  formData.description.length > 0 && formData.description.length < 50
                    ? 'text-[#9E5338]'
                    : 'text-[#6B6560]'
                }`}
              >
                {formData.description.length < 50
                  ? `${50 - formData.description.length} more chars needed`
                  : 'Minimum requirement met'}
              </span>
            </div>
            <Textarea
              name="description"
              value={formData.description}
              onChange={onInputChange}
              required
              minLength={50}
              maxLength={2000}
              className="rounded-2xl min-h-[110px] bg-white border-[#E8E2D9] text-[#221F1C] text-xs placeholder:text-[#6B6560]/50 focus-visible:ring-[#9E5338] p-3.5 resize-none"
              placeholder="Detail what is included in this package (minimum 50 characters, e.g. deliverables, equipment, team size, duration)..."
            />
            <div className="flex justify-end px-1">
              <span className="text-[11px] text-[#6B6560] font-medium">
                {formData.description.length}/2000 characters
              </span>
            </div>
          </div>

          {/* Pricing Type, Base Price, & Status Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="space-y-1.5">
              <Label className="font-bold text-xs uppercase tracking-wider text-[#221F1C]">
                Pricing Model
              </Label>
              <select
                name="pricing_type"
                value={formData.pricing_type}
                onChange={onInputChange}
                className="w-full h-11 rounded-2xl border border-[#E8E2D9] bg-white px-3.5 text-xs text-[#221F1C] focus:outline-none focus:ring-1 focus:ring-[#9E5338] cursor-pointer"
              >
                <option value="hourly">Hourly Rate</option>
                <option value="package">Package Deal</option>
                <option value="custom">Custom Quote</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="font-bold text-xs uppercase tracking-wider text-[#221F1C]">
                Base Price (₹) {formData.pricing_type !== 'custom' && <span className="text-[#9E5338]">*</span>}
              </Label>
              <Input
                type="number"
                name="base_price"
                value={formData.base_price}
                onChange={onInputChange}
                required={formData.pricing_type !== 'custom'}
                min={1}
                className="h-11 rounded-2xl bg-white border-[#E8E2D9] text-[#221F1C] text-xs placeholder:text-[#6B6560]/50 focus-visible:ring-[#9E5338]"
                placeholder={formData.pricing_type === 'custom' ? 'Optional for custom quotes' : 'e.g. 50000'}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="font-bold text-xs uppercase tracking-wider text-[#221F1C]">
                Visibility Status
              </Label>
              <select
                name="status"
                value={formData.status}
                onChange={onInputChange}
                className="w-full h-11 rounded-2xl border border-[#E8E2D9] bg-white px-3.5 text-xs text-[#221F1C] focus:outline-none focus:ring-1 focus:ring-[#9E5338] cursor-pointer"
              >
                <option value="draft">Draft (Hidden)</option>
                <option value="active">Active (Visible)</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Real Service Showcase Images Section */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <div>
                <Label className="font-bold text-xs uppercase tracking-wider text-[#221F1C] flex items-center gap-1.5">
                  <Camera className="size-3.5 text-[#9E5338]" />
                  Real Service Photos & Showcase <span className="text-[#6B6560] font-normal text-[11px]">(Better Transparency)</span>
                </Label>
                <p className="text-[11px] text-[#6B6560] mt-0.5">
                  Upload real photographs of your actual work, equipment, setups, or deliverable highlights for this service.
                </p>
              </div>
              {(existingImages.length > 0 || filePreviews.length > 0) && (
                <span className="text-[10px] font-semibold text-[#9E5338] bg-[#F3EADF] px-2.5 py-0.5 rounded-full shrink-0">
                  {existingImages.length + filePreviews.length} Total Photos
                </span>
              )}
            </div>

            {/* Upload Dropzone */}
            <div className="border-2 border-dashed border-[#E8E2D9] hover:border-[#9E5338] bg-white rounded-2xl p-4 sm:p-5 text-center transition-colors">
              <input
                type="file"
                id="service-images-input"
                multiple
                accept="image/jpeg,image/png,image/webp"
                onChange={onFileSelect}
                className="hidden"
              />
              <label
                htmlFor="service-images-input"
                className="cursor-pointer flex flex-col items-center justify-center gap-2 group"
              >
                <div className="size-10 rounded-full bg-[#FAF7F2] group-hover:bg-[#F3EADF] text-[#9E5338] flex items-center justify-center transition-colors">
                  <Upload className="size-5" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-[#221F1C] group-hover:text-[#9E5338] transition-colors">
                    Click to browse or drag real service photos
                  </span>
                  <p className="text-[10px] text-[#6B6560]">
                    Supports JPEG, PNG, WebP up to 10MB per image
                  </p>
                </div>
              </label>
            </div>

            {/* Existing Photos List (When editing) */}
            {existingImages.length > 0 && (
              <div className="space-y-2 pt-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#6B6560]">
                  Current Service Photos ({existingImages.length})
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {existingImages.map((img) => (
                    <div
                      key={img.id}
                      className="relative aspect-square rounded-xl overflow-hidden border border-[#E8E2D9] group bg-stone-100"
                    >
                      <Image
                        src={img.url || img.thumbnail_url || img.medium_url || ''}
                        alt={img.title || 'Service photo'}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                      {img.is_primary && (
                        <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-[#9E5338] text-white text-[9px] font-bold shadow-xs flex items-center gap-0.5">
                          <Star className="size-2.5 fill-white" /> Primary
                        </span>
                      )}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-1">
                        {!img.is_primary && (
                          <button
                            type="button"
                            onClick={() => onSetPrimaryImage(editingService!.id, img.id)}
                            className="px-2 py-0.5 rounded-full bg-white/90 hover:bg-white text-[#221F1C] text-[10px] font-semibold transition-colors cursor-pointer"
                          >
                            Make Primary
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onDeleteExistingImage(editingService!.id, img.id)}
                          className="px-2 py-0.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-[10px] font-semibold transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Trash2 className="size-2.5" /> Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Staged New Uploads Preview */}
            {filePreviews.length > 0 && (
              <div className="space-y-2 pt-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#6B6560]">
                  New Photos to Upload on Save ({filePreviews.length})
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {filePreviews.map((preview, index) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-xl overflow-hidden border border-[#9E5338]/40 ring-1 ring-[#9E5338]/30 group bg-stone-100"
                    >
                      <Image
                        src={preview.previewUrl}
                        alt={preview.file.name}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => onRemoveSelectedFile(index)}
                        className="absolute top-1.5 right-1.5 size-6 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center transition-colors cursor-pointer"
                        title="Remove photo"
                      >
                        <X className="size-3" />
                      </button>
                      <span className="absolute bottom-1.5 left-1.5 right-1.5 truncate text-[9px] font-medium text-white bg-black/60 px-1 py-0.5 rounded backdrop-blur-xs">
                        {preview.file.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-[#E8E2D9]">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-full border border-[#E8E2D9] bg-white text-[#221F1C] hover:bg-[#F3EADF] text-xs font-semibold px-6 h-11 cursor-pointer transition-colors"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || uploadingImages}
              className="rounded-full bg-[#9E5338] hover:bg-[#86442B] text-white text-xs font-semibold px-7 h-11 cursor-pointer shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              {loading || uploadingImages ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> {uploadingImages ? 'Uploading photos...' : 'Saving...'}
                </>
              ) : (
                <>
                  <ShieldCheck className="size-4" /> Save Service
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
