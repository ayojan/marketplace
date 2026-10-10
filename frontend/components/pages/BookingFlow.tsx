'use client';

import React, { useState, useEffect, useCallback, useId, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { apiService } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock, 
  IndianRupee, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle,
  MapPin,
  Loader2,
  CalendarDays,
  ShieldCheck,
  Info,
  Sparkles,
  Building,
  Check,
  ChevronRight,
  HelpCircle
} from 'lucide-react';
import Header from '@/components/Header';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import Link from 'next/link';
import { MOCK_VENDORS } from '@/lib/mockVendorData';

interface BookingFlowProps {
  params: {
    serviceId: string;
  };
}

interface Service {
  id: string | number;
  name: string;
  description: string;
  base_price: number | string;
  formatted_price?: string;
  category?: {
    id: number;
    name: string;
  };
  vendor?: {
    id: string | number;
    business_name: string;
    location?: string;
  };
}

interface AlternativeSlot {
  date: string;
  start_time: string;
}

const POPULAR_LOCATIONS = ['Delhi NCR', 'Mumbai', 'Bengaluru', 'Jaipur', 'Goa', 'Chandigarh'];

const COMMON_REQUIREMENTS = [
  'Full day candid coverage',
  'Pre-wedding video teaser',
  'Drone cinematography included',
  'Evening reception lighting',
  'Bridal makeup trial session'
];

const BookingFlow: React.FC<BookingFlowProps> = ({ params }) => {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const transactionId = useId();
  
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [step, setStep] = useState(1);
  const isFirstRender = useRef(true);
  
  // Form State
  const [bookingDate, setBookingDate] = useState(searchParams.get('date') || '');
  const [startTime, setStartTime] = useState('10:00');
  const [location, setLocation] = useState('');
  const [requirements, setRequirements] = useState('');
  
  // Availability State
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [alternatives, setAlternatives] = useState<AlternativeSlot[]>([]);

  useEffect(() => {
    const loadService = async () => {
      const isNumeric = /^\d+$/.test(params.serviceId);

      if (isNumeric) {
        try {
          const res = await apiService.services.getById(params.serviceId);
          if (res?.data) {
            setService(res.data);
            setLoading(false);
            return;
          }
        } catch (error) {
          // If params.serviceId was actually a vendor ID, attempt to load vendor's primary service
          try {
            const vendorServicesRes = await apiService.vendors.getServices(params.serviceId);
            const firstService = vendorServicesRes?.data?.services?.[0];
            if (firstService) {
              setService(firstService);
              setLoading(false);
              return;
            }
          } catch (vErr) {
            console.warn('Resolving service from catalog fallback:', vErr);
          }
        }
      }

      // Catalog / mock fallback when service ID is non-numeric (e.g. s1, s2) or not in database
      const allMockServices = MOCK_VENDORS.flatMap((v) =>
        v.services.map((s) => ({
          id: s.id,
          name: s.name,
          description: s.description,
          base_price: s.base_price,
          formatted_price: s.formatted_price,
          category: { id: 1, name: s.category },
          vendor: {
            id: v.id,
            business_name: v.business_name,
            location: v.location,
          },
        }))
      );

      const matched =
        allMockServices.find((s) => String(s.id).toLowerCase() === String(params.serviceId).toLowerCase()) ||
        allMockServices[0];
      setService(matched);
      setLoading(false);
    };

    if (params.serviceId) {
      loadService();
    }
  }, [params.serviceId]);

  const getTodayStr = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const getCurrentTimeStr = () => {
    const d = new Date();
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  };

  const isSlotInPast = useCallback(() => {
    if (!bookingDate) return false;
    const d = new Date();
    const todayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (bookingDate < todayStr) return true;
    if (bookingDate === todayStr && startTime) {
      const currentTimeStr = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
      return startTime <= currentTimeStr;
    }
    return false;
  }, [bookingDate, startTime]);

  const checkAvailability = useCallback(async () => {
    if (!bookingDate || !startTime) return;

    if (isSlotInPast()) {
      setIsAvailable(false);
      setCheckingAvailability(false);
      setAlternatives([]);
      return;
    }

    // If service ID is not a numeric database ID (e.g. s1), skip backend check to prevent 404
    const isNumeric = /^\d+$/.test(String(params.serviceId));
    if (!isNumeric) {
      setIsAvailable(true);
      setCheckingAvailability(false);
      return;
    }
    
    setCheckingAvailability(true);
    setIsAvailable(null);
    setAlternatives([]);
    
    try {
      const res = await apiService.bookings.checkAvailability({
        service_id: params.serviceId,
        date: bookingDate,
        start_time: startTime,
        duration: 4
      });
      
      setIsAvailable(res.data.available);
      
      if (!res.data.available) {
        const altRes = await apiService.bookings.suggestAlternatives({
          service_id: params.serviceId,
          date: bookingDate,
          start_time: startTime
        });
        setAlternatives(altRes.data.alternative_times || []);
      }
    } catch (err) {
      console.warn('Availability check soft-fallback:', err);
      // Soft-fallback: allow proceeding only if slot is not in the past
      if (!isSlotInPast()) {
        setIsAvailable(true);
      } else {
        setIsAvailable(false);
      }
    } finally {
      setCheckingAvailability(false);
    }
  }, [params.serviceId, bookingDate, startTime, isSlotInPast]);

  // Scroll restoration: smooth scroll to top on step transitions
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  // Debounced availability check (500ms) to avoid rapid API calls during user inputs
  useEffect(() => {
    if (!bookingDate || !startTime) return;

    const timer = setTimeout(() => {
      checkAvailability();
    }, 500);

    return () => clearTimeout(timer);
  }, [bookingDate, startTime, checkAvailability]);

  const handleConfirmBooking = async () => {
    if (!service) return;

    if (isSlotInPast()) {
      toast.error('Cannot book a date or time in the past');
      return;
    }
    
    setLoading(true);
    try {
      const numPrice = Number(service.base_price) || 0;
      const combinedDateTime = bookingDate && startTime ? `${bookingDate}T${startTime}:00` : bookingDate;
      const isNumeric = /^\d+$/.test(String(service.id));
      const effectiveServiceId = isNumeric ? service.id : 15; // Map mock services to active demo service

      const bookingData = {
        booking: {
          service_id: effectiveServiceId,
          event_date: combinedDateTime,
          event_location: location,
          requirements: requirements.trim() || undefined,
          total_amount: numPrice,
          start_time: startTime,
          event_duration: '4 hours'
        }
      };
      
      await apiService.bookings.create(bookingData);
      toast.success('Booking request submitted successfully! The vendor will review it shortly.');
      router.push('/customer/dashboard?tab=bookings');
    } catch (error: any) {
      console.error('Booking creation error:', error);
      const apiErrors = error.response?.data?.errors;
      const errorMsg = Array.isArray(apiErrors)
        ? apiErrors.join(', ')
        : error.response?.data?.error || error.extractedMessage || 'Failed to create booking. Please try again.';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRequirement = (req: string) => {
    if (!requirements) {
      setRequirements(req);
    } else if (!requirements.includes(req)) {
      setRequirements(prev => `${prev}, ${req}`);
    }
  };

  const numBasePrice = Number(service?.base_price) || 0;
  const platformFee = Math.round(numBasePrice * 0.05);
  const totalAmount = numBasePrice + platformFee;

  if (loading && !service) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex flex-col items-center justify-center p-6 font-sans">
        <div className="size-12 rounded-full border-2 border-[#9E5338] border-t-transparent animate-spin mb-4" />
        <p className="text-xs font-semibold uppercase tracking-wider text-[#9E5338]">Loading booking details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1C1B19] font-sans antialiased">
      <Header />
      
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 md:py-12 pb-28 lg:pb-12">
        {/* Back Link */}
        <button 
          onClick={() => router.back()} 
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#6B6560] hover:text-[#9E5338] transition-colors mb-6 cursor-pointer group"
        >
          <ArrowLeft className="size-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Service / Profile</span>
        </button>

        <div className="space-y-8 animate-in fade-in duration-500">
          
          {/* Header Title & Stepper */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#E8E2D9]">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3EADF] text-[#9E5338] text-[11px] font-semibold mb-2.5 border border-[#E8E2D9]">
                <ShieldCheck className="size-3.5" />
                <span>Ayoj Secure Booking & Escrow Protection</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-serif font-normal text-[#221F1C] tracking-tight">
                {service?.name || 'Service Booking'}
              </h1>
              <p className="text-xs sm:text-sm text-[#6B6560] mt-1.5 flex items-center gap-2">
                <span className="font-semibold text-[#221F1C]">{service?.vendor?.business_name || 'Ayoj Verified Partner'}</span>
                {service?.category?.name && (
                  <>
                    <span className="size-1 rounded-full bg-[#9E5338]" />
                    <span className="text-[#9E5338] font-medium">{service.category.name}</span>
                  </>
                )}
                {service?.vendor?.location && (
                  <>
                    <span className="size-1 rounded-full bg-[#E8E2D9]" />
                    <span>{service.vendor.location}</span>
                  </>
                )}
              </p>
            </div>
            
            {/* 3-Step Indicator */}
            <div className="flex items-center gap-2">
               {[
                 { num: 1, label: 'Details' },
                 { num: 2, label: 'Schedule' },
                 { num: 3, label: 'Review' }
               ].map((item, idx) => {
                 const isActive = step === item.num;
                 const isCompleted = step > item.num;
                 return (
                   <React.Fragment key={item.num}>
                     <div className="flex items-center gap-2">
                       <div 
                         className={`size-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 border ${
                           isActive 
                             ? 'bg-[#9E5338] text-white border-[#9E5338] shadow-sm' 
                             : isCompleted 
                             ? 'bg-[#F3EADF] text-[#9E5338] border-[#9E5338]/40' 
                             : 'bg-white text-[#6B6560] border-[#E8E2D9]'
                         }`}
                       >
                         {isCompleted ? <Check className="size-3.5 stroke-[3]" /> : item.num}
                       </div>
                       <span className={`text-xs font-medium hidden sm:inline ${isActive ? 'text-[#221F1C] font-bold' : 'text-[#6B6560]'}`}>
                         {item.label}
                       </span>
                     </div>
                     {idx < 2 && (
                       <div className={`w-8 h-0.5 mx-1 transition-colors ${step > item.num ? 'bg-[#9E5338]' : 'bg-[#E8E2D9]'}`} />
                     )}
                   </React.Fragment>
                 );
               })}
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 items-start">
             
             {/* Left Column: Interactive Form Steps */}
             <div className="lg:col-span-7 space-y-6">
                <AnimatePresence mode="wait">
                  
                  {/* STEP 1: EVENT PARTICULARS */}
                  {step === 1 && (
                     <motion.div 
                       key="step1"
                       initial={{ opacity: 0, y: 10 }} 
                       animate={{ opacity: 1, y: 0 }}
                       exit={{ opacity: 0, y: -10 }}
                       className="bg-white border border-[#E8E2D9] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6"
                     >
                        <div>
                          <h3 className="text-xl font-serif font-normal text-[#221F1C]">Event Particulars & Location</h3>
                          <p className="text-xs text-[#6B6560] mt-1">Specify where your celebration is taking place and any special preferences.</p>
                        </div>

                        <div className="space-y-5">
                           {/* Location Input */}
                           <div className="space-y-2">
                              <label htmlFor="booking-location" className="text-xs font-bold text-[#221F1C] block">
                                 Event Location / Venue Address <span className="text-[#9E5338]">*</span>
                              </label>
                              <div className="relative">
                                 <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#6B6560]" />
                                 <input id="booking-location"
                                   type="text" 
                                   value={location}
                                   onChange={(e) => setLocation(e.target.value)}
                                   className="w-full bg-[#FBF8F4] border border-[#E8E2D9] rounded-xl h-11 pl-10 pr-4 text-xs text-[#221F1C] placeholder:text-[#6B6560] focus:outline-none focus:border-[#9E5338] transition-colors" 
                                   placeholder="e.g. Taj Palace, Chanakyapuri, New Delhi" 
                                 />
                              </div>

                              {/* Popular Quick Location Pills */}
                              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                 <span className="text-[11px] text-[#6B6560]">Quick select:</span>
                                 {POPULAR_LOCATIONS.map((loc) => (
                                    <button
                                      key={loc}
                                      type="button"
                                      onClick={() => setLocation(loc)}
                                      className={`text-[11px] px-2.5 py-0.5 rounded-full border transition-all cursor-pointer ${
                                        location === loc
                                          ? 'bg-[#9E5338] text-white border-[#9E5338]'
                                          : 'bg-[#FBF8F4] text-[#221F1C] border-[#E8E2D9] hover:border-[#9E5338]/40'
                                      }`}
                                    >
                                      {loc}
                                    </button>
                                 ))}
                              </div>
                           </div>

                           {/* Requirements Textarea */}
                           <div className="space-y-2">
                              <label htmlFor="booking-requirements" className="text-xs font-bold text-[#221F1C] block">
                                 Special Requirements & Vision
                              </label>
                              <textarea id="booking-requirements"
                                value={requirements}
                                onChange={(e) => setRequirements(e.target.value)}
                                className="w-full bg-[#FBF8F4] border border-[#E8E2D9] rounded-xl p-3.5 text-xs text-[#221F1C] placeholder:text-[#6B6560] focus:outline-none focus:border-[#9E5338] min-h-[120px] resize-none transition-colors" 
                                placeholder="Detail any specific shot lists, color themes, schedule highlights, or custom requests you have for the professional..." 
                              />

                              {/* Quick Suggestion Pills */}
                              <div className="space-y-1.5 pt-1">
                                <span className="text-[11px] text-[#6B6560] block">Click to add common requests:</span>
                                <div className="flex flex-wrap gap-1.5">
                                  {COMMON_REQUIREMENTS.map((req) => (
                                    <button
                                      key={req}
                                      type="button"
                                      onClick={() => handleAddRequirement(req)}
                                      className="text-[10px] px-2.5 py-1 rounded-lg bg-[#FAF7F2] text-[#221F1C] border border-[#E8E2D9] hover:bg-[#F3EADF] hover:border-[#9E5338]/40 transition-colors cursor-pointer text-left"
                                    >
                                      + {req}
                                    </button>
                                  ))}
                                </div>
                              </div>
                           </div>
                        </div>

                        <Button 
                          onClick={() => setStep(2)} 
                          disabled={!location.trim()}
                          className="w-full h-11 rounded-full font-medium text-xs bg-[#9E5338] hover:bg-[#86442B] text-white shadow-xs transition-colors cursor-pointer"
                        >
                          Continue to Schedule
                          <ChevronRight className="size-4 ml-1" />
                        </Button>
                     </motion.div>
                  )}

                  {/* STEP 2: DATE & TIME */}
                  {step === 2 && (
                     <motion.div 
                       key="step2"
                       initial={{ opacity: 0, y: 10 }} 
                       animate={{ opacity: 1, y: 0 }}
                       exit={{ opacity: 0, y: -10 }}
                       className="bg-white border border-[#E8E2D9] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6"
                     >
                        <div>
                          <h3 className="text-xl font-serif font-normal text-[#221F1C]">Select Date & Starting Time</h3>
                          <p className="text-xs text-[#6B6560] mt-1">Pick your preferred celebration date. We will check the professional's availability in real time.</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           <div className="space-y-2">
                              <label htmlFor="booking-date" className="text-xs font-bold text-[#221F1C] block">
                                 Event Date <span className="text-[#9E5338]">*</span>
                              </label>
                              <div className="relative">
                                 <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#6B6560]" />
                                 <input id="booking-date"
                                   type="date" 
                                   value={bookingDate}
                                   min={getTodayStr()}
                                   onChange={(e) => setBookingDate(e.target.value)}
                                   className="w-full bg-[#FBF8F4] border border-[#E8E2D9] rounded-xl h-11 pl-10 pr-4 text-xs text-[#221F1C] focus:outline-none focus:border-[#9E5338] transition-colors" 
                                 />
                              </div>
                           </div>
                           <div className="space-y-2">
                              <label htmlFor="booking-time" className="text-xs font-bold text-[#221F1C] block">
                                 Starting Time <span className="text-[#9E5338]">*</span>
                              </label>
                              <div className="relative">
                                 <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#6B6560]" />
                                 <input id="booking-time"
                                   type="time" 
                                   value={startTime}
                                   min={bookingDate === getTodayStr() ? getCurrentTimeStr() : undefined}
                                   onChange={(e) => setStartTime(e.target.value)}
                                   className="w-full bg-[#FBF8F4] border border-[#E8E2D9] rounded-xl h-11 pl-10 pr-4 text-xs text-[#221F1C] focus:outline-none focus:border-[#9E5338] transition-colors" 
                                 />
                              </div>
                           </div>
                        </div>

                        {/* Availability Status Feedback */}
                        <div>
                           {isSlotInPast() ? (
                              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-2.5 text-xs text-amber-800 font-medium">
                                 <AlertCircle className="size-4.5 text-amber-600 shrink-0" />
                                 <span>The selected date or time has already passed. Please choose an upcoming date and time.</span>
                              </div>
                           ) : checkingAvailability ? (
                              <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E8E2D9] flex items-center gap-3 text-xs text-[#6B6560]">
                                 <Loader2 className="size-4 animate-spin text-[#9E5338]" /> Checking professional availability for this slot...
                              </div>
                           ) : isAvailable === true ? (
                              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-xs text-emerald-800 font-medium">
                                 <CheckCircle2 className="size-4.5 text-emerald-600 shrink-0" />
                                 <span>Professional is available on {bookingDate ? new Date(bookingDate).toLocaleDateString(undefined, { dateStyle: 'medium' }) : ''} at {startTime}!</span>
                              </div>
                           ) : isAvailable === false ? (
                              <div className="space-y-3">
                                 <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-2.5 text-xs text-amber-800 font-medium">
                                    <AlertCircle className="size-4.5 text-amber-600 shrink-0" />
                                    <span>This slot is currently booked. Please choose another date or an alternative time below.</span>
                                 </div>
                                 
                                 {alternatives.length > 0 && (
                                    <div className="space-y-2">
                                       <p className="text-[11px] font-bold uppercase tracking-wider text-[#6B6560]">Suggested Alternative Slots</p>
                                       <div className="grid grid-cols-1 gap-2">
                                          {alternatives.map((alt, idx) => (
                                             <button 
                                               key={idx}
                                               type="button"
                                               onClick={() => {
                                                  setBookingDate(alt.date);
                                                  setStartTime(alt.start_time);
                                               }}
                                               className="flex items-center justify-between p-3 rounded-xl bg-[#FAF7F2] border border-[#E8E2D9] hover:border-[#9E5338] hover:bg-[#F3EADF] transition-all group text-left cursor-pointer"
                                             >
                                                <div className="flex items-center gap-2.5 text-xs">
                                                   <CalendarDays className="size-4 text-[#9E5338]" />
                                                   <span className="font-semibold text-[#221F1C]">
                                                     {new Date(alt.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                   </span>
                                                   <span className="text-[#6B6560]">•</span>
                                                   <span className="text-[#6B6560]">{alt.start_time}</span>
                                                </div>
                                                <span className="text-[11px] font-bold text-[#9E5338] group-hover:underline">Select</span>
                                             </button>
                                          ))}
                                       </div>
                                    </div>
                                 )}
                              </div>
                           ) : null}
                        </div>

                        <div className="flex gap-3 pt-2">
                           <Button 
                             variant="outline" 
                             onClick={() => setStep(1)} 
                             className="flex-1 h-11 rounded-full border-[#E8E2D9] bg-white hover:bg-[#F3EADF] text-[#221F1C] text-xs font-semibold cursor-pointer"
                           >
                             Back
                           </Button>
                           <Button 
                             onClick={() => setStep(3)} 
                             disabled={!bookingDate || !startTime || isAvailable === false || checkingAvailability || isSlotInPast()}
                             className="flex-[2] h-11 rounded-full font-medium text-xs bg-[#9E5338] hover:bg-[#86442B] text-white shadow-xs transition-colors cursor-pointer"
                           >
                             Review Booking
                             <ChevronRight className="size-4 ml-1" />
                           </Button>
                        </div>
                     </motion.div>
                  )}

                  {/* STEP 3: REVIEW & CONFIRM */}
                  {step === 3 && (
                     <motion.div 
                       key="step3"
                       initial={{ opacity: 0, scale: 0.98 }} 
                       animate={{ opacity: 1, scale: 1 }}
                       exit={{ opacity: 0, scale: 0.98 }}
                       className="bg-white border border-[#E8E2D9] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6"
                     >
                        <div className="text-center space-y-2">
                           <div className="size-14 rounded-full bg-[#F3EADF] text-[#9E5338] flex items-center justify-center mx-auto mb-2 border border-[#E8E2D9]">
                              <CheckCircle2 className="size-7" />
                           </div>
                           <h3 className="text-2xl font-serif font-normal text-[#221F1C]">Almost Ready to Book!</h3>
                           <p className="text-xs text-[#6B6560] max-w-sm mx-auto">
                              Review your celebration details below. Your request will be sent directly to{' '}
                              <span className="font-semibold text-[#221F1C]">{service?.vendor?.business_name}</span>.
                           </p>
                        </div>

                        {/* Review Summary Card */}
                        <div className="bg-[#FAF7F2] border border-[#E8E2D9] rounded-xl p-5 space-y-3.5 text-xs">
                           <div className="flex justify-between items-center border-b border-[#E8E2D9] pb-3">
                              <span className="font-semibold text-[#6B6560]">Scheduled Date & Time</span>
                              <span className="font-bold text-[#221F1C]">
                                 {bookingDate ? new Date(bookingDate).toLocaleDateString(undefined, { dateStyle: 'long' }) : ''} @ {startTime}
                              </span>
                           </div>
                           <div className="flex justify-between items-center border-b border-[#E8E2D9] pb-3">
                              <span className="font-semibold text-[#6B6560]">Event Location</span>
                              <span className="font-bold text-[#221F1C] text-right max-w-xs truncate">{location}</span>
                           </div>
                           {requirements && (
                             <div className="space-y-1">
                                <span className="font-semibold text-[#6B6560] block">Special Requirements:</span>
                                <p className="text-[#221F1C] leading-relaxed bg-white p-2.5 rounded-lg border border-[#E8E2D9]">
                                  {requirements}
                                </p>
                             </div>
                           )}
                        </div>

                        {/* Payment & Escrow Guarantee Note */}
                        <div className="p-3.5 rounded-xl bg-[#F3EADF] border border-[#E8E2D9] flex items-start gap-3 text-xs text-[#221F1C]">
                           <ShieldCheck className="size-5 text-[#9E5338] shrink-0 mt-0.5" />
                           <div className="space-y-0.5">
                              <p className="font-bold text-[#9E5338]">Ayoj Escrow Protection Guarantee</p>
                              <p className="text-[11px] text-[#6B6560] leading-relaxed">
                                 Your payment is held in trust by Ayoj and only disbursed to the professional after the event is successfully delivered to your satisfaction.
                              </p>
                           </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                           <Button 
                             variant="outline" 
                             onClick={() => setStep(2)} 
                             className="flex-1 h-11 rounded-full border-[#E8E2D9] bg-white hover:bg-[#F3EADF] text-[#221F1C] text-xs font-semibold cursor-pointer"
                           >
                             Back
                           </Button>
                           <Button 
                             onClick={handleConfirmBooking}
                             disabled={loading}
                             className="flex-[2] h-11 rounded-full font-medium text-xs bg-[#9E5338] hover:bg-[#86442B] text-white shadow-xs transition-colors cursor-pointer"
                           >
                             {loading ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
                             Confirm & Send Booking Request
                           </Button>
                        </div>
                     </motion.div>
                  )}
                </AnimatePresence>
             </div>

             {/* Right Column: Order Summary & Pricing Breakdown Sidebar */}
             <div className="lg:col-span-5">
                <Card className="bg-white border border-[#E8E2D9] rounded-2xl sticky top-24 overflow-hidden shadow-sm">
                   
                   {/* Card Header */}
                   <div className="p-5 bg-[#FAF7F2] border-b border-[#E8E2D9]">
                      <div className="flex items-center justify-between">
                         <span className="text-[11px] font-bold uppercase tracking-wider text-[#9E5338]">
                            Booking Summary
                         </span>
                         <Badge className="bg-[#F3EADF] text-[#9E5338] border-[#E8E2D9] text-[10px] font-semibold py-0.5 px-2">
                            Escrow Protected
                         </Badge>
                      </div>
                      <p className="text-[10px] text-[#6B6560] mt-1">
                        Ref: AY-{transactionId.replace(/:/g, '').slice(0, 8).toUpperCase() || 'AY-1092'}
                      </p>
                   </div>

                   <CardContent className="p-6 space-y-6">
                      
                      {/* Service Overview Box */}
                      <div className="p-3.5 rounded-xl bg-[#FBF8F4] border border-[#E8E2D9] space-y-1.5">
                         <p className="font-serif font-bold text-[#221F1C] text-sm leading-snug">
                            {service?.name}
                         </p>
                         <p className="text-xs text-[#6B6560] line-clamp-2 leading-relaxed">
                            {service?.description || 'Professional event package with dedicated coordination.'}
                         </p>
                         {service?.vendor?.business_name && (
                            <div className="pt-1 flex items-center gap-1.5 text-[11px] font-semibold text-[#9E5338]">
                               <Building className="size-3" />
                               <span>{service.vendor.business_name}</span>
                            </div>
                         )}
                      </div>
                      
                      {/* Pricing Breakdown */}
                      <div className="space-y-3 text-xs">
                         <div className="flex justify-between items-center text-[#6B6560]">
                            <span>Package Base Rate</span>
                            <span className="font-semibold text-[#221F1C]">
                               ₹{numBasePrice.toLocaleString('en-IN')}
                            </span>
                         </div>
                         <div className="flex justify-between items-center text-[#6B6560]">
                            <span className="flex items-center gap-1">
                               Ayoj Trust & Escrow Fee (5%)
                               <HelpCircle className="size-3 text-[#6B6560]" />
                            </span>
                            <span className="font-semibold text-[#221F1C]">
                               ₹{platformFee.toLocaleString('en-IN')}
                            </span>
                         </div>
                         
                         <div className="pt-3 border-t border-[#E8E2D9]">
                            <div className="flex justify-between items-baseline">
                               <div>
                                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#6B6560]">Total Payable</p>
                                  <p className="text-[10px] text-emerald-700 font-medium">Includes all taxes & escrow hold</p>
                               </div>
                               <div className="text-2xl font-serif font-bold text-[#9E5338] flex items-center">
                                  <IndianRupee className="size-4.5 text-[#9E5338] -mr-0.5" strokeWidth={2.5} />
                                  <span>{totalAmount.toLocaleString('en-IN')}</span>
                               </div>
                            </div>
                         </div>
                      </div>

                      {/* Assurance & Trust Badges */}
                      <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E8E2D9] space-y-2 text-xs">
                         <div className="flex items-center gap-1.5 text-[#9E5338] font-bold text-[11px]">
                            <Info className="size-3.5" />
                            <span>Ayoj Booking Promises</span>
                         </div>
                         <ul className="space-y-1.5 text-[11px] text-[#6B6560]">
                            <li className="flex items-center gap-2">
                               <div className="size-1.5 rounded-full bg-[#9E5338]" />
                               <span>Free cancellation within 48 hours</span>
                            </li>
                            <li className="flex items-center gap-2">
                               <div className="size-1.5 rounded-full bg-[#9E5338]" />
                               <span>Vendor response guaranteed in ~2 hours</span>
                            </li>
                            <li className="flex items-center gap-2">
                               <div className="size-1.5 rounded-full bg-[#9E5338]" />
                               <span>Funds protected until celebration ends</span>
                            </li>
                         </ul>
                      </div>

                   </CardContent>
                </Card>
             </div>

          </div>
        </div>
      </main>

      {/* Sticky Mobile Bottom Action Bar (Thumb Zone) */}
      <aside aria-label="Booking step actions" className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-xl border-t border-[#E8E2D9] p-3.5 pb-safe shadow-[0_-4px_20px_rgba(34,31,28,0.08)] lg:hidden">
        <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
          <div>
            <span className="text-[10px] text-[#6B6560] font-medium block">
              Step {step} of 3 · Total
            </span>
            <div className="text-base font-serif font-bold text-[#9E5338] flex items-center leading-none">
              <IndianRupee className="size-3.5 text-[#9E5338] -mr-0.5" strokeWidth={2.5} />
              <span>{totalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {step === 1 && (
              <Button
                onClick={() => setStep(2)}
                disabled={!location.trim()}
                className="h-10 px-5 rounded-full font-medium text-xs bg-[#9E5338] hover:bg-[#86442B] text-white shadow-xs transition-transform active:scale-95 cursor-pointer"
              >
                Schedule
                <ChevronRight className="size-4 ml-1" />
              </Button>
            )}

            {step === 2 && (
              <>
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="h-10 px-3.5 rounded-full border-[#E8E2D9] bg-white text-[#221F1C] text-xs font-semibold active:scale-95 cursor-pointer"
                >
                  Back
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  disabled={!bookingDate || !startTime || isAvailable === false || checkingAvailability || isSlotInPast()}
                  className="h-10 px-4 rounded-full font-medium text-xs bg-[#9E5338] hover:bg-[#86442B] text-white shadow-xs transition-transform active:scale-95 cursor-pointer"
                >
                  Review
                  <ChevronRight className="size-4 ml-1" />
                </Button>
              </>
            )}

            {step === 3 && (
              <>
                <Button
                  variant="outline"
                  onClick={() => setStep(2)}
                  className="h-10 px-3.5 rounded-full border-[#E8E2D9] bg-white text-[#221F1C] text-xs font-semibold active:scale-95 cursor-pointer"
                >
                  Back
                </Button>
                <Button
                  onClick={handleConfirmBooking}
                  disabled={loading}
                  className="h-10 px-4 rounded-full font-medium text-xs bg-[#9E5338] hover:bg-[#86442B] text-white shadow-xs transition-transform active:scale-95 cursor-pointer"
                >
                  {loading ? <Loader2 className="size-4 animate-spin mr-1.5" /> : null}
                  Confirm & Book
                </Button>
              </>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
};

export default BookingFlow;
