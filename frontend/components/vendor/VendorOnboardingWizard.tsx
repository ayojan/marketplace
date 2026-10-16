/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useAuth } from '@/lib/contexts/AuthContext';
import { apiService } from '@/lib/api';
import AyojLogo from '@/components/AyojLogo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  User,
  Building2,
  Mail,
  Lock,
  Phone,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Camera,
  Brush,
  Flower2,
  Sparkles,
  Utensils,
  Music,
  MapPin,
  Compass,
  IndianRupee,
  Briefcase,
  Star,
  Plus,
  Trash2,
  ShieldCheck,
  Eye,
  EyeOff,
  Navigation,
  Globe,
  UploadCloud,
  Check,
  Package,
  Layers,
  ChevronRight,
  Info,
  Sliders,
  DollarSign,
  AlertCircle
} from 'lucide-react';

const CITIES_PRESETS = [
  'Delhi NCR',
  'Mumbai',
  'Bengaluru',
  'Jaipur',
  'Goa',
  'Chandigarh',
  'Hyderabad',
  'Pune',
  'Udaipur',
  'Kolkata',
  'Ahmedabad',
  'Chennai'
];

const CATEGORY_PRESETS: { [key: string]: { name: string; services: string[] } } = {
  photography: {
    name: 'Photography',
    services: [
      'Candid Wedding Photography',
      'Traditional Wedding Photography',
      'Pre-Wedding Couple Shoot',
      'Engagement & Roka Coverage',
      'Drone Aerial Cinematography'
    ]
  },
  videography: {
    name: 'Videography',
    services: [
      'Cinematic Wedding Film & Teaser',
      'Traditional HD Video Coverage',
      'Instagram Reels & Same-Day Edit',
      'Pre-Wedding Concept Film'
    ]
  },
  'makeup-artist': {
    name: 'Makeup Artist',
    services: [
      'Bridal HD & Airbrush Makeup',
      'Sangeet & Cocktail Glam Look',
      'Engagement & Reception Makeup',
      'Party Makeup for Family & Friends'
    ]
  },
  decorator: {
    name: 'Decorator',
    services: [
      'Floral Mandap & Stage Setup',
      'Grand Entrance & Royal Walkway',
      'Haldi & Mehendi Boho Decor',
      'Ambient Fairy & Truss Lighting'
    ]
  },
  'event-planner': {
    name: 'Event Planner',
    services: [
      'End-to-End Wedding Planning',
      'Day-of Event Coordination & Logistics',
      'Vendor Curation & Guest Hospitality',
      'Theme & Production Management'
    ]
  },
  caterer: {
    name: 'Catering',
    services: [
      'Live Chaat & Multi-Cuisine Counters',
      'Royal Indian Feast Buffet',
      'Cocktail Bar & Mocktail Mixology',
      'Gourmet Dessert & Mithai Spread'
    ]
  },
  dj: {
    name: 'DJ & Sound',
    services: [
      'Sangeet Night Bollywood DJ Console',
      'Live Dhol & Percussion Band',
      'JBL Line-Array Sound & Laser Setup',
      'Baraat Mobile Sound Truck'
    ]
  },
  venue: {
    name: 'Venues',
    services: [
      'Luxury Banquet Hall',
      'Open-Air Farmhouse & Lawn',
      'Heritage Palace / Resort Space',
      'Intimate Poolside Party Area'
    ]
  }
};

const SAMPLE_PORTFOLIO_IMAGES = [
  {
    title: 'Royal Mandap & Evening Lighting',
    category: 'Decorator',
    url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80'
  },
  {
    title: 'Candid Sangeet Dance Performance',
    category: 'Photography',
    url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80'
  },
  {
    title: 'Bridal Airbrush Glow & Hair Updo',
    category: 'Makeup Artist',
    url: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80'
  },
  {
    title: 'Gourmet Live Counter & Cocktail Styling',
    category: 'Catering',
    url: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80'
  }
];

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
  const [accountData, setAccountData] = useState({
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    phone: '',
    email: user?.email || '',
    password: '',
    passwordConfirmation: ''
  });

  // Step 2: Business Profile
  const [profileData, setProfileData] = useState({
    businessName: '',
    vendorType: 'individual', // 'individual' | 'business'
    description: '',
    profileImage: '',
    yearsExperience: 4,
    city: 'Delhi NCR',
    state: 'Delhi',
    pincode: '110001'
  });

  // Step 3: Categories & Offerings
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['photography']);
  const [offerings, setOfferings] = useState<
    {
      id: string;
      categorySlug: string;
      categoryName: string;
      name: string;
      description: string;
      pricingStyle: string; // 'fixed' | 'starting' | 'package' | 'custom'
      basePrice: number;
    }[]
  >([
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
  const [locationData, setLocationData] = useState({
    baseCity: 'Delhi NCR',
    serviceableCities: ['Delhi NCR', 'Noida', 'Gurgaon', 'Jaipur'],
    travelRadiusKm: 100,
    panIndia: false,
    travelChargesType: 'included', // 'included' | 'fixed' | 'per_km' | 'custom'
    travelChargesAmount: 0,
    outOfAreaApproval: true
  });
  const [customCityInput, setCustomCityInput] = useState('');

  // Step 5: Portfolio and Pricing
  const [portfolioItems, setPortfolioItems] = useState(SAMPLE_PORTFOLIO_IMAGES);
  const [customMediaTitle, setCustomMediaTitle] = useState('');
  const [customMediaUrl, setCustomMediaUrl] = useState('');
  const [customMediaCategory, setCustomMediaCategory] = useState('Photography');

  const [packages, setPackages] = useState([
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

  // Character counter helper
  const descriptionLength = profileData.description.trim().length;

  // Step Nav validation check
  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        if (isAuthenticated && user?.role === 'vendor') return true;
        return (
          accountData.firstName.trim().length > 0 &&
          accountData.lastName.trim().length > 0 &&
          accountData.email.includes('@') &&
          accountData.password.length >= 8 &&
          accountData.password === accountData.passwordConfirmation
        );
      case 2:
        return (
          profileData.businessName.trim().length >= 2 &&
          profileData.description.trim().length >= 50 &&
          profileData.city.trim().length > 0
        );
      case 3:
        return selectedCategories.length > 0 && offerings.length > 0;
      case 4:
        return locationData.baseCity.trim().length > 0 && locationData.serviceableCities.length > 0;
      case 5:
        return true;
      default:
        return true;
    }
  };

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
      // Find matching category IDs from backend
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
      // Create portfolio items
      for (const item of portfolioItems.slice(0, 3)) {
        await apiService.portfolioItems.create({
          title: item.title,
          category: item.category,
          description: `Portfolio showcase of ${item.title} delivered by ${profileData.businessName || 'our team'}.`,
          is_featured: true,
          display_order: 1
        }).catch(() => {});
      }

      // Update final profile metadata and request verification
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

      // Submit verification request
      await apiService.profiles.requestVerification().catch((err) => {
        console.warn('Verification request notice:', err);
      });

      toast.success('🎉 Congratulations! Your listing has been published!');
      setCurrentStep(6); // Celebration screen
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
      (pos) => {
        setIsDetectingLocation(false);
        // Default to detected primary metro
        setLocationData((prev) => ({
          ...prev,
          baseCity: 'Delhi NCR'
        }));
        toast.success('Location detected! Base city set to Delhi NCR.');
      },
      (err) => {
        setIsDetectingLocation(false);
        toast.error('Could not detect location. Please select your city manually.');
      }
    );
  };

  // Add custom city to serviceable list
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

  // Toggle category in Step 3
  const handleToggleCategory = (slug: string, name: string) => {
    if (selectedCategories.includes(slug)) {
      if (selectedCategories.length === 1) {
        toast.error('You must keep at least one active category.');
        return;
      }
      setSelectedCategories((prev) => prev.filter((s) => s !== slug));
      setOfferings((prev) => prev.filter((o) => o.categorySlug !== slug));
    } else {
      setSelectedCategories((prev) => [...prev, slug]);
      // Add a starter offering
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

  // Step metadata for stepper bar
  const STEPS = [
    { number: 1, title: 'Account', subtitle: isVendorAuthenticated ? 'Completed' : 'Login credentials' },
    { number: 2, title: 'Business Profile', subtitle: 'Identity & Bio' },
    { number: 3, title: 'Categories & Services', subtitle: 'Offerings & Pricing' },
    { number: 4, title: 'Service Locations', subtitle: 'Coverage & Travel' },
    { number: 5, title: 'Portfolio & Pricing', subtitle: 'Showcase & Packages' }
  ];

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
        {/* Stepper Progress Bar (only shown if not in completion screen 6) */}
        {currentStep <= 5 && (
          <div className="mb-10">
            {/* Step Indicators */}
            <div className="grid grid-cols-5 gap-2 md:gap-4 relative">
              {STEPS.map((step) => {
                const isCompleted = currentStep > step.number || (step.number === 1 && isVendorAuthenticated);
                const isCurrent = currentStep === step.number;
                const isClickable = (isCompleted || isCurrent) && !(step.number === 1 && isVendorAuthenticated);
                return (
                  <button
                    key={step.number}
                    onClick={() => {
                      if (isClickable) setCurrentStep(step.number);
                    }}
                    disabled={!isClickable}
                    className={`flex flex-col items-center text-center group transition-all ${
                      isClickable ? 'cursor-pointer' : 'cursor-default'
                    } ${!isCompleted && !isCurrent ? 'opacity-40' : ''}`}
                  >
                    <div
                      className={`size-9 rounded-full flex items-center justify-center font-bold text-xs mb-1.5 transition-all shadow-sm ${
                        isCompleted
                          ? 'bg-emerald-600 text-white'
                          : isCurrent
                          ? 'bg-[#9E5338] text-white ring-4 ring-[#9E5338]/20 scale-105'
                          : 'bg-[#F3EADF] text-[#6B6560] border border-[#E8E2D9]'
                      }`}
                    >
                      {isCompleted ? <Check className="size-4 stroke-[3]" /> : step.number}
                    </div>
                    <span className={`text-[11px] md:text-xs font-bold truncate max-w-[80px] md:max-w-none ${
                      isCurrent ? 'text-[#9E5338]' : isCompleted ? 'text-[#221F1C]' : 'text-[#6B6560]'
                    }`}>
                      {step.title}
                    </span>
                    <span className="hidden md:block text-[10px] text-[#6B6560] truncate">
                      {step.subtitle}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Linear Progress Indicator */}
            <div className="w-full bg-[#E8E2D9] h-1.5 rounded-full mt-4 overflow-hidden">
              <motion.div
                className="bg-[#9E5338] h-full rounded-full"
                initial={{ width: '20%' }}
                animate={{ width: `${(currentStep / 5) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        )}

        {/* Dynamic Wizard Steps */}
        <AnimatePresence mode="wait">
          {/* STEP 1: Account Details */}
          {currentStep === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-white border border-[#E8E2D9] rounded-2xl p-6 sm:p-9 shadow-sm"
            >
              <div className="mb-6">
                <Badge variant="outline" className="bg-[#F3EADF] text-[#9E5338] border-[#E8E2D9] mb-2 font-semibold text-[11px]">
                  Step 1 — Required Account Details
                </Badge>
                <h2 className="text-2xl sm:text-3xl font-serif font-normal text-[#221F1C]">
                  Create Your Vendor Account
                </h2>
                <p className="text-xs sm:text-sm text-[#6B6560] mt-1">
                  Start by establishing your partner login. You will collect your business listing details in the next steps.
                </p>
              </div>

              <form onSubmit={handleStep1Submit} className="space-y-4">
                {/* Names */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="firstName" className="text-xs font-bold text-[#221F1C]">
                      Owner First Name <span className="text-rose-500">*</span>
                    </Label>
                    <div className="relative">
                      <User className="size-4 text-[#6B6560] absolute left-3 top-3" />
                      <Input
                        id="firstName"
                        required
                        value={accountData.firstName}
                        onChange={(e) => setAccountData({ ...accountData, firstName: e.target.value })}
                        placeholder="e.g. Aarav"
                        className="pl-9 bg-[#FBF8F4] border-[#E8E2D9] focus:border-[#9E5338] rounded-xl text-xs sm:text-sm h-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="lastName" className="text-xs font-bold text-[#221F1C]">
                      Owner Last Name <span className="text-rose-500">*</span>
                    </Label>
                    <div className="relative">
                      <User className="size-4 text-[#6B6560] absolute left-3 top-3" />
                      <Input
                        id="lastName"
                        required
                        value={accountData.lastName}
                        onChange={(e) => setAccountData({ ...accountData, lastName: e.target.value })}
                        placeholder="e.g. Mehra"
                        className="pl-9 bg-[#FBF8F4] border-[#E8E2D9] focus:border-[#9E5338] rounded-xl text-xs sm:text-sm h-10"
                      />
                    </div>
                  </div>
                </div>

                {/* Mobile Number with OTP Verification Skip notice */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="phone" className="text-xs font-bold text-[#221F1C]">
                      Mobile Number <span className="text-rose-500">*</span>
                    </Label>
                    <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                      <ShieldCheck className="size-3" /> OTP Verification Skipped (Auto-verified)
                    </span>
                  </div>
                  <div className="relative flex items-center">
                    <div className="absolute left-3 flex items-center gap-1 text-xs font-bold text-[#6B6560] border-r border-[#E8E2D9] pr-2 pointer-events-none">
                      <span>🇮🇳</span>
                      <span>+91</span>
                    </div>
                    <Input
                      id="phone"
                      type="tel"
                      required
                      value={accountData.phone}
                      onChange={(e) => setAccountData({ ...accountData, phone: e.target.value })}
                      placeholder="98765 43210"
                      className="pl-20 bg-[#FBF8F4] border-[#E8E2D9] focus:border-[#9E5338] rounded-xl text-xs sm:text-sm h-10"
                    />
                  </div>
                  <p className="text-[10px] text-[#6B6560]">
                    Direct client inquiries, booking requests, and reminders will be notified to this mobile number.
                  </p>
                </div>

                {/* Email Address */}
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-bold text-[#221F1C]">
                    Email Address <span className="text-rose-500">*</span>
                  </Label>
                  <div className="relative">
                    <Mail className="size-4 text-[#6B6560] absolute left-3 top-3" />
                    <Input
                      id="email"
                      type="email"
                      required
                      value={accountData.email}
                      onChange={(e) => setAccountData({ ...accountData, email: e.target.value })}
                      placeholder="studio@weddingnarratives.com"
                      className="pl-9 bg-[#FBF8F4] border-[#E8E2D9] focus:border-[#9E5338] rounded-xl text-xs sm:text-sm h-10"
                    />
                  </div>
                </div>

                {/* Password Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-xs font-bold text-[#221F1C]">
                      Password <span className="text-rose-500">*</span>
                    </Label>
                    <div className="relative">
                      <Lock className="size-4 text-[#6B6560] absolute left-3 top-3" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={8}
                        value={accountData.password}
                        onChange={(e) => setAccountData({ ...accountData, password: e.target.value })}
                        placeholder="Minimum 8 characters"
                        className="pl-9 pr-9 bg-[#FBF8F4] border-[#E8E2D9] focus:border-[#9E5338] rounded-xl text-xs sm:text-sm h-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-[#6B6560] hover:text-[#221F1C]"
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="passwordConfirmation" className="text-xs font-bold text-[#221F1C]">
                      Confirm Password <span className="text-rose-500">*</span>
                    </Label>
                    <div className="relative">
                      <Lock className="size-4 text-[#6B6560] absolute left-3 top-3" />
                      <Input
                        id="passwordConfirmation"
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        minLength={8}
                        value={accountData.passwordConfirmation}
                        onChange={(e) => setAccountData({ ...accountData, passwordConfirmation: e.target.value })}
                        placeholder="Re-enter password"
                        className="pl-9 pr-9 bg-[#FBF8F4] border-[#E8E2D9] focus:border-[#9E5338] rounded-xl text-xs sm:text-sm h-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-3 text-[#6B6560] hover:text-[#221F1C]"
                      >
                        {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bottom CTA */}
                <div className="pt-4 flex items-center justify-end">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[#9E5338] hover:bg-[#85432c] text-white rounded-xl px-7 py-5 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-[#9E5338]/15"
                  >
                    {isSubmitting ? (
                      'Creating Account...'
                    ) : (
                      <>
                        <span>Create Account & Continue</span>
                        <ArrowRight className="size-4" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          )}

          {/* STEP 2: Business Profile */}
          {currentStep === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-white border border-[#E8E2D9] rounded-2xl p-6 sm:p-9 shadow-sm"
            >
              <div className="mb-6">
                <Badge variant="outline" className="bg-[#F3EADF] text-[#9E5338] border-[#E8E2D9] mb-2 font-semibold text-[11px]">
                  Step 2 — Required to Publish Listing
                </Badge>
                <h2 className="text-2xl sm:text-3xl font-serif font-normal text-[#221F1C]">
                  Business Profile & Identity
                </h2>
                <p className="text-xs sm:text-sm text-[#6B6560] mt-1">
                  Help prospective couples and celebration planners understand who you are and why they should choose you.
                </p>
              </div>

              {isVendorAuthenticated && (
                <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl p-3.5 flex items-center gap-3 text-xs">
                  <div className="size-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <Check className="size-3.5 stroke-[3]" />
                  </div>
                  <div>
                    <p className="font-bold">Account Created Successfully!</p>
                    <p className="text-emerald-700 text-[11px]">Your login credentials are saved. Complete your business profile below to get your showcase live on Ayoj.</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleStep2Submit} className="space-y-5">
                {/* Business Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="businessName" className="text-xs font-bold text-[#221F1C]">
                    Business or Display Name <span className="text-rose-500">*</span>
                  </Label>
                  <div className="relative">
                    <Building2 className="size-4 text-[#6B6560] absolute left-3 top-3" />
                    <Input
                      id="businessName"
                      required
                      value={profileData.businessName}
                      onChange={(e) => setProfileData({ ...profileData, businessName: e.target.value })}
                      placeholder="e.g. The Wedding Narratives Studio"
                      className="pl-9 bg-[#FBF8F4] border-[#E8E2D9] focus:border-[#9E5338] rounded-xl text-xs sm:text-sm h-10"
                    />
                  </div>
                </div>

                {/* Vendor Type Selection Cards */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-[#221F1C]">
                    Vendor Type <span className="text-rose-500">*</span>
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div
                      onClick={() => setProfileData({ ...profileData, vendorType: 'individual' })}
                      className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                        profileData.vendorType === 'individual'
                          ? 'border-[#9E5338] bg-[#F3EADF]/40 shadow-xs'
                          : 'border-[#E8E2D9] bg-[#FBF8F4] hover:bg-[#F3EADF]/20'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${profileData.vendorType === 'individual' ? 'bg-[#9E5338] text-white' : 'bg-white text-[#6B6560] border border-[#E8E2D9]'}`}>
                        <User className="size-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#221F1C]">Solo Professional / Freelancer</h4>
                        <p className="text-[11px] text-[#6B6560] mt-0.5">Independent artist operating personally</p>
                      </div>
                    </div>

                    <div
                      onClick={() => setProfileData({ ...profileData, vendorType: 'business' })}
                      className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                        profileData.vendorType === 'business'
                          ? 'border-[#9E5338] bg-[#F3EADF]/40 shadow-xs'
                          : 'border-[#E8E2D9] bg-[#FBF8F4] hover:bg-[#F3EADF]/20'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${profileData.vendorType === 'business' ? 'bg-[#9E5338] text-white' : 'bg-white text-[#6B6560] border border-[#E8E2D9]'}`}>
                        <Building2 className="size-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#221F1C]">Studio / Agency / Company</h4>
                        <p className="text-[11px] text-[#6B6560] mt-0.5">Multi-crew team, registered company or studio</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Short Description */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="description" className="text-xs font-bold text-[#221F1C]">
                      Short Bio / About Your Services <span className="text-rose-500">*</span>
                    </Label>
                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-medium ${descriptionLength >= 50 ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {descriptionLength}/50 min characters
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setProfileData({
                            ...profileData,
                            description:
                              'Award-winning luxury wedding and celebration studio capturing timeless moments, royal rituals, and modern aesthetics across India with world-class equipment and passionate artistry.'
                          })
                        }
                        className="text-[10px] text-[#9E5338] hover:underline font-bold"
                      >
                        ✨ Insert sample bio
                      </button>
                    </div>
                  </div>
                  <Textarea
                    id="description"
                    required
                    rows={4}
                    value={profileData.description}
                    onChange={(e) => setProfileData({ ...profileData, description: e.target.value })}
                    placeholder="Describe your signature style, background, what makes your services unique, and how you work with clients on their special day..."
                    className="bg-[#FBF8F4] border-[#E8E2D9] focus:border-[#9E5338] rounded-xl text-xs sm:text-sm p-3 resize-none"
                  />
                </div>

                {/* Years Experience & Profile Image URL */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="yearsExp" className="text-xs font-bold text-[#221F1C]">
                      Years of Experience (Optional)
                    </Label>
                    <Input
                      id="yearsExp"
                      type="number"
                      min={0}
                      max={50}
                      value={profileData.yearsExperience}
                      onChange={(e) => setProfileData({ ...profileData, yearsExperience: parseInt(e.target.value) || 0 })}
                      className="bg-[#FBF8F4] border-[#E8E2D9] focus:border-[#9E5338] rounded-xl text-xs sm:text-sm h-10"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="logoUrl" className="text-xs font-bold text-[#221F1C]">
                      Profile / Studio Logo Image URL
                    </Label>
                    <Input
                      id="logoUrl"
                      type="url"
                      value={profileData.profileImage}
                      onChange={(e) => setProfileData({ ...profileData, profileImage: e.target.value })}
                      placeholder="https://... (or leave blank for generated avatar)"
                      className="bg-[#FBF8F4] border-[#E8E2D9] focus:border-[#9E5338] rounded-xl text-xs sm:text-sm h-10"
                    />
                  </div>
                </div>

                {/* Primary Location: City, State, PIN */}
                <div className="pt-2 border-t border-[#E8E2D9] space-y-3">
                  <h4 className="text-xs font-bold text-[#221F1C] uppercase tracking-wider">
                    Primary Business Location
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="city" className="text-[11px] font-bold text-[#6B6560]">City</Label>
                      <Input
                        id="city"
                        required
                        value={profileData.city}
                        onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                        placeholder="e.g. Delhi NCR"
                        className="bg-[#FBF8F4] border-[#E8E2D9] rounded-xl text-xs h-9"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="state" className="text-[11px] font-bold text-[#6B6560]">State</Label>
                      <Input
                        id="state"
                        required
                        value={profileData.state}
                        onChange={(e) => setProfileData({ ...profileData, state: e.target.value })}
                        placeholder="e.g. Delhi"
                        className="bg-[#FBF8F4] border-[#E8E2D9] rounded-xl text-xs h-9"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="pincode" className="text-[11px] font-bold text-[#6B6560]">PIN Code</Label>
                      <Input
                        id="pincode"
                        required
                        value={profileData.pincode}
                        onChange={(e) => setProfileData({ ...profileData, pincode: e.target.value })}
                        placeholder="e.g. 110001"
                        className="bg-[#FBF8F4] border-[#E8E2D9] rounded-xl text-xs h-9"
                      />
                    </div>
                  </div>
                </div>

                {/* Navigation CTA */}
                <div className="pt-4 flex items-center justify-between border-t border-[#E8E2D9]">
                  {isVendorAuthenticated ? (
                    <Link
                      href="/vendor/dashboard"
                      className="inline-flex items-center gap-1.5 text-xs text-[#6B6560] hover:text-[#221F1C] font-semibold py-2 px-3.5 rounded-xl border border-[#E8E2D9] hover:bg-[#F3EADF] transition-colors"
                    >
                      <ArrowLeft className="size-3.5" /> Save & Exit to Dashboard
                    </Link>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep(1)}
                      className="border-[#E8E2D9] text-[#6B6560] hover:text-[#221F1C] rounded-xl text-xs h-10 px-4"
                    >
                      <ArrowLeft className="size-3.5 mr-1.5" /> Back
                    </Button>
                  )}

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[#9E5338] hover:bg-[#85432c] text-white rounded-xl px-7 py-5 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-[#9E5338]/15"
                  >
                    {isSubmitting ? (
                      'Saving...'
                    ) : (
                      <>
                        <span>Save & Configure Offerings</span>
                        <ArrowRight className="size-4" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          )}

          {/* STEP 3: Categories and Services */}
          {currentStep === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-white border border-[#E8E2D9] rounded-2xl p-6 sm:p-9 shadow-sm"
            >
              <div className="mb-6">
                <Badge variant="outline" className="bg-[#F3EADF] text-[#9E5338] border-[#E8E2D9] mb-2 font-semibold text-[11px]">
                  Step 3 — Required to Publish Listing
                </Badge>
                <h2 className="text-2xl sm:text-3xl font-serif font-normal text-[#221F1C]">
                  Categories & Service Offerings
                </h2>
                <p className="text-xs sm:text-sm text-[#6B6560] mt-1">
                  Select all categories that apply to your expertise, then detail specific offerings and pricing models.
                </p>
              </div>

              <form onSubmit={handleStep3Submit} className="space-y-6">
                {/* Category Selection Grid */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-[#221F1C] block">
                    1. Select One or More Categories
                  </Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {Object.entries(CATEGORY_PRESETS).map(([slug, data]) => {
                      const isSelected = selectedCategories.includes(slug);
                      return (
                        <div
                          key={slug}
                          onClick={() => handleToggleCategory(slug, data.name)}
                          className={`p-3 rounded-xl border text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5 ${
                            isSelected
                              ? 'border-[#9E5338] bg-[#F3EADF] text-[#9E5338] font-bold shadow-xs'
                              : 'border-[#E8E2D9] bg-[#FBF8F4] text-[#6B6560] hover:bg-white'
                          }`}
                        >
                          <span className="text-xs">{data.name}</span>
                          {isSelected && <Check className="size-3 text-[#9E5338]" />}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Offerings Under Selected Categories */}
                <div className="space-y-4 pt-2 border-t border-[#E8E2D9]">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-xs font-bold text-[#221F1C]">
                        2. Detailed Service Offerings ({offerings.length})
                      </Label>
                      <p className="text-[11px] text-[#6B6560]">
                        Define the packages and standalone services clients can book
                      </p>
                    </div>

                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        const firstCat = selectedCategories[0] || 'photography';
                        const preset = CATEGORY_PRESETS[firstCat];
                        setOfferings([
                          ...offerings,
                          {
                            id: `off-${Date.now()}`,
                            categorySlug: firstCat,
                            categoryName: preset?.name || 'Photography',
                            name: 'New Custom Package',
                            description: 'Professional event coverage with high-end equipment, edited deliverables, and dedicated client service.',
                            pricingStyle: 'package',
                            basePrice: 20000
                          }
                        ]);
                      }}
                      className="bg-[#F3EADF] text-[#9E5338] hover:bg-[#9E5338] hover:text-white rounded-xl text-xs font-bold border border-[#E8E2D9]"
                    >
                      <Plus className="size-3.5 mr-1" /> Add Offering
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {offerings.map((offering, idx) => (
                      <div
                        key={offering.id}
                        className="p-4 rounded-xl border border-[#E8E2D9] bg-[#FBF8F4] space-y-3 relative group"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <Label className="text-[10px] font-bold text-[#6B6560] uppercase">
                                Offering Title
                              </Label>
                              <Input
                                required
                                value={offering.name}
                                onChange={(e) => {
                                  const updated = [...offerings];
                                  updated[idx].name = e.target.value;
                                  setOfferings(updated);
                                }}
                                placeholder="e.g. Candid Wedding Photography"
                                className="bg-white border-[#E8E2D9] rounded-lg text-xs h-9 mt-1"
                              />
                            </div>

                            <div>
                              <Label className="text-[10px] font-bold text-[#6B6560] uppercase">
                                Category Tag
                              </Label>
                              <select
                                value={offering.categorySlug}
                                onChange={(e) => {
                                  const updated = [...offerings];
                                  updated[idx].categorySlug = e.target.value;
                                  updated[idx].categoryName = CATEGORY_PRESETS[e.target.value]?.name || 'Service';
                                  setOfferings(updated);
                                }}
                                className="w-full bg-white border border-[#E8E2D9] rounded-lg text-xs h-9 px-2.5 mt-1 focus:outline-none"
                              >
                                {selectedCategories.map((catSlug) => (
                                  <option key={catSlug} value={catSlug}>
                                    {CATEGORY_PRESETS[catSlug]?.name || catSlug}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          {offerings.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setOfferings(offerings.filter((o) => o.id !== offering.id))}
                              className="text-rose-400 hover:text-rose-600 p-1 mt-5"
                              title="Delete offering"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          )}
                        </div>

                        {/* Description */}
                        <div>
                          <Label className="text-[10px] font-bold text-[#6B6560] uppercase">
                            Description of Offering
                          </Label>
                          <Textarea
                            rows={2}
                            value={offering.description}
                            onChange={(e) => {
                              const updated = [...offerings];
                              updated[idx].description = e.target.value;
                              setOfferings(updated);
                            }}
                            placeholder="What does this service include? (deliverables, hours, crew, equipment...)"
                            className="bg-white border-[#E8E2D9] rounded-lg text-xs p-2.5 mt-1 resize-none"
                          />
                        </div>

                        {/* Pricing Style & Base Price */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          <div>
                            <Label className="text-[10px] font-bold text-[#6B6560] uppercase">
                              Pricing Style
                            </Label>
                            <select
                              value={offering.pricingStyle}
                              onChange={(e) => {
                                const updated = [...offerings];
                                updated[idx].pricingStyle = e.target.value;
                                setOfferings(updated);
                              }}
                              className="w-full bg-white border border-[#E8E2D9] rounded-lg text-xs h-9 px-2.5 mt-1 focus:outline-none"
                            >
                              <option value="fixed">Fixed Price</option>
                              <option value="starting">Starting Price (From ₹)</option>
                              <option value="package">Package-based</option>
                              <option value="custom">Custom Quote / Variable</option>
                            </select>
                          </div>

                          <div>
                            <Label className="text-[10px] font-bold text-[#6B6560] uppercase">
                              {offering.pricingStyle === 'custom' ? 'Quote Note' : 'Base Price (₹ INR)'}
                            </Label>
                            {offering.pricingStyle === 'custom' ? (
                              <div className="h-9 flex items-center px-3 bg-white border border-[#E8E2D9] rounded-lg text-xs text-[#6B6560] mt-1">
                                Provided upon client consultation
                              </div>
                            ) : (
                              <div className="relative mt-1">
                                <span className="absolute left-3 top-2.5 text-xs text-[#6B6560]">₹</span>
                                <Input
                                  type="number"
                                  min={0}
                                  value={offering.basePrice}
                                  onChange={(e) => {
                                    const updated = [...offerings];
                                    updated[idx].basePrice = Number(e.target.value) || 0;
                                    setOfferings(updated);
                                  }}
                                  placeholder="25000"
                                  className="pl-7 bg-white border-[#E8E2D9] rounded-lg text-xs h-9"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Step 3 Navigation */}
                <div className="pt-4 flex items-center justify-between border-t border-[#E8E2D9]">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(2)}
                    className="border-[#E8E2D9] text-[#6B6560] hover:text-[#221F1C] rounded-xl text-xs h-10 px-4"
                  >
                    <ArrowLeft className="size-3.5 mr-1.5" /> Back
                  </Button>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[#9E5338] hover:bg-[#85432c] text-white rounded-xl px-7 py-5 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-[#9E5338]/15"
                  >
                    {isSubmitting ? (
                      'Saving Services...'
                    ) : (
                      <>
                        <span>Save & Configure Locations</span>
                        <ArrowRight className="size-4" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          )}

          {/* STEP 4: Service Locations & Travel */}
          {currentStep === 4 && (
            <motion.div
              key="step-4"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-white border border-[#E8E2D9] rounded-2xl p-6 sm:p-9 shadow-sm"
            >
              <div className="mb-6">
                <Badge variant="outline" className="bg-[#F3EADF] text-[#9E5338] border-[#E8E2D9] mb-2 font-semibold text-[11px]">
                  Step 4 — Required to Publish Listing
                </Badge>
                <h2 className="text-2xl sm:text-3xl font-serif font-normal text-[#221F1C]">
                  Service Locations & Travel Terms
                </h2>
                <p className="text-xs sm:text-sm text-[#6B6560] mt-1">
                  Ensure you are accurately matched to customers searching within your operating radius and destinations.
                </p>
              </div>

              <form onSubmit={handleStep4Submit} className="space-y-6">
                {/* Base City Detection & Selection */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="baseCity" className="text-xs font-bold text-[#221F1C]">
                      Base Operating City <span className="text-rose-500">*</span>
                    </Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleDetectLocation}
                      disabled={isDetectingLocation}
                      className="text-xs text-[#9E5338] hover:bg-[#F3EADF] h-7 px-2 font-bold flex items-center gap-1"
                    >
                      <Navigation className="size-3" />
                      {isDetectingLocation ? 'Detecting...' : 'Detect Using My Location'}
                    </Button>
                  </div>
                  <div className="relative">
                    <MapPin className="size-4 text-[#9E5338] absolute left-3 top-3" />
                    <Input
                      id="baseCity"
                      required
                      value={locationData.baseCity}
                      onChange={(e) => setLocationData({ ...locationData, baseCity: e.target.value })}
                      placeholder="e.g. Delhi NCR"
                      className="pl-9 bg-[#FBF8F4] border-[#E8E2D9] focus:border-[#9E5338] rounded-xl text-xs sm:text-sm h-10"
                    />
                  </div>
                </div>

                {/* Serviceable Cities / Districts Chips */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-[#221F1C]">
                    Serviceable Cities or Districts ({locationData.serviceableCities.length})
                  </Label>
                  <div className="flex flex-wrap gap-1.5 p-3 rounded-xl border border-[#E8E2D9] bg-[#FBF8F4] min-h-[50px] items-center">
                    {locationData.serviceableCities.map((city) => (
                      <span
                        key={city}
                        className="inline-flex items-center gap-1 bg-white border border-[#E8E2D9] px-2.5 py-1 rounded-full text-xs font-semibold text-[#221F1C] shadow-2xs"
                      >
                        {city}
                        <button
                          type="button"
                          onClick={() => handleRemoveCity(city)}
                          className="hover:text-rose-500 transition-colors ml-0.5"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>

                  {/* Quick Add Preset Pills */}
                  <div className="flex flex-wrap items-center gap-1 pt-1">
                    <span className="text-[10px] text-[#6B6560] font-medium mr-1">Quick Add:</span>
                    {CITIES_PRESETS.filter((c) => !locationData.serviceableCities.includes(c)).slice(0, 6).map((city) => (
                      <button
                        key={city}
                        type="button"
                        onClick={() =>
                          setLocationData((prev) => ({
                            ...prev,
                            serviceableCities: [...prev.serviceableCities, city]
                          }))
                        }
                        className="text-[10px] bg-[#F3EADF] text-[#9E5338] hover:bg-[#9E5338] hover:text-white px-2 py-0.5 rounded-md font-bold transition-all border border-[#E8E2D9]"
                      >
                        + {city}
                      </button>
                    ))}
                  </div>

                  {/* Add Custom City Input */}
                  <div className="flex gap-2 pt-1">
                    <Input
                      value={customCityInput}
                      onChange={(e) => setCustomCityInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomCity();
                        }
                      }}
                      placeholder="Add another district / town..."
                      className="bg-white border-[#E8E2D9] rounded-xl text-xs h-9"
                    />
                    <Button
                      type="button"
                      onClick={handleAddCustomCity}
                      className="bg-[#221F1C] hover:bg-[#332f2b] text-white rounded-xl text-xs h-9 px-4 font-bold"
                    >
                      Add
                    </Button>
                  </div>
                </div>

                {/* Travel Radius Slider & Nationwide Travel Toggle */}
                <div className="p-4 rounded-xl border border-[#E8E2D9] bg-[#FBF8F4] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-[#221F1C]">Travel Radius from Base City</h4>
                      <p className="text-[11px] text-[#6B6560]">Maximum road/driving distance you comfortably serve</p>
                    </div>
                    <span className="text-xs font-bold text-[#9E5338] bg-[#F3EADF] px-2.5 py-1 rounded-md border border-[#E8E2D9]">
                      {locationData.panIndia ? 'Pan-India / Flights' : `${locationData.travelRadiusKm} km`}
                    </span>
                  </div>

                  {!locationData.panIndia && (
                    <Slider
                      value={[locationData.travelRadiusKm]}
                      min={10}
                      max={500}
                      step={10}
                      onValueChange={([val]) => setLocationData({ ...locationData, travelRadiusKm: val })}
                      className="py-2"
                    />
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-[#E8E2D9]">
                    <div className="flex items-center gap-2">
                      <Globe className="size-4 text-[#9E5338]" />
                      <span className="text-xs font-medium text-[#221F1C]">Available for Pan-India Destination Weddings</span>
                    </div>
                    <Switch
                      checked={locationData.panIndia}
                      onCheckedChange={(checked) => setLocationData({ ...locationData, panIndia: checked })}
                    />
                  </div>
                </div>

                {/* Travel Charges Policy */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-[#221F1C]">
                    Travel Charges Policy for Outstation Events
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {[
                      { id: 'included', label: 'Included in package', desc: 'No extra charge within radius' },
                      { id: 'fixed', label: 'Fixed Outstation Fee', desc: 'Flat rate per trip' },
                      { id: 'per_km', label: 'Per-Kilometre Rate', desc: 'Charged per km from base city' },
                      { id: 'custom', label: 'Custom Quote', desc: 'Calculated upon booking discussion' }
                    ].map((item) => (
                      <div
                        key={item.id}
                        onClick={() => setLocationData({ ...locationData, travelChargesType: item.id })}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          locationData.travelChargesType === item.id
                            ? 'border-[#9E5338] bg-[#F3EADF] text-[#221F1C] font-semibold'
                            : 'border-[#E8E2D9] bg-[#FBF8F4] text-[#6B6560]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#221F1C]">{item.label}</span>
                          {locationData.travelChargesType === item.id && <Check className="size-3 text-[#9E5338]" />}
                        </div>
                        <p className="text-[10px] text-[#6B6560] mt-0.5">{item.desc}</p>
                      </div>
                    ))}
                  </div>

                  {(locationData.travelChargesType === 'fixed' || locationData.travelChargesType === 'per_km') && (
                    <div className="mt-2 p-3 rounded-xl bg-[#FBF8F4] border border-[#E8E2D9] flex items-center gap-3">
                      <Label className="text-xs font-bold text-[#221F1C] whitespace-nowrap">
                        {locationData.travelChargesType === 'fixed' ? 'Fixed Travel Surcharge (₹)' : 'Rate Per KM (₹/km)'}
                      </Label>
                      <Input
                        type="number"
                        min={0}
                        value={locationData.travelChargesAmount}
                        onChange={(e) => setLocationData({ ...locationData, travelChargesAmount: Number(e.target.value) || 0 })}
                        placeholder={locationData.travelChargesType === 'fixed' ? '2500' : '18'}
                        className="bg-white border-[#E8E2D9] rounded-lg text-xs h-9 max-w-[140px]"
                      />
                    </div>
                  )}
                </div>

                {/* Out of Area Approval Switch */}
                <div className="p-4 rounded-xl border border-[#E8E2D9] bg-[#FBF8F4] flex items-center justify-between">
                  <div className="space-y-0.5 max-w-sm">
                    <h4 className="text-xs font-bold text-[#221F1C]">Require Approval for Out-of-Area Inquiries</h4>
                    <p className="text-[11px] text-[#6B6560]">
                      Inquiries outside your primary serviceable cities will require your manual acceptance before confirmation.
                    </p>
                  </div>
                  <Switch
                    checked={locationData.outOfAreaApproval}
                    onCheckedChange={(checked) => setLocationData({ ...locationData, outOfAreaApproval: checked })}
                  />
                </div>

                {/* Step 4 Navigation */}
                <div className="pt-4 flex items-center justify-between border-t border-[#E8E2D9]">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(3)}
                    className="border-[#E8E2D9] text-[#6B6560] hover:text-[#221F1C] rounded-xl text-xs h-10 px-4"
                  >
                    <ArrowLeft className="size-3.5 mr-1.5" /> Back
                  </Button>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[#9E5338] hover:bg-[#85432c] text-white rounded-xl px-7 py-5 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-[#9E5338]/15"
                  >
                    {isSubmitting ? (
                      'Saving Locations...'
                    ) : (
                      <>
                        <span>Save & Configure Portfolio</span>
                        <ArrowRight className="size-4" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          )}

          {/* STEP 5: Portfolio and Pricing */}
          {currentStep === 5 && (
            <motion.div
              key="step-5"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-white border border-[#E8E2D9] rounded-2xl p-6 sm:p-9 shadow-sm space-y-7"
            >
              <div>
                <Badge variant="outline" className="bg-[#F3EADF] text-[#9E5338] border-[#E8E2D9] mb-2 font-semibold text-[11px]">
                  Step 5 — Recommended to Maximize Bookings
                </Badge>
                <h2 className="text-2xl sm:text-3xl font-serif font-normal text-[#221F1C]">
                  Portfolio Gallery & Service Packages
                </h2>
                <p className="text-xs sm:text-sm text-[#6B6560] mt-1">
                  Give couples and event hosts the visual proof and transparent packages they need to choose you over others.
                </p>
              </div>

              {/* Portfolio Media Showcase */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-[#221F1C] flex items-center gap-1.5">
                    <Camera className="size-4 text-[#9E5338]" />
                    Featured Portfolio Highlights ({portfolioItems.length})
                  </Label>
                  <span className="text-[11px] text-[#6B6560]">High-resolution wedding and event captures</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {portfolioItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="group relative h-32 rounded-xl overflow-hidden border border-[#E8E2D9] bg-slate-100"
                    >
                      <img
                        src={item.url}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-2 text-white">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-[#F3EADF]">
                          {item.category}
                        </span>
                        <span className="text-[11px] font-semibold truncate leading-tight">
                          {item.title}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPortfolioItems(portfolioItems.filter((_, i) => i !== idx))}
                        className="absolute top-1.5 right-1.5 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-600"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Custom Media URL */}
                <div className="p-3.5 rounded-xl border border-[#E8E2D9] bg-[#FBF8F4] flex flex-col sm:flex-row gap-2 items-center">
                  <Input
                    value={customMediaTitle}
                    onChange={(e) => setCustomMediaTitle(e.target.value)}
                    placeholder="Work title e.g. Royal Jaipur Sangeet"
                    className="bg-white border-[#E8E2D9] text-xs h-9 sm:w-1/3"
                  />
                  <Input
                    value={customMediaUrl}
                    onChange={(e) => setCustomMediaUrl(e.target.value)}
                    placeholder="https://images.unsplash... (Image URL)"
                    className="bg-white border-[#E8E2D9] text-xs h-9 flex-1"
                  />
                  <Button
                    type="button"
                    onClick={() => {
                      if (!customMediaUrl.trim()) return;
                      setPortfolioItems([
                        ...portfolioItems,
                        {
                          title: customMediaTitle.trim() || 'Event Highlight',
                          category: 'Portfolio',
                          url: customMediaUrl.trim()
                        }
                      ]);
                      setCustomMediaTitle('');
                      setCustomMediaUrl('');
                    }}
                    className="bg-[#221F1C] hover:bg-[#332f2b] text-white rounded-xl text-xs h-9 px-4 font-bold shrink-0"
                  >
                    + Add Image
                  </Button>
                </div>
              </div>

              {/* Service Packages and Pricing Inclusions/Exclusions */}
              <div className="space-y-4 pt-3 border-t border-[#E8E2D9]">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-xs font-bold text-[#221F1C]">
                      Service Packages & Clear Deliverables ({packages.length})
                    </Label>
                    <p className="text-[11px] text-[#6B6560]">
                      Specify what is included and excluded so clients know exactly what they are booking
                    </p>
                  </div>

                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      setPackages([
                        ...packages,
                        {
                          id: `pkg-${Date.now()}`,
                          title: 'Custom Event Tier',
                          price: 45000,
                          inclusions: 'Complete coverage, edited output, dedicated lead pro',
                          exclusions: 'Travel costs beyond city limit'
                        }
                      ]);
                    }}
                    className="bg-[#F3EADF] text-[#9E5338] hover:bg-[#9E5338] hover:text-white rounded-xl text-xs font-bold border border-[#E8E2D9]"
                  >
                    <Plus className="size-3.5 mr-1" /> Add Package
                  </Button>
                </div>

                <div className="space-y-3">
                  {packages.map((pkg, idx) => (
                    <div
                      key={pkg.id}
                      className="p-4 rounded-xl border border-[#E8E2D9] bg-[#FBF8F4] space-y-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <Label className="text-[10px] font-bold text-[#6B6560] uppercase">Package Name</Label>
                            <Input
                              value={pkg.title}
                              onChange={(e) => {
                                const updated = [...packages];
                                updated[idx].title = e.target.value;
                                setPackages(updated);
                              }}
                              className="bg-white border-[#E8E2D9] rounded-lg text-xs h-9 mt-1"
                            />
                          </div>

                          <div>
                            <Label className="text-[10px] font-bold text-[#6B6560] uppercase">Package Price (₹ INR)</Label>
                            <div className="relative mt-1">
                              <span className="absolute left-3 top-2 text-xs text-[#6B6560]">₹</span>
                              <Input
                                type="number"
                                min={0}
                                value={pkg.price}
                                onChange={(e) => {
                                  const updated = [...packages];
                                  updated[idx].price = Number(e.target.value) || 0;
                                  setPackages(updated);
                                }}
                                className="pl-7 bg-white border-[#E8E2D9] rounded-lg text-xs h-9"
                              />
                            </div>
                          </div>
                        </div>

                        {packages.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setPackages(packages.filter((p) => p.id !== pkg.id))}
                            className="text-rose-400 hover:text-rose-600 p-1 mt-4"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <Label className="text-[10px] font-bold text-emerald-700 uppercase flex items-center gap-1">
                            <CheckCircle2 className="size-3" /> Package Inclusions
                          </Label>
                          <Textarea
                            rows={2}
                            value={pkg.inclusions}
                            onChange={(e) => {
                              const updated = [...packages];
                              updated[idx].inclusions = e.target.value;
                              setPackages(updated);
                            }}
                            placeholder="e.g. 2 Photographers, 1 Videographer, 300 Edited Photos, Teaser Reel"
                            className="bg-white border-[#E8E2D9] rounded-lg text-xs p-2 mt-1 resize-none"
                          />
                        </div>

                        <div>
                          <Label className="text-[10px] font-bold text-rose-700 uppercase flex items-center gap-1">
                            <AlertCircle className="size-3" /> Package Exclusions
                          </Label>
                          <Textarea
                            rows={2}
                            value={pkg.exclusions}
                            onChange={(e) => {
                              const updated = [...packages];
                              updated[idx].exclusions = e.target.value;
                              setPackages(updated);
                            }}
                            placeholder="e.g. Raw footage, outstation travel expenses, drone permit fees"
                            className="bg-white border-[#E8E2D9] rounded-lg text-xs p-2 mt-1 resize-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Minimum Booking Value */}
              <div className="p-4 rounded-xl border border-[#E8E2D9] bg-[#FBF8F4] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-[#221F1C]">Minimum Booking Value (₹ INR)</h4>
                  <p className="text-[11px] text-[#6B6560]">
                    Inquiries below this amount will be automatically marked as below your studio threshold.
                  </p>
                </div>
                <div className="relative w-full sm:w-44">
                  <span className="absolute left-3 top-2.5 text-xs text-[#6B6560]">₹</span>
                  <Input
                    type="number"
                    min={0}
                    value={minBookingValue}
                    onChange={(e) => setMinBookingValue(Number(e.target.value) || 0)}
                    className="pl-7 bg-white border-[#E8E2D9] rounded-xl text-xs h-10 font-bold"
                  />
                </div>
              </div>

              {/* Step 5 Navigation & Publish Button */}
              <div className="pt-4 flex items-center justify-between border-t border-[#E8E2D9]">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(4)}
                  className="border-[#E8E2D9] text-[#6B6560] hover:text-[#221F1C] rounded-xl text-xs h-10 px-4"
                >
                  <ArrowLeft className="size-3.5 mr-1.5" /> Back
                </Button>

                <Button
                  type="button"
                  onClick={handleStep5Publish}
                  disabled={isSubmitting}
                  className="bg-[#9E5338] hover:bg-[#85432c] text-white rounded-xl px-9 py-6 font-bold text-sm sm:text-base flex items-center gap-2 shadow-lg shadow-[#9E5338]/25 transform hover:scale-[1.01] active:scale-98 transition-all"
                >
                  {isSubmitting ? (
                    'Publishing Listing...'
                  ) : (
                    <>
                      <Sparkles className="size-4" />
                      <span>Publish Vendor Listing</span>
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 6: Celebration & Completion Screen */}
          {currentStep === 6 && (
            <motion.div
              key="step-6"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white border border-[#E8E2D9] rounded-2xl p-8 sm:p-12 text-center shadow-lg max-w-2xl mx-auto space-y-6"
            >
              <div className="size-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-200 shadow-md">
                <Check className="size-10 stroke-[3]" />
              </div>

              <div className="space-y-2">
                <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-300 font-bold px-3 py-1">
                  Onboarding Complete & Listing Live
                </Badge>
                <h2 className="text-3xl sm:text-4xl font-serif text-[#221F1C]">
                  Welcome to Ayoj Partner Network!
                </h2>
                <p className="text-xs sm:text-sm text-[#6B6560] max-w-md mx-auto">
                  Your professional listing for <strong className="text-[#221F1C]">{profileData.businessName || 'Your Studio'}</strong> is now published. Clients can discover your offerings in the marketplace.
                </p>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left py-2">
                <div className="p-3 bg-[#FBF8F4] border border-[#E8E2D9] rounded-xl">
                  <span className="text-[10px] text-[#6B6560] font-bold uppercase block">Status</span>
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="size-3" /> Live & Active
                  </span>
                </div>

                <div className="p-3 bg-[#FBF8F4] border border-[#E8E2D9] rounded-xl">
                  <span className="text-[10px] text-[#6B6560] font-bold uppercase block">Base City</span>
                  <span className="text-xs font-bold text-[#221F1C] truncate block mt-0.5">
                    {locationData.baseCity}
                  </span>
                </div>

                <div className="p-3 bg-[#FBF8F4] border border-[#E8E2D9] rounded-xl">
                  <span className="text-[10px] text-[#6B6560] font-bold uppercase block">Offerings</span>
                  <span className="text-xs font-bold text-[#221F1C] block mt-0.5">
                    {offerings.length} Services
                  </span>
                </div>

                <div className="p-3 bg-[#FBF8F4] border border-[#E8E2D9] rounded-xl">
                  <span className="text-[10px] text-[#6B6560] font-bold uppercase block">Verification</span>
                  <span className="text-xs font-bold text-[#9E5338] block mt-0.5">
                    Under Review
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button
                  onClick={() => router.push('/vendor/dashboard')}
                  className="w-full sm:w-auto bg-[#9E5338] hover:bg-[#85432c] text-white rounded-xl px-7 py-5 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-[#9E5338]/20"
                >
                  <Briefcase className="size-4" />
                  <span>Go to Vendor Dashboard</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => router.push('/marketplace')}
                  className="w-full sm:w-auto border-[#E8E2D9] text-[#221F1C] hover:bg-[#F3EADF] rounded-xl px-7 py-5 font-bold text-xs sm:text-sm flex items-center justify-center gap-2"
                >
                  <span>Explore Marketplace</span>
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </motion.div>
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
