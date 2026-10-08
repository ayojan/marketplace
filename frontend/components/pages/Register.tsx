'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../lib/contexts/AuthContext';
import { Camera, Lock, Mail, User, ArrowRight, CheckCircle, Briefcase, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import AuthLeftPanel from '@/components/auth/AuthLeftPanel';
import AyojLogo from '@/components/AyojLogo';

const Register = () => {
  const searchParams = useSearchParams();
  const initialRole = searchParams.get('role') || 'customer';

  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordMismatch, setPasswordMismatch] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    passwordConfirmation: '',
    firstName: '',
    lastName: '',
    role: initialRole,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, error, clearError } = useAuth();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) clearError();

    if (name === 'passwordConfirmation') {
      setPasswordMismatch(value !== formData.password && value.length > 0);
    }
  };

  const handleRoleSelect = (role: string) => {
    setFormData(prev => ({ ...prev, role }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.passwordConfirmation) {
      return;
    }

    setIsSubmitting(true);

    const result = await register({
      email: formData.email,
      password: formData.password,
      password_confirmation: formData.passwordConfirmation,
      first_name: formData.firstName,
      last_name: formData.lastName,
      role: formData.role,
      vendor_profile_attributes: formData.role === 'vendor' ? {
        business_name: `${formData.firstName} ${formData.lastName}'s Business`,
        location: 'Not specified'
      } : undefined
    });

    if (result.success) {
      if (result.message && result.message.includes('confirm')) {
        toast.success('Account created! Check your email to confirm, then sign in.', { duration: 6000 });
        router.push('/login');
      } else {
        router.push('/dashboard');
      }
    }

    setIsSubmitting(false);
  };

  const customerPerks = ['Browse verified pros', 'Instant booking', 'Secure payment escrow'];
  const vendorPerks = ['List services & packages', 'Manage calendar', 'Get paid directly'];

  return (
    <div className="min-h-screen w-full bg-[#FBF8F4] flex overflow-hidden font-sans text-[#221F1C]">
      <AuthLeftPanel />

      {/* Right Panel */}
      <div className="flex-1 lg:w-[55%] flex flex-col items-center justify-center p-6 md:p-12 relative overflow-hidden bg-[#FBF8F4]">
        
        {/* Mobile Logo & Back Link */}
        <div className="w-full flex items-center justify-between max-w-md mx-auto mb-4">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-[#6B6560] hover:text-[#9E5338] transition-colors font-medium">
            <ArrowLeft className="size-3.5" /> Back to Home
          </Link>

          <Link href="/">
            <AyojLogo size="sm" showTagline={false} />
          </Link>
        </div>

        {/* Step Indicator */}
        <div className="flex gap-2 mb-6">
          <div className={`h-1 flex-1 rounded-full transition-colors ${step >= 1 ? 'bg-[#9E5338]' : 'bg-[#E8E2D9]'}`} style={{ width: '32px' }} />
          <div className={`h-1 flex-1 rounded-full transition-colors ${step >= 2 ? 'bg-[#9E5338]' : 'bg-[#E8E2D9]'}`} style={{ width: '32px' }} />
        </div>

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 max-w-md"
        >
          <h2 className="text-3xl md:text-4xl font-serif font-normal text-[#221F1C] mb-2">
            {step === 1 ? 'Join Ayoj' : 'Create your account'}
          </h2>
          <p className="text-[#6B6560] text-sm">
            {step === 1
              ? 'Select your account type to get started'
              : 'Fill in your details to complete setup'}
          </p>
        </motion.div>

        {/* Form Card Surface */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-[#E8E2D9] rounded-2xl p-8 shadow-sm w-full max-w-md relative z-10"
        >
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-xs flex items-start gap-2.5 mb-6">
              <svg className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <AnimatePresence mode="wait">
            {/* Step 1: Role Selection */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 gap-4">
                  {[
                    { role: 'customer', icon: User, label: 'Customer', desc: 'Discover & Book Services', perks: customerPerks },
                    { role: 'vendor', icon: Briefcase, label: 'Vendor / Partner', desc: 'List & Provide Services', perks: vendorPerks },
                  ].map(({ role, icon: Icon, label, desc, perks }) => {
                    const isSelected = formData.role === role;
                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => handleRoleSelect(role)}
                        className={`relative p-5 rounded-xl border-2 transition-all duration-200 text-left cursor-pointer ${
                          isSelected
                            ? 'bg-[#F3EADF] border-[#9E5338] shadow-sm'
                            : 'bg-white border-[#E8E2D9] hover:border-[#9E5338]/40 hover:bg-[#FBF8F4]'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-full transition-colors shrink-0 ${
                            isSelected ? 'bg-[#9E5338] text-white' : 'bg-[#F5ECE2] text-[#6B6560]'
                          }`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <div className="font-serif font-bold text-base text-[#221F1C]">
                              {label}
                            </div>
                            <div className="text-xs text-[#6B6560] mt-0.5 mb-2.5">{desc}</div>
                            <ul className="space-y-1">
                              {perks.map((perk) => (
                                <li key={perk} className="text-xs text-[#221F1C] flex items-center gap-2 font-normal">
                                  <div className="w-1.5 h-1.5 rounded-full bg-[#9E5338]" />
                                  {perk}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="absolute top-4 right-4 text-[#9E5338]">
                            <CheckCircle className="w-5 h-5 fill-[#9E5338]/20" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                <Button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full h-11 rounded-full bg-[#9E5338] hover:bg-[#86442B] text-white font-medium text-xs transition-colors"
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </motion.div>
            )}

            {/* Step 2: Info & Credentials */}
            {step === 2 && (
              <motion.form
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
                onSubmit={handleSubmit}
              >
                <div className="grid grid-cols-2 gap-3">
                  <div className="group">
                    <Label htmlFor="firstName" className="text-[#221F1C] font-semibold text-xs mb-1 block">
                      First Name
                    </Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-4 w-4 text-[#6B6560]" />
                      </div>
                      <Input
                        id="firstName"
                        name="firstName"
                        type="text"
                        required
                        className="pl-9 h-10 bg-[#FBF8F4] border-[#E8E2D9] rounded-xl focus:border-[#9E5338] text-xs text-[#221F1C]"
                        placeholder="John"
                        value={formData.firstName}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="group">
                    <Label htmlFor="lastName" className="text-[#221F1C] font-semibold text-xs mb-1 block">
                      Last Name
                    </Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-4 w-4 text-[#6B6560]" />
                      </div>
                      <Input
                        id="lastName"
                        name="lastName"
                        type="text"
                        required
                        className="pl-9 h-10 bg-[#FBF8F4] border-[#E8E2D9] rounded-xl focus:border-[#9E5338] text-xs text-[#221F1C]"
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="group">
                  <Label htmlFor="email" className="text-[#221F1C] font-semibold text-xs mb-1 block">
                    Email Address
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-[#6B6560]" />
                    </div>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      className="pl-9 h-10 bg-[#FBF8F4] border-[#E8E2D9] rounded-xl focus:border-[#9E5338] text-xs text-[#221F1C]"
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="group">
                    <Label htmlFor="password" className="text-[#221F1C] font-semibold text-xs mb-1 block">
                      Password
                    </Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-4 w-4 text-[#6B6560]" />
                      </div>
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        className="pl-9 pr-8 h-10 bg-[#FBF8F4] border-[#E8E2D9] rounded-xl focus:border-[#9E5338] text-xs text-[#221F1C]"
                        placeholder="Create password"
                        value={formData.password}
                        onChange={handleChange}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-[#6B6560] hover:text-[#221F1C] transition-colors cursor-pointer"
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
                    <Label htmlFor="passwordConfirmation" className="text-[#221F1C] font-semibold text-xs mb-1 block">
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-4 w-4 text-[#6B6560]" />
                      </div>
                      <Input
                        id="passwordConfirmation"
                        name="passwordConfirmation"
                        type={showConfirm ? 'text' : 'password'}
                        required
                        className="pl-9 pr-8 h-10 bg-[#FBF8F4] border-[#E8E2D9] rounded-xl focus:border-[#9E5338] text-xs text-[#221F1C]"
                        placeholder="Confirm password"
                        value={formData.passwordConfirmation}
                        onChange={handleChange}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-[#6B6560] hover:text-[#221F1C] transition-colors cursor-pointer"
                      >
                        {showConfirm ? (
                          <EyeOff className="h-3.5 w-3.5" />
                        ) : (
                          <Eye className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                    {passwordMismatch && (
                      <p className="text-[10px] text-rose-600 mt-1">Passwords don't match</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 pt-3">
                  <Button
                    type="button"
                    onClick={() => setStep(1)}
                    variant="outline"
                    className="h-11 rounded-full px-4 border-[#E8E2D9] bg-[#FBF8F4] hover:bg-[#F3EADF] text-[#221F1C]"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || passwordMismatch}
                    className="flex-1 h-11 rounded-full bg-[#9E5338] hover:bg-[#86442B] text-white font-medium text-xs transition-colors"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        <span>Creating account...</span>
                      </>
                    ) : (
                      <>
                        Create Account
                        <ArrowRight className="w-4 h-4 ml-1.5" />
                      </>
                    )}
                  </Button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Footer Link */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center mt-6 text-[#6B6560] text-xs"
        >
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-[#9E5338] font-bold hover:underline transition-colors"
          >
            Sign in
          </Link>
        </motion.p>

      </div>
    </div>
  );
};

export default Register;
