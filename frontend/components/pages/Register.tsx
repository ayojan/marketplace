'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../lib/contexts/AuthContext';
import {
  Lock,
  Mail,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  ArrowLeft,
  Briefcase,
  Building,
  Sparkles,
  Github,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import AuthLeftPanel from '@/components/auth/AuthLeftPanel';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';
import AyojLogo from '@/components/AyojLogo';

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

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    passwordConfirmation: '',
    businessName: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, error, clearError } = useAuth();

  const handleRoleChange = (role: 'customer' | 'vendor') => {
    setActiveRole(role);
    if (error) clearError();
    router.replace(`/register?role=${role}`);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.passwordConfirmation) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    setIsSubmitting(true);

    const payload: {
      email: string;
      password: string;
      password_confirmation: string;
      first_name: string;
      last_name: string;
      role: 'customer' | 'vendor';
      vendor_profile_attributes?: {
        business_name: string;
        location?: string;
      };
    } = {
      email: formData.email,
      password: formData.password,
      password_confirmation: formData.passwordConfirmation,
      first_name: formData.firstName,
      last_name: formData.lastName,
      role: activeRole,
    };

    if (activeRole === 'vendor') {
      const bName = formData.businessName.trim() || `${formData.firstName} ${formData.lastName}'s Services`;
      payload.vendor_profile_attributes = {
        business_name: bName,
        location: 'Delhi NCR',
      };
    }

    const result = await register(payload);

    if (result.success) {
      if (result.message && result.message.toLowerCase().includes('confirm')) {
        toast.success('Account created! Please check your email to confirm.', {
          duration: 5000,
        });
        router.push('/login');
      } else {
        if (activeRole === 'vendor') {
          toast.success("Account created! Let's set up your business profile.", {
            duration: 4000,
          });
          router.push('/vendor/onboarding');
        } else {
          toast.success('Welcome to Ayoj! Start planning your celebration.');
          router.push(searchParams?.get('from') || '/');
        }
      }
    }

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen w-full bg-[#FBF8F4] flex overflow-hidden font-sans text-[#221F1C]">
      {/* Left Panel */}
      <AuthLeftPanel role={activeRole} />

      {/* Right Panel */}
      <div className="flex-1 lg:w-[55%] flex flex-col justify-between p-6 md:p-10 relative overflow-y-auto bg-[#FBF8F4]">
        
        {/* Top Header Row with Back Button & Logo */}
        <div className="w-full flex items-center justify-between max-w-md mx-auto mb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-[#6B6560] hover:text-[#9E5338] transition-colors font-medium group"
          >
            <ArrowLeft className="size-3.5 group-hover:-translate-x-0.5 transition-transform" /> Back to Home
          </Link>

          <Link href="/" className="hover:opacity-90 transition-opacity">
            <AyojLogo size="sm" showTagline={false} />
          </Link>
        </div>

        <div className="w-full max-w-md mx-auto my-auto space-y-5 py-2">
          
          {/* Role Toggle Tabs */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#F3EADF] rounded-xl border border-[#E8E2D9]">
            <button
              type="button"
              onClick={() => handleRoleChange('customer')}
              className={`py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeRole === 'customer'
                  ? 'bg-white text-[#9E5338] shadow-xs'
                  : 'text-[#6B6560] hover:text-[#221F1C]'
              }`}
            >
              <Sparkles className="size-3.5" />
              <span>Customer (Book Events)</span>
            </button>
            <button
              type="button"
              onClick={() => handleRoleChange('vendor')}
              className={`py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeRole === 'vendor'
                  ? 'bg-white text-[#9E5338] shadow-xs'
                  : 'text-[#6B6560] hover:text-[#221F1C]'
              }`}
            >
              <Briefcase className="size-3.5" />
              <span>Partner / Vendor</span>
            </button>
          </div>

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

          {/* Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-[#E8E2D9] rounded-2xl p-6 sm:p-7 shadow-sm w-full relative z-10"
          >
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

            <form className="space-y-3.5" onSubmit={handleSubmit}>
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
              {activeRole === 'vendor' && (
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
                  {activeRole === 'vendor' ? 'Business / Contact Email' : 'Email Address'}
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
                    {activeRole === 'vendor'
                      ? 'Register & Continue to Onboarding'
                      : 'Create Account'}
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </>
                )}
              </Button>

              {activeRole === 'vendor' && (
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
              <div className="grid grid-cols-2 gap-3">
                <GoogleSignInButton mode="register" role={activeRole} />
                <Button variant="outline" className="h-10 rounded-xl border-[#E8E2D9] bg-[#FBF8F4] hover:bg-[#F3EADF] text-[#221F1C] text-xs font-medium gap-2 cursor-pointer">
                  <Github className="w-4 h-4 text-[#221F1C]" />
                  Github
                </Button>
              </div>
            </form>
          </motion.div>

          {/* Contextual Links & Bottom Switcher Card */}
          <div className="space-y-3 text-center">
            <p className="text-[#6B6560] text-xs">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-[#9E5338] font-bold hover:underline transition-colors inline-flex items-center gap-1 group"
              >
                Sign In
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
                      List your services & get booked
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
          <a href="#" className="underline hover:text-[#221F1C]">Terms of Service</a> and{' '}
          <a href="#" className="underline hover:text-[#221F1C]">Privacy Policy</a>.
        </div>
      </div>
    </div>
  );
};

export default Register;
