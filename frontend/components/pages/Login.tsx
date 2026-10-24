'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../lib/contexts/AuthContext';
import { ArrowLeft, ArrowRight, Sparkles, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';
import AyojLogo from '@/components/AyojLogo';
import { apiService } from '@/lib/api';
import { AuthLeftPanel, AuthLoginForm, LoginFormData } from '@/components/auth';

const Login = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, error, clearError } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleLoginSubmit = async (formData: LoginFormData) => {
    setIsSubmitting(true);

    const result = await login(formData);

    if (result.success) {
      const fromParam = searchParams.get('from');
      if (fromParam && fromParam !== '/') {
        router.push(fromParam);
      } else if (result.user?.role === 'vendor') {
        try {
          const profileRes = await apiService.profiles.me();
          const isComplete = Boolean(
            profileRes.data?.metadata?.onboarding_completed ||
              String(profileRes.data?.metadata?.onboarding_completed) === 'true' ||
              (profileRes.data?.verification_status &&
                profileRes.data?.verification_status !== 'unverified')
          );
          if (isComplete) {
            router.push('/vendor/dashboard');
          } else {
            router.push('/vendor/onboarding');
          }
        } catch {
          router.push('/vendor/onboarding');
        }
      } else {
        router.push(fromParam || '/');
      }
    }

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen w-full bg-[#FBF8F4] flex overflow-hidden font-sans text-[#221F1C]">
      {/* Left Panel Showcase */}
      <AuthLeftPanel />

      {/* Right Panel */}
      <div className="flex-1 lg:w-[55%] flex flex-col justify-between p-6 md:p-10 relative overflow-y-auto bg-[#FBF8F4]">
        {/* Top Header Row with Back Button & Logo */}
        <div className="w-full flex items-center justify-between max-w-md mx-auto mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-[#6B6560] hover:text-[#9E5338] transition-colors font-medium group"
          >
            <ArrowLeft className="size-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Home</span>
          </Link>

          <Link href="/" className="hover:opacity-90 transition-opacity">
            <AyojLogo size="sm" showTagline={false} />
          </Link>
        </div>

        <div className="w-full max-w-md mx-auto my-auto space-y-6 py-4">
          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3EADF] text-[#9E5338] text-[11px] font-semibold mb-3 border border-[#E8E2D9]">
              <Sparkles className="size-3" />
              <span>Ayoj Marketplace Account</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-serif font-normal text-[#221F1C] mb-2 tracking-tight">
              Welcome back
            </h2>
            <p className="text-[#6B6560] text-xs sm:text-sm font-normal max-w-xs mx-auto">
              Sign in to manage your bookings, inquiries, and event celebrations
            </p>
          </motion.div>

          {/* Unified Login Form Component */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <AuthLoginForm
              onSubmit={handleLoginSubmit}
              isSubmitting={isSubmitting}
              error={error}
              onClearError={clearError}
            />
          </motion.div>

          {/* Contextual Sign Up Links */}
          <div className="space-y-3 text-center">
            <p className="text-[#6B6560] text-xs">
              Don't have an account?{' '}
              <Link
                href="/register"
                className="text-[#9E5338] font-bold hover:underline transition-colors inline-flex items-center gap-1 group"
              >
                <span>Create an account</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </p>

            {/* Vendor Partner Callout Card */}
            <div className="p-3 rounded-xl bg-white border border-[#E8E2D9] text-xs text-[#6B6560] flex items-center justify-between max-w-md mx-auto shadow-xs">
              <div className="flex items-center gap-2 text-left">
                <div className="size-7 rounded-lg bg-[#F3EADF] text-[#9E5338] flex items-center justify-center shrink-0">
                  <Briefcase className="size-3.5" />
                </div>
                <div>
                  <span className="font-semibold text-[#221F1C] block text-[11px]">
                    Are you an event professional?
                  </span>
                  <span className="text-[10px] text-[#6B6560]">
                    List your services &amp; get booked
                  </span>
                </div>
              </div>
              <Link
                href="/register?role=vendor"
                className="text-xs font-semibold text-[#9E5338] hover:text-[#86442B] underline shrink-0 ml-2"
              >
                Join as Vendor →
              </Link>
            </div>
          </div>
        </div>

        {/* Legal microcopy */}
        <div className="w-full text-center text-[11px] text-[#6B6560] py-2">
          By signing in, you agree to Ayoj's{' '}
          <a href="#" className="underline hover:text-[#221F1C]">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="underline hover:text-[#221F1C]">
            Privacy Policy
          </a>
          .
        </div>
      </div>
    </div>
  );
};

export default Login;
