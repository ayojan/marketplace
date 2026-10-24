'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Briefcase, Plus } from 'lucide-react';
import { Service } from './constants';
import ServiceCard from './ServiceCard';

interface ServiceListGridProps {
  services: Service[];
  onEdit: (service: Service) => void;
  onDelete: (serviceId: string) => void;
  onOpenPhotoManager: (service: Service) => void;
  onAddNew: () => void;
}

export default function ServiceListGrid({
  services,
  onEdit,
  onDelete,
  onOpenPhotoManager,
  onAddNew
}: ServiceListGridProps) {
  if (services.length === 0) {
    return (
      <div className="py-16 text-center border-2 border-dashed border-[#E8E2D9] bg-white rounded-3xl p-8">
        <div className="size-12 rounded-full bg-[#F3EADF] text-[#9E5338] flex items-center justify-center mx-auto mb-3">
          <Briefcase className="size-6" />
        </div>
        <h3 className="text-base font-serif text-[#221F1C] mb-1">No services listed yet</h3>
        <p className="text-xs text-[#6B6560] mb-4">
          Add your first service package to start receiving customer inquiries and bookings.
        </p>
        <Button
          onClick={onAddNew}
          className="rounded-full bg-[#9E5338] hover:bg-[#86442B] text-white text-xs font-semibold px-6 h-10 cursor-pointer"
        >
          <Plus className="mr-1.5 size-4" /> Add Service Now
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {services.map((service, index) => (
        <ServiceCard
          key={service.id}
          service={service}
          index={index}
          onEdit={onEdit}
          onDelete={onDelete}
          onOpenPhotoManager={onOpenPhotoManager}
        />
      ))}
    </div>
  );
}
