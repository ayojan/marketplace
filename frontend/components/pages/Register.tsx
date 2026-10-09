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
  CheckCircle2,
  Building,
  MapPin,
  Tag,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import AuthLeftPanel from '@/components/auth/AuthLeftPanel';
import AyojLogo from '@/components/AyojLogo';

const SERVICE_CATEGORIES = [
  'Photography & Cinematography',
  'Bridal Makeup & Hair',
  'Decor & Styling',
  'Event Planning & Coordination',
  'DJ & Sound Entertainment',
  'Catering & Food Experience',
];

const POPULAR_CITIES = [
  'Delhi NCR',
  'Mumbai',
  'Bengaluru',
  'Jaipur',
  'Goa',
  'Chandigarh',
];

const Register = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const roleParam = searchParams.get('role');
  const activeRole: 'customer' | 'vendor' = roleParam === 'vendor' ? 'vendor' : 'customer';

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    passwordConfirmation: '',
    // Vendor specific fields
    businessName: '',
    category: SERVICE_CATEGORIES[0],
    location: POPULAR_CITIES[0],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, error, clearError } = useAuth();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
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

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
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
        location: string;
        description: string;
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
      payload.vendor_profile_attributes = {
        business_name:
          formData.businessName || `${formData.firstName} ${formData.lastName}'s Studio`,
        location: formData.location || 'Delhi NCR',
        description: formData.category || SERVICE_CATEGORIES[0],
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
        toast.success(
          activeRole === 'vendor'
            ? 'Welcome to Ayoj Partner Network!'
            : 'Welcome to Ayoj! Start planning your celebration.'
        );
        router.push(activeRole === 'vendor' ? '/vendor/dashboard' : '/customer/dashboard');
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
          
          {/* Heading */}
          <motion.div
            key={activeRole}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3EADF] text-[#9E5338] text-[11px] font-semibold mb-3 border border-[#E8E2D9]">
              {activeRole === 'vendor' ? (
                <>
                  <Briefcase className="size-3" />
                  <span>Ayoj Partner Onboarding</span>
                </>
              ) : (
                <>
                  <Sparkles className="size-3" />
                  <span>Ayoj Customer Registration</span>
                </>
              )}
            </div>
            <h2 className="text-3xl md:text-4xl font-serif font-normal text-[#221F1C] mb-2 tracking-tight">
              {activeRole === 'vendor' ? 'Become an Ayoj Partner' : 'Create your account'}
            </h2>
            <p className="text-[#6B6560] text-xs sm:text-sm font-normal max-w-xs mx-auto">
              {activeRole === 'vendor'
                ? 'List your services, showcase your portfolio & receive direct client inquiries'
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

              {/* Vendor Specific Business Profile Fields */}
              {activeRole === 'vendor' && (
                <div className="space-y-3 pt-0.5">
                  <div className="group">
                    <Label
                      htmlFor="businessName"
                      className="text-[#221F1C] font-semibold text-xs mb-1 block"
                    >
                      Business / Studio Name
                    </Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Building className="h-3.5 w-3.5 text-[#6B6560]" />
                      </div>
                      <Input
                        id="businessName"
                        name="businessName"
                        type="text"
                        required={activeRole === 'vendor'}
                        className="pl-8 h-10 bg-[#FBF8F4] border-[#E8E2D9] rounded-xl focus:border-[#9E5338] text-xs text-[#221F1C] placeholder:text-[#6B6560]"
                        placeholder="e.g. Royal Canvas Photography"
                        value={formData.businessName}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="group">
                      <Label
                        htmlFor="category"
                        className="text-[#221F1C] font-semibold text-xs mb-1 block"
                      >
                        Service Category
                      </Label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Tag className="h-3.5 w-3.5 text-[#6B6560]" />
                        </div>
                        <select
                          id="category"
                          name="category"
                          value={formData.category}
                          onChange={handleChange}
                          className="w-full pl-8 pr-3 h-10 bg-[#FBF8F4] border border-[#E8E2D9] rounded-xl focus:border-[#9E5338] text-xs text-[#221F1C] appearance-none cursor-pointer"
                        >
                          {SERVICE_CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="group">
                      <Label
                        htmlFor="location"
                        className="text-[#221F1C] font-semibold text-xs mb-1 block"
                      >
                        Base City
                      </Label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <MapPin className="h-3.5 w-3.5 text-[#6B6560]" />
                        </div>
                        <select
                          id="location"
                          name="location"
                          value={formData.location}
                          onChange={handleChange}
                          className="w-full pl-8 pr-3 h-10 bg-[#FBF8F4] border border-[#E8E2D9] rounded-xl focus:border-[#9E5338] text-xs text-[#221F1C] appearance-none cursor-pointer"
                        >
                          {POPULAR_CITIES.map((city) => (
                            <option key={city} value={city}>
                              {city}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
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
                      placeholder="Min. 6 chars"
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
                      ? 'Register as Ayoj Partner'
                      : 'Create Account'}
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </>
                )}
              </Button>
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
