'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  BadgeCheck,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileText
} from 'lucide-react';
import { VendorSettingsFormData } from './types';

interface VendorSettingsVerificationTabProps {
  formData: VendorSettingsFormData;
  onChange: (field: string, value: any) => void;
  onRequestVerification: () => Promise<void>;
}

export default function VendorSettingsVerificationTab({
  formData,
  onChange,
  onRequestVerification
}: VendorSettingsVerificationTabProps) {
  return (
    <div className="bg-white border border-[#E8E2D9] rounded-2xl p-6 shadow-xs space-y-6">
      <div>
        <h3 className="text-base font-serif font-bold text-[#221F1C]">Ayoj Verified Partner Shield</h3>
        <p className="text-xs text-[#6B6560] mt-0.5">
          Verified pros receive the verified badge, enhanced search visibility, and priority booking placement.
        </p>
      </div>

      {/* Status Banner */}
      <div className={`p-4 rounded-xl border flex items-start gap-3.5 ${
        formData.verification_status === 'verified'
          ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
          : formData.verification_status === 'pending_verification'
            ? 'bg-amber-50/70 border-amber-200 text-amber-900'
            : 'bg-[#FAF7F2] border-[#E8E2D9] text-[#221F1C]'
      }`}>
        {formData.verification_status === 'verified' ? (
          <BadgeCheck className="size-6 text-emerald-600 shrink-0 mt-0.5" />
        ) : formData.verification_status === 'pending_verification' ? (
          <Clock className="size-6 text-amber-600 shrink-0 mt-0.5" />
        ) : (
          <ShieldCheck className="size-6 text-[#9E5338] shrink-0 mt-0.5" />
        )}
        <div>
          <h4 className="text-xs font-bold capitalize">
            Status: {formData.verification_status === 'verified' ? 'Ayoj Verified Partner' : formData.verification_status === 'pending_verification' ? 'Verification Review Pending' : 'Standard Profile (Unverified)'}
          </h4>
          <p className="text-[11px] opacity-90 mt-0.5">
            {formData.verification_status === 'verified'
              ? 'Your business identity, phone, and professional experience have been certified by Ayoj trust operations.'
              : formData.verification_status === 'pending_verification'
                ? 'Our trust team is reviewing your documents. You will receive an email update within 48 hours.'
                : 'Submit your GSTIN or business registration license to acquire the Verified Partner badge.'}
          </p>
        </div>
      </div>

      {/* Verification Checklist */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#6B6560]">
            Required Verification Standards
          </h4>
          <span className="text-[11px] text-[#9E5338] font-semibold">
            All 4 standards required for badge
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Standard 1: License */}
          <div className={`p-3.5 rounded-xl border flex items-start gap-3 ${
            formData.business_license?.trim() ? 'bg-emerald-50/50 border-emerald-200' : 'bg-[#FAF7F2] border-[#E8E2D9]'
          }`}>
            {formData.business_license?.trim() ? (
              <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="size-4 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div className="text-left min-w-0">
              <p className="text-xs font-bold text-[#221F1C]">1. Business Registration / GSTIN</p>
              <p className="text-[11px] text-[#6B6560] mt-0.5">
                {formData.business_license?.trim()
                  ? `GSTIN: ${formData.business_license}`
                  : 'Enter your valid GSTIN or MSME certificate number below.'}
              </p>
            </div>
          </div>

          {/* Standard 2: Contact & Location */}
          <div className={`p-3.5 rounded-xl border flex items-start gap-3 ${
            formData.phone?.trim() && formData.location?.trim() ? 'bg-emerald-50/50 border-emerald-200' : 'bg-[#FAF7F2] border-[#E8E2D9]'
          }`}>
            {formData.phone?.trim() && formData.location?.trim() ? (
              <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="size-4 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div className="text-left min-w-0">
              <p className="text-xs font-bold text-[#221F1C]">2. Contact & Base Location</p>
              <p className="text-[11px] text-[#6B6560] mt-0.5">
                {formData.phone?.trim() && formData.location?.trim()
                  ? `${formData.location} · ${formData.phone}`
                  : 'Set operational city and direct telephone in Basic Info.'}
              </p>
            </div>
          </div>

          {/* Standard 3: Profile Completeness */}
          <div className={`p-3.5 rounded-xl border flex items-start gap-3 ${
            (formData.description || '').trim().length >= 50 ? 'bg-emerald-50/50 border-emerald-200' : 'bg-[#FAF7F2] border-[#E8E2D9]'
          }`}>
            {(formData.description || '').trim().length >= 50 ? (
              <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="size-4 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div className="text-left min-w-0">
              <p className="text-xs font-bold text-[#221F1C]">3. Comprehensive Studio Profile</p>
              <p className="text-[11px] text-[#6B6560] mt-0.5">
                {(formData.description || '').trim().length >= 50
                  ? `Complete (${(formData.description || '').trim().length} chars bio)`
                  : 'Studio bio must be at least 50 characters long.'}
              </p>
            </div>
          </div>

          {/* Standard 4: Ayoj Curation Approval */}
          <div className={`p-3.5 rounded-xl border flex items-start gap-3 ${
            formData.verification_status === 'verified' ? 'bg-emerald-50/50 border-emerald-200' : 'bg-[#FAF7F2] border-[#E8E2D9]'
          }`}>
            {formData.verification_status === 'verified' ? (
              <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <Clock className="size-4 text-[#9E5338] shrink-0 mt-0.5" />
            )}
            <div className="text-left min-w-0">
              <p className="text-xs font-bold text-[#221F1C]">4. Ayoj Curation Team Review</p>
              <p className="text-[11px] text-[#6B6560] mt-0.5">
                {formData.verification_status === 'verified'
                  ? 'Certified and approved by platform trust operations.'
                  : formData.verification_status === 'pending_verification'
                    ? 'Documents submitted and currently under review.'
                    : 'Request official verification once items 1-3 are complete.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-2 border-t border-[#E8E2D9]">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-[#221F1C]">Business Registration / GSTIN Number</Label>
          <Input
            value={formData.business_license}
            onChange={(e) => onChange('business_license', e.target.value)}
            placeholder="e.g. 07AAAAA0000A1Z5"
            className="bg-[#FAF7F2]/60 border-[#E8E2D9] focus-visible:ring-[#9E5338] text-xs h-10 font-mono"
          />
          <p className="text-[10px] text-[#6B6560]">
            Government of India GSTIN or registered MSME certificate number for your vendor business.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-dashed border-[#E8E2D9] bg-[#FAF7F2]/50 text-center space-y-2">
          <FileText className="size-6 text-[#9E5338] mx-auto opacity-80" />
          <div>
            <p className="text-xs font-semibold text-[#221F1C]">Official Documentation & Review</p>
            <p className="text-[11px] text-[#6B6560]">
              Submit for manual review. When approved, the Verified Partner badge will display automatically on your cards.
            </p>
          </div>
          {formData.verification_status !== 'verified' && (
            <Button
              type="button"
              onClick={onRequestVerification}
              disabled={formData.verification_status === 'pending_verification'}
              className="bg-[#9E5338] hover:bg-[#86442B] text-white rounded-full text-xs font-semibold h-9 px-5 shadow-xs cursor-pointer"
            >
              {formData.verification_status === 'pending_verification' ? 'Verification In Progress' : 'Request Official Verification'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
