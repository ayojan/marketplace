'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Lock, AlertCircle, CheckCircle2, Shield, ArrowRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

declare global {
  interface Window {
    google?: any;
    __googleGsiLoaded?: boolean;
  }
}

interface GoogleSignInButtonProps {
  mode?: 'login' | 'register';
  role?: 'customer' | 'vendor';
  vendorAttributes?: {
    business_name?: string;
    location?: string;
  };
  onSuccess?: (user: any, needsMobile: boolean) => void;
  onError?: (error: string) => void;
  className?: string;
  buttonText?: string;
}

export default function GoogleSignInButton({
  mode = 'login',
  role = 'customer',
  vendorAttributes,
  onSuccess,
  onError,
  className = '',
  buttonText
}: GoogleSignInButtonProps) {
  const { loginWithGoogle } = useAuth();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [gisReady, setGisReady] = useState(false);

  // Account collision linking state
  const [showCollisionModal, setShowCollisionModal] = useState(false);
  const [collisionEmail, setCollisionEmail] = useState('');
  const [cachedCredential, setCachedCredential] = useState<string | null>(null);
  const [linkPassword, setLinkPassword] = useState('');
  const [isLinking, setIsLinking] = useState(false);
  const [collisionError, setCollisionError] = useState<string | null>(null);

  // Mobile onboarding prompt state for customers
  const [showMobileModal, setShowMobileModal] = useState(false);
  const [mobileNumber, setMobileNumber] = useState('');

  // Dev setup & instant test modal
  const [showDevSetupModal, setShowDevSetupModal] = useState(false);
  const [devEmail, setDevEmail] = useState('akv1087@gmail.com');

  const configuredClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const isRealClientConfigured = Boolean(
    configuredClientId &&
    !configuredClientId.includes('test-google-client-id') &&
    configuredClientId.endsWith('.apps.googleusercontent.com')
  );
  const clientId = configuredClientId || '';
  const hiddenGisRef = useRef<HTMLDivElement>(null);

  // Load Google Identity Services script only when a real client ID is configured
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!isRealClientConfigured) return;

    if (window.google?.accounts?.id) {
      setGisReady(true);
      return;
    }

    const scriptId = 'google-identity-services-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        window.__googleGsiLoaded = true;
        setGisReady(true);
      };
      script.onerror = () => {
        console.warn('Google Identity Services script failed to load.');
      };
      document.body.appendChild(script);
    } else {
      script.addEventListener('load', () => setGisReady(true));
    }
  }, [isRealClientConfigured]);

  // Initialize GIS and render hidden standard button for popup authorization
  const handleCredentialResponseRef = useRef<(res: any) => Promise<void>>();

  useEffect(() => {
    if (!isRealClientConfigured || !gisReady || !window.google?.accounts?.id || !clientId) return;

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response: any) => handleCredentialResponseRef.current?.(response),
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      if (hiddenGisRef.current) {
        hiddenGisRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(hiddenGisRef.current, {
          theme: 'outline',
          size: 'large',
          type: 'standard',
          text: mode === 'register' ? 'signup_with' : 'signin_with',
        });
      }
    } catch (err) {
      console.warn('GIS initialization notice:', err);
    }
  }, [isRealClientConfigured, gisReady, clientId, mode]);

  // Handler for Google Token Credential
  const handleCredentialResponse = async (response: any) => {
    const credential = response?.credential;
    if (!credential) {
      toast.error('Google sign-in was cancelled or no credential received.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await loginWithGoogle({
        credential,
        role,
        vendor_profile_attributes: vendorAttributes
      });

      if (res.success) {
        toast.success(res.message || 'Signed in with Google successfully!');
        if (onSuccess) {
          onSuccess(res.user, res.needs_mobile_onboarding);
        } else {
          // Default post-auth navigation
          if (res.user?.role === 'vendor') {
            if (res.needs_mobile_onboarding || !res.user?.vendor_profile) {
              router.push('/vendor/onboarding');
            } else {
              router.push('/vendor/dashboard');
            }
          } else {
            if (res.needs_mobile_onboarding) {
              setShowMobileModal(true);
            } else {
              router.push('/customer/dashboard');
            }
          }
        }
      } else if (res.code === 'account_collision') {
        // Safe account collision flow
        setCachedCredential(credential);
        setCollisionEmail(res.email || '');
        setCollisionError(null);
        setShowCollisionModal(true);
      } else {
        const msg = res.error || 'Google authentication failed';
        toast.error(msg);
        if (onError) onError(msg);
      }
    } catch (err: any) {
      const msg = err.message || 'An unexpected error occurred during Google sign-in';
      toast.error(msg);
      if (onError) onError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger Google Sign-In prompt
  const handleTriggerSignIn = () => {
    if (!isRealClientConfigured) {
      setShowDevSetupModal(true);
      return;
    }

    if (!gisReady || !window.google?.accounts?.id) {
      toast.error('Google Sign-In is initializing. Please try again in a moment.');
      return;
    }

    try {
      const hiddenBtn = hiddenGisRef.current?.querySelector('div[role="button"]') as HTMLElement | null;
      if (hiddenBtn) {
        hiddenBtn.click();
      } else {
        window.google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            console.log('One-tap dismissed or skipped:', notification.getNotDisplayedReason());
          }
        });
      }
    } catch (err) {
      console.warn('Google prompt fallback error:', err);
    }
  };

  // Development simulation sign in handler
  const handleDevSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!devEmail) return;

    setShowDevSetupModal(false);
    setIsLoading(true);

    try {
      const sanitizedEmail = devEmail.trim().toLowerCase();
      const devToken = `dev-google-token:${JSON.stringify({
        email: sanitizedEmail,
        name: sanitizedEmail.split('@')[0],
        sub: `google-user-${sanitizedEmail.replace(/[^a-zA-Z0-9]/g, '')}`
      })}`;
      await handleCredentialResponse({ credential: devToken });
    } catch (err: any) {
      toast.error(err.message || 'Dev sign-in failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Safe Collision Account Linking Submit
  const handleLinkAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cachedCredential || !linkPassword) return;

    setIsLinking(true);
    setCollisionError(null);

    try {
      const res = await loginWithGoogle({
        credential: cachedCredential,
        link_account_password: linkPassword,
      });

      if (res.success) {
        setShowCollisionModal(false);
        setCachedCredential(null);
        setLinkPassword('');
        toast.success('Google account successfully linked!');

        if (onSuccess) {
          onSuccess(res.user, res.needs_mobile_onboarding);
        } else if (res.user?.role === 'vendor') {
          router.push('/vendor/dashboard');
        } else {
          router.push('/customer/dashboard');
        }
      } else {
        setCollisionError(res.error || 'Incorrect password. Could not link account.');
      }
    } catch (err: any) {
      setCollisionError(err.message || 'Failed to verify account');
    } finally {
      setIsLinking(false);
    }
  };

  handleCredentialResponseRef.current = handleCredentialResponse;

  const displayText = buttonText || (mode === 'register' ? 'Sign up with Google' : 'Sign in with Google');

  return (
    <>
      {/* Hidden container where GIS renders standard Google element */}
      <div ref={hiddenGisRef} className="hidden" aria-hidden="true" />

      {/* Styled Ayoj Google Button */}
      <Button
        type="button"
        variant="outline"
        onClick={handleTriggerSignIn}
        disabled={isLoading}
        className={`h-10 rounded-xl border-[#E8E2D9] bg-[#FBF8F4] hover:bg-[#F3EADF] text-[#221F1C] text-xs font-medium gap-2 cursor-pointer transition-all shadow-2xs hover:border-[#9E5338]/40 ${className}`}
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-[#9E5338]/30 border-t-[#9E5338] rounded-full animate-spin" />
        ) : (
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
        )}
        <span>{isLoading ? 'Connecting...' : displayText}</span>
      </Button>

      {/* Account Collision & Linking Modal */}
      <AnimatePresence>
        {showCollisionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md bg-white border border-[#E8E2D9] rounded-2xl shadow-xl overflow-hidden p-6 sm:p-7 relative"
            >
              <button
                onClick={() => setShowCollisionModal(false)}
                className="absolute top-4 right-4 text-[#6B6560] hover:text-[#221F1C] p-1 rounded-lg hover:bg-[#F3EADF] transition-colors"
              >
                <X className="size-4" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="size-10 rounded-xl bg-[#F3EADF] text-[#9E5338] flex items-center justify-center shrink-0">
                  <Shield className="size-5" />
                </div>
                <div>
                  <h3 className="text-base font-serif font-bold text-[#221F1C]">Existing Account Found</h3>
                  <p className="text-xs text-[#6B6560]">Confirm password to link your Google account</p>
                </div>
              </div>

              <div className="bg-[#FBF8F4] border border-[#E8E2D9] rounded-xl p-3.5 mb-5 text-xs text-[#6B6560] space-y-1">
                <p>
                  An Ayoj account registered with <strong className="text-[#221F1C]">{collisionEmail}</strong> already exists.
                </p>
                <p className="text-[11px] text-[#6B6560]">
                  To protect your account from unauthorized access, enter your existing password to link Google Sign-In.
                </p>
              </div>

              {collisionError && (
                <div className="p-3 mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="size-4 shrink-0 text-red-600" />
                  <span>{collisionError}</span>
                </div>
              )}

              <form onSubmit={handleLinkAccountSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="linkPassword" className="text-xs font-semibold text-[#221F1C] mb-1.5 block">
                    Current Ayoj Password
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="size-3.5 text-[#6B6560]" />
                    </div>
                    <Input
                      id="linkPassword"
                      type="password"
                      required
                      value={linkPassword}
                      onChange={(e) => setLinkPassword(e.target.value)}
                      placeholder="Enter your existing account password"
                      className="pl-8 h-10 bg-[#FBF8F4] border-[#E8E2D9] rounded-xl text-xs"
                      autoFocus
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCollisionModal(false)}
                    className="h-9 px-4 rounded-xl text-xs font-medium border-[#E8E2D9]"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLinking || !linkPassword}
                    className="h-9 px-5 rounded-xl text-xs font-semibold bg-[#9E5338] hover:bg-[#85432c] text-white flex items-center gap-1.5"
                  >
                    {isLinking ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <span>Link & Sign In</span>
                        <ArrowRight className="size-3.5" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Onboarding Reminder Modal for Customers */}
      <AnimatePresence>
        {showMobileModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md bg-white border border-[#E8E2D9] rounded-2xl shadow-xl overflow-hidden p-6 relative"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="size-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200">
                  <CheckCircle2 className="size-5" />
                </div>
                <div>
                  <h3 className="text-base font-serif font-bold text-[#221F1C]">Welcome to Ayoj!</h3>
                  <p className="text-xs text-[#6B6560]">Your Google account is now verified</p>
                </div>
              </div>

              <div className="bg-[#FBF8F4] border border-[#E8E2D9] rounded-xl p-3.5 mb-5 text-xs text-[#6B6560] space-y-1">
                <p className="font-semibold text-[#221F1C]">One quick step before booking:</p>
                <p className="text-[11px]">
                  Vendors require a verified mobile contact number to coordinate wedding and celebration schedules. You can add this in your dashboard settings anytime.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2.5">
                <Button
                  onClick={() => {
                    setShowMobileModal(false);
                    router.push('/customer/dashboard');
                  }}
                  className="h-10 px-6 rounded-xl text-xs font-semibold bg-[#9E5338] hover:bg-[#85432c] text-white flex items-center gap-1.5"
                >
                  <span>Go to Customer Dashboard</span>
                  <ArrowRight className="size-3.5" />
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Dev Mode & Setup Instructions Modal */}
      <AnimatePresence>
        {showDevSetupModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-lg bg-white border border-[#E8E2D9] rounded-2xl shadow-xl overflow-hidden p-6 sm:p-7 relative max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setShowDevSetupModal(false)}
                className="absolute top-4 right-4 text-[#6B6560] hover:text-[#221F1C] p-1.5 rounded-lg hover:bg-[#F3EADF] transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="size-4" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="size-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200">
                  <AlertCircle className="size-5" />
                </div>
                <div>
                  <h3 className="text-base font-serif font-bold text-[#221F1C]">Google Sign-In Configuration</h3>
                  <p className="text-xs text-[#6B6560]">Why Error 401: invalid_client happens &amp; dev test options</p>
                </div>
              </div>

              <div className="bg-amber-50/70 border border-amber-200/90 rounded-xl p-3.5 mb-5 text-xs text-[#221F1C] space-y-1.5">
                <p className="font-semibold text-amber-900">Why Google showed "Error 401: invalid_client":</p>
                <p className="text-[12px] text-amber-950/80 leading-relaxed">
                  Google OAuth requires a registered <strong>OAuth 2.0 Web Client ID</strong> from Google Cloud Console with <code className="bg-amber-100/70 px-1 py-0.5 rounded text-[#221F1C]">http://localhost:3000</code> added to authorized JavaScript origins. Without this set up in your environment, Google rejects authentication requests.
                </p>
              </div>

              {/* Dev Quick Sign In Box */}
              <div className="border border-[#E8E2D9] rounded-xl p-4 bg-[#FBF8F4] mb-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#221F1C] uppercase tracking-wider flex items-center gap-1.5">
                    <span>⚡ Instant Dev Sign-In</span>
                  </span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-medium px-2 py-0.5 rounded-full">
                    Ready to Test
                  </span>
                </div>
                <p className="text-xs text-[#6B6560] mb-3">
                  You don't have to wait for Google Cloud setup! Test the entire Ayoj Google auth flow, JWT issuance, account collision, and dashboard redirect right now:
                </p>

                <form onSubmit={handleDevSignIn} className="space-y-3">
                  <div>
                    <Label htmlFor="devEmailInput" className="text-xs font-semibold text-[#221F1C] mb-1.5 block">
                      Test Google Account Email
                    </Label>
                    <Input
                      id="devEmailInput"
                      type="email"
                      value={devEmail}
                      onChange={(e) => setDevEmail(e.target.value)}
                      placeholder="akv1087@gmail.com"
                      required
                      className="h-9 bg-white border-[#E8E2D9] rounded-lg text-xs"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading || !devEmail}
                    className="w-full h-9 rounded-lg text-xs font-semibold bg-[#9E5338] hover:bg-[#85432c] text-white flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Authenticating...</span>
                      </>
                    ) : (
                      <>
                        <span>Continue with {devEmail}</span>
                        <ArrowRight className="size-3.5" />
                      </>
                    )}
                  </Button>
                </form>
              </div>

              {/* Real Google Cloud Setup Steps */}
              <div className="border-t border-[#E8E2D9] pt-4 text-xs text-[#6B6560] space-y-2.5">
                <h4 className="font-semibold text-[#221F1C]">To enable live Google Sign-In with real Google popups:</h4>
                <ol className="list-decimal pl-4 space-y-1.5 text-[11px] leading-relaxed">
                  <li>
                    Go to <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-[#9E5338] underline font-medium">Google Cloud Console &gt; Credentials</a>.
                  </li>
                  <li>
                    Click <strong>Create Credentials &gt; OAuth client ID</strong>. Application type: <strong>Web application</strong>.
                  </li>
                  <li>
                    Under <em>Authorized JavaScript origins</em>, add: <code className="bg-[#F3EADF] px-1.5 py-0.5 rounded text-[#221F1C]">http://localhost:3000</code>.
                  </li>
                  <li>
                    Copy your Client ID and add to <code className="bg-[#F3EADF] px-1.5 py-0.5 rounded text-[#221F1C]">frontend/.env.local</code>:
                    <div className="bg-[#221F1C] text-emerald-400 p-2 rounded-lg mt-1 font-mono text-[10px] select-all break-all">
                      NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
                    </div>
                  </li>
                  <li>
                    Also add to <code className="bg-[#F3EADF] px-1.5 py-0.5 rounded text-[#221F1C]">backend/.env</code>:
                    <div className="bg-[#221F1C] text-emerald-400 p-2 rounded-lg mt-1 font-mono text-[10px] select-all break-all">
                      GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
                    </div>
                  </li>
                </ol>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
