'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import GoogleSignInButton from './GoogleSignInButton';

import { LoginFormData } from './types';
export type { LoginFormData };

interface AuthLoginFormProps {
  onSubmit: (formData: LoginFormData) => Promise<void>;
  isSubmitting?: boolean;
  error?: string | null;
  onClearError?: () => void;
  forgotPasswordHref?: string;
}

export default function AuthLoginForm({
  onSubmit,
  isSubmitting = false,
  error,
  onClearError,
  forgotPasswordHref = '#'
}: AuthLoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
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
    await onSubmit(formData);
  };

  return (
    <div className="bg-white border border-[#E8E2D9] rounded-2xl p-6 sm:p-8 shadow-sm w-full relative z-10 space-y-5">
      {/* Error Banner */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-xs flex items-start gap-2.5">
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

      {/* Unified Login Form */}
      <form className="space-y-4" onSubmit={handleFormSubmit}>
        <div className="space-y-3.5">
          <div className="group">
            <Label
              htmlFor="email"
              className="text-[#221F1C] font-semibold text-xs mb-1.5 block"
            >
              Email Address
            </Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                <Mail className="h-4 w-4 text-[#6B6560]" />
              </div>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="pl-9 h-11 bg-[#FBF8F4] border-[#E8E2D9] rounded-xl focus:border-[#9E5338] focus:ring-[#9E5338]/20 text-xs text-[#221F1C] placeholder:text-[#6B6560]"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="group">
            <div className="flex items-center justify-between mb-1.5">
              <Label
                htmlFor="password"
                className="text-[#221F1C] font-semibold text-xs"
              >
                Password
              </Label>
              <Link
                href={forgotPasswordHref}
                className="text-xs font-medium text-[#9E5338] hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                <Lock className="h-4 w-4 text-[#6B6560]" />
              </div>
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                className="pl-9 pr-10 h-11 bg-[#FBF8F4] border-[#E8E2D9] rounded-xl focus:border-[#9E5338] focus:ring-[#9E5338]/20 text-xs text-[#221F1C] placeholder:text-[#6B6560]"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#6B6560] hover:text-[#221F1C] transition-colors cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-11 rounded-full bg-[#9E5338] hover:bg-[#86442B] text-white font-medium text-xs transition-colors shadow-xs cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              <span>Signing in...</span>
            </>
          ) : (
            <>
              Sign In
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </>
          )}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative flex items-center py-1">
        <div className="flex-grow border-t border-[#E8E2D9]"></div>
        <span className="shrink-0 px-3 text-[10px] uppercase font-semibold text-[#6B6560] tracking-wider bg-white">
          Or continue with
        </span>
        <div className="flex-grow border-t border-[#E8E2D9]"></div>
      </div>

      {/* Social Logins */}
      <div className="w-full">
        <GoogleSignInButton mode="login" className="w-full justify-center" />
      </div>
    </div>
  );
}
