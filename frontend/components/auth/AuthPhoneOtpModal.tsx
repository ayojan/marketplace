'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, ArrowRight, X, CheckCircle2, RotateCw, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface AuthPhoneOtpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: (phoneNumber: string) => void;
  title?: string;
  subtitle?: string;
}

export default function AuthPhoneOtpModal({
  isOpen,
  onClose,
  onVerified,
  title = 'Phone Verification',
  subtitle = 'Verify your phone number with a 6-digit one-time code.'
}: AuthPhoneOtpModalProps) {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(30);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for resend
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'otp' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit phone number');
      return;
    }

    setErrorMsg('');
    setIsSending(true);

    try {
      // Simulate network request
      await new Promise((r) => setTimeout(r, 600));
      setStep('otp');
      setCountdown(30);
      toast.success(`OTP sent to +91 ${cleanPhone.slice(-10)}`);
      setTimeout(() => inputRefs.current[0]?.focus(), 150);
    } catch {
      setErrorMsg('Could not send OTP. Please check the number and try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;

    const newOtp = [...otp];
    for (let i = 0; i < 6; i++) {
      newOtp[i] = pastedData[i] || '';
    }
    setOtp(newOtp);
    const focusIdx = Math.min(pastedData.length, 5);
    inputRefs.current[focusIdx]?.focus();
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const enteredOtp = otp.join('');
    if (enteredOtp.length !== 6) {
      setErrorMsg('Please enter the complete 6-digit code');
      return;
    }

    setErrorMsg('');
    setIsVerifying(true);

    try {
      await new Promise((r) => setTimeout(r, 700));
      toast.success('Phone verified successfully!');
      onVerified(`+91${phone.replace(/\D/g, '').slice(-10)}`);
      onClose();
    } catch {
      setErrorMsg('Invalid verification code. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleReset = () => {
    setStep('phone');
    setOtp(['', '', '', '', '', '']);
    setErrorMsg('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleReset}
          className="absolute inset-0 bg-black/60 backdrop-blur-xs"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 280 }}
          className="relative w-full max-w-md bg-white rounded-3xl border border-[#E8E2D9] shadow-2xl overflow-hidden z-10"
        >
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-[#E8E2D9] bg-[#FAF7F2] flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#9E5338] uppercase tracking-wider mb-0.5">
                <ShieldCheck className="size-3.5" />
                <span>Secure Verification</span>
              </div>
              <h3 className="text-lg font-serif font-bold text-[#221F1C]">{title}</h3>
              <p className="text-xs text-[#6B6560] mt-0.5">{subtitle}</p>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="size-8 rounded-full bg-white hover:bg-[#F3EADF] border border-[#E8E2D9] flex items-center justify-center text-[#221F1C] cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6">
            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {errorMsg}
              </div>
            )}

            {step === 'phone' ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#221F1C] mb-1.5">
                    Mobile Phone Number
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="h-11 px-3 bg-[#FAF7F2] border border-[#E8E2D9] rounded-xl flex items-center text-xs font-bold text-[#221F1C]">
                      +91
                    </span>
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#6B6560]">
                        <Phone className="size-3.5" />
                      </div>
                      <input
                        type="tel"
                        required
                        placeholder="98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full h-11 pl-9 pr-3 text-xs rounded-xl bg-[#FBF8F4] border border-[#E8E2D9] text-[#221F1C] focus:outline-none focus:border-[#9E5338]"
                      />
                    </div>
                  </div>
                  <span className="text-[11px] text-[#6B6560] mt-1 block">
                    We will send a 6-digit confirmation code via SMS.
                  </span>
                </div>

                <Button
                  type="submit"
                  disabled={isSending}
                  className="w-full h-11 rounded-full bg-[#9E5338] hover:bg-[#86442B] text-white text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                >
                  {isSending ? (
                    <span>Sending code...</span>
                  ) : (
                    <>
                      <span>Send 6-Digit OTP</span>
                      <ArrowRight className="size-3.5" />
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="text-center space-y-1">
                  <span className="text-xs text-[#6B6560]">
                    Enter the code sent to{' '}
                    <strong className="text-[#221F1C]">+91 {phone.slice(-10)}</strong>
                  </span>
                  <div>
                    <button
                      type="button"
                      onClick={() => setStep('phone')}
                      className="text-[11px] text-[#9E5338] underline hover:text-[#86442B] cursor-pointer"
                    >
                      Change phone number
                    </button>
                  </div>
                </div>

                {/* 6 Digit Inputs */}
                <div className="flex items-center justify-center gap-2 pt-2" onPaste={handlePaste}>
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => {
                        inputRefs.current[index] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="size-11 sm:size-12 text-center text-base font-bold bg-[#FBF8F4] border border-[#E8E2D9] rounded-xl text-[#221F1C] focus:outline-none focus:border-[#9E5338] focus:ring-1 focus:ring-[#9E5338]"
                    />
                  ))}
                </div>

                {/* Resend Action */}
                <div className="text-center pt-1">
                  {countdown > 0 ? (
                    <span className="text-[11px] text-[#6B6560]">
                      Resend code in <strong className="text-[#221F1C]">{countdown}s</strong>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#9E5338] hover:underline cursor-pointer"
                    >
                      <RotateCw className="size-3" />
                      <span>Resend OTP</span>
                    </button>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isVerifying || otp.join('').length !== 6}
                  className="w-full h-11 rounded-full bg-[#9E5338] hover:bg-[#86442B] text-white text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50"
                >
                  {isVerifying ? (
                    <span>Verifying code...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="size-3.5" />
                      <span>Verify &amp; Continue</span>
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
