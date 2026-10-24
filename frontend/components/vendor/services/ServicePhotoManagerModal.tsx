'use client';

import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { X, Upload, Star, Trash2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Service } from './constants';

interface ServicePhotoManagerModalProps {
  service: Service | null;
  uploadingImages: boolean;
  onClose: () => void;
  onQuickUpload: (serviceId: string, e: React.ChangeEvent<HTMLInputElement>) => void;
  onSetPrimaryImage: (serviceId: string | number, imageId: number) => void;
  onDeleteImage: (serviceId: string | number, imageId: number) => void;
}

export default function ServicePhotoManagerModal({
  service,
  uploadingImages,
  onClose,
  onQuickUpload,
  onSetPrimaryImage,
  onDeleteImage
}: ServicePhotoManagerModalProps) {
  if (!service) return null;

  return (
    <AnimatePresence>
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-[#E8E2D9] overflow-hidden my-8 cursor-default"
        >
          {/* Header */}
          <div className="p-6 bg-[#FAF7F2] border-b border-[#E8E2D9] flex justify-between items-center">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#9E5338]">
                Real Service Photos
              </span>
              <h3 className="text-lg font-serif font-bold text-[#221F1C]">
                {service.name}
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="size-8 rounded-full bg-white hover:bg-[#F3EADF] border border-[#E8E2D9] flex items-center justify-center text-[#221F1C] cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-5 max-h-[65vh] overflow-y-auto">
            <p className="text-xs text-[#6B6560]">
              High-quality real photos of your actual work, equipment, and setups give customers full transparency and improve trust.
            </p>

            {/* Direct Upload button */}
            <div className="border-2 border-dashed border-[#E8E2D9] hover:border-[#9E5338] bg-[#FBF8F4] rounded-2xl p-4 text-center transition-colors">
              <input
                type="file"
                id="quick-photo-upload"
                multiple
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => onQuickUpload(service.id, e)}
                className="hidden"
                disabled={uploadingImages}
              />
              <label
                htmlFor="quick-photo-upload"
                className={`flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                  uploadingImages ? 'opacity-50 pointer-events-none' : ''
                }`}
              >
                {uploadingImages ? (
                  <Loader2 className="size-5 text-[#9E5338] animate-spin" />
                ) : (
                  <Upload className="size-5 text-[#9E5338]" />
                )}
                <span className="text-xs font-semibold text-[#221F1C]">
                  {uploadingImages ? 'Uploading photos...' : 'Upload real photos for this service'}
                </span>
                <span className="text-[10px] text-[#6B6560]">
                  JPG, PNG, WebP up to 10MB
                </span>
              </label>
            </div>

            {/* Photos Grid */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[#6B6560] uppercase tracking-wider">
                Uploaded Photos ({service.images?.length || 0})
              </h4>

              {!service.images || service.images.length === 0 ? (
                <div className="p-6 rounded-2xl border border-dashed border-[#E8E2D9] text-center bg-stone-50 text-xs text-[#6B6560]">
                  No photos uploaded for this service yet. Add photos above to showcase your real services.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {service.images.map((img) => (
                    <div
                      key={img.id}
                      className="relative aspect-square rounded-xl overflow-hidden border border-[#E8E2D9] group bg-stone-100"
                    >
                      <Image
                        src={img.url || img.thumbnail_url || img.medium_url || ''}
                        alt={img.title || service.name}
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
                            onClick={() => onSetPrimaryImage(service.id, img.id)}
                            className="px-2 py-0.5 rounded-full bg-white/90 hover:bg-white text-[#221F1C] text-[10px] font-semibold transition-colors cursor-pointer"
                          >
                            Make Primary
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onDeleteImage(service.id, img.id)}
                          className="px-2 py-0.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-[10px] font-semibold transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Trash2 className="size-2.5" /> Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-stone-50 border-t border-[#E8E2D9] flex justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-full border-[#E8E2D9] text-xs font-semibold px-5 h-9"
            >
              Done
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
