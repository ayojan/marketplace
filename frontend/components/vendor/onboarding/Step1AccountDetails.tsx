'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Lock, ShieldCheck, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { OnboardingAccountData } from './constants';

interface Step1AccountDetailsProps {
  accountData: OnboardingAccountData;
  setAccountData: React.Dispatch<React.SetStateAction<OnboardingAccountData>>;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  showConfirmPassword: boolean;
  setShowConfirmPassword: (show: boolean) => void;
}

export default function Step1AccountDetails({
  accountData,
  setAccountData,
  onSubmit,
  isSubmitting,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword
}: Step1AccountDetailsProps) {
  return (
    <motion.div
      key="step-1"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="bg-white border border-[#E8E2D9] rounded-2xl p-6 sm:p-9 shadow-sm"
    >
      <div className="mb-6">
        <Badge variant="outline" className="bg-[#F3EADF] text-[#9E5338] border-[#E8E2D9] mb-2 font-semibold text-[11px]">
          Step 1 — Required Account Details
        </Badge>
        <h2 className="text-2xl sm:text-3xl font-serif font-normal text-[#221F1C]">
          Create Your Vendor Account
        </h2>
        <p className="text-xs sm:text-sm text-[#6B6560] mt-1">
          Start by establishing your partner login. You will collect your business listing details in the next steps.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {/* Names */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="firstName" className="text-xs font-bold text-[#221F1C]">
              Owner First Name <span className="text-rose-500">*</span>
            </Label>
            <div className="relative">
              <User className="size-4 text-[#6B6560] absolute left-3 top-3" />
              <Input
                id="firstName"
                required
                value={accountData.firstName}
                onChange={(e) => setAccountData({ ...accountData, firstName: e.target.value })}
                placeholder="e.g. Aarav"
                className="pl-9 bg-[#FBF8F4] border-[#E8E2D9] focus:border-[#9E5338] rounded-xl text-xs sm:text-sm h-10"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="lastName" className="text-xs font-bold text-[#221F1C]">
              Owner Last Name <span className="text-rose-500">*</span>
            </Label>
            <div className="relative">
              <User className="size-4 text-[#6B6560] absolute left-3 top-3" />
              <Input
                id="lastName"
                required
                value={accountData.lastName}
                onChange={(e) => setAccountData({ ...accountData, lastName: e.target.value })}
                placeholder="e.g. Mehra"
                className="pl-9 bg-[#FBF8F4] border-[#E8E2D9] focus:border-[#9E5338] rounded-xl text-xs sm:text-sm h-10"
              />
            </div>
          </div>
        </div>

        {/* Mobile Number with OTP Verification Skip notice */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="phone" className="text-xs font-bold text-[#221F1C]">
              Mobile Number <span className="text-rose-500">*</span>
            </Label>
            <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
              <ShieldCheck className="size-3" /> OTP Verification Skipped (Auto-verified)
            </span>
          </div>
          <div className="relative flex items-center">
            <div className="absolute left-3 flex items-center gap-1 text-xs font-bold text-[#6B6560] border-r border-[#E8E2D9] pr-2 pointer-events-none">
              <span>🇮🇳</span>
              <span>+91</span>
            </div>
            <Input
              id="phone"
              type="tel"
              required
              value={accountData.phone}
              onChange={(e) => setAccountData({ ...accountData, phone: e.target.value })}
              placeholder="98765 43210"
              className="pl-20 bg-[#FBF8F4] border-[#E8E2D9] focus:border-[#9E5338] rounded-xl text-xs sm:text-sm h-10"
            />
          </div>
          <p className="text-[10px] text-[#6B6560]">
            Direct client inquiries, booking requests, and reminders will be notified to this mobile number.
          </p>
        </div>

        {/* Email Address */}
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs font-bold text-[#221F1C]">
            Email Address <span className="text-rose-500">*</span>
          </Label>
          <div className="relative">
            <Mail className="size-4 text-[#6B6560] absolute left-3 top-3" />
            <Input
              id="email"
              type="email"
              required
              value={accountData.email}
              onChange={(e) => setAccountData({ ...accountData, email: e.target.value })}
              placeholder="studio@weddingnarratives.com"
              className="pl-9 bg-[#FBF8F4] border-[#E8E2D9] focus:border-[#9E5338] rounded-xl text-xs sm:text-sm h-10"
            />
          </div>
        </div>

        {/* Password Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs font-bold text-[#221F1C]">
              Password <span className="text-rose-500">*</span>
            </Label>
            <div className="relative">
              <Lock className="size-4 text-[#6B6560] absolute left-3 top-3" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                value={accountData.password}
                onChange={(e) => setAccountData({ ...accountData, password: e.target.value })}
                placeholder="Minimum 8 characters"
                className="pl-9 pr-9 bg-[#FBF8F4] border-[#E8E2D9] focus:border-[#9E5338] rounded-xl text-xs sm:text-sm h-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-[#6B6560] hover:text-[#221F1C]"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="passwordConfirmation" className="text-xs font-bold text-[#221F1C]">
              Confirm Password <span className="text-rose-500">*</span>
            </Label>
            <div className="relative">
              <Lock className="size-4 text-[#6B6560] absolute left-3 top-3" />
              <Input
                id="passwordConfirmation"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                minLength={8}
                value={accountData.passwordConfirmation}
                onChange={(e) => setAccountData({ ...accountData, passwordConfirmation: e.target.value })}
                placeholder="Re-enter password"
                className="pl-9 pr-9 bg-[#FBF8F4] border-[#E8E2D9] focus:border-[#9E5338] rounded-xl text-xs sm:text-sm h-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3 text-[#6B6560] hover:text-[#221F1C]"
              >
                {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="pt-4 flex items-center justify-end">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-[#9E5338] hover:bg-[#85432c] text-white rounded-xl px-7 py-5 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-[#9E5338]/15"
          >
            {isSubmitting ? (
              'Creating Account...'
            ) : (
              <>
                <span>Create Account & Continue</span>
                <ArrowRight className="size-4" />
              </>
            )}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
