'use client';

import React from 'react';
import Image from 'next/image';
import { Camera, Check, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Service } from './types';

interface VendorPackagesSectionProps {
  services: Service[];
  selectedService: Service | null;
  onSelectService: (service: Service) => void;
  onViewService: (service: Service) => void;
}

export default function VendorPackagesSection({
  services,
  selectedService,
  onSelectService,
  onViewService,
}: VendorPackagesSectionProps) {
  return (
    <section id="packages" className="scroll-mt-28 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-serif font-bold text-[#221F1C]">Available Service Packages</h2>
          <p className="text-xs text-[#6B6560] mt-0.5">Click any service to view full details, deliverables, and inclusions</p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#FAF7F2] border border-[#E8E2D9] text-[#9E5338]">
          {services.length} {services.length === 1 ? 'Package' : 'Packages'}
        </span>
      </div>

      {services.length === 0 ? (
        <div className="p-8 rounded-2xl border border-dashed border-[#E8E2D9] text-center bg-white space-y-2">
          <p className="text-sm font-semibold text-[#221F1C]">No packages listed yet</p>
          <p className="text-xs text-[#6B6560]">This vendor has not published active service packages yet. You can still reach out via custom booking inquiry.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {services.map((service) => {
            const isSelected = selectedService?.id === service.id;
            const categoryName = service.category?.name || (service.categories && service.categories[0]?.name);
            const pricingLabel = service.pricing_type === 'hourly' ? '/ hr' : service.pricing_type === 'custom' ? 'Quote' : '';
            const primaryImg = service.images?.find((i) => i.is_primary)?.url || service.images?.[0]?.url;

            return (
              <div
                key={service.id}
                onClick={() => onViewService(service)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group ${
                  isSelected
                    ? 'bg-[#FAF7F2]/60 border-[#9E5338] ring-1 ring-[#9E5338] shadow-sm'
                    : 'bg-white border-[#E8E2D9] hover:border-[#9E5338]/50 hover:shadow-sm'
                }`}
              >
                <div className="flex items-start gap-4 flex-1">
                  {/* Real service image thumbnail if present */}
                  {primaryImg && (
                    <div className="relative size-18 sm:size-20 rounded-xl overflow-hidden border border-[#E8E2D9] bg-stone-100 shrink-0">
                      <Image
                        src={primaryImg}
                        alt={service.name}
                        fill
                        unoptimized
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {service.images && service.images.length > 1 && (
                        <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-md bg-black/70 text-white text-[9px] font-semibold backdrop-blur-xs flex items-center gap-0.5">
                          <Camera className="size-2.5" /> {service.images.length}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-serif font-bold text-[#221F1C] text-base hover:text-[#9E5338] transition-colors">
                        {service.name}
                      </h3>
                      {categoryName && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#F3EADF] text-[#9E5338]">
                          {categoryName}
                        </span>
                      )}
                      {service.pricing_type && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-stone-100 text-[#6B6560] capitalize">
                          {service.pricing_type}
                        </span>
                      )}
                      {isSelected && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#9E5338] text-white flex items-center gap-1">
                          <Check className="size-2.5" strokeWidth={3} /> Selected
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-[#6B6560] font-normal max-w-xl line-clamp-2 leading-relaxed">
                      {service.description}
                    </p>

                    {/* Key Deliverable Highlights */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1 text-[11px] text-[#221F1C]">
                      <div className="flex items-center gap-1.5">
                        <Check className="size-3 text-[#9E5338] shrink-0" strokeWidth={2.5} />
                        <span>Direct lead artist consultation</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Check className="size-3 text-[#9E5338] shrink-0" strokeWidth={2.5} />
                        <span>High-res deliverables & timeline milestones</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Check className="size-3 text-[#9E5338] shrink-0" strokeWidth={2.5} />
                        <span>Full setup & on-site technical execution</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Check className="size-3 text-emerald-600 shrink-0" strokeWidth={2.5} />
                        <span className="font-semibold text-emerald-800">0% Ayoj commission markup</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewService(service);
                        }}
                        className="text-xs font-semibold text-[#9E5338] hover:underline inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="size-3.5" />
                        <span>View Service Details</span>
                      </button>
                      <span className="text-stone-300">•</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectService(service);
                        }}
                        className={`text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                          isSelected ? 'text-[#9E5338]' : 'text-[#6B6560] hover:text-[#221F1C]'
                        }`}
                      >
                        {isSelected ? (
                          <>
                            <Check className="size-3.5 text-[#9E5338]" strokeWidth={2.5} />
                            <span>Selected for Booking</span>
                          </>
                        ) : (
                          <span>Select for Booking</span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="sm:text-right shrink-0 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 border-[#E8E2D9]">
                  <div>
                    <p className="text-[10px] font-bold text-[#6B6560] uppercase tracking-wider">
                      {service.pricing_type === 'custom' ? 'Pricing' : 'Starting at'}
                    </p>
                    <p className="text-xl font-bold text-[#221F1C]">
                      {service.pricing_type === 'custom'
                        ? 'Custom Quote'
                        : `₹${service.base_price?.toLocaleString() || '0'}${pricingLabel ? ` ${pricingLabel}` : ''}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewService(service);
                      }}
                      className="h-8 px-3 rounded-full text-xs font-medium border-[#E8E2D9] text-[#221F1C] hover:bg-[#FAF7F2] hover:border-[#9E5338]"
                    >
                      <Eye className="size-3 mr-1" />
                      Details
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectService(service);
                      }}
                      className={`h-8 px-3.5 rounded-full text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-[#9E5338] text-white hover:bg-[#85432B]'
                          : 'bg-white border border-[#9E5338] text-[#9E5338] hover:bg-[#9E5338] hover:text-white'
                      }`}
                    >
                      {isSelected ? 'Selected' : 'Select'}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
