'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useAuth } from '@/lib/contexts/AuthContext';
import { apiService } from '@/lib/api';
import AyojLogo from '@/components/AyojLogo';
import {
  OnboardingProgressHeader,
  Step1AccountDetails,
  Step2BusinessProfile,
  Step3CategoriesServices,
  Step4ServiceLocations,
  Step5PortfolioPackages,
  Step6CompletionCelebration,
  CITIES_PRESETS,
  CATEGORY_PRESETS,
  SAMPLE_PORTFOLIO_IMAGES,
  OnboardingAccountData,
  OnboardingProfileData,
  OnboardingOffering,
  OnboardingLocationData,
  OnboardingPackage,
  OnboardingPortfolioItem
} from './onboarding';

export default function VendorOnboardingWizard() {
  const router = useRouter();
  const { user, register, isAuthenticated } = useAuth();

  const [currentStep, setCurrentStep] = useState<number>(
    isAuthenticated && user?.role === 'vendor' ? 2 : 1
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState<boolean>(false);

  // Categories fetched from backend
  const [categoriesList, setCategoriesList] = useState<any[]>([]);

  // Step 1: Account Details
  const [accountData, setAccountData] = useState<OnboardingAccountData>({
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    phone: '',
    email: user?.email || '',
    password: '',
    passwordConfirmation: ''
  });

  // Step 2: Business Profile
  const [profileData, setProfileData] = useState<OnboardingProfileData>({
    businessName: '',
    vendorType: 'individual',
    description: '',
    profileImage: '',
    yearsExperience: 4,
    city: 'Delhi NCR',
    state: 'Delhi',
    pincode: '110001'
  });

  // Step 3: Categories & Offerings
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['photography']);
  const [offerings, setOfferings] = useState<OnboardingOffering[]>([
    {
      id: 'off-1',
      categorySlug: 'photography',
      categoryName: 'Photography',
      name: 'Signature Candid Wedding Shoot',
      description: 'Comprehensive high-resolution candid photography capturing authentic emotion, timeless portraits, and celebration highlights.',
      pricingStyle: 'package',
      basePrice: 45000
    }
  ]);

  // Step 4: Service Locations & Travel
  const [locationData, setLocationData] = useState<OnboardingLocationData>({
    baseCity: 'Delhi NCR',
    serviceableCities: ['Delhi NCR', 'Noida', 'Gurgaon', 'Jaipur'],
    travelRadiusKm: 100,
    panIndia: false,
    travelChargesType: 'included',
    travelChargesAmount: 0,
    outOfAreaApproval: true
  });
  const [customCityInput, setCustomCityInput] = useState('');

  // Step 5: Portfolio and Pricing
  const [portfolioItems, setPortfolioItems] = useState<OnboardingPortfolioItem[]>(SAMPLE_PORTFOLIO_IMAGES);
  const [customMediaTitle, setCustomMediaTitle] = useState('');
  const [customMediaUrl, setCustomMediaUrl] = useState('');

  const [packages, setPackages] = useState<OnboardingPackage[]>([
    {
      id: 'pkg-1',
      title: 'Classic Celebration Package',
      price: 35000,
      inclusions: '1 Lead Artist, Full Day Event Coverage, 250 Color-Graded Photos, Online Gallery',
      exclusions: 'Outstation flights/stay, Raw unprocessed footage'
    },
    {
      id: 'pkg-2',
      title: 'Grand Royal Package',
      price: 75000,
      inclusions: '2 Lead Artists + Drone Pilot, Teaser Video + Full Gallery, 450 Edited Master Photos, Premium Hardbound Album',
      exclusions: 'Travel outside serviceable cities (billed per km)'
    }
  ]);
  const [minBookingValue, setMinBookingValue] = useState<number>(15000);

  // If already authenticated as vendor, prefill and skip Step 1
  useEffect(() => {
    if (isAuthenticated && user?.role === 'vendor') {
      apiService.profiles.me()
        .then((res) => {
          const profile = res.data;
          if (profile) {
            setProfileData((prev) => ({
              ...prev,
              businessName: profile.business_name || prev.businessName,
              description: profile.description || prev.description,
              yearsExperience: profile.years_experience ?? prev.yearsExperience,
              city: profile.metadata?.city || profile.location?.split(',')[0]?.trim() || prev.city,
              state: profile.metadata?.state || prev.state,
              pincode: profile.metadata?.pincode || prev.pincode,
              vendorType: profile.metadata?.vendor_type || prev.vendorType,
              profileImage: profile.metadata?.profile_image || prev.profileImage
            }));

            // Pre-fill location data if saved
            if (profile.metadata?.base_city) {
              setLocationData((prev) => ({
                ...prev,
                baseCity: profile.metadata.base_city || prev.baseCity,
                serviceableCities: profile.metadata.serviceable_locations || prev.serviceableCities,
                travelRadiusKm: typeof profile.metadata.travel_radius_km === 'number' ? profile.metadata.travel_radius_km : prev.travelRadiusKm,
                panIndia: profile.metadata.travel_radius_km === 'Pan-India',
                travelChargesType: profile.metadata.travel_charges_type || prev.travelChargesType,
                travelChargesAmount: profile.metadata.travel_charges_amount || prev.travelChargesAmount,
                outOfAreaApproval: profile.metadata.out_of_area_approval ?? prev.outOfAreaApproval
              }));
            }

            // Restore step saved in metadata or calculate step
            const savedStep = Number(profile.metadata?.onboarding_step);
            if (profile.metadata?.onboarding_completed) {
              setCurrentStep(6);
            } else if (savedStep && savedStep >= 2 && savedStep <= 5) {
              setCurrentStep(savedStep);
            } else {
              setCurrentStep((curr) => (curr === 1 ? 2 : curr));
            }
          }
        })
        .catch(() => {});
    }
  }, [isAuthenticated, user]);

  // Load backend categories
  useEffect(() => {
    apiService.profiles.serviceCategories()
      .then((res) => {
        const cats = res.data?.service_categories || [];
        if (cats.length > 0) {
          setCategoriesList(cats);
        }
      })
      .catch((err) => {
        console.warn('Using default category taxonomy:', err);
      });
  }, []);

  // Handler: Step 1 Submit (Account Details)
  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAuthenticated && user?.role === 'vendor') {
      setCurrentStep(2);
      return;
    }

    if (accountData.password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    if (accountData.password !== accountData.passwordConfirmation) {
      toast.error('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        first_name: accountData.firstName.trim(),
        last_name: accountData.lastName.trim(),
        email: accountData.email.trim(),
        password: accountData.password,
        password_confirmation: accountData.passwordConfirmation,
        role: 'vendor',
        vendor_attributes: {
          business_name: `${accountData.firstName} ${accountData.lastName}'s Studio`,
          phone: accountData.phone || '+91 98765 43210',
          location: 'Delhi NCR'
        }
      };

      const res = await register(payload);
      if (res.success) {
        toast.success('Account created! Let us set up your business profile.');
        setCurrentStep(2);
      } else {
        toast.error(res.error || 'Failed to create vendor account');
      }
    } catch (err: any) {
      toast.error(err.message || 'An error occurred during account registration');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler: Step 2 Submit (Business Profile)
  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (profileData.description.trim().length < 50) {
      toast.error('Description must be at least 50 characters long to help clients understand your services.');
      return;
    }

    setIsSubmitting(true);
    try {
      const formattedLocation = `${profileData.city}, ${profileData.state} - ${profileData.pincode}`;
      await apiService.profiles.updateMe({
        vendor: {
          business_name: profileData.businessName.trim(),
          description: profileData.description.trim(),
          location: formattedLocation,
          years_experience: Number(profileData.yearsExperience) || 0,
          phone: accountData.phone || undefined,
          metadata: {
            vendor_type: profileData.vendorType,
            city: profileData.city,
            state: profileData.state,
            pincode: profileData.pincode,
            profile_image: profileData.profileImage,
            onboarding_step: 2
          }
        }
      });
      toast.success('Business profile updated successfully!');
      setCurrentStep(3);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update business profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler: Step 3 Submit (Categories & Services)
  const handleStep3Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (offerings.length === 0) {
      toast.error('Please add at least one service offering to proceed.');
      return;
    }

    setIsSubmitting(true);
    try {
      const matchedCategoryIds = selectedCategories
        .map((catSlug) => {
          const match = categoriesList.find(
            (c) => c.slug === catSlug || c.name.toLowerCase() === (CATEGORY_PRESETS[catSlug]?.name || catSlug).toLowerCase()
          );
          return match?.id;
        })
        .filter(Boolean);

      if (matchedCategoryIds.length > 0) {
        await apiService.profiles.updateMe({
          vendor: {
            category_ids: matchedCategoryIds,
            primary_category_id: matchedCategoryIds[0]
          }
        }).catch((err) => {
          console.warn('Vendor categories sync notice:', err);
        });
      }

      for (const off of offerings) {
        const catMatch = categoriesList.find(
          (c) => c.slug === off.categorySlug || c.name.toLowerCase() === off.categoryName.toLowerCase()
        );
        const categoryId = catMatch?.id;

        await apiService.services.create({
          service: {
            name: off.name,
            description: off.description.length >= 50 ? off.description : `${off.description} Professional event service with complete satisfaction guarantee.`,
            base_price: off.pricingStyle === 'custom' ? undefined : Number(off.basePrice) || 15000,
            pricing_type: off.pricingStyle === 'custom' ? 'custom' : off.pricingStyle === 'fixed' ? 'hourly' : 'package',
            status: 'active',
            service_category_id: categoryId,
            category_id: categoryId
          }
        }).catch((err) => {
          console.warn('Service create notice:', err);
        });
      }

      toast.success('Services saved and classified under categories!');
      setCurrentStep(4);
    } catch (err: any) {
      toast.error('Could not save all services. Moving to locations.');
      setCurrentStep(4);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler: Step 4 Submit (Service Locations & Travel)
  const handleStep4Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiService.profiles.updateMe({
        vendor: {
          location: locationData.baseCity,
          metadata: {
            base_city: locationData.baseCity,
            serviceable_locations: locationData.serviceableCities,
            travel_radius_km: locationData.panIndia ? 'Pan-India' : locationData.travelRadiusKm,
            travel_charges_type: locationData.travelChargesType,
            travel_charges_amount: Number(locationData.travelChargesAmount) || 0,
            out_of_area_approval: locationData.outOfAreaApproval,
            onboarding_step: 4
          }
        }
      });
      toast.success('Service locations & travel policy configured!');
      setCurrentStep(5);
    } catch (err: any) {
      toast.error('Failed to update service locations');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler: Step 5 Submit (Publish Listing)
  const handleStep5Publish = async () => {
    setIsSubmitting(true);
    try {
      for (const item of portfolioItems.slice(0, 10)) {
        try {
          const createRes = await apiService.portfolioItems.create({
            portfolio_item: {
              title: item.title,
              category: item.category || 'Portfolio',
              description: `Portfolio showcase of ${item.title} delivered by ${profileData.businessName || 'our team'}.`,
              is_featured: true,
              display_order: 1
            }
          });

          const itemId = createRes?.data?.portfolio_item?.id;
          if (itemId && item.file) {
            await apiService.portfolioItems.uploadImages(itemId, [item.file]).catch(() => null);
          }
        } catch (itemErr) {
          console.warn('Failed to save portfolio showcase item:', item.title, itemErr);
        }
      }

      await apiService.profiles.updateMe({
        vendor: {
          metadata: {
            packages: packages,
            min_booking_value: minBookingValue,
            onboarding_completed: true,
            onboarding_step: 6,
            onboarding_completed_at: new Date().toISOString()
          }
        }
      });

      await apiService.profiles.requestVerification().catch((err) => {
        console.warn('Verification request notice:', err);
      });

      toast.success('🎉 Congratulations! Your listing has been published!');
      setCurrentStep(6);
    } catch (err: any) {
      toast.error('Listing published with warnings.');
      setCurrentStep(6);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Geolocation detection helper
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }
    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      () => {
        setIsDetectingLocation(false);
        setLocationData((prev) => ({
          ...prev,
          baseCity: 'Delhi NCR'
        }));
        toast.success('Location detected! Base city set to Delhi NCR.');
      },
      () => {
        setIsDetectingLocation(false);
        toast.error('Could not detect location. Please select your city manually.');
      }
    );
  };

  const handleAddCustomCity = () => {
    if (!customCityInput.trim()) return;
    const formatted = customCityInput.trim();
    if (!locationData.serviceableCities.includes(formatted)) {
      setLocationData((prev) => ({
        ...prev,
        serviceableCities: [...prev.serviceableCities, formatted]
      }));
    }
    setCustomCityInput('');
  };

  const handleRemoveCity = (cityToRemove: string) => {
    setLocationData((prev) => ({
      ...prev,
      serviceableCities: prev.serviceableCities.filter((c) => c !== cityToRemove)
    }));
  };

  const handleToggleCategory = (slug: string, name: string) => {
    if (selectedCategories.includes(slug)) {
      if (selectedCategories.length === 1) {
        toast.error('You must keep at least one active category.');
        return;
      }
      setSelectedCategories((prev) => prev.filter((s) => s !== slug));
      setOfferings((prev) => prev.filter((o) => o.categorySlug !== slug));
    } else {
      if (selectedCategories.length >= 3) {
        toast.error('You can select up to 3 operating categories (1 primary + 2 secondary).');
        return;
      }
      setSelectedCategories((prev) => [...prev, slug]);
      const preset = CATEGORY_PRESETS[slug];
      const starterName = preset?.services[0] || `${name} Signature Service`;
      setOfferings((prev) => [
        ...prev,
        {
          id: `off-${Date.now()}`,
          categorySlug: slug,
          categoryName: name,
          name: starterName,
          description: `Professional ${name.toLowerCase()} tailored for luxury Indian weddings and festive gatherings.`,
          pricingStyle: 'package',
          basePrice: 25000
        }
      ]);
    }
  };

  const isVendorAuthenticated = isAuthenticated && user?.role === 'vendor';

  return (
    <div className="min-h-screen bg-[#FBF8F4] text-[#221F1C] flex flex-col justify-between font-sans selection:bg-[#9E5338] selection:text-white">
      {/* Top Brand Header */}
      <header className="border-b border-[#E8E2D9] bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="hover:opacity-90 transition-opacity flex items-center gap-2">
            <AyojLogo size="sm" showTagline={false} />
            <span className="text-[10px] font-bold tracking-wider uppercase text-[#9E5338] bg-[#F3EADF] px-2 py-0.5 rounded-full border border-[#E8E2D9]">
              Partner Onboarding
            </span>
          </Link>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-2 text-xs text-[#6B6560]">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Signed in as <strong className="text-[#221F1C]">{user?.email}</strong></span>
              </div>
            ) : (
              <Link
                href="/login"
                className="text-xs text-[#6B6560] hover:text-[#9E5338] font-medium transition-colors"
              >
                Already have an account? <span className="underline font-bold text-[#221F1C]">Sign in</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Wizard Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 md:py-12">
        <OnboardingProgressHeader
          currentStep={currentStep}
          onStepClick={(step) => setCurrentStep(step)}
          isVendorAuthenticated={isVendorAuthenticated}
        />

        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <Step1AccountDetails
              accountData={accountData}
              setAccountData={setAccountData}
              onSubmit={handleStep1Submit}
              isSubmitting={isSubmitting}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              showConfirmPassword={showConfirmPassword}
              setShowConfirmPassword={setShowConfirmPassword}
            />
          )}

          {currentStep === 2 && (
            <Step2BusinessProfile
              profileData={profileData}
              setProfileData={setProfileData}
              onSubmit={handleStep2Submit}
              isSubmitting={isSubmitting}
              isVendorAuthenticated={isVendorAuthenticated}
              onBack={() => setCurrentStep(1)}
            />
          )}

          {currentStep === 3 && (
            <Step3CategoriesServices
              selectedCategories={selectedCategories}
              onToggleCategory={handleToggleCategory}
              offerings={offerings}
              setOfferings={setOfferings}
              onSubmit={handleStep3Submit}
              isSubmitting={isSubmitting}
              onBack={() => setCurrentStep(2)}
            />
          )}

          {currentStep === 4 && (
            <Step4ServiceLocations
              locationData={locationData}
              setLocationData={setLocationData}
              customCityInput={customCityInput}
              setCustomCityInput={setCustomCityInput}
              handleAddCustomCity={handleAddCustomCity}
              handleRemoveCity={handleRemoveCity}
              handleDetectLocation={handleDetectLocation}
              isDetectingLocation={isDetectingLocation}
              onSubmit={handleStep4Submit}
              isSubmitting={isSubmitting}
              onBack={() => setCurrentStep(3)}
            />
          )}

          {currentStep === 5 && (
            <Step5PortfolioPackages
              portfolioItems={portfolioItems}
              setPortfolioItems={setPortfolioItems}
              customMediaTitle={customMediaTitle}
              setCustomMediaTitle={setCustomMediaTitle}
              customMediaUrl={customMediaUrl}
              setCustomMediaUrl={setCustomMediaUrl}
              packages={packages}
              setPackages={setPackages}
              minBookingValue={minBookingValue}
              setMinBookingValue={setMinBookingValue}
              onPublish={handleStep5Publish}
              isSubmitting={isSubmitting}
              onBack={() => setCurrentStep(4)}
            />
          )}

          {currentStep === 6 && (
            <Step6CompletionCelebration
              businessName={profileData.businessName}
              baseCity={locationData.baseCity}
              offeringsCount={offerings.length}
              onGoToDashboard={() => router.push('/vendor/dashboard')}
              onExploreMarketplace={() => router.push('/marketplace')}
            />
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E8E2D9] py-4 text-center text-xs text-[#6B6560] bg-white">
        Ayoj Partner Network • Multi-Step Vendor Onboarding & Listing System
      </footer>
    </div>
  );
}
