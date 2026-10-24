'use client';

import React from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Camera, Edit2, Trash2, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { Service } from './constants';

interface ServiceCardProps {
  service: Service;
  index: number;
  onEdit: (service: Service) => void;
  onDelete: (serviceId: string) => void;
  onOpenPhotoManager: (service: Service) => void;
}

export default function ServiceCard({
  service,
  index,
  onEdit,
  onDelete,
  onOpenPhotoManager
}: ServiceCardProps) {
  const primaryThumb =
    service.images && service.images.length > 0
      ? service.images.find((i) => i.is_primary)?.url ||
        service.images[0]?.url ||
        service.images[0]?.thumbnail_url
      : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.05 }}
      className="p-6 rounded-2xl border border-[#E8E2D9] bg-white hover:border-[#9E5338]/40 hover:shadow-md transition-all group flex flex-col justify-between"
    >
      <div>
        <div className="flex justify-between items-start mb-3">
          <div className="size-10 rounded-xl bg-[#F3EADF] border border-[#E8E2D9] flex items-center justify-center text-[#9E5338]">
            <Briefcase className="size-5" />
          </div>

          <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={() => onOpenPhotoManager(service)}
              className="p-2 rounded-full text-[#6B6560] hover:text-[#9E5338] hover:bg-[#F3EADF] transition-colors cursor-pointer"
              title="Manage Real Service Photos"
              aria-label="Manage Real Service Photos"
            >
              <Camera className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onEdit(service)}
              className="p-2 rounded-full text-[#6B6560] hover:text-[#9E5338] hover:bg-[#F3EADF] transition-colors cursor-pointer"
              title="Edit Service"
              aria-label="Edit Service"
            >
              <Edit2 className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(service.id)}
              className="p-2 rounded-full text-[#6B6560] hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              title="Delete Service"
              aria-label="Delete Service"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
        </div>

        <div className="flex items-start gap-3 mb-2">
          {/* Thumbnail if service has photos */}
          {primaryThumb && (
            <div
              onClick={() => onOpenPhotoManager(service)}
              className="relative size-16 rounded-xl overflow-hidden border border-[#E8E2D9] bg-stone-100 shrink-0 cursor-pointer group/thumb"
              title="Click to view/manage photos"
            >
              <Image
                src={primaryThumb}
                alt={service.name}
                fill
                unoptimized
                className="object-cover group-hover/thumb:scale-105 transition-transform"
              />
              <span className="absolute bottom-0.5 right-0.5 px-1 rounded bg-black/75 text-white text-[8px] font-bold flex items-center gap-0.5">
                <Camera className="size-2" /> {service.images?.length || 0}
              </span>
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h4 className="text-base font-bold text-[#221F1C] tracking-tight group-hover:text-[#9E5338] transition-colors truncate">
              {service.name}
            </h4>
            {service.category?.name && (
              <span className="text-[10px] font-semibold text-[#9E5338] bg-[#F3EADF] px-2 py-0.5 rounded-full inline-block mt-0.5">
                {service.category.name}
              </span>
            )}
          </div>
        </div>

        <p className="text-xs text-[#6B6560] font-normal mb-3 line-clamp-2 leading-relaxed">
          {service.description}
        </p>

        {/* Real Photos indicator badge / CTA */}
        <div className="mb-4">
          {service.images && service.images.length > 0 ? (
            <button
              type="button"
              onClick={() => onOpenPhotoManager(service)}
              className="text-[11px] font-semibold text-[#9E5338] hover:underline flex items-center gap-1.5 cursor-pointer"
            >
              <Camera className="size-3" />
              <span>
                {service.images.length} real service {service.images.length === 1 ? 'photo' : 'photos'} uploaded
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onOpenPhotoManager(service)}
              className="text-[11px] font-medium text-[#6B6560] hover:text-[#9E5338] flex items-center gap-1.5 p-1.5 rounded-lg border border-dashed border-[#E8E2D9] hover:border-[#9E5338] bg-[#FAF7F2] w-full justify-center transition-colors cursor-pointer"
            >
              <Plus className="size-3 text-[#9E5338]" />
              <span>Add real service photos for better transparency</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-[#E8E2D9]">
        <div className="text-sm font-bold text-[#9E5338] flex items-center gap-1">
          <span>{service.formatted_price}</span>
        </div>

        <Badge
          className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border-none ${
            service.status === 'active'
              ? 'bg-[#F3EADF] text-[#9E5338]'
              : 'bg-[#E8E2D9]/50 text-[#6B6560]'
          }`}
        >
          {service.status}
        </Badge>
      </div>
    </motion.div>
  );
}
