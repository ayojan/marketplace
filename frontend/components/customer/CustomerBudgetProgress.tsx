'use client';

import React from 'react';
import { IndianRupee, PieChart, TrendingUp, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { CustomerProfileData } from './types';

const BUDGET_PRESETS = [
  { label: '₹1.5 Lakhs', value: 150000 },
  { label: '₹3 Lakhs', value: 300000 },
  { label: '₹5 Lakhs', value: 500000 },
  { label: '₹10 Lakhs', value: 1000000 },
  { label: '₹20 Lakhs+', value: 2000000 },
];

interface CustomerBudgetProgressProps {
  data: CustomerProfileData;
  onChange: (updated: Partial<CustomerProfileData>) => void;
  bookings: any[];
}

export default function CustomerBudgetProgress({
  data,
  onChange,
  bookings,
}: CustomerBudgetProgressProps) {
  const targetBudget = Number(data.totalBudget) || 300000;

  const totalSpent = React.useMemo(() => {
    return bookings.reduce((sum, b) => sum + (Number(b.total_amount) || 0), 0);
  }, [bookings]);

  const remaining = targetBudget - totalSpent;
  const spentPercent = Math.min(100, Math.round((totalSpent / targetBudget) * 100));

  return (
    <div className="bg-white rounded-3xl border border-[#E8E2D9] p-6 sm:p-8 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E2D9] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="size-8 rounded-full bg-[#F3EADF] text-[#9E5338] flex items-center justify-center">
              <PieChart className="size-4" />
            </span>
            <h3 className="font-serif font-bold text-lg text-[#221F1C]">
              Budget Planner &amp; Spend Allocator
            </h3>
          </div>
          <p className="text-xs text-[#6B6560] mt-1">
            Keep track of your total planned budget vs. confirmed studio bookings in real-time
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#FAF7F2] px-3.5 py-1.5 rounded-2xl border border-[#E8E2D9] text-xs font-bold text-[#221F1C]">
          <IndianRupee className="size-3.5 text-[#9E5338]" />
          <span>Committed: ₹{totalSpent.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Target Budget Presets and Input */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-[#221F1C] block">
          Target Planned Budget (₹ INR)
        </label>
        <div className="flex flex-wrap items-center gap-2">
          {BUDGET_PRESETS.map((preset) => {
            const isSelected = targetBudget === preset.value;
            return (
              <button
                key={preset.value}
                type="button"
                onClick={() => onChange({ totalBudget: preset.value })}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#9E5338] text-white border-[#9E5338] shadow-xs'
                    : 'bg-[#FAF7F2] text-[#6B6560] border-[#E8E2D9] hover:border-[#9E5338]/40 hover:text-[#221F1C]'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        <div className="relative max-w-xs mt-2">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#6B6560]">₹</span>
          <input
            type="number"
            min="10000"
            step="10000"
            value={targetBudget}
            onChange={(e) => onChange({ totalBudget: Number(e.target.value) || 0 })}
            className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-[#E8E2D9] bg-[#FAF7F2] text-xs font-bold text-[#221F1C] focus:outline-none focus:border-[#9E5338] transition-colors"
          />
        </div>
      </div>

      {/* Visual Spend Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D9]">
          <span className="text-[10px] font-bold text-[#6B6560] uppercase tracking-wider block">Planned Target</span>
          <p className="text-xl font-bold font-serif text-[#221F1C] mt-1">₹{targetBudget.toLocaleString('en-IN')}</p>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200">
          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Committed Spend</span>
          <p className="text-xl font-bold font-serif text-emerald-900 mt-1">₹{totalSpent.toLocaleString('en-IN')}</p>
          <span className="text-[10px] text-emerald-700">{spentPercent}% allocated</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E8E2D9]">
          <span className="text-[10px] font-bold text-[#6B6560] uppercase tracking-wider block">Remaining Balance</span>
          <p className={`text-xl font-bold font-serif mt-1 ${remaining < 0 ? 'text-rose-600' : 'text-[#221F1C]'}`}>
            ₹{remaining.toLocaleString('en-IN')}
          </p>
          <span className="text-[10px] text-[#6B6560]">
            {remaining < 0 ? 'Budget exceeded' : 'Available for open slots'}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5 pt-2">
        <div className="flex justify-between text-xs font-semibold">
          <span className="text-[#6B6560]">Allocation Meter</span>
          <span className="text-[#221F1C]">{spentPercent}% Committed</span>
        </div>
        <div className="w-full h-3 rounded-full bg-[#E8E2D9] overflow-hidden p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              spentPercent > 90 ? 'bg-amber-600' : 'bg-[#9E5338]'
            }`}
            style={{ width: `${spentPercent}%` }}
          />
        </div>
      </div>

      {/* Celebration Pro-Tips */}
      <div className="p-4 rounded-2xl bg-[#F3EADF]/40 border border-[#E8E2D9] space-y-2">
        <h4 className="text-xs font-bold text-[#9E5338] flex items-center gap-1.5 uppercase tracking-wider">
          <Sparkles className="size-3.5" /> Budget Allocation Guide for Indian Celebrations
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-[#221F1C]">
          <div><strong>📸 Photography:</strong> 15 – 20%</div>
          <div><strong>🌸 Decor &amp; Stage:</strong> 25 – 30%</div>
          <div><strong>💄 Bridal Makeup:</strong> 8 – 12%</div>
          <div><strong>🎵 Music &amp; DJ:</strong> 5 – 10%</div>
        </div>
      </div>
    </div>
  );
}
