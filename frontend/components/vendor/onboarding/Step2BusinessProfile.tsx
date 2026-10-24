'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Building2, User, Check, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { OnboardingProfileData } from './constants';

interface Step2BusinessProfileProps {
  profileData: OnboardingProfileData;
  setProfileData: React.Dispatch<React.SetStateAction<OnboardingProfileData>>;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  isVendorAuthenticated: boolean;
  onBack: () => void;
}

export default function Step2BusinessProfile({
  profileData,
  setProfileData,
  onSubmit,
  isSubmitting,
  isVendorAuthenticated,
  onBack
}: Step2BusinessProfileProps) {
  const descriptionLength = profileData.description.trim().length;

  return (
    <motion.div
      key="step-2"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="bg-white border border-[#E8E2D9] rounded-2xl p-6 sm:p-9 shadow-sm"
    >
      <div className="mb-6">
        <Badge variant="outline" className="bg-[#F3EADF] text-[#9E5338] border-[#E8E2D9] mb-2 font-semibold text-[11px]">
          Step 2 — Required to Publish Listing
        </Badge>
        <h2 className="text-2xl sm:text-3xl font-serif font-normal text-[#221F1C]">
          Business Profile & Identity
        </h2>
        <p className="text-xs sm:text-sm text-[#6B6560] mt-1">
          Help prospective couples and celebration planners understand who you are and why they should choose you.
        </p>
      </div>

      {isVendorAuthenticated && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl p-3.5 flex items-center gap-3 text-xs">
          <div className="size-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
            <Check className="size-3.5 stroke-[3]" />
          </div>
          <div>
            <p className="font-bold">Account Created Successfully!</p>
            <p className="text-emerald-700 text-[11px]">Your login credentials are saved. Complete your business profile below to get your showcase live on Ayoj.</p>
          </div>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-5">
        {/* Business Name */}
        <div className="space-y-1.5">
          <Label htmlFor="businessName" className="text-xs font-bold text-[#221F1C]">
            Business or Display Name <span className="text-rose-500">*</span>
          </Label>
          <div className="relative">
            <Building2 className="size-4 text-[#6B6560] absolute left-3 top-3" />
            <Input
              id="businessName"
              required
              value={profileData.businessName}
              onChange={(e) => setProfileData({ ...profileData, businessName: e.target.value })}
              placeholder="e.g. The Wedding Narratives Studio"
              className="pl-9 bg-[#FBF8F4] border-[#E8E2D9] focus:border-[#9E5338] rounded-xl text-xs sm:text-sm h-10"
            />
          </div>
        </div>

        {/* Vendor Type Selection Cards */}
        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-[#221F1C]">
            Vendor Type <span className="text-rose-500">*</span>
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div
              onClick={() => setProfileData({ ...profileData, vendorType: 'individual' })}
              className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                profileData.vendorType === 'individual'
                  ? 'border-[#9E5338] bg-[#F3EADF]/40 shadow-xs'
                  : 'border-[#E8E2D9] bg-[#FBF8F4] hover:bg-[#F3EADF]/20'
              }`}
            >
              <div className={`p-2 rounded-lg ${profileData.vendorType === 'individual' ? 'bg-[#9E5338] text-white' : 'bg-white text-[#6B6560] border border-[#E8E2D9]'}`}>
                <User className="size-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#221F1C]">Solo Professional / Freelancer</h4>
                <p className="text-[11px] text-[#6B6560] mt-0.5">Independent artist operating personally</p>
              </div>
            </div>

            <div
              onClick={() => setProfileData({ ...profileData, vendorType: 'business' })}
              className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                profileData.vendorType === 'business'
                  ? 'border-[#9E5338] bg-[#F3EADF]/40 shadow-xs'
                  : 'border-[#E8E2D9] bg-[#FBF8F4] hover:bg-[#F3EADF]/20'
              }`}
            >
              <div className={`p-2 rounded-lg ${profileData.vendorType === 'business' ? 'bg-[#9E5338] text-white' : 'bg-white text-[#6B6560] border border-[#E8E2D9]'}`}>
                <Building2 className="size-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#221F1C]">Studio / Agency / Company</h4>
                <p className="text-[11px] text-[#6B6560] mt-0.5">Multi-crew team, registered company or studio</p>
              </div>
            </div>
          </div>
        </div>

        {/* Short Description */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="description" className="text-xs font-bold text-[#221F1C]">
              Short Bio / About Your Services <span className="text-rose-500">*</span>
            </Label>
            <div className="flex items-center gap-2">
              <span className={`text-[11px] font-medium ${descriptionLength >= 50 ? 'text-emerald-600' : 'text-amber-600'}`}>
                {descriptionLength}/50 min characters
              </span>
              <button
                type="button"
                onClick={() =>
                  setProfileData({
                    ...profileData,
                    description:
                      'Award-winning luxury wedding and celebration studio capturing timeless moments, royal rituals, and modern aesthetics across India with world-class equipment and passionate artistry.'
                  })
                }
                className="text-[10px] text-[#9E5338] hover:underline font-bold"
              >
                ✨ Insert sample bio
              </button>
            </div>
          </div>
          <Textarea
            id="description"
            required
            rows={4}
            value={profileData.description}
            onChange={(e) => setProfileData({ ...profileData, description: e.target.value })}
            placeholder="Describe your signature style, background, what makes your services unique, and how you work with clients on their special day..."
            className="bg-[#FBF8F4] border-[#E8E2D9] focus:border-[#9E5338] rounded-xl text-xs sm:text-sm p-3 resize-none"
          />
        </div>

        {/* Years Experience & Profile Image URL */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="yearsExp" className="text-xs font-bold text-[#221F1C]">
              Years of Experience (Optional)
            </Label>
            <Input
              id="yearsExp"
              type="number"
              min={0}
              max={50}
              value={profileData.yearsExperience}
              onChange={(e) => setProfileData({ ...profileData, yearsExperience: parseInt(e.target.value) || 0 })}
              className="bg-[#FBF8F4] border-[#E8E2D9] focus:border-[#9E5338] rounded-xl text-xs sm:text-sm h-10"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="logoUrl" className="text-xs font-bold text-[#221F1C]">
              Profile / Studio Logo Image URL
            </Label>
            <Input
              id="logoUrl"
              type="url"
              value={profileData.profileImage}
              onChange={(e) => setProfileData({ ...profileData, profileImage: e.target.value })}
              placeholder="https://... (or leave blank for generated avatar)"
              className="bg-[#FBF8F4] border-[#E8E2D9] focus:border-[#9E5338] rounded-xl text-xs sm:text-sm h-10"
            />
          </div>
        </div>

        {/* Primary Location: City, State, PIN */}
        <div className="pt-2 border-t border-[#E8E2D9] space-y-3">
          <h4 className="text-xs font-bold text-[#221F1C] uppercase tracking-wider">
            Primary Business Location
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label htmlFor="city" className="text-[11px] font-bold text-[#6B6560]">City</Label>
              <Input
                id="city"
                required
                value={profileData.city}
                onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                placeholder="e.g. Delhi NCR"
                className="bg-[#FBF8F4] border-[#E8E2D9] rounded-xl text-xs h-9"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="state" className="text-[11px] font-bold text-[#6B6560]">State</Label>
              <Input
                id="state"
                required
                value={profileData.state}
                onChange={(e) => setProfileData({ ...profileData, state: e.target.value })}
                placeholder="e.g. Delhi"
                className="bg-[#FBF8F4] border-[#E8E2D9] rounded-xl text-xs h-9"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="pincode" className="text-[11px] font-bold text-[#6B6560]">PIN Code</Label>
              <Input
                id="pincode"
                required
                value={profileData.pincode}
                onChange={(e) => setProfileData({ ...profileData, pincode: e.target.value })}
                placeholder="e.g. 110001"
                className="bg-[#FBF8F4] border-[#E8E2D9] rounded-xl text-xs h-9"
              />
            </div>
          </div>
        </div>

        {/* Navigation CTA */}
        <div className="pt-4 flex items-center justify-between border-t border-[#E8E2D9]">
          {isVendorAuthenticated ? (
            <Link
              href="/vendor/dashboard"
              className="inline-flex items-center gap-1.5 text-xs text-[#6B6560] hover:text-[#221F1C] font-semibold py-2 px-3.5 rounded-xl border border-[#E8E2D9] hover:bg-[#F3EADF] transition-colors"
            >
              <ArrowLeft className="size-3.5" /> Save & Exit to Dashboard
            </Link>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="border-[#E8E2D9] text-[#6B6560] hover:text-[#221F1C] rounded-xl text-xs h-10 px-4"
            >
              <ArrowLeft className="size-3.5 mr-1.5" /> Back
            </Button>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-[#9E5338] hover:bg-[#85432c] text-white rounded-xl px-7 py-5 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-[#9E5338]/15"
          >
            {isSubmitting ? (
              'Saving...'
            ) : (
              <>
                <span>Save & Configure Offerings</span>
                <ArrowRight className="size-4" />
              </>
            )}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
