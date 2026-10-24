'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building, IndianRupee, HelpCircle, Info } from 'lucide-react';
import { Service } from './constants';

interface BookingOrderSummarySidebarProps {
  service: Service | null;
  transactionId: string;
  numBasePrice: number;
  platformFee: number;
  totalAmount: number;
}

export default function BookingOrderSummarySidebar({
  service,
  transactionId,
  numBasePrice,
  platformFee,
  totalAmount
}: BookingOrderSummarySidebarProps) {
  const referenceCode = transactionId.replace(/:/g, '').slice(0, 8).toUpperCase() || 'AY-1092';

  return (
    <Card className="bg-white border border-[#E8E2D9] rounded-2xl sticky top-24 overflow-hidden shadow-sm">
      {/* Card Header */}
      <div className="p-5 bg-[#FAF7F2] border-b border-[#E8E2D9]">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#9E5338]">
            Booking Summary
          </span>
          <Badge className="bg-[#F3EADF] text-[#9E5338] border-[#E8E2D9] text-[10px] font-semibold py-0.5 px-2">
            Escrow Protected
          </Badge>
        </div>
        <p className="text-[10px] text-[#6B6560] mt-1">
          Ref: AY-{referenceCode}
        </p>
      </div>

      <CardContent className="p-6 space-y-6">
        {/* Service Overview Box */}
        <div className="p-3.5 rounded-xl bg-[#FBF8F4] border border-[#E8E2D9] space-y-1.5">
          <p className="font-serif font-bold text-[#221F1C] text-sm leading-snug">
            {service?.name}
          </p>
          <p className="text-xs text-[#6B6560] line-clamp-2 leading-relaxed">
            {service?.description || 'Professional event package with dedicated coordination.'}
          </p>
          {service?.vendor?.business_name && (
            <div className="pt-1 flex items-center gap-1.5 text-[11px] font-semibold text-[#9E5338]">
              <Building className="size-3" />
              <span>{service.vendor.business_name}</span>
            </div>
          )}
        </div>

        {/* Pricing Breakdown */}
        <div className="space-y-3 text-xs">
          <div className="flex justify-between items-center text-[#6B6560]">
            <span>Package Base Rate</span>
            <span className="font-semibold text-[#221F1C]">
              ₹{numBasePrice.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="flex justify-between items-center text-[#6B6560]">
            <span className="flex items-center gap-1">
              Ayoj Trust & Escrow Fee (5%)
              <HelpCircle className="size-3 text-[#6B6560]" />
            </span>
            <span className="font-semibold text-[#221F1C]">
              ₹{platformFee.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="pt-3 border-t border-[#E8E2D9]">
            <div className="flex justify-between items-baseline">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#6B6560]">Total Payable</p>
                <p className="text-[10px] text-emerald-700 font-medium">Includes all taxes & escrow hold</p>
              </div>
              <div className="text-2xl font-serif font-bold text-[#9E5338] flex items-center">
                <IndianRupee className="size-4.5 text-[#9E5338] -mr-0.5" strokeWidth={2.5} />
                <span>{totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Assurance & Trust Badges */}
        <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E8E2D9] space-y-2 text-xs">
          <div className="flex items-center gap-1.5 text-[#9E5338] font-bold text-[11px]">
            <Info className="size-3.5" />
            <span>Ayoj Booking Promises</span>
          </div>
          <ul className="space-y-1.5 text-[11px] text-[#6B6560]">
            <li className="flex items-center gap-2">
              <div className="size-1.5 rounded-full bg-[#9E5338]" />
              <span>Free cancellation within 48 hours</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="size-1.5 rounded-full bg-[#9E5338]" />
              <span>Vendor response guaranteed in ~2 hours</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="size-1.5 rounded-full bg-[#9E5338]" />
              <span>Funds protected until celebration ends</span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
