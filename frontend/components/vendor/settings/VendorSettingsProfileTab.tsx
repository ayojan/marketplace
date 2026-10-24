'use client';

import React from 'react';
import { CITIES } from '@/components/Header';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Instagram,
  Star,
  Check
} from 'lucide-react';
import { VendorSettingsFormData, ServiceCategory } from './constants';

interface VendorSettingsProfileTabProps {
  formData: VendorSettingsFormData;
  allCategories: ServiceCategory[];
  selectedCategoryIds: number[];
  primaryCategoryId: number | null;
  onChange: (field: string, value: any) => void;
  onToggleCategory: (catId: number) => void;
  onSetPrimaryCategory: (e: React.MouseEvent, catId: number) => void;
}

export default function VendorSettingsProfileTab({
  formData,
  allCategories,
  selectedCategoryIds,
  primaryCategoryId,
  onChange,
  onToggleCategory,
  onSetPrimaryCategory
}: VendorSettingsProfileTabProps) {
  return (
    <div className="bg-white border border-[#E8E2D9] rounded-2xl p-6 shadow-xs space-y-6">
      <div>
        <h3 className="text-base font-serif font-bold text-[#221F1C]">Business Identity & Presence</h3>
        <p className="text-xs text-[#6B6560] mt-0.5">
          Manage how your vendor brand appears to hosts across Ayoj marketplace searches.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-[#221F1C]">Brand / Studio Name</Label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#8C847C]" />
            <Input
              value={formData.business_name}
              onChange={(e) => onChange('business_name', e.target.value)}
              placeholder="e.g. The Wedding Narratives"
              className="pl-9 bg-[#FAF7F2]/60 border-[#E8E2D9] focus-visible:ring-[#9E5338] text-xs h-10"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-[#221F1C]">Primary Contact / Owner</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#8C847C]" />
            <Input
              value={formData.owner_name}
              onChange={(e) => onChange('owner_name', e.target.value)}
              placeholder="e.g. Aarav Sharma"
              className="pl-9 bg-[#FAF7F2]/60 border-[#E8E2D9] focus-visible:ring-[#9E5338] text-xs h-10"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-[#221F1C]">Business Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#8C847C]" />
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => onChange('email', e.target.value)}
              placeholder="contact@brand.in"
              className="pl-9 bg-[#FAF7F2]/60 border-[#E8E2D9] focus-visible:ring-[#9E5338] text-xs h-10"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-[#221F1C]">WhatsApp / Phone Number</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#8C847C]" />
            <Input
              value={formData.phone}
              onChange={(e) => onChange('phone', e.target.value)}
              placeholder="+91 98765 43210"
              className="pl-9 bg-[#FAF7F2]/60 border-[#E8E2D9] focus-visible:ring-[#9E5338] text-xs h-10"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-[#221F1C]">Operating Hub / City</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#8C847C]" />
            <select
              value={formData.location}
              onChange={(e) => onChange('location', e.target.value)}
              aria-label="Operating Hub / City"
              className="w-full pl-9 pr-4 bg-[#FAF7F2]/60 border border-[#E8E2D9] rounded-md text-xs h-10 text-[#221F1C] focus:outline-none focus:ring-1 focus:ring-[#9E5338]"
            >
              {CITIES.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-[#221F1C]">Years of Experience</Label>
          <Input
            type="number"
            min="0"
            max="60"
            value={formData.years_experience}
            onChange={(e) => onChange('years_experience', e.target.value)}
            className="bg-[#FAF7F2]/60 border-[#E8E2D9] focus-visible:ring-[#9E5338] text-xs h-10"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-[#221F1C]">Instagram Handle</Label>
          <div className="relative">
            <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#8C847C]" />
            <Input
              value={formData.instagram_handle}
              onChange={(e) => onChange('instagram_handle', e.target.value.replace('@', ''))}
              placeholder="weddingnarratives"
              className="pl-9 bg-[#FAF7F2]/60 border-[#E8E2D9] focus-visible:ring-[#9E5338] text-xs h-10"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-[#221F1C]">Official Portfolio / Website</Label>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#8C847C]" />
            <Input
              value={formData.website}
              onChange={(e) => onChange('website', e.target.value)}
              placeholder="https://weddingnarratives.in"
              className="pl-9 bg-[#FAF7F2]/60 border-[#E8E2D9] focus-visible:ring-[#9E5338] text-xs h-10"
            />
          </div>
        </div>
      </div>

      {/* Operating Categories Multiselect */}
      <div className="space-y-2.5 pt-4 border-t border-[#E8E2D9]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div>
            <Label className="text-xs font-semibold text-[#221F1C] flex items-center gap-2">
              Operating Categories
              <span className="text-[10px] font-semibold text-[#9E5338] bg-[#F3EADF] px-2 py-0.5 rounded-full border border-[#E8E2D9]">
                {selectedCategoryIds.length}/3 Selected
              </span>
            </Label>
            <p className="text-[11px] text-[#6B6560] mt-0.5">
              Select up to 3 service categories your business operates in. Designate 1 as <span className="font-semibold text-[#9E5338]">Primary (★)</span>.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 pt-1">
          {allCategories.map((cat) => {
            const isSelected = selectedCategoryIds.includes(cat.id);
            const isPrimary = primaryCategoryId === cat.id;

            return (
              <div
                key={cat.id}
                onClick={() => onToggleCategory(cat.id)}
                className={`relative p-3 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between gap-2 select-none ${
                  isSelected
                    ? 'border-[#9E5338] bg-[#FDF9F5] shadow-xs ring-1 ring-[#9E5338]/20'
                    : 'border-[#E8E2D9] bg-[#FAF7F2]/60 hover:bg-white text-[#6B6560]'
                }`}
              >
                <div className="flex items-start justify-between gap-1.5">
                  <span className={`text-xs font-medium leading-tight ${isSelected ? 'text-[#221F1C] font-semibold' : ''}`}>
                    {cat.name}
                  </span>
                  {isSelected && (
                    <div className="size-4 rounded-full bg-[#9E5338] text-white flex items-center justify-center shrink-0">
                      <Check className="size-2.5 stroke-[3]" />
                    </div>
                  )}
                </div>

                {isSelected && (
                  <div className="pt-1.5 border-t border-[#E8E2D9]/60 flex items-center justify-between">
                    {isPrimary ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#9E5338] bg-[#F3EADF] px-1.5 py-0.5 rounded">
                        <Star className="size-2.5 fill-[#9E5338]" /> Primary
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => onSetPrimaryCategory(e, cat.id)}
                        className="text-[10px] text-[#6B6560] hover:text-[#9E5338] hover:underline flex items-center gap-1 font-medium cursor-pointer"
                      >
                        <Star className="size-2.5" /> Make Primary
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-[#221F1C]">About Your Studio / Bio</Label>
        <Textarea
          rows={4}
          value={formData.description}
          onChange={(e) => onChange('description', e.target.value)}
          placeholder="Tell clients about your creative philosophy, team experience, equipment, and event coverage style..."
          className="bg-[#FAF7F2]/60 border-[#E8E2D9] focus-visible:ring-[#9E5338] text-xs resize-none"
        />
        <p className="text-[10px] text-[#6B6560]">
          Minimum 50 characters recommended to build buyer trust on the marketplace.
        </p>
      </div>
    </div>
  );
}
