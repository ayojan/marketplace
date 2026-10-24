'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check, CheckCircle2, Briefcase, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Step6CompletionCelebrationProps {
  businessName: string;
  baseCity: string;
  offeringsCount: number;
  onGoToDashboard: () => void;
  onExploreMarketplace: () => void;
}

export default function Step6CompletionCelebration({
  businessName,
  baseCity,
  offeringsCount,
  onGoToDashboard,
  onExploreMarketplace
}: Step6CompletionCelebrationProps) {
  return (
    <motion.div
      key="step-6"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white border border-[#E8E2D9] rounded-2xl p-8 sm:p-12 text-center shadow-lg max-w-2xl mx-auto space-y-6"
    >
      <div className="size-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-200 shadow-md">
        <Check className="size-10 stroke-[3]" />
      </div>

      <div className="space-y-2">
        <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-300 font-bold px-3 py-1">
          Onboarding Complete & Listing Live
        </Badge>
        <h2 className="text-3xl sm:text-4xl font-serif text-[#221F1C]">
          Welcome to Ayoj Partner Network!
        </h2>
        <p className="text-xs sm:text-sm text-[#6B6560] max-w-md mx-auto">
          Your professional listing for <strong className="text-[#221F1C]">{businessName || 'Your Studio'}</strong> is now published. Clients can discover your offerings in the marketplace.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left py-2">
        <div className="p-3 bg-[#FBF8F4] border border-[#E8E2D9] rounded-xl">
          <span className="text-[10px] text-[#6B6560] font-bold uppercase block">Status</span>
          <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 mt-0.5">
            <CheckCircle2 className="size-3" /> Live & Active
          </span>
        </div>

        <div className="p-3 bg-[#FBF8F4] border border-[#E8E2D9] rounded-xl">
          <span className="text-[10px] text-[#6B6560] font-bold uppercase block">Base City</span>
          <span className="text-xs font-bold text-[#221F1C] truncate block mt-0.5">
            {baseCity}
          </span>
        </div>

        <div className="p-3 bg-[#FBF8F4] border border-[#E8E2D9] rounded-xl">
          <span className="text-[10px] text-[#6B6560] font-bold uppercase block">Offerings</span>
          <span className="text-xs font-bold text-[#221F1C] block mt-0.5">
            {offeringsCount} Services
          </span>
        </div>

        <div className="p-3 bg-[#FBF8F4] border border-[#E8E2D9] rounded-xl">
          <span className="text-[10px] text-[#6B6560] font-bold uppercase block">Verification</span>
          <span className="text-xs font-bold text-[#9E5338] block mt-0.5">
            Under Review
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Button
          onClick={onGoToDashboard}
          className="w-full sm:w-auto bg-[#9E5338] hover:bg-[#85432c] text-white rounded-xl px-7 py-5 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-[#9E5338]/20"
        >
          <Briefcase className="size-4" />
          <span>Go to Vendor Dashboard</span>
        </Button>

        <Button
          variant="outline"
          onClick={onExploreMarketplace}
          className="w-full sm:w-auto border-[#E8E2D9] text-[#221F1C] hover:bg-[#F3EADF] rounded-xl px-7 py-5 font-bold text-xs sm:text-sm flex items-center justify-center gap-2"
        >
          <span>Explore Marketplace</span>
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </motion.div>
  );
}
