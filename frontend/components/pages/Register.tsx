'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../lib/contexts/AuthContext';
import { ArrowLeft, ArrowRight, Briefcase, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import AyojLogo from '@/components/AyojLogo';
import {
  AuthLeftPanel,
  AuthRoleSelector,
  AuthRegisterForm,
  RegisterFormData
} from '@/components/auth';

const Register = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const roleParam = searchParams.get('role');
  const [activeRole, setActiveRole] = useState<'customer' | 'vendor'>(
    roleParam === 'vendor' ? 'vendor' : 'customer'
  );

  useEffect(() => {
    if (roleParam === 'vendor') {
      setActiveRole('vendor');
    } else if (roleParam === 'customer') {
      setActiveRole('customer');
    }
  }, [roleParam]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, error, clearError } = useAuth();

  const handleRoleChange = (role: 'customer' | 'vendor') => {
    setActiveRole(role);
    if (error) clearError();
    router.replace(`/register?role=${role}`);
  };

  const handleRegisterSubmit = async (formData: RegisterFormData) => {
    setIsSubmitting(true);

    const payload: {
      email: string;
      password: string;
      password_confirmation: string;
      first_name: string;
      last_name: string;
      role: 'customer' | 'vendor';
      vendor_attributes?: {
        business_name: string;
        location?: string;
      };
    } = {
      email: formData.email,
      password: formData.password,
      password_confirmation: formData.passwordConfirmation,
      first_name: formData.firstName,
      last_name: formData.lastName,
      role: activeRole
    };

    if (activeRole === 'vendor') {
      const bName =
        formData.businessName.trim() || `${formData.firstName} ${formData.lastName}'s Services`;
      payload.vendor_attributes = {
        business_name: bName,
        location: 'Delhi NCR'
      };
    }

    const result = await register(payload);

    if (result.success) {
      if (result.message && result.message.toLowerCase().includes('confirm')) {
        toast.success('Account created! Please check your email to confirm.', {
          duration: 5000
        });
        router.push('/login');
      } else {
        if (activeRole === 'vendor') {
          toast.success("Account created! Let's set up your business profile.", {
            duration: 4000
          });
          router.push('/vendor/onboarding');
        } else {
          toast.success('Welcome to Ayoj! Start planning your celebration.');
          const target = searchParams?.get('redirect') || searchParams?.get('from') || '/';
          router.push(target.startsWith('/') ? target : '/');
        }
      }
    }

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen w-full bg-[#FBF8F4] flex overflow-hidden font-sans text-[#221F1C]">
      {/* Left Panel Showcase */}
      <AuthLeftPanel role={activeRole} />

      {/* Right Panel Content */}
      <div className="flex-1 lg:w-[55%] flex flex-col justify-between p-6 md:p-10 relative overflow-y-auto bg-[#FBF8F4]">
        {/* Top Header Row with Back Button & Logo */}
        <div className="w-full flex items-center justify-between max-w-md mx-auto mb-4">
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

        <div className="w-full max-w-md mx-auto my-auto space-y-5 py-2">
          {/* Role Toggle Selector */}
          <AuthRoleSelector
            activeRole={activeRole}
            onRoleChange={handleRoleChange}
            variant="tabs"
          />

          {/* Heading */}
          <motion.div
            key={activeRole}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h2 className="text-3xl md:text-4xl font-serif font-normal text-[#221F1C] mb-2 tracking-tight">
              {activeRole === 'vendor' ? 'Become an Ayoj Partner' : 'Create your account'}
            </h2>
            <p className="text-[#6B6560] text-xs sm:text-sm font-normal max-w-xs mx-auto">
              {activeRole === 'vendor'
                ? 'Quick 1-step signup — set up your business profile & services right after'
                : 'Join Ayoj to find, compare and book verified event professionals'}
            </p>
          </motion.div>

          {/* Registration Form Component */}
          <AuthRegisterForm
            role={activeRole}
            onSubmit={handleRegisterSubmit}
            isSubmitting={isSubmitting}
            error={error}
            onClearError={clearError}
          />

          {/* Contextual Links & Bottom Switcher Card */}
          <div className="space-y-3 text-center">
            <p className="text-[#6B6560] text-xs">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-[#9E5338] font-bold hover:underline transition-colors inline-flex items-center gap-1 group"
              >
                <span>Sign In</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </p>

            {/* Vendor Callout on Customer Register, and Customer Callout on Vendor Register */}
            {activeRole === 'customer' ? (
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
            ) : (
              <div className="p-3 rounded-xl bg-white border border-[#E8E2D9] text-xs text-[#6B6560] flex items-center justify-between max-w-md mx-auto shadow-xs">
                <div className="flex items-center gap-2 text-left">
                  <div className="size-7 rounded-lg bg-[#F3EADF] text-[#9E5338] flex items-center justify-center shrink-0">
                    <User className="size-3.5" />
                  </div>
                  <div>
                    <span className="font-semibold text-[#221F1C] block text-[11px]">
                      Looking to book event pros?
                    </span>
                    <span className="text-[10px] text-[#6B6560]">
                      Plan your wedding or celebration
                    </span>
                  </div>
                </div>
                <Link
                  href="/register"
                  className="text-xs font-semibold text-[#9E5338] hover:text-[#86442B] underline shrink-0 ml-2"
                >
                  Sign up as Customer →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Legal microcopy */}
        <div className="w-full text-center text-[11px] text-[#6B6560] py-2">
          By signing up, you agree to Ayoj's{' '}
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

export default Register;
