'use client';

import React from 'react';
import { 
  Sparkles, 
  Calendar as CalendarIcon, 
  MapPin, 
  Building, 
  Users, 
  Hash, 
  Heart,
  Clock,
  Compass
} from 'lucide-react';
import { CITIES } from '@/components/Header';
import { CustomerProfileData } from './types';

export const GUEST_COUNT_OPTIONS = [
  { id: 'under_100', label: 'Intimate (< 100 guests)' },
  { id: '100_250', label: 'Classic (100 – 250 guests)' },
  { id: '250_500', label: 'Grand (250 – 500 guests)' },
  { id: 'above_500', label: 'Regal Gathering (500+ guests)' },
];

export const VIBE_TAGS = [
  '📸 Candid & Storytelling',
  '👑 Royal & Grand Heritage',
  '🌿 Contemporary Minimalist',
  '✨ Bollywood Glam & High-Energy',
  '🌸 Bohemian & Pastel Tones',
  '🪔 Traditional Festive & Vedic',
  '🏙️ Modern Luxury Skyline',
  '🌊 Tropical & Beachside Vibe',
];

interface CelebrationPassportCardProps {
  data: CustomerProfileData;
  onChange: (updated: Partial<CustomerProfileData>) => void;
}

export default function CelebrationPassportCard({
  data,
  onChange,
}: CelebrationPassportCardProps) {
  const toggleVibe = (tag: string) => {
    const current = data.vibeTags || [];
    const next = current.includes(tag)
      ? current.filter((t) => t !== tag)
      : [...current, tag];
    onChange({ vibeTags: next });
  };

  const daysRemaining = React.useMemo(() => {
    if (!data.weddingDate) return null;
    const target = new Date(data.weddingDate).getTime();
    const today = new Date().getTime();
    const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : diff === 0 ? 0 : null;
  }, [data.weddingDate]);

  return (
    <div className="bg-white rounded-3xl border border-[#E8E2D9] p-6 sm:p-8 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E2D9] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="size-8 rounded-full bg-[#F3EADF] text-[#9E5338] flex items-center justify-center">
              <Compass className="size-4" />
            </span>
            <h3 className="font-serif font-bold text-lg text-[#221F1C]">
              Celebration Passport &amp; Vision
            </h3>
          </div>
          <p className="text-xs text-[#6B6560] mt-1">
            Defines your event identity, timeline, destination, and aesthetic vibe across all vendor quotes
          </p>
        </div>

        {daysRemaining !== null && (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D9] text-xs font-semibold text-[#9E5338]">
            <Clock className="size-3.5" />
            <span>{daysRemaining === 0 ? 'Event is Today!' : `${daysRemaining} days until celebration`}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Celebration Title / Couple Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#221F1C] flex items-center gap-1.5">
            <Heart className="size-3 text-[#9E5338]" /> Celebration / Couple Title
          </label>
          <input
            type="text"
            placeholder="e.g. Pooja & Rohan's Shaadi"
            value={data.coupleName}
            onChange={(e) => onChange({ coupleName: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E2D9] bg-[#FAF7F2] text-xs text-[#221F1C] focus:outline-none focus:border-[#9E5338] transition-colors"
          />
          <span className="text-[10px] text-[#6B6560]">Appears on your booking contracts & inquiries</span>
        </div>

        {/* Custom Event Hashtag */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#221F1C] flex items-center gap-1.5">
            <Hash className="size-3 text-[#9E5338]" /> Event Hashtag
          </label>
          <input
            type="text"
            placeholder="e.g. #PoojaKiShaadi"
            value={data.hashtag}
            onChange={(e) => onChange({ hashtag: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E2D9] bg-[#FAF7F2] text-xs text-[#221F1C] focus:outline-none focus:border-[#9E5338] transition-colors"
          />
          <span className="text-[10px] text-[#6B6560]">Shareable tag for photo albums & guest feeds</span>
        </div>

        {/* Event Type */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#221F1C] flex items-center gap-1.5">
            <Sparkles className="size-3 text-[#9E5338]" /> Event Occasion
          </label>
          <select
            value={data.eventType}
            onChange={(e) => onChange({ eventType: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E2D9] bg-[#FAF7F2] text-xs text-[#221F1C] focus:outline-none focus:border-[#9E5338] transition-colors cursor-pointer"
          >
            <option value="Wedding">Wedding / Shaadi</option>
            <option value="Pre-Wedding">Pre-Wedding / Engagement</option>
            <option value="Sangeet / Mehendi">Sangeet &amp; Mehendi Night</option>
            <option value="Birthday">Birthday Celebration</option>
            <option value="Anniversary">Milestone Anniversary</option>
            <option value="Baby Shower">Baby Shower / Godh Bharai</option>
            <option value="Corporate">Corporate Gala / Summit</option>
            <option value="Other">Other Celebration</option>
          </select>
        </div>

        {/* Target Event Date */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#221F1C] flex items-center gap-1.5">
            <CalendarIcon className="size-3 text-[#9E5338]" /> Target Event Date
          </label>
          <input
            type="date"
            value={data.weddingDate}
            min={new Date().toISOString().split('T')[0]}
            onChange={(e) => onChange({ weddingDate: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E2D9] bg-[#FAF7F2] text-xs text-[#221F1C] focus:outline-none focus:border-[#9E5338] transition-colors"
          />
        </div>

        {/* Primary City / Destination */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#221F1C] flex items-center gap-1.5">
            <MapPin className="size-3 text-[#9E5338]" /> Primary City / Destination
          </label>
          <select
            value={data.city}
            onChange={(e) => onChange({ city: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E2D9] bg-[#FAF7F2] text-xs text-[#221F1C] focus:outline-none focus:border-[#9E5338] transition-colors cursor-pointer"
          >
            {CITIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Venue Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#221F1C] flex items-center gap-1.5">
            <Building className="size-3 text-[#9E5338]" /> Venue / Resort Name
          </label>
          <input
            type="text"
            placeholder="e.g. The Leela Palace, Udaipur (or To be decided)"
            value={data.venueName}
            onChange={(e) => onChange({ venueName: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E2D9] bg-[#FAF7F2] text-xs text-[#221F1C] focus:outline-none focus:border-[#9E5338] transition-colors"
          />
        </div>
      </div>

      {/* Guest Count Options */}
      <div className="space-y-2 pt-2 border-t border-[#E8E2D9]">
        <label className="text-xs font-bold text-[#221F1C] flex items-center gap-1.5">
          <Users className="size-3.5 text-[#9E5338]" /> Estimated Guest Count
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {GUEST_COUNT_OPTIONS.map((opt) => {
            const isSelected = data.guestCount === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onChange({ guestCount: opt.id })}
                className={`p-2.5 rounded-xl border text-xs font-medium transition-all text-center cursor-pointer ${
                  isSelected
                    ? 'bg-[#9E5338] text-white border-[#9E5338] shadow-xs'
                    : 'bg-[#FAF7F2] text-[#6B6560] border-[#E8E2D9] hover:border-[#9E5338]/40 hover:text-[#221F1C]'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Celebration Vibe & Aesthetic Style Chips */}
      <div className="space-y-2 pt-2 border-t border-[#E8E2D9]">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-[#221F1C] flex items-center gap-1.5">
            <Sparkles className="size-3.5 text-[#9E5338]" /> Celebration Vibe &amp; Visual Style
          </label>
          <span className="text-[10px] text-[#6B6560]">Select all that match your mood</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {VIBE_TAGS.map((tag) => {
            const isSelected = data.vibeTags?.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleVibe(tag)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#F3EADF] text-[#9E5338] border-[#9E5338] font-bold shadow-2xs'
                    : 'bg-[#FAF7F2] text-[#6B6560] border-[#E8E2D9] hover:border-[#9E5338]/40 hover:text-[#221F1C]'
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
