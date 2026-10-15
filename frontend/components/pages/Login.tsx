'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../lib/contexts/AuthContext';
import { Mail, Lock, ArrowRight, Eye, EyeOff, Github, ArrowLeft, Sparkles, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import AuthLeftPanel from '@/components/auth/AuthLeftPanel';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';
import AyojLogo from '@/components/AyojLogo';
import { apiService } from '@/lib/api';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login, error, clearError } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
            (profileRes.data?.verification_status && profileRes.data?.verification_status !== 'unverified')
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
      <AuthLeftPanel />

      {/* Right Panel */}
      <div className="flex-1 lg:w-[55%] flex flex-col justify-between p-6 md:p-10 relative overflow-y-auto bg-[#FBF8F4]">
        
        {/* Top Header Row with Back Button & Logo */}
        <div className="w-full flex items-center justify-between max-w-md mx-auto mb-6">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-[#6B6560] hover:text-[#9E5338] transition-colors font-medium group">
            <ArrowLeft className="size-3.5 group-hover:-translate-x-0.5 transition-transform" /> Back to Home
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

          {/* Form Card Surface */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-[#E8E2D9] rounded-2xl p-6 sm:p-8 shadow-sm w-full relative z-10 space-y-5"
          >
            {/* Error Banner */}
            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-xs flex items-start gap-2.5">
                <svg className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Unified Login Form */}
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-3.5">
                <div className="group">
                  <Label htmlFor="email" className="text-[#221F1C] font-semibold text-xs mb-1.5 block">
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
                    <Label htmlFor="password" className="text-[#221F1C] font-semibold text-xs">
                      Password
                    </Label>
                    <a href="#" className="text-xs font-medium text-[#9E5338] hover:underline">
                      Forgot password?
                    </a>
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
                className="w-full h-11 rounded-full bg-[#9E5338] hover:bg-[#86442B] text-white font-medium text-xs transition-colors shadow-xs"
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
            <div className="grid grid-cols-2 gap-3">
              <GoogleSignInButton mode="login" />
              <Button variant="outline" className="h-10 rounded-xl border-[#E8E2D9] bg-[#FBF8F4] hover:bg-[#F3EADF] text-[#221F1C] text-xs font-medium gap-2 cursor-pointer">
                <Github className="w-4 h-4 text-[#221F1C]" />
                Github
              </Button>
            </div>
          </motion.div>

          {/* Contextual Sign Up Links */}
          <div className="space-y-3 text-center">
            <p className="text-[#6B6560] text-xs">
              Don't have an account?{' '}
              <Link
                href="/register"
                className="text-[#9E5338] font-bold hover:underline transition-colors inline-flex items-center gap-1 group"
              >
                Create an account
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
                  <span className="font-semibold text-[#221F1C] block text-[11px]">Are you an event professional?</span>
                  <span className="text-[10px] text-[#6B6560]">List your services & get booked</span>
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

        {/* Legal Microcopy Footer */}
        <div className="w-full text-center text-[11px] text-[#6B6560] py-2">
          By signing in, you agree to Ayoj's{' '}
          <a href="#" className="underline hover:text-[#221F1C]">Terms of Service</a> and{' '}
          <a href="#" className="underline hover:text-[#221F1C]">Privacy Policy</a>.
        </div>

      </div>
    </div>
  );
};

export default Login;
