'use client';

import React, { useState } from 'react';
import {
  Lock,
  Mail,
  User,
  Building,
  Eye,
  EyeOff,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import GoogleSignInButton from './GoogleSignInButton';

import { RegisterFormData } from './types';
export type { RegisterFormData };

interface AuthRegisterFormProps {
  role: 'customer' | 'vendor';
  onSubmit: (formData: RegisterFormData) => Promise<void>;
  isSubmitting?: boolean;
  error?: string | null;
  onClearError?: () => void;
}

export default function AuthRegisterForm({
  role,
  onSubmit,
  isSubmitting = false,
  error,
  onClearError
}: AuthRegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [formData, setFormData] = useState<RegisterFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    passwordConfirmation: '',
    businessName: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    if (error && onClearError) onClearError();
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.passwordConfirmation) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    await onSubmit(formData);
  };

  return (
    <div className="bg-white border border-[#E8E2D9] rounded-2xl p-6 sm:p-7 shadow-sm w-full relative z-10">
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-xs flex items-start gap-2.5 mb-4">
          <svg
            className="w-4 h-4 text-rose-500 shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <form className="space-y-3.5" onSubmit={handleFormSubmit}>
        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-3">
          <div className="group">
            <Label
              htmlFor="firstName"
              className="text-[#221F1C] font-semibold text-xs mb-1 block"
            >
              First Name
            </Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-3.5 w-3.5 text-[#6B6560]" />
              </div>
              <Input
                id="firstName"
                name="firstName"
                type="text"
                required
                className="pl-8 h-10 bg-[#FBF8F4] border-[#E8E2D9] rounded-xl focus:border-[#9E5338] text-xs text-[#221F1C] placeholder:text-[#6B6560]"
                placeholder="e.g. Priya"
                value={formData.firstName}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="group">
            <Label
              htmlFor="lastName"
              className="text-[#221F1C] font-semibold text-xs mb-1 block"
            >
              Last Name
            </Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-3.5 w-3.5 text-[#6B6560]" />
              </div>
              <Input
                id="lastName"
                name="lastName"
                type="text"
                required
                className="pl-8 h-10 bg-[#FBF8F4] border-[#E8E2D9] rounded-xl focus:border-[#9E5338] text-xs text-[#221F1C] placeholder:text-[#6B6560]"
                placeholder="e.g. Sharma"
                value={formData.lastName}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Vendor Specific Optional Business Name */}
        {role === 'vendor' && (
          <div className="group">
            <div className="flex items-center justify-between mb-1">
              <Label
                htmlFor="businessName"
                className="text-[#221F1C] font-semibold text-xs block"
              >
                Business or Brand Name
              </Label>
              <span className="text-[10px] text-[#6B6560] bg-[#F3EADF] px-1.5 py-0.5 rounded font-medium">
                Optional
              </span>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Building className="h-3.5 w-3.5 text-[#6B6560]" />
              </div>
              <Input
                id="businessName"
                name="businessName"
                type="text"
                className="pl-8 h-10 bg-[#FBF8F4] border-[#E8E2D9] rounded-xl focus:border-[#9E5338] text-xs text-[#221F1C] placeholder:text-[#6B6560]"
                placeholder="e.g. Royal Canvas Photography (or your name)"
                value={formData.businessName}
                onChange={handleChange}
              />
            </div>
          </div>
        )}

        {/* Email Address */}
        <div className="group">
          <Label
            htmlFor="email"
            className="text-[#221F1C] font-semibold text-xs mb-1 block"
          >
            {role === 'vendor' ? 'Business / Contact Email' : 'Email Address'}
          </Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-3.5 w-3.5 text-[#6B6560]" />
            </div>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="pl-8 h-10 bg-[#FBF8F4] border-[#E8E2D9] rounded-xl focus:border-[#9E5338] text-xs text-[#221F1C] placeholder:text-[#6B6560]"
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Password Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="group">
            <Label
              htmlFor="password"
              className="text-[#221F1C] font-semibold text-xs mb-1 block"
            >
              Password
            </Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-3.5 w-3.5 text-[#6B6560]" />
              </div>
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                className="pl-8 pr-9 h-10 bg-[#FBF8F4] border-[#E8E2D9] rounded-xl focus:border-[#9E5338] text-xs text-[#221F1C] placeholder:text-[#6B6560]"
                placeholder="Min. 8 chars"
                value={formData.password}
                onChange={handleChange}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-[#6B6560] hover:text-[#221F1C] cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="h-3.5 w-3.5" />
                ) : (
                  <Eye className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </div>

          <div className="group">
            <Label
              htmlFor="passwordConfirmation"
              className="text-[#221F1C] font-semibold text-xs mb-1 block"
            >
              Confirm Password
            </Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-3.5 w-3.5 text-[#6B6560]" />
              </div>
              <Input
                id="passwordConfirmation"
                name="passwordConfirmation"
                type={showConfirm ? 'text' : 'password'}
                autoComplete="new-password"
                required
                className="pl-8 pr-9 h-10 bg-[#FBF8F4] border-[#E8E2D9] rounded-xl focus:border-[#9E5338] text-xs text-[#221F1C] placeholder:text-[#6B6560]"
                placeholder="Re-enter password"
                value={formData.passwordConfirmation}
                onChange={handleChange}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-[#6B6560] hover:text-[#221F1C] cursor-pointer"
              >
                {showConfirm ? (
                  <EyeOff className="h-3.5 w-3.5" />
                ) : (
                  <Eye className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-11 rounded-full bg-[#9E5338] hover:bg-[#86442B] text-white font-medium text-xs transition-colors mt-2 shadow-xs cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              <span>Creating account...</span>
            </>
          ) : (
            <>
              {role === 'vendor' ? 'Register & Continue to Onboarding' : 'Create Account'}
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </>
          )}
        </Button>

        {role === 'vendor' && (
          <p className="text-[11px] text-[#6B6560] text-center pt-1 font-normal">
            ✨ Quick 1-step registration. You'll complete your service details and portfolio in the onboarding wizard.
          </p>
        )}

        {/* Divider */}
        <div className="relative flex items-center py-2">
          <div className="flex-grow border-t border-[#E8E2D9]"></div>
          <span className="shrink-0 px-3 text-[10px] uppercase font-semibold text-[#6B6560] tracking-wider bg-white">
            Or sign up with
          </span>
          <div className="flex-grow border-t border-[#E8E2D9]"></div>
        </div>

        {/* Social Logins */}
        <div className="w-full">
          <GoogleSignInButton mode="register" role={role} className="w-full justify-center" />
        </div>
      </form>
    </div>
  );
}
